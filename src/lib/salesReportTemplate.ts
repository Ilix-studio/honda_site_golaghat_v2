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

export const SALES_REPORT_TEMPLATE_COLUMNS: TemplateColumn[] = [
  {
    header: "Date",
    required: true,
    example: "15/10/2026",
    hint: "Sale date, dd/mm/yyyy. Rows with a blank or unreadable date are rejected.",
  },
  {
    header: "Model Name",
    required: true,
    example: "ACTIVA 125",
  },
  {
    header: "Customer First Name",
    required: true,
    example: "Himanku",
  },
  {
    header: "Customer Last Name",
    required: true,
    example: "Borah",
  },
  {
    header: "Contact Mobile",
    required: true,
    example: "9678467033",
    hint: "10 digits. Used to create or link the customer.",
  },
  {
    header: "Frame No",
    required: true,
    example: "ME4JK430BSD034968",
    hint: "Dedup key within your branch, and the primary stock match.",
  },
  {
    header: "Engine No",
    required: true,
    example: "JK43ED0034204",
    hint: "Fallback stock match when Frame No does not hit.",
  },
  {
    header: "Total Payment",
    required: false,
    example: "122206.18",
    hint: "Optional. Numbers only. If blank, the ex-showroom price of the CSV stock matched by Frame/Engine No is used.",
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
