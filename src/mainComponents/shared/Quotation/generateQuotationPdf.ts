// mainComponents/shared/Quotation/generateQuotationPdf.ts
import type { Quotation } from "@/redux-store/services/NewFeatures/quotationApi";
import { loadImageAsDataUrl } from "@/lib/loadImageAsDataUrl";
import companyLogoUrl from "@/assets/logo.png";
import { buildPublicQuotationUrl } from "./quotationDefaults";

// jsPDF's built-in "helvetica" font has no glyph for ₹ (U+20B9) — it renders
// as a garbled/mismeasured character. "Rs." is plain ASCII and renders
// reliably in every jsPDF build. The web UI still uses ₹; this is PDF-only.
const fmtMoney = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export const generateQuotationPdf = async (quotation: Quotation) => {
  const jsPDF = (await import("jspdf")).default;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const m = 16;
  const cW = pageW - m * 2;

  const DARK: [number, number, number] = [17, 24, 39];
  const MID: [number, number, number] = [107, 114, 128];
  const BG: [number, number, number] = [249, 250, 251];
  const BORDER: [number, number, number] = [209, 213, 219];
  const RED: [number, number, number] = [220, 38, 38];

  let y = 16;

  // ── Company logo, top-left ──────────────────────────────────────────────
  const logo = await loadImageAsDataUrl(companyLogoUrl);
  if (logo) {
    const maxLogoW = 22;
    const maxLogoH = 18;
    const scale = Math.min(maxLogoW / logo.width, maxLogoH / logo.height);
    const logoW = logo.width * scale;
    const logoH = logo.height * scale;
    doc.addImage(logo.dataUrl, logo.format, m, 6, logoW, logoH);
  }

  // ── Date, top-right (mirrors the logo on the top-left) ──────────────────
  doc
    .setFont("helvetica", "normal")
    .setFontSize(8)
    .setTextColor(...MID);
  doc.text("Date", pageW - m, 10, { align: "right" });
  doc
    .setFont("helvetica", "bold")
    .setFontSize(10)
    .setTextColor(...DARK);
  doc.text(fmtDate(quotation.createdAt), pageW - m, 15, { align: "right" });

  // ── Editable top heading (centered) ────────────────────────────────────────
  // A saved heading can end up with the same phone number listed twice (e.g.
  // pasted twice while editing) — collapse repeated numbers on a line to
  // their first occurrence. Only tokens that look like a number (7+ digits)
  // are deduped, so comma-separated address text (e.g. "Road, Golaghat") is
  // left untouched.
  const dedupeNumbers = (line: string): string => {
    const seen = new Set<string>();
    return line
      .split(",")
      .filter((part) => {
        const digits = part.replace(/\D/g, "");
        if (digits.length < 7) return true;
        if (seen.has(digits)) return false;
        seen.add(digits);
        return true;
      })
      .map((part) => part.trim())
      .join(", ");
  };
  const headingLines = (quotation.topHeading || "").split("\n").filter(Boolean);
  doc
    .setFont("helvetica", "bold")
    .setFontSize(14)
    .setTextColor(...DARK);
  doc.text(dedupeNumbers(headingLines[0] ?? ""), pageW / 2, y, { align: "center" });
  y += 6;
  if (headingLines.length > 1) {
    doc
      .setFont("helvetica", "normal")
      .setFontSize(9)
      .setTextColor(...MID);
    for (const line of headingLines.slice(1)) {
      doc.text(dedupeNumbers(line), pageW / 2, y, { align: "center" });
      y += 5;
    }
  }
  y += 2;
  doc.setDrawColor(...RED).setLineWidth(0.6);
  doc.line(m, y, pageW - m, y);
  y += 8;

  // ── Title + quotation number ─────────────────────────────────────────────
  doc
    .setFont("helvetica", "bold")
    .setFontSize(12)
    .setTextColor(...DARK);
  doc.text("QUOTATION", m, y);
  doc
    .setFont("helvetica", "bold")
    .setFontSize(11)
    .setTextColor(...RED);
  doc.text(`Quotation No: ${quotation.quotationNo}`, pageW - m, y, { align: "right" });
  y += 8;

  // ── To block ──────────────────────────────────────────────────────────────
  const toLines = [
    quotation.to.name,
    quotation.to.phone,
    quotation.to.addressLine1,
    quotation.to.addressLine2,
  ].filter(Boolean) as string[];
  const toRowH = 6 + toLines.length * 5;
  doc.setFillColor(...BG);
  doc.roundedRect(m, y, cW, toRowH, 1.5, 1.5, "F");
  doc
    .setFont("helvetica", "normal")
    .setFontSize(7)
    .setTextColor(...MID);
  doc.text("TO", m + 4, y + 5.5);
  doc
    .setFont("helvetica", "bold")
    .setFontSize(9)
    .setTextColor(...DARK);
  toLines.forEach((line, i) => {
    doc.text(line, m + 4, y + 10.5 + i * 5);
  });
  y += toRowH + 8;

  // ── Vehicle line ──────────────────────────────────────────────────────────
  doc
    .setFont("helvetica", "bold")
    .setFontSize(11)
    .setTextColor(...DARK);
  doc.text(quotation.bikeSnapshot.modelName, m, y);
  doc
    .setFont("helvetica", "normal")
    .setFontSize(8)
    .setTextColor(...MID);
  const specLine = `${quotation.bikeSnapshot.mainCategory === "scooter" ? "Scooter" : "Motorcycle"} · ${quotation.bikeSnapshot.category}`;
  doc.text(specLine.replace(/^\w/, (c) => c.toUpperCase()), pageW - m, y, {
    align: "right",
  });
  y += 8;

  // ── Price breakdown ──────────────────────────────────────────────────────
  const isVariation = quotation.pricingType === "variation" && !!quotation.variation;

  interface Row {
    label: string;
    value: number;
    emphasis?: boolean;
  }
  const priceRows: Row[] = [];
  let onRoadSubtotal: number;

  if (isVariation) {
    priceRows.push({
      label: `Variation — ${quotation.variation!.label}`,
      value: quotation.variation!.price,
    });
    onRoadSubtotal = quotation.variation!.onRoadPrice;
  } else {
    priceRows.push({ label: "Ex-Showroom Price", value: quotation.exShowroomPrice });
    priceRows.push({ label: "On-Road Tax", value: quotation.onRoadTax });
    onRoadSubtotal = quotation.exShowroomPrice + quotation.onRoadTax;
  }
  priceRows.push({ label: "On-Road Price", value: onRoadSubtotal, emphasis: true });

  if (quotation.insurance?.premium) {
    const label = quotation.insurance.provider
      ? `Insurance (${quotation.insurance.provider})`
      : "Insurance";
    priceRows.push({ label, value: quotation.insurance.premium });
  }

  quotation.vasSelections.forEach((vas) => {
    priceRows.push({ label: vas.serviceName, value: vas.price });
  });

  const accessoriesTotal = quotation.accessories.reduce(
    (sum, a) => sum + a.amount * a.quantity,
    0,
  );
  if (quotation.accessories.length > 0) {
    priceRows.push({ label: "Accessories", value: accessoriesTotal });
  }

  const grandTotal =
    onRoadSubtotal +
    (quotation.insurance?.premium ?? 0) +
    quotation.vasSelections.reduce((sum, v) => sum + v.price, 0) +
    accessoriesTotal;

  const priceRowH = 8;
  const priceTableH = priceRows.length * priceRowH;

  doc.setFillColor(...BG);
  doc.roundedRect(m, y, cW, priceTableH, 1.5, 1.5, "F");
  doc.setDrawColor(...BORDER);
  doc.roundedRect(m, y, cW, priceTableH, 1.5, 1.5, "S");

  let rowY = y;
  priceRows.forEach((row, i) => {
    if (i > 0) {
      doc.setDrawColor(...BORDER).setLineWidth(0.2);
      doc.line(m + 4, rowY, m + cW - 4, rowY);
    }
    const textY = rowY + priceRowH / 2 + 1.5;
    doc
      .setFont("helvetica", row.emphasis ? "bold" : "normal")
      .setFontSize(9)
      .setTextColor(...(row.emphasis ? DARK : MID));
    doc.text(row.label, m + 4, textY);
    doc
      .setFont("helvetica", "bold")
      .setFontSize(9)
      .setTextColor(...DARK);
    doc.text(fmtMoney(row.value), m + cW - 4, textY, { align: "right" });
    rowY += priceRowH;
  });
  y += priceTableH + 2;

  // Grand total banner.
  const totalRowH = 14;
  doc.setFillColor(...RED);
  doc.roundedRect(m, y, cW, totalRowH, 1.5, 1.5, "F");
  doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(255, 220, 220);
  doc.text("TOTAL", m + 4, y + 5.5);
  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(255, 255, 255);
  doc.text(fmtMoney(grandTotal), m + cW - 4, y + 10, { align: "right" });
  y += totalRowH + 8;

  // ── Accessories table ─────────────────────────────────────────────────────
  if (quotation.accessories.length > 0) {
    doc
      .setFont("helvetica", "bold")
      .setFontSize(8)
      .setTextColor(...MID);
    doc.text("ACCESSORIES", m, y);
    y += 4;

    const colItemX = m + 4;
    const colQtyX = m + cW - 50;
    const colAmountX = m + cW - 4;
    const headerH = 7;

    doc.setFillColor(...DARK);
    doc.rect(m, y, cW, headerH, "F");
    doc.setFont("helvetica", "bold").setFontSize(7).setTextColor(255, 255, 255);
    doc.text("ITEM", colItemX, y + 5);
    doc.text("QTY", colQtyX, y + 5, { align: "right" });
    doc.text("AMOUNT", colAmountX, y + 5, { align: "right" });
    y += headerH;

    const accRowH = 7;
    quotation.accessories.forEach((item, i) => {
      if (i % 2 === 1) {
        doc.setFillColor(...BG);
        doc.rect(m, y, cW, accRowH, "F");
      }
      doc.setDrawColor(...BORDER).setLineWidth(0.2);
      doc.line(m, y + accRowH, m + cW, y + accRowH);

      doc
        .setFont("helvetica", "normal")
        .setFontSize(8)
        .setTextColor(...DARK);
      doc.text(item.name, colItemX, y + 4.8);
      doc.text(String(item.quantity), colQtyX, y + 4.8, { align: "right" });
      doc.text(fmtMoney(item.amount * item.quantity), colAmountX, y + 4.8, {
        align: "right",
      });

      y += accRowH;
    });
    y += 6;
  }

  // ── Bank details + Terms & Conditions ────────────────────────────────────
  const halfW = cW / 2 - 4;

  doc
    .setFont("helvetica", "bold")
    .setFontSize(8)
    .setTextColor(...MID);
  doc.text("BANK DETAILS", m, y);
  doc.text("TERMS & CONDITIONS", m + halfW + 8, y);
  y += 4;

  const bankLines = doc.splitTextToSize(quotation.bankDetails, halfW - 2);
  const termsLines = doc.splitTextToSize(quotation.termsAndConditions, halfW - 2);
  doc
    .setFont("helvetica", "normal")
    .setFontSize(7)
    .setTextColor(...DARK);
  doc.text(bankLines, m, y + 4);
  doc.text(termsLines, m + halfW + 8, y + 4);

  const blockH = Math.max(bankLines.length, termsLines.length) * 3.6 + 10;
  y += blockH;

  // ── Signature line ───────────────────────────────────────────────────────
  const sigX2 = m + cW;
  const sigX1 = sigX2 - 55;
  const sigY = Math.min(y, pageH - 24);
  doc.setDrawColor(...DARK).setLineWidth(0.3);
  doc.line(sigX1, sigY, sigX2, sigY);
  doc
    .setFont("helvetica", "normal")
    .setFontSize(8)
    .setTextColor(...MID);
  doc.text("Authorized Signature", (sigX1 + sigX2) / 2, sigY + 5, {
    align: "center",
  });

  // ── Footer note — public link ────────────────────────────────────────────
  doc
    .setFont("helvetica", "normal")
    .setFontSize(7)
    .setTextColor(...MID);
  doc.text(
    `Please save the link: ${buildPublicQuotationUrl(quotation)}`,
    m,
    pageH - 8,
  );

  doc.save(`quotation_${quotation.quotationNo}.pdf`);
};
