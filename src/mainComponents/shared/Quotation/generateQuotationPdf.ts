// mainComponents/shared/Quotation/generateQuotationPdf.ts
import type { Quotation } from "@/redux-store/services/NewFeatures/quotationApi";

// jsPDF's built-in "helvetica" font has no glyph for ₹ (U+20B9) — it renders
// as a garbled/mismeasured character, which also throws off right-aligned
// text width calculations (visible as truncated totals). "Rs." is plain
// ASCII and renders reliably in every jsPDF build. The web UI still uses ₹
// (browsers handle it fine); this formatter is PDF-only.
const fmtMoney = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

/**
 * Fetches an image URL and converts it to a data URL + detected jsPDF format
 * ("PNG"/"JPEG"), so it can be embedded via doc.addImage. Returns null on any
 * failure (CORS, network) so PDF generation can gracefully skip the image
 * rather than throwing.
 */
async function loadImageAsDataUrl(
  src: string,
): Promise<{ dataUrl: string; format: "PNG" | "JPEG"; width: number; height: number } | null> {
  try {
    const res = await fetch(src, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const format: "PNG" | "JPEG" = dataUrl.includes("image/png") ? "PNG" : "JPEG";

    const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = dataUrl;
    });

    return { dataUrl, format, ...dims };
  } catch {
    return null;
  }
}

export const generateQuotationPdf = async (quotation: Quotation) => {
  const jsPDF = (await import("jspdf")).default;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const m = 18;
  const cW = pageW - m * 2;

  const RED: [number, number, number] = [220, 38, 38];
  const DARK: [number, number, number] = [17, 24, 39];
  const MID: [number, number, number] = [107, 114, 128];
  const BG: [number, number, number] = [249, 250, 251];
  const BORDER: [number, number, number] = [229, 231, 235];

  let y = 0;

  // ── Header band ────────────────────────────────────────────────────────────
  doc.setFillColor(...RED);
  doc.rect(0, 0, pageW, 28, "F");

  doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(255, 255, 255);
  doc.text("TSANGPOOL HONDA", m, 11);

  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(255, 200, 200);
  doc.text("Dealership Management System", m, 16.5);

  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(255, 255, 255);
  doc.text("PRICE QUOTATION", pageW - m, 11, { align: "right" });

  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(255, 200, 200);
  doc.text(`Generated: ${fmtDate(new Date().toISOString())}`, pageW - m, 16.5, {
    align: "right",
  });

  y = 36;

  // ── Bike hero image + model name ───────────────────────────────────────────
  const imgSrc = quotation.bikeSnapshot.image?.src;
  const loadedImage = imgSrc ? await loadImageAsDataUrl(imgSrc) : null;

  // Narrower, shorter hero box than a full-width strip — a wide, short box
  // left large empty margins around a typical (roughly 4:3–16:9) bike photo.
  const heroW = cW * 0.62;
  const heroH = 44;
  const heroX = m + (cW - heroW) / 2;
  doc.setFillColor(...BG);
  doc.roundedRect(heroX, y, heroW, heroH, 2, 2, "F");
  doc.setDrawColor(...BORDER);
  doc.roundedRect(heroX, y, heroW, heroH, 2, 2, "S");

  if (loadedImage) {
    const maxW = heroW - 8;
    const maxH = heroH - 8;
    const scale = Math.min(maxW / loadedImage.width, maxH / loadedImage.height);
    const drawW = loadedImage.width * scale;
    const drawH = loadedImage.height * scale;
    const imgX = heroX + (heroW - drawW) / 2;
    const imgY = y + (heroH - drawH) / 2;
    doc.addImage(loadedImage.dataUrl, loadedImage.format, imgX, imgY, drawW, drawH);
  } else {
    doc
      .setFont("helvetica", "italic")
      .setFontSize(9)
      .setTextColor(...MID);
    doc.text("Image not available", heroX + heroW / 2, y + heroH / 2, { align: "center" });
  }
  y += heroH + 8;

  doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(...DARK);
  doc.text(quotation.bikeSnapshot.modelName, m, y, { align: "left" });
  y += 6;

  doc
    .setFont("helvetica", "normal")
    .setFontSize(9)
    .setTextColor(...MID);
  const specLine = `${quotation.bikeSnapshot.mainCategory === "scooter" ? "Scooter" : "Motorcycle"} · ${quotation.bikeSnapshot.category}`;
  doc.text(specLine.replace(/^\w/, (c) => c.toUpperCase()), m, y);
  y += 10;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const sectionTitle = (title: string) => {
    doc
      .setFont("helvetica", "bold")
      .setFontSize(8)
      .setTextColor(...MID);
    doc.text(title.toUpperCase(), m, y);
    doc.setDrawColor(...RED).setLineWidth(0.4);
    doc.line(m, y + 1.5, m + 40, y + 1.5);
    y += 7;
  };

  // ── Price breakdown table ────────────────────────────────────────────────
  sectionTitle("Price Breakdown");

  const isVariation = quotation.pricingType === "variation" && !!quotation.variation;

  interface Row {
    label: string;
    value: number;
    emphasis?: boolean;
  }
  const rows: Row[] = [];
  let onRoadSubtotal: number;

  if (isVariation) {
    rows.push({ label: `Variation — ${quotation.variation!.label}`, value: quotation.variation!.price });
    onRoadSubtotal = quotation.variation!.onRoadPrice;
    rows.push({ label: "On-Road Price", value: onRoadSubtotal, emphasis: true });
  } else {
    rows.push({ label: "Ex-Showroom Price", value: quotation.exShowroomPrice });
    rows.push({ label: "On-Road Tax", value: quotation.onRoadTax });
    onRoadSubtotal = quotation.exShowroomPrice + quotation.onRoadTax;
    rows.push({ label: "On-Road Price", value: onRoadSubtotal, emphasis: true });
  }

  if (quotation.insurance?.premium) {
    const label = quotation.insurance.provider
      ? `Insurance (${quotation.insurance.provider})`
      : "Insurance";
    rows.push({ label, value: quotation.insurance.premium });
  }

  quotation.vasSelections.forEach((vas) => {
    rows.push({ label: vas.serviceName, value: vas.price });
  });

  const grandTotal =
    onRoadSubtotal +
    (quotation.insurance?.premium ?? 0) +
    quotation.vasSelections.reduce((sum, v) => sum + v.price, 0);

  const rowH = 10;
  const tableH = rows.length * rowH;

  doc.setFillColor(...BG);
  doc.roundedRect(m, y, cW, tableH, 1.5, 1.5, "F");
  doc.setDrawColor(...BORDER);
  doc.roundedRect(m, y, cW, tableH, 1.5, 1.5, "S");

  let rowY = y;
  rows.forEach((row, i) => {
    if (i > 0) {
      doc.setDrawColor(...BORDER).setLineWidth(0.2);
      doc.line(m + 5, rowY, m + cW - 5, rowY);
    }
    const textY = rowY + rowH / 2 + 1.5;
    doc
      .setFont("helvetica", row.emphasis ? "bold" : "normal")
      .setFontSize(9)
      .setTextColor(...(row.emphasis ? DARK : MID));
    doc.text(row.label, m + 5, textY);
    doc
      .setFont("helvetica", "bold")
      .setFontSize(9)
      .setTextColor(...DARK);
    doc.text(fmtMoney(row.value), m + cW - 5, textY, { align: "right" });
    rowY += rowH;
  });
  y += tableH + 2;

  // Grand total — the last row of the table, visually a continuation of it.
  const totalRowH = 16;
  doc.setFillColor(...RED);
  doc.roundedRect(m, y, cW, totalRowH, 1.5, 1.5, "F");
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(255, 220, 220);
  doc.text("TOTAL", m + 5, y + 6.5);
  doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(255, 255, 255);
  doc.text(fmtMoney(grandTotal), m + cW - 5, y + 11.5, { align: "right" });
  y += totalRowH + 10;

  // ── Footer band ────────────────────────────────────────────────────────────
  doc.setFillColor(...RED);
  doc.rect(0, pageH - 14, pageW, 14, "F");
  doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(255, 200, 200);
  doc.text("Tsangpool Honda Dealership · Golaghat, Assam", m, pageH - 5.5);
  doc.text(`Quotation ID: ${quotation._id}`, pageW - m, pageH - 5.5, { align: "right" });

  doc.save(`quotation_${quotation.bikeSnapshot.modelName.replace(/\s+/g, "_")}_${quotation._id}.pdf`);
};
