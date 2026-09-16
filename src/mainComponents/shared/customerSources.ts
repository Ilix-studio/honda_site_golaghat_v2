import {
  ReceiptText,
  Handshake,
  FileSpreadsheet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import {
  CUSTOMER_SOURCE_TAGS,
  type CustomerSourceTag,
} from "@/redux-store/services/customer/customerAdminApi";

/**
 * Presentation for the four pipelines that put a customer on record — shared
 * by the customer list itself and by every dashboard's "View Customer List"
 * tile, so a label only ever has to change in one place.
 *
 * Distinct from `creationSource`, which records how a customer FIRST entered
 * the system and is written once. These say "where can I see them now", which
 * is what lets one customer carry several at a time.
 */
export const CUSTOMER_SOURCE_META: Record<
  CustomerSourceTag,
  {
    /** Full name — filter chips, tooltip headings. */
    label: string;
    /** Badge text inside a table row. */
    short: string;
    /** Reads as "<n> <countLabel>" in a sentence, so it stays lowercase. */
    countLabel: string;
    icon: LucideIcon;
    className: string;
    hint: string;
  }
> = {
  "sales-report": {
    label: "Sales Report",
    short: "Sales",
    countLabel: "sales report",
    icon: ReceiptText,
    className: "bg-amber-50 text-amber-700 border-amber-200",
    hint: "Named on a row of an uploaded sales report.",
  },
  "manual-assign": {
    label: "Manual Assign",
    short: "Manual",
    countLabel: "manual",
    icon: Handshake,
    className: "bg-violet-50 text-violet-700 border-violet-200",
    hint: "Has a vehicle assigned from manually-entered stock.",
  },
  "csv-assign": {
    label: "CSV Assign",
    short: "CSV",
    countLabel: "CSV",
    icon: FileSpreadsheet,
    className: "bg-blue-50 text-blue-700 border-blue-200",
    hint: "Has a vehicle assigned from CSV / daily stock.",
  },
  "service-upload": {
    label: "Service Upload",
    short: "Service",
    countLabel: "service",
    icon: Wrench,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    hint: "Appears on an imported service invoice.",
  },
};

/** Shown before any counts have arrived, and when every pipeline is empty. */
const CUSTOMER_SOURCES_FALLBACK =
  "Sales reports, stock assignments & service uploads";

/**
 * One-line breakdown for the dashboard tile, e.g. "16 sales report · 2 CSV ·
 * 2 service". Empty pipelines are dropped rather than rendered as zeroes —
 * most dealerships only ever use a couple of them, and a row of "0 manual"
 * crowds out the numbers that matter.
 *
 * These deliberately don't sum to the tile's total: a customer carrying both
 * a sales-report row and a service invoice is counted under each.
 */
export function describeCustomerSources(
  sourceCounts?: Record<CustomerSourceTag, number>,
): string {
  if (!sourceCounts) return CUSTOMER_SOURCES_FALLBACK;

  const parts = CUSTOMER_SOURCE_TAGS.filter(
    (tag) => (sourceCounts[tag] ?? 0) > 0,
  ).map((tag) => `${sourceCounts[tag]} ${CUSTOMER_SOURCE_META[tag].countLabel}`);

  return parts.length ? parts.join(" · ") : CUSTOMER_SOURCES_FALLBACK;
}
