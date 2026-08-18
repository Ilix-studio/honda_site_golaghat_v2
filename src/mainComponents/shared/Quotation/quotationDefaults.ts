// Same defaults as server3/src/models/NewFeatures/Quotation.ts's
// DEFAULT_QUOTATION_BANK_DETAILS / DEFAULT_QUOTATION_TERMS — duplicated, not
// shared: separate runtime/language (mirrors how branchLetterhead.ts
// duplicates the B2B Sales letterhead constants).

export const DEFAULT_QUOTATION_BANK_DETAILS =
  "Bank Details- HDFC BANK, GOLAGHAT BRANCH\n" +
  "A/c No-50200028753554\n" +
  "IFSC-HDFC0002937\n" +
  "TSANGPOOL HONDA\n" +
  "GSTIN/UIN-18AJNPP5932A4Z1";

export const DEFAULT_QUOTATION_TERMS =
  "Terms & Conditions:\n" +
  "1. Above rates are inclusive of Local Sales Tax prevailing at the time of delivery will be applicable.\n" +
  "2. DD/ Cheque/ Pay Order should be drawn in favor of (Dealer Name: Biswajit Phukan)\n" +
  "3. Kindly bring proof of residence for registration.\n" +
  "4. Prices quoted in the quotation are as per HMSI Guidelines. It may change as per HMSI.\n" +
  "5. Valid from (*Conditions Apply)";

export const ACCESSORY_PRESETS = ["Side Stand", "Foot Rest", "Seat Cover", "Body Cover"];

export function buildPublicQuotationUrl(quotation: {
  quotationNo: string;
  publicToken: string;
}): string {
  return `${window.location.origin}/quotation/${quotation.quotationNo}/${quotation.publicToken}`;
}
