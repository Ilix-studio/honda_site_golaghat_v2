/**
 * Downloadable CSV template for the Sold Vehicles Import.
 *
 * Header strings must stay in sync with SALES_REPORT_FIELDS in
 * server3/src/utils/salesReportColumnMatcher.ts. Unlike the other import
 * templates, the columns marked required here are required — that matcher rejects the upload
 * up front, naming the exact missing labels, if any one is absent. EX SHOWROOM,
 * INSURANCE and REGISTRATION are not required to upload, but a row missing any
 * of them is held as pending until they are entered.
 *
 * Matching normalizes case, collapses whitespace and treats
 * `.`/`:`/`/`/`\`/`_`/`-` as spaces, and several fields accept aliases (e.g.
 * "Chassis No" for "Frame No"), but the canonical labels below are the safe
 * choice.
 */
import {
  buildTemplateCsv,
  downloadCsv,
  type TemplateColumn,
} from "@/lib/csvTemplate";

const FLAG_HINT = "Optional. 1 = taken, 0 = not taken.";

/** The sales register's own columns, in its order. */
export const SALES_REPORT_TEMPLATE_COLUMNS: TemplateColumn[] = [
  {
    header: "SL NO.",
    required: false,
    example: "1",
    hint: "Optional. Register serial number.",
  },
  {
    header: "DATE",
    required: true,
    example: "10/15/2026",
    hint: "Sale date, mm/dd/yyyy. Rows with a blank or unreadable date are rejected.",
  },
  {
    header: "CUSTOMER NAME",
    required: true,
    example: "Himanku Borah",
    hint: "Full name in one cell.",
  },
  {
    header: "PHONE NO.",
    required: true,
    example: "9678467033",
    hint: "10 digits. Used to create or link the customer.",
  },
  {
    header: "LOCATION",
    required: false,
    example: "GOLAGHAT",
    hint: "Optional.",
  },
  {
    header: "FRAME NO",
    required: true,
    example: "ME4JK430BSD034968",
    hint: "Dedup key within your branch, and the primary stock match.",
  },
  {
    header: "ENGINE NO",
    required: true,
    example: "JK43ED0034204",
    hint: "Fallback stock match when FRAME NO does not hit.",
  },
  {
    header: "MODEL NAME",
    required: true,
    example: "ACTIVA 125",
  },
  {
    header: "COLOUR",
    required: false,
    example: "GREY",
    hint: "Optional.",
  },
  { header: "EW", required: false, example: "1", hint: FLAG_HINT },
  { header: "AMC", required: false, example: "0", hint: FLAG_HINT },
  { header: "RSA", required: false, example: "0", hint: FLAG_HINT },
  { header: "JOY CLUB", required: false, example: "0", hint: FLAG_HINT },
  {
    header: "FINANCE",
    required: false,
    example: "CASH",
    hint: "Optional. Financier name, or CASH.",
  },
  {
    header: "EXECUTIVE",
    required: false,
    example: "RAHUL",
    hint: "Optional. Sales executive.",
  },
  {
    header: "STATUS",
    required: false,
    example: "SOLD",
    hint: "Optional. Blank is recorded as Sold.",
  },
  {
    header: "PRODUCT CODE",
    required: false,
    example: "ACT125DLX",
    hint: "Optional.",
  },
  {
    header: "EX SHOWROOM",
    required: false,
    example: "92000",
    hint: "Important. Amount in rupees. If this, INSURANCE or REGISTRATION is blank, the row is held until you enter them after upload.",
  },
  {
    header: "INSURANCE",
    required: false,
    example: "6500",
    hint: "Important. Amount in rupees.",
  },
  {
    header: "REGISTRATION",
    required: false,
    example: "3800",
    hint: "Important. Amount in rupees. Total payment = EX SHOWROOM + INSURANCE + REGISTRATION.",
  },
];

/** Money columns that are not required to upload, but that a row is held for if any is blank. */
const AMOUNT_HEADERS = ["EX SHOWROOM", "INSURANCE", "REGISTRATION"];

/** Columns the upload guide lists under "Important": the required ones plus the three amounts. */
export const isImportantColumn = (c: TemplateColumn) =>
  c.required || AMOUNT_HEADERS.includes(c.header);

export function buildSalesReportTemplateCsv(): string {
  // Headers only — no example row to delete before uploading.
  return buildTemplateCsv(SALES_REPORT_TEMPLATE_COLUMNS, { includeExample: false });
}

export function downloadSalesReportTemplate(): void {
  downloadCsv(
    "sold-vehicles-import-template.csv",
    buildSalesReportTemplateCsv(),
  );
}
