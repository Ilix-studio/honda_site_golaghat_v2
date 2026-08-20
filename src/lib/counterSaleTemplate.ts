/**
 * Downloadable CSV template for the Counter Sale report import.
 *
 * Header strings must stay in sync with CURATED_HEADERS in
 * server3/src/service/counterSaleReport.service.ts. Matching runs through
 * `normalizeHeader`, which lowercases, collapses whitespace and turns
 * `.`/`:`/`/`/`\`/`_`/`-` into spaces — so spacing and case are forgiving, but
 * wording is not, and `#` is significant (it is not stripped).
 *
 * Unlike the service-jobcard import, only "CPOTC Order #" is enforced: a row
 * without it is rejected outright because it is the per-branch dedup key. The
 * other four curated columns feed the dashboard's From/To/Date/Revenue fields
 * and default to empty/0 when absent. Any additional source columns in the file
 * are preserved verbatim on the stored row.
 */
import {
  buildTemplateCsv,
  downloadCsv,
  type TemplateColumn,
} from "@/lib/csvTemplate";

export const COUNTER_SALE_TEMPLATE_COLUMNS: TemplateColumn[] = [
  {
    header: "CPOTC Order #",
    required: true,
    example: "CPOTC-2026-000142",
    hint: "Dedup key — rows repeating one already imported in your branch are rejected.",
  },
  {
    header: "Organization",
    required: false,
    example: "TSANGPOOL HONDA",
    hint: 'Shown as "From".',
  },
  {
    header: "Account Name",
    required: false,
    example: "GOLAGHAT AUTO SPARES",
    hint: 'Shown as "To".',
  },
  {
    header: "Channel Partner Purchase Order Date",
    required: false,
    example: "20-08-2026",
    hint: "DD-MM-YYYY or DD/MM/YYYY.",
  },
  {
    header: "Total Invoice",
    required: false,
    example: "18500.00",
    hint: "Numbers only — ₹ and thousands separators are stripped. Drives batch revenue totals.",
  },
];

export function buildCounterSaleTemplateCsv(): string {
  return buildTemplateCsv(COUNTER_SALE_TEMPLATE_COLUMNS);
}

export function downloadCounterSaleTemplate(): void {
  downloadCsv(
    "counter-sale-import-template.csv",
    buildCounterSaleTemplateCsv(),
  );
}
