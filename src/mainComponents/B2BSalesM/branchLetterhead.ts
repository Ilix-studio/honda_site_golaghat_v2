// Same mapping as server3/src/models/BikeSystemModel2/B2BSalesModel.ts's
// getBranchLetterhead — duplicated, not shared: separate runtime/language.

// Golaghat's letterhead — also the fallback for any branch without its own
// confirmed address (currently: Telgaram, TODO once its real address/phone
// is provided).
export const DEFAULT_B2B_SALES_HEADING =
  "TSANGPOOL HONDA\nG. F. ROAD, BENGENAKHOWA, GOLAGHAT\nPh. 9401453344, 9401553344";

const SARUPATHAR_HEADING =
  "TSANGPOOL HONDA\nSarupathar, GOLAGHAT\nPh. 9401453322, 9401553322";

export function getBranchLetterhead(branchName?: string): string {
  if (branchName?.toLowerCase().includes("sarupathar")) return SARUPATHAR_HEADING;
  return DEFAULT_B2B_SALES_HEADING;
}
