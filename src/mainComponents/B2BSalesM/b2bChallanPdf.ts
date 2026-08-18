// mainComponents/B2BSalesM/b2bChallanPdf.ts
import type { B2BSale } from "@/types/b2bSales/b2bSales.types";
import { loadImageAsDataUrl } from "@/lib/loadImageAsDataUrl";
import companyLogoUrl from "@/assets/logo.png";

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

const CHALLAN_NOTE =
  "NOTE:\n" +
  "1. Interest will be charged 2% per month if bill is not paid within 15 days.\n" +
  "2. No claim will be considered unless made in writing within 7 (Seven) days from the date of delivery.";

export const generateB2BChallanPdf = async (sale: B2BSale) => {
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
  // Sits in the whitespace to the left of the centered heading below — no
  // layout shift needed elsewhere. Same-origin bundled asset, so the fetch
  // inside loadImageAsDataUrl never hits a CORS wall; degrades silently
  // (nothing drawn) if it fails for any reason.
  const logo = await loadImageAsDataUrl(companyLogoUrl);
  if (logo) {
    const maxLogoW = 22;
    const maxLogoH = 18;
    const scale = Math.min(maxLogoW / logo.width, maxLogoH / logo.height);
    const logoW = logo.width * scale;
    const logoH = logo.height * scale;
    doc.addImage(logo.dataUrl, logo.format, m, 6, logoW, logoH);
  }

  // ── Editable top heading (centered) ────────────────────────────────────────
  const headingLines = (sale.topHeading || "").split("\n").filter(Boolean);
  doc
    .setFont("helvetica", "bold")
    .setFontSize(14)
    .setTextColor(...DARK);
  doc.text(headingLines[0] ?? "", pageW / 2, y, { align: "center" });
  y += 6;
  if (headingLines.length > 1) {
    doc
      .setFont("helvetica", "normal")
      .setFontSize(9)
      .setTextColor(...MID);
    for (const line of headingLines.slice(1)) {
      doc.text(line, pageW / 2, y, { align: "center" });
      y += 5;
    }
  }
  y += 2;
  doc.setDrawColor(...RED).setLineWidth(0.6);
  doc.line(m, y, pageW - m, y);
  y += 8;

  // ── Challan title + number ───────────────────────────────────────────────
  doc
    .setFont("helvetica", "bold")
    .setFontSize(12)
    .setTextColor(...DARK);
  doc.text("DELIVERY CHALLAN", m, y);
  doc
    .setFont("helvetica", "bold")
    .setFontSize(11)
    .setTextColor(...RED);
  doc.text(`Challan No: ${sale.challanNo}`, pageW - m, y, { align: "right" });
  y += 8;

  // ── From / To / Date block ───────────────────────────────────────────────
  const halfW = cW / 2 - 4;
  const infoRowH = 16;
  doc.setFillColor(...BG);
  doc.roundedRect(m, y, halfW, infoRowH, 1.5, 1.5, "F");
  doc.roundedRect(m + halfW + 8, y, halfW, infoRowH, 1.5, 1.5, "F");

  doc
    .setFont("helvetica", "normal")
    .setFontSize(7)
    .setTextColor(...MID);
  doc.text("FROM", m + 4, y + 5.5);
  doc.text("TO", m + halfW + 12, y + 5.5);
  doc
    .setFont("helvetica", "bold")
    .setFontSize(9)
    .setTextColor(...DARK);
  doc.text(sale.from, m + 4, y + 11.5);
  doc.text(sale.to, m + halfW + 12, y + 11.5);
  y += infoRowH + 4;

  doc
    .setFont("helvetica", "normal")
    .setFontSize(8)
    .setTextColor(...MID);
  doc.text(`Date: ${fmtDate(sale.date)}`, m, y);
  y += 8;

  // ── Items table (stock items then extra items) ───────────────────────────
  interface Row {
    label: string;
    sub: string;
    qty: number;
    total: number;
  }
  const rows: Row[] = [
    ...sale.stockItems.map((item) => ({
      label: item.modelName,
      sub: `Engine: ${item.engineNumber} · Chassis: ${item.chassisNumber}`,
      qty: item.quantity,
      total: item.totalPrice,
    })),
    ...sale.extraItems.map((item) => ({
      label: item.name,
      sub: "",
      qty: item.quantity,
      total: item.totalPrice,
    })),
  ];

  const colItemX = m + 4;
  const colQtyX = m + cW - 50;
  const colTotalX = m + cW - 4;
  const headerH = 8;

  doc.setFillColor(...DARK);
  doc.rect(m, y, cW, headerH, "F");
  doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(255, 255, 255);
  doc.text("ITEM", colItemX, y + 5.5);
  doc.text("QTY", colQtyX, y + 5.5, { align: "right" });
  doc.text("TOTAL", colTotalX, y + 5.5, { align: "right" });
  y += headerH;

  rows.forEach((row, i) => {
    const rowH = row.sub ? 12 : 8;
    if (i % 2 === 1) {
      doc.setFillColor(...BG);
      doc.rect(m, y, cW, rowH, "F");
    }
    doc.setDrawColor(...BORDER).setLineWidth(0.2);
    doc.line(m, y + rowH, m + cW, y + rowH);

    doc
      .setFont("helvetica", "normal")
      .setFontSize(9)
      .setTextColor(...DARK);
    doc.text(row.label, colItemX, y + 5.5);
    if (row.sub) {
      doc
        .setFont("helvetica", "normal")
        .setFontSize(7)
        .setTextColor(...MID);
      doc.text(row.sub, colItemX, y + 9.5);
    }
    doc
      .setFont("helvetica", "normal")
      .setFontSize(9)
      .setTextColor(...DARK);
    doc.text(String(row.qty), colQtyX, y + 5.5, { align: "right" });
    doc
      .setFont("helvetica", "bold")
      .setFontSize(9)
      .setTextColor(...DARK);
    doc.text(fmtMoney(row.total), colTotalX, y + 5.5, { align: "right" });

    y += rowH;
  });
  y += 4;

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalsRows: { label: string; value: string; emphasis?: boolean }[] = [
    { label: "Total Price", value: fmtMoney(sale.totalPrice) },
  ];
  if (sale.tcsAmount !== undefined && sale.tcsAmount !== null) {
    totalsRows.push({
      label: "TCS",
      value: fmtMoney(sale.tcsAmount),
    });
  }

  const totalsW = 80;
  const totalsX = m + cW - totalsW;
  totalsRows.forEach((row) => {
    doc
      .setFont("helvetica", "normal")
      .setFontSize(8)
      .setTextColor(...MID);
    doc.text(row.label, totalsX, y + 4.5);
    doc
      .setFont("helvetica", "normal")
      .setFontSize(9)
      .setTextColor(...DARK);
    doc.text(row.value, m + cW - 4, y + 4.5, { align: "right" });
    y += 6;
  });

  const payableH = 12;
  doc.setFillColor(...RED);
  doc.roundedRect(totalsX, y, totalsW, payableH, 1.5, 1.5, "F");
  doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(255, 220, 220);
  doc.text("FINAL PRICE", totalsX + 4, y + 5);
  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(255, 255, 255);
  doc.text(fmtMoney(sale.payablePrice), m + cW - 4, y + 9.5, {
    align: "right",
  });
  y += payableH + 16;

  // ── Signature line ───────────────────────────────────────────────────────
  const sigX2 = m + cW;
  const sigX1 = sigX2 - 55;
  doc.setDrawColor(...DARK).setLineWidth(0.3);
  doc.line(sigX1, y, sigX2, y);
  doc
    .setFont("helvetica", "normal")
    .setFontSize(8)
    .setTextColor(...MID);
  doc.text("Authorized Signature", (sigX1 + sigX2) / 2, y + 5, {
    align: "center",
  });

  // ── Bottom-left note ──────────────────────────────────────────────────────
  const noteLines = doc.splitTextToSize(CHALLAN_NOTE, cW * 0.6);
  const noteY = Math.max(y - 4, pageH - 30);
  doc
    .setFont("helvetica", "normal")
    .setFontSize(7)
    .setTextColor(...MID);
  doc.text(noteLines, m, noteY);

  doc.save(`challan_${sale.challanNo}.pdf`);
};
