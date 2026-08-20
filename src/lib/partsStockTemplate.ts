/**
 * Downloadable CSV template for the Parts Stock import.
 *
 * Header strings must stay in sync with PARTS_STOCK_FIELDS in
 * server3/src/utils/partsColumnMatcher.ts. Matching normalizes case, collapses
 * whitespace and treats `.`/`:`/`/`/`\`/`_`/`-` as spaces, but the wording
 * itself has to match — an upload missing any required column is rejected.
 */
import {
  buildTemplateCsv,
  downloadCsv,
  type TemplateColumn,
} from "@/lib/csvTemplate";

export const PARTS_STOCK_TEMPLATE_COLUMNS: TemplateColumn[] = [
  {
    header: "Part Number",
    required: true,
    example: "06435-K0W-N01",
    hint: "Stored uppercased — this is the key each upload is diffed against.",
  },
  {
    header: "Description",
    required: true,
    example: "BRAKE PAD SET, FRONT",
  },
  {
    header: "Quantity",
    required: true,
    example: "24",
    hint: "Numbers only.",
  },
  {
    header: "Unit Price",
    required: false,
    example: "845.00",
    hint: "Numbers only — ₹ and thousands separators are stripped.",
  },
  {
    header: "Location",
    required: false,
    example: "GOLAGHAT",
    hint: 'Also accepted as "Inventory Location Name".',
  },
];

export function buildPartsStockTemplateCsv(): string {
  return buildTemplateCsv(PARTS_STOCK_TEMPLATE_COLUMNS);
}

export function downloadPartsStockTemplate(): void {
  downloadCsv("parts-stock-import-template.csv", buildPartsStockTemplateCsv());
}
