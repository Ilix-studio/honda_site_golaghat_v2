/**
 * Shared CSV-template plumbing for the dealer-export import screens
 * (service job cards, counter sale). Each module owns its own column
 * vocabulary — this only handles turning that into a file the browser
 * downloads and Excel opens cleanly.
 */

export interface TemplateColumn {
  header: string;
  required: boolean;
  /** Value used in the template's example row. */
  example: string;
  /** Optional UI-only note about the column's expected format. */
  hint?: string;
}

/** RFC-4180 quoting: wrap when the value carries a comma, quote or newline. */
const escapeCsvCell = (value: string): string =>
  /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

const toCsvRow = (cells: string[]): string => cells.map(escapeCsvCell).join(",");

/**
 * Header row plus one example row. The example is intentionally included so the
 * expected date and number formatting is visible in the file itself — it should
 * be deleted before uploading real data, since it would otherwise import as a
 * genuine row.
 *
 * Written with a UTF-8 BOM and CRLF endings so Excel opens it without mangling
 * the header row.
 */
export function buildTemplateCsv(columns: TemplateColumn[]): string {
  const headers = toCsvRow(columns.map((c) => c.header));
  const example = toCsvRow(columns.map((c) => c.example));
  return `\uFEFF${headers}\r\n${example}\r\n`;
}

export function downloadCsv(fileName: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
