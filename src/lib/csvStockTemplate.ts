/**
 * Downloadable CSV template for the Stock Concept CSV import.
 *
 * Header strings must stay in sync with CORE_FIELD_MAPPINGS in
 * server3/src/utils/csvSchemaDetector.ts. Note this importer matches headers by
 * exact (case-insensitive) equality against that list — unlike the parts,
 * counter-sale, sales-report and service-jobcard importers, it does NOT collapse
 * whitespace or normalize punctuation. "Engine  Number" or "Engine-Number" will
 * not match; "engine number" will.
 *
 * Model Variant, Engine Number, Frame Number and Color are required — the
 * detector throws "Missing required columns: …" before any row is processed.
 */
import {
  buildTemplateCsv,
  downloadCsv,
  type TemplateColumn,
} from "@/lib/csvTemplate";

export const CSV_STOCK_TEMPLATE_COLUMNS: TemplateColumn[] = [
  {
    header: "Model Variant",
    required: true,
    example: "ACTIVA 125 DISC OBD2B",
    hint: 'Also accepted: "Model", "Variant", "Model Name".',
  },
  {
    header: "Engine Number",
    required: true,
    example: "JK43ED0034204",
    hint: 'Stored uppercased. Also accepted: "Engine No", "Engine".',
  },
  {
    header: "Frame Number",
    required: true,
    example: "ME4JK430BSD034968",
    hint: 'Stored uppercased. Also accepted: "Chassis Number", "Chassis", "Frame".',
  },
  {
    header: "Color",
    required: true,
    example: "REBEL RED METALLIC 2",
    hint: 'Also accepted: "Colour".',
  },
  {
    header: "Location",
    required: false,
    example: "GOLAGHAT",
    hint: 'Defaults to WAREHOUSE when absent. Also accepted: "Branch".',
  },
  {
    header: "Cost Price",
    required: false,
    example: "122206.18",
    hint: "Numbers only — ₹ and separators are stripped. Drives the vehicle's recorded price on assignment.",
  },
];

export function buildCsvStockTemplateCsv(): string {
  return buildTemplateCsv(CSV_STOCK_TEMPLATE_COLUMNS);
}

export function downloadCsvStockTemplate(): void {
  downloadCsv("stock-concept-import-template.csv", buildCsvStockTemplateCsv());
}
