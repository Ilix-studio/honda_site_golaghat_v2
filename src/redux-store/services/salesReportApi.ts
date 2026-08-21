import { apiSlice } from "./apiSlice";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SalesReportImportResponse {
  success: boolean;
  message: string;
  data: {
    totalRows: number;
    successCount: number;
    failureCount: number;
    reviewCount: number;
    matchedCount: number;
    unmatchedCount: number;
    conflictCount: number;
    batchId: string;
    sourceFormat: "xlsx" | "csv";
    detectedColumns: string[];
    errors: { row: number; data: Record<string, unknown>; error: string }[];
    created: string[];
  };
}

export type SalesReportMatchOutcome =
  | "matched_status_flipped"
  | "matched_already_sold"
  | "unmatched"
  | "customer_conflict";

export interface SalesReportRow {
  _id: string;
  saleReportId: string;
  rowData: Record<string, unknown>;
  detectedColumns: string[];
  sourceFormat: "xlsx" | "csv";
  modelName: string;
  modelVariant: string;
  customerFirstName: string;
  customerLastName: string;
  customerMobile: string;
  frameNo: string;
  engineNo: string;
  status: string;
  purchaseType: string;
  totalPayment: number;
  matchOutcome: SalesReportMatchOutcome;
  matched: boolean;
  needsReview: boolean;
  matchedStockId?: string;
  customerId?: string;
  customerVehicleId?: string;
  importBatch: string;
  importDate: string;
  branchId: { _id: string; branchName?: string } | string;
  createdAt: string;
}

export interface SalesReportListResponse {
  success: boolean;
  data: SalesReportRow[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface SalesReportBatch {
  batchId: string;
  fileName: string;
  sourceFormat: string;
  importDate: string;
  branchId: string;
  totalRecords: number;
  totalPayment: number;
  matchedCount: number;
  unmatchedCount: number;
  reviewCount: number;
}

export interface SalesReportBatchesResponse {
  success: boolean;
  data: SalesReportBatch[];
}

export interface SalesReportDeletedBatch {
  batchId: string;
  fileName: string;
  importDate: string;
  branchId: string;
  totalRecords: number;
  totalPayment: number;
  deletedBy?: string;
  deletedByRole?: string;
  deletedAt?: string;
}

export interface SalesReportDeletedBatchesResponse {
  success: boolean;
  data: SalesReportDeletedBatch[];
}

export interface SalesReportKpiResponse {
  success: boolean;
  data: {
    year: number;
    totals: { totalRecords: number; totalPayment: number };
    monthly: { month: string; count: number; totalPayment: number }[];
    byPurchaseType: { purchaseType: string; count: number; totalPayment: number }[];
    byOutcome: { outcome: SalesReportMatchOutcome; count: number }[];
    perBranch: { branchId: string; count: number; totalPayment: number }[];
  };
}

export interface SalesReportFilters {
  page?: number;
  limit?: number;
  batchId?: string;
  branchId?: string;
  matched?: boolean;
  purchaseType?: string;
}

export interface SalesReportBatchesByDateFilters {
  date: string;
  branchId?: string;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const salesReportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    importSalesReport: builder.mutation<SalesReportImportResponse, FormData>({
      query: (formData) => ({
        url: "/sales-report/import",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["SalesReport", "SalesReportBatch"],
    }),

    getAllSalesReports: builder.query<SalesReportListResponse, SalesReportFilters | void>({
      query: (filters) => {
        const p = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined && v !== "") p.append(k, String(v));
          });
        }
        const qs = p.toString();
        return `/sales-report${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["SalesReport"],
    }),

    getSalesReportBatches: builder.query<
      SalesReportBatchesResponse,
      { branchId?: string } | void
    >({
      query: (params) => {
        const p = new URLSearchParams();
        if (params?.branchId) p.append("branchId", params.branchId);
        const qs = p.toString();
        return `/sales-report/batches${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["SalesReportBatch"],
    }),

    getSalesReportBatchesByDate: builder.query<
      SalesReportBatchesResponse,
      SalesReportBatchesByDateFilters
    >({
      query: (params) => {
        const p = new URLSearchParams();
        p.append("date", params.date);
        if (params.branchId) p.append("branchId", params.branchId);
        const qs = p.toString();
        return `/sales-report/batches/by-date${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["SalesReportBatch"],
    }),

    getSalesReportKpis: builder.query<
      SalesReportKpiResponse,
      { year?: number; branchId?: string } | void
    >({
      query: (params) => {
        const p = new URLSearchParams();
        if (params?.year) p.append("year", String(params.year));
        if (params?.branchId) p.append("branchId", params.branchId);
        const qs = p.toString();
        return `/sales-report/kpis${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["SalesReport"],
    }),

    getDeletedSalesReportBatches: builder.query<SalesReportDeletedBatchesResponse, void>({
      query: () => "/sales-report/deleted-batches",
      providesTags: ["SalesReportDeletedBatch"],
    }),

    deleteSalesReportBatch: builder.mutation<
      { success: boolean; message: string },
      { batchId: string }
    >({
      query: ({ batchId }) => ({
        url: `/sales-report/batches/${batchId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SalesReport", "SalesReportBatch", "SalesReportDeletedBatch"],
    }),
  }),
});

export const {
  useImportSalesReportMutation,
  useGetAllSalesReportsQuery,
  useGetSalesReportBatchesQuery,
  useGetSalesReportBatchesByDateQuery,
  useGetSalesReportKpisQuery,
  useGetDeletedSalesReportBatchesQuery,
  useDeleteSalesReportBatchMutation,
} = salesReportApi;
