import { apiSlice } from "./apiSlice";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CounterSaleImportResponse {
  success: boolean;
  message: string;
  data: {
    totalRows: number;
    successCount: number;
    failureCount: number;
    reviewCount: number;
    batchId: string;
    sourceFormat: "xlsx" | "csv";
    detectedColumns: string[];
    errors: { row: number; data: Record<string, unknown>; error: string }[];
    created: string[];
  };
}

export interface CounterSaleRow {
  _id: string;
  saleId: string;
  cpotcOrderNumber: string;
  rowData: Record<string, unknown>;
  detectedColumns: string[];
  sourceFormat: "xlsx" | "csv";
  organization: string;
  accountName: string;
  purchaseOrderDate: string | null;
  totalInvoice: number;
  importBatch: string;
  importDate: string;
  needsReview: boolean;
  branchId: { _id: string; branchName?: string } | string;
  createdAt: string;
}

export interface CounterSaleListResponse {
  success: boolean;
  data: CounterSaleRow[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface CounterSaleBatch {
  batchId: string;
  fileName: string;
  sourceFormat: string;
  importDate: string;
  branchId: string;
  totalRecords: number;
  totalInvoice: number;
  reviewCount: number;
}

export interface CounterSaleBatchesResponse {
  success: boolean;
  data: CounterSaleBatch[];
}

export interface CounterSaleDeletedBatch {
  batchId: string;
  fileName: string;
  importDate: string;
  branchId: string;
  totalRecords: number;
  totalInvoice: number;
  deletedBy?: string;
  deletedByRole?: string;
  deletedAt?: string;
}

export interface CounterSaleDeletedBatchesResponse {
  success: boolean;
  data: CounterSaleDeletedBatch[];
}

export interface CounterSaleFilters {
  page?: number;
  limit?: number;
  batchId?: string;
  branchId?: string;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const counterSaleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    importCounterSaleReport: builder.mutation<CounterSaleImportResponse, FormData>({
      query: (formData) => ({
        url: "/counter-sale/import",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["CounterSale", "CounterSaleBatch"],
    }),

    getAllCounterSales: builder.query<CounterSaleListResponse, CounterSaleFilters | void>({
      query: (filters) => {
        const p = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined && v !== "") p.append(k, String(v));
          });
        }
        const qs = p.toString();
        return `/counter-sale${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["CounterSale"],
    }),

    getCounterSaleBatches: builder.query<
      CounterSaleBatchesResponse,
      { branchId?: string } | void
    >({
      query: (params) => {
        const p = new URLSearchParams();
        if (params?.branchId) p.append("branchId", params.branchId);
        const qs = p.toString();
        return `/counter-sale/batches${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["CounterSaleBatch"],
    }),

    getDeletedCounterSaleBatches: builder.query<CounterSaleDeletedBatchesResponse, void>({
      query: () => "/counter-sale/deleted-batches",
      providesTags: ["CounterSaleDeletedBatch"],
    }),

    deleteCounterSaleBatch: builder.mutation<
      { success: boolean; message: string },
      { batchId: string }
    >({
      query: ({ batchId }) => ({
        url: `/counter-sale/batches/${batchId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CounterSale", "CounterSaleBatch", "CounterSaleDeletedBatch"],
    }),
  }),
});

export const {
  useImportCounterSaleReportMutation,
  useGetAllCounterSalesQuery,
  useGetCounterSaleBatchesQuery,
  useGetDeletedCounterSaleBatchesQuery,
  useDeleteCounterSaleBatchMutation,
} = counterSaleApi;
