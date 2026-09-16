import { apiSlice } from "./apiSlice";
import type {
  SalesTimeseriesResponse,
  SalesTimeseriesFilters,
} from "./dataImport.types";

// ─── Types ───────────────────────────────────────────────────────────────────

export type LineItemKind = "PART" | "LABOUR";
export type LineItemClassification =
  | "SOLD"
  | "PENDING_STOCK"
  | "ACCESSORY"
  | "LABOUR";
export type PartMatchQuality = "exact" | "loose" | "none";

export interface InvoiceHeader {
  jobCardNumber?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  jobCardClosedDate?: string;
  frameNumber?: string;
  engineNumber?: string;
  registrationNumber?: string;
  modelName?: string;
  modelCode?: string;
  color?: string;
  serviceType?: string;
  serviceKm?: number;
  advisorName?: string;
  technicianName?: string;
  saleDate?: string;
}

export interface InvoiceCustomer {
  customerName?: string;
  customerMobile?: string;
  customerAccountId?: string;
  customerAddress?: string;
  customerCity?: string;
  customerPin?: string;
}

export interface InvoiceTotals {
  totalPartsAmount?: number;
  totalLabourAmount?: number;
  totalDiscountAmount?: number;
  totalTaxAmount?: number;
  totalInvoiceAmount?: number;
  miscellaneousAmount?: number;
  paymentMode?: string;
}

export interface InvoiceLineItem {
  _id?: string;
  srNo: number;
  partNo: string;
  matchKey?: string;
  description: string;
  hsn: string;
  uom: string;
  kind: LineItemKind;
  qty: number;
  unitPrice?: number;
  discountPct?: number;
  discountRs?: number;
  taxableAmount: number;
  classification: LineItemClassification;
  matchQuality: PartMatchQuality;
  matchedPartId?: string | null;
  isLube: boolean;
  /** Null while PENDING_STOCK; set once the line counts as sold. */
  soldAt?: string | null;
  reconciledAt?: string | null;
  reconciledByBatch?: string | null;
  needsReview: boolean;
  reviewReason?: string;
}

export interface InvoiceRevenue {
  partsRevenue: number;
  lubesRevenue: number;
  accessoriesRevenue: number;
  /** Billed parts not in stock yet — not counted as parts revenue until they are. */
  pendingRevenue: number;
  labourRevenue: number;
}

export interface ClassificationSummary {
  sold: number;
  pending: number;
  accessory: number;
  labour: number;
  looseMatches: number;
  unmatchedPartNumbers: string[];
}

export interface Reconciliation {
  ok: boolean;
  partsTaxable: number;
  labourTaxable: number;
  partsDelta?: number;
  labourDelta?: number;
  notes: string[];
}

/** Response of POST /service-invoice/preview — nothing has been written yet. */
export interface InvoicePreviewResponse {
  success: boolean;
  data: {
    duplicate: boolean;
    existingInvoiceId?: string;
    fileName: string;
    header: InvoiceHeader;
    customer: InvoiceCustomer;
    totals: InvoiceTotals;
    reconciliation: Reconciliation;
    needsReview: boolean;
    reviewReasons: string[];
    lineItems: InvoiceLineItem[];
    summary: ClassificationSummary;
    revenue: InvoiceRevenue;
  };
}

export interface InvoiceCommitResponse {
  success: boolean;
  data: {
    duplicate: boolean;
    invoiceId?: string;
    invoiceNumber: string;
    jobCardNumber?: string;
    message?: string;
    counts: {
      lineItems: number;
      sold: number;
      pending: number;
      accessory: number;
      labour: number;
      consumptionRows: number;
    };
    revenue: InvoiceRevenue;
    autoRegistration?: {
      outcome: string;
      customerId?: string;
      vehicleId?: string;
      nameVerification: "match" | "mismatch" | "unverified";
    };
    freeServicesDisabled: boolean;
    needsReview: boolean;
    reviewReasons: string[];
  };
}

export interface ServiceInvoiceRow {
  _id: string;
  invoiceNumber: string;
  jobCardNumber?: string;
  invoiceDate?: string;
  jobCardClosedDate?: string;
  frameNumber?: string;
  registrationNumber?: string;
  modelName?: string;
  serviceType?: string;
  serviceKm?: number;
  advisorName?: string;
  technicianName?: string;
  customerName?: string;
  customerMobile?: string;
  totalPartsAmount: number;
  totalLabourAmount: number;
  totalInvoiceAmount: number;
  derivedRevenue: InvoiceRevenue;
  needsReview: boolean;
  reconciled: boolean;
  fileName: string;
  createdAt: string;
  branchId?: { _id: string; branchName: string } | string;
}

export interface ServiceInvoiceListResponse {
  success: boolean;
  data: {
    rows: ServiceInvoiceRow[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ServiceInvoiceStatsResponse {
  success: boolean;
  data: {
    year: number;
    monthly: Array<{
      month: string;
      invoiceCount: number;
      partsRevenue: number;
      labourRevenue: number;
      accessoriesRevenue: number;
      totalRevenue: number;
    }>;
    totals: {
      totalInvoices: number;
      totalRevenue: number;
      partsRevenue: number;
      lubesRevenue: number;
      accessoriesRevenue: number;
      labourRevenue: number;
      pendingRevenue: number;
      needsReview: number;
      partsSold: number;
      partsPendingStock: number;
      accessoriesFitted: number;
    };
    byTechnician: Array<{ technician: string; invoices: number; revenue: number }>;
    byModel: Array<{ model: string; invoices: number; revenue: number }>;
  };
}

export interface EffectiveStockRow {
  partNumber: string;
  description?: string;
  stockQty: number;
  consumedQty: number;
  effectiveQty: number;
  unitPrice?: number;
  stockAsOf?: string;
  oversold: boolean;
}

export interface EffectiveStockResponse {
  success: boolean;
  data: {
    rows: EffectiveStockRow[];
    totals: {
      partsTracked: number;
      totalStockQty: number;
      totalConsumedQty: number;
      totalEffectiveQty: number;
      oversoldCount: number;
    };
  };
}

export interface ServiceInvoiceDetailResponse {
  success: boolean;
  data: { invoice: ServiceInvoiceRow; lineItems: InvoiceLineItem[] };
}

export interface ServiceInvoiceFilters {
  page?: number;
  limit?: number;
  needsReview?: boolean;
  q?: string;
  branchId?: string;
}

/** Shape of the error body these endpoints return on a 4xx/5xx. */
export interface ApiErrorBody {
  data?: { message?: string };
}

// ─── Endpoints ───────────────────────────────────────────────────────────────

function withParams(
  url: string,
  params: Record<string, string | number | boolean | undefined>,
): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") search.append(k, String(v));
  });
  const qs = search.toString();
  return qs ? `${url}?${qs}` : url;
}

export const serviceInvoiceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Step 1 of the upload: parse + classify the PDF and show the user what
     * WOULD be imported. Writes nothing, so it invalidates nothing.
     */
    previewServiceInvoice: builder.mutation<InvoicePreviewResponse, FormData>({
      query: (formData) => ({
        url: "/service-invoice/preview",
        method: "POST",
        body: formData,
      }),
    }),

    /** Step 2: actually import the invoice the user just previewed. */
    importServiceInvoice: builder.mutation<InvoiceCommitResponse, FormData>({
      query: (formData) => ({
        url: "/service-invoice/commit",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [
        "ServiceInvoice",
        "ServiceInvoiceStats",
        "ServiceInvoiceLineItem",
        "EffectiveStock",
        // Consumption changes what is effectively on the shelf.
        "PartsStockStatus",
      ],
    }),

    getServiceInvoiceStats: builder.query<
      ServiceInvoiceStatsResponse,
      { year?: number; branchId?: string } | void
    >({
      query: (params) =>
        withParams("/service-invoice/stats", {
          year: params?.year,
          branchId: params?.branchId,
        }),
      providesTags: ["ServiceInvoiceStats"],
    }),

    getServiceInvoices: builder.query<
      ServiceInvoiceListResponse,
      ServiceInvoiceFilters | void
    >({
      query: (filters) =>
        withParams("/service-invoice", {
          page: filters?.page,
          limit: filters?.limit,
          needsReview: filters?.needsReview,
          q: filters?.q,
          branchId: filters?.branchId,
        }),
      providesTags: ["ServiceInvoice"],
    }),

    getServiceInvoiceById: builder.query<
      ServiceInvoiceDetailResponse,
      { id: string; branchId?: string }
    >({
      query: ({ id, branchId }) =>
        withParams(`/service-invoice/${id}`, { branchId }),
      providesTags: ["ServiceInvoice"],
    }),

    getServiceInvoiceLineItems: builder.query<
      { success: boolean; data: { rows: InvoiceLineItem[]; count: number } },
      {
        invoiceId?: string;
        classification?: LineItemClassification;
        limit?: number;
        branchId?: string;
      } | void
    >({
      query: (params) =>
        withParams("/service-invoice/line-items", {
          invoiceId: params?.invoiceId,
          classification: params?.classification,
          limit: params?.limit,
          branchId: params?.branchId,
        }),
      providesTags: ["ServiceInvoiceLineItem"],
    }),

    /** On-hand stock net of service consumption. Requires a specific branch. */
    getEffectiveStock: builder.query<
      EffectiveStockResponse,
      { branchId?: string; partNumber?: string } | void
    >({
      query: (params) =>
        withParams("/service-invoice/effective-stock", {
          branchId: params?.branchId,
          partNumber: params?.partNumber,
        }),
      providesTags: ["EffectiveStock"],
    }),

    /**
     * Revenue timeseries + model/branch/technician breakdowns.
     *
     * Replaces getServiceJobcardSalesTimeseries and deliberately reuses the
     * same SalesTimeseriesResponse shape, so the dashboards that consume it
     * (BranchKpiCharts, DataImportOverview, BranchDataImportDashboard,
     * DashServiceAdmins) needed only their import swapped.
     */
    getServiceInvoiceTimeseries: builder.query<
      SalesTimeseriesResponse,
      SalesTimeseriesFilters
    >({
      query: (filters) => {
        const p = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== undefined && v !== "") p.append(k, String(v));
        });
        const qs = p.toString();
        return `/service-invoice/sales/timeseries${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["SalesTimeseries"],
    }),

    /**
     * Re-tag a pending line as a genuine accessory — the manual way out for a
     * part that is never carried as stock, so it stops waiting for an upload
     * that will never contain it.
     */
    markLineAsAccessory: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (lineItemId) => ({
        url: `/service-invoice/line-items/${lineItemId}/accessory`,
        method: "PATCH",
      }),
      invalidatesTags: [
        "ServiceInvoice",
        "ServiceInvoiceStats",
        "ServiceInvoiceLineItem",
      ],
    }),

    deleteServiceInvoice: builder.mutation<
      {
        success: boolean;
        message: string;
        data: { reversedConsumption: number; reversedAccessories: number };
      },
      string
    >({
      query: (invoiceId) => ({
        url: `/service-invoice/${invoiceId}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        "ServiceInvoice",
        "ServiceInvoiceStats",
        "ServiceInvoiceLineItem",
        "EffectiveStock",
        "PartsStockStatus",
      ],
    }),
  }),
});

export const {
  usePreviewServiceInvoiceMutation,
  useImportServiceInvoiceMutation,
  useGetServiceInvoiceStatsQuery,
  useGetServiceInvoicesQuery,
  useGetServiceInvoiceByIdQuery,
  useGetServiceInvoiceLineItemsQuery,
  useGetEffectiveStockQuery,
  useGetServiceInvoiceTimeseriesQuery,
  useMarkLineAsAccessoryMutation,
  useDeleteServiceInvoiceMutation,
} = serviceInvoiceApi;
