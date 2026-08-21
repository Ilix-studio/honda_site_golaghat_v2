import { IPopulatedStockConcept } from "@/types/superAd_Cu.types";

/**
 * `CustomerVehicle.stockConcept` is a polymorphic ref: it populates to either a
 * StockConcept (created through the manual stock form) or a StockConceptCSV
 * (created by a CSV import). The two collections describe the same vehicle with
 * different field names — CSV stock has no `modelName`, `category`, `variant`
 * or `yearOfManufacture` at all, and calls the chassis a `frameNumber`.
 *
 * Reading `stock.modelName` directly therefore renders every CSV-assigned
 * vehicle as "Unknown Model". Resolve through here instead.
 */
export interface StockDisplay {
  modelName: string;
  category: string;
  color: string;
  variant: string;
  year: string;
  engineNumber: string;
  chassisNumber: string;
  /** Whether this came from a CSV import — useful for explaining sparse rows. */
  isCsvStock: boolean;
}

const EM_DASH = "—";

export function resolveStockDisplay(
  stock?: IPopulatedStockConcept | null,
): StockDisplay {
  const isCsvStock = !stock?.modelName && !!stock?.modelVariant;

  return {
    // CSV's `modelVariant` is a combined model+variant string ("ACTIVA 125 DISC
    // OBD2B"), which is the closest thing it has to a model name.
    modelName: stock?.modelName ?? stock?.modelVariant ?? "Unknown Model",
    category: stock?.category ?? EM_DASH,
    color: stock?.color ?? EM_DASH,
    // Blank, not a dash: callers append this conditionally.
    variant: stock?.variant ?? "",
    year: stock?.yearOfManufacture ? String(stock.yearOfManufacture) : EM_DASH,
    engineNumber: stock?.engineNumber ?? EM_DASH,
    chassisNumber: stock?.chassisNumber ?? stock?.frameNumber ?? EM_DASH,
    isCsvStock,
  };
}
