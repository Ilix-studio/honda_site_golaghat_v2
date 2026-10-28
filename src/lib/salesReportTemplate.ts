/**
 * Downloadable CSV template for the Sold Vehicles Import.
 *
 * Header strings must stay in sync with SALES_REPORT_FIELDS in
 * server3/src/utils/salesReportColumnMatcher.ts. Unlike the other import
 * templates, the columns marked required here are required — that matcher rejects the upload
 * up front, naming the exact missing labels, if any one is absent.
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
];

export function buildSalesReportTemplateCsv(): string {
  return buildTemplateCsv(SALES_REPORT_TEMPLATE_COLUMNS);
}

export function downloadSalesReportTemplate(): void {
  downloadCsv(
    "sold-vehicles-import-template.csv",
    buildSalesReportTemplateCsv(),
  );
}
