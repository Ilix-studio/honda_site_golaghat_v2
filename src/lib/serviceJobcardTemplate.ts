/**
 * Downloadable CSV template for the Service Records import.
 *
 * Header strings here must stay in sync with SERVICE_JOBCARD_FIELDS in
 * server3/src/utils/serviceJobcardColumnMatcher.ts — that matcher maps a file's
 * columns onto canonical keys by exact (normalized) header text, and rejects
 * the upload when a required column is missing. The normalizer is forgiving
 * about case, spacing and `-`/`_`/`.`/`:` punctuation, but not about wording.
 */

export interface TemplateColumn {
  header: string;
  required: boolean;
  /** Value used in the template's example row. */
  example: string;
  hint?: string;
}

export const SERVICE_JOBCARD_TEMPLATE_COLUMNS: TemplateColumn[] = [
  {
    header: "Job Card Number",
    required: true,
    example: "JC-AS140001-02-2627-002242",
    hint: "Unique per job card — this is the key each upload is diffed against.",
  },
  {
    header: "Frame Number",
    required: true,
    example: "ME4JF98FGPG001383",
    hint: "Used to match the vehicle.",
  },
  {
    header: "Job Card Closed Date",
    required: true,
    example: "20-08-2026",
    hint: "DD-MM-YYYY or DD/MM/YYYY.",
  },
  {
    header: "Total Job Card Revenue",
    required: true,
    example: "4250.00",
    hint: "Numbers only — ₹ and thousands separators are stripped.",
  },
  { header: "Job Card Created Date", required: false, example: "18-08-2026" },
  {
    header: "Customer Name",
    required: false,
    example: "YAMRAJ CHETRY",
    hint: "Honorifics (Mr./Mrs./Ms.) are stripped automatically.",
  },
  {
    header: "Customer Mobile",
    required: false,
    example: "8133027125",
    hint: "10 digits. Used to match or auto-create the customer.",
  },
  { header: "Registration Number", required: false, example: "AS14K1234" },
  { header: "Model Name", required: false, example: "DIO OBD2" },
  { header: "Model Variant", required: false, example: "DIO DLX-OBD2" },
  { header: "Service Type", required: false, example: "FREE" },
  { header: "AMC Service", required: false, example: "NO" },
  { header: "Current KMs", required: false, example: "3200" },
  { header: "Labour Revenue", required: false, example: "600.00" },
  { header: "Parts Revenue", required: false, example: "2400.00" },
  { header: "Lubes Revenue", required: false, example: "950.00" },
  { header: "Accessories Revenue", required: false, example: "300.00" },
  { header: "Technician Name", required: false, example: "RAJU DAS" },
];

/** RFC-4180 quoting: wrap when the value carries a comma, quote or newline. */
const escapeCsvCell = (value: string): string =>
  /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

const toCsvRow = (cells: string[]): string => cells.map(escapeCsvCell).join(",");

/**
 * Header row plus one example row. The example is intentionally included so the
 * expected date and number formatting is visible in the file itself — delete it
 * before uploading real data (an example-only upload would import that one row).
 */
export function buildServiceJobcardTemplateCsv(): string {
  const headers = SERVICE_JOBCARD_TEMPLATE_COLUMNS.map((c) => c.header);
  const example = SERVICE_JOBCARD_TEMPLATE_COLUMNS.map((c) => c.example);
  // CRLF + BOM so Excel opens it as UTF-8 without mangling the header row.
  return `\uFEFF${toCsvRow(headers)}\r\n${toCsvRow(example)}\r\n`;
}

export function downloadServiceJobcardTemplate(): void {
  const blob = new Blob([buildServiceJobcardTemplateCsv()], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "service-jobcard-import-template.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
