// ─── Literal Unions ───────────────────────────────────────────────────────────

export const JOB_CARD_STATUSES = [
  "draft",
  "temp_bill_sent",
  "customer_reviewed",
  "in_progress",
  "final_bill_sent",
  "customer_confirmed",
  "invoice_generated",
  "closed",
  "cancelled",
] as const;

export type JobCardStatus = (typeof JOB_CARD_STATUSES)[number];

export const LINE_ITEM_TYPES = [
  "labour",
  "part",
  "accessory",
  "custom",
] as const;

export type LineItemType = (typeof LINE_ITEM_TYPES)[number];

export const BILL_TYPES = ["temp", "final"] as const;
export type BillType = (typeof BILL_TYPES)[number];

export const CONFIRMATION_METHODS = ["otp", "button"] as const;
export type ConfirmationMethod = (typeof CONFIRMATION_METHODS)[number];

export const PRIORITY_LEVELS = ["normal", "urgent"] as const;
export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];

export const VEHICLE_CONDITIONS = ["good", "fair", "poor", "damaged"] as const;
export type VehicleCondition = (typeof VEHICLE_CONDITIONS)[number];

// ─── Populated Sub-shapes (from API responses) ────────────────────────────────

export interface PopulatedCustomer {
  _id: string;
  phoneNumber: string;
  firebaseUid?: string;
}

export interface PopulatedVehicle {
  _id: string;
  numberPlate?: string;
  stockConcept?: {
    modelName: string;
    color: string;
    engineCC?: number;
  };
}

export interface PopulatedBranch {
  _id: string;
  branchName: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface PopulatedOpenedBy {
  _id: string;
  name: string;
  applicationId: string;
}

// ─── Line Item ────────────────────────────────────────────────────────────────

export interface JobCardLineItem {
  _id: string;
  /** null for free-text custom items */
  catalogRef: string | null;
  itemType: LineItemType;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  /** Percentage 0–100 */
  discount: number;
  /** Percentage, default 18 (GST) */
  taxRate: number;
  /** Computed server-side — never trust client value */
  lineTotal: number;
  addedBy: "service_admin" | "customer";
  isRemoved: boolean;
  removedBy?: "customer" | "service_admin";
}

// ─── Bill Version Snapshot ────────────────────────────────────────────────────

export interface BillVersion {
  version: number;
  sentAt: string;
  /** ObjectId string of the SA who sent it */
  sentBy: string;
  billType: BillType;
  lineItemsSnapshot: JobCardLineItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
}

// ─── Confirmation State ───────────────────────────────────────────────────────

export interface JobCardConfirmation {
  method: ConfirmationMethod | null;
  /** otpHash and otpExpiresAt are never returned by the API */
  otpAttempts: number;
  confirmedAt?: string;
  confirmedVia: ConfirmationMethod | null;
}

// ─── Physical Checklist ───────────────────────────────────────────────────────

export interface PhysicalChecklist {
  /** 0–100 */
  fuelLevel?: number;
  vehicleCondition?: VehicleCondition;
  paintCondition?: string;
  remarks?: string;
}

// ─── Core JobCard Document (API response shape) ───────────────────────────────

export interface JobCard {
  _id: string;
  jobCardNumber: string;
  /** null for walk-in cards */
  serviceBooking: string | null;
  customer: PopulatedCustomer;
  vehicle: PopulatedVehicle;
  branch: PopulatedBranch;
  openedBy: PopulatedOpenedBy;
  assignedTechnician?: string;
  status: JobCardStatus;
  priority: PriorityLevel;
  serviceType: string;
  physicalChecklist: PhysicalChecklist;
  customerRequests?: string;
  /** Never returned to customer — SA only */
  internalNotes?: string;
  lineItems: JobCardLineItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  /** Append-only audit trail of sent bills */
  billVersions: BillVersion[];
  confirmation: JobCardConfirmation;
  /** Populated when invoice is generated */
  invoiceRef?: JobCardInvoice | string;
  tempBillSentAt?: string;
  customerReviewedAt?: string;
  inProgressAt?: string;
  finalBillSentAt?: string;
  closedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Invoice ──────────────────────────────────────────────────────────────────

export interface JobCardInvoice {
  _id: string;
  invoiceNumber: string;
  jobCard: string;
  branch: PopulatedBranch;
  customer: PopulatedCustomer;
  vehicle: PopulatedVehicle;
  /** Immutable snapshot at time of invoice generation */
  lineItemsSnapshot: JobCardLineItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  /** null until async PDF upload completes */
  pdfUrl: string | null;
  /** SHA-256 tamper-detection token */
  digitalSignatureToken: string;
  issuedAt: string;
  notifiedSuperAdmin: boolean;
  notifiedServiceAdmin: boolean;
  createdAt: string;
}

// ─── Catalog Item ─────────────────────────────────────────────────────────────

export interface JobCardCatalogItem {
  _id: string;
  branch: string;
  itemType: LineItemType;
  name: string;
  description?: string;
  defaultUnitPrice: number;
  defaultTaxRate: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface JobCardListResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: JobCard[];
}

export interface JobCardSingleResponse {
  success: boolean;
  data: JobCard;
}

export interface JobCardMutationResponse {
  success: boolean;
  message: string;
  data: JobCard;
}

export interface InvoiceSingleResponse {
  success: boolean;
  data: JobCardInvoice;
}

export interface OtpRequestResponse {
  success: boolean;
  message: string;
  /** Only present in development builds — never store or display */
  otp?: string;
}

export interface ConfirmResponse {
  success: boolean;
  message: string;
  data: { invoice: JobCardInvoice };
}

export interface CatalogListResponse {
  success: boolean;
  count: number;
  data: JobCardCatalogItem[];
}

export interface CatalogSingleResponse {
  success: boolean;
  message: string;
  data: JobCardCatalogItem;
}

export interface CatalogDeleteResponse {
  success: boolean;
  message: string;
}

// ─── Request Body Types ───────────────────────────────────────────────────────

export interface CreateJobCardBody {
  /** Preferred — links to an existing ServiceBooking */
  serviceBookingId?: string;
  /** Walk-in: provide both customerId and vehicleId */
  customerId?: string;
  vehicleId?: string;
  priority?: PriorityLevel;
  assignedTechnician?: string;
  physicalChecklist?: Partial<PhysicalChecklist>;
  customerRequests?: string;
  internalNotes?: string;
}

export interface AddLineItemBody {
  /** Omit for custom free-text items */
  catalogRef?: string;
  itemType: LineItemType;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  /** Percentage, default 0 */
  discount?: number;
  /** Percentage, default 18 */
  taxRate?: number;
}

export interface CustomerReviewBody {
  /** IDs of line items the customer wants removed */
  removedLineItemIds: string[];
  /** Appended to customerRequests — does not overwrite */
  additionalRequests?: string;
}

export interface CancelJobCardBody {
  cancellationReason: string;
}

export interface CreateCatalogItemBody {
  itemType: LineItemType;
  name: string;
  description?: string;
  defaultUnitPrice: number;
  /** Default 18 */
  defaultTaxRate?: number;
}

export interface UpdateCatalogItemBody {
  name?: string;
  description?: string;
  defaultUnitPrice?: number;
  defaultTaxRate?: number;
  isActive?: boolean;
}

// ─── Query Filter Args ────────────────────────────────────────────────────────

export interface ListJobCardsArgs {
  status?: JobCardStatus;
  branchId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  priority?: PriorityLevel;
  page?: number;
  limit?: number;
}

export interface ListCatalogArgs {
  itemType?: LineItemType;
  search?: string;
  /** Super-Admin only */
  branchId?: string;
  includeInactive?: boolean;
}

// ─── UI Helper Types ──────────────────────────────────────────────────────────

/** Human-readable label for each status — use in badges/chips */
export const JOB_CARD_STATUS_LABELS: Record<JobCardStatus, string> = {
  draft: "Draft",
  temp_bill_sent: "Temp Bill Sent",
  customer_reviewed: "Customer Reviewed",
  in_progress: "In Progress",
  final_bill_sent: "Final Bill Sent",
  customer_confirmed: "Confirmed",
  invoice_generated: "Invoice Generated",
  closed: "Closed",
  cancelled: "Cancelled",
};

/** Statuses where the SA can still modify line items */
export const MUTABLE_STATUSES: JobCardStatus[] = [
  "draft",
  "temp_bill_sent",
  "customer_reviewed",
  "in_progress",
];

/** Statuses visible to the customer in their dashboard */
export const CUSTOMER_VISIBLE_STATUSES: JobCardStatus[] = [
  "temp_bill_sent",
  "customer_reviewed",
  "in_progress",
  "final_bill_sent",
  "customer_confirmed",
  "invoice_generated",
  "closed",
];
