import { apiSlice } from "./apiSlice";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PartsImportResponse {
  success: boolean;
  message: string;
  data: {
    totalRows: number;
    // Absent when `duplicate` is true (nothing was parsed into a batch).
    importedRows?: number;
    duplicateRows?: number;
    reviewRows?: number;
    batchId?: string;
    sourceFormat?: "xlsx" | "csv" | "pdf";
    detectedColumns?: string[];
    errors?: { row: number; data: Record<string, any>; error: string }[];
    // Upload-over-upload comparison (see partsStockDiff.service.ts)
    duplicate?: boolean;
    previousBatchId?: string | null;
    addedRows?: number;
    changedRows?: number;
    removedRows?: number;
    unchangedRows?: number;
    revenueBefore?: number;
    revenueAfter?: number;
    revenueDelta?: number;
    changesMarkdown?: string;
  };
}

export interface PartsStatsResponse {
  success: boolean;
  data: {
    year: number;
    monthly: { month: string; partCount: number; reviewCount: number }[];
    totals: { totalParts: number; reviewParts: number; totalBatches: number };
  };
}

export interface PartsNormalizedRow {
  partNumber?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  inventoryLocationName?: string;
}

export interface PartsRowDTO {
  _id: string;
  partId: string;
  rowData: Record<string, any>;
  normalized: PartsNormalizedRow;
  detectedColumns: string[];
  sourceFormat: string;
  importBatch: string;
  importDate: string;
  needsReview: boolean;
  isCurrent?: boolean;
  changeType?: "added" | "changed";
  branchId: { _id: string; branchName?: string } | string;
  createdAt: string;
}

export interface PartsListResponse {
  success: boolean;
  data: PartsRowDTO[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface PartsBatchDTO {
  _id: string;
  batchId: string;
  fileName: string;
  sourceFormat: "xlsx" | "csv" | "pdf";
  detectedColumns: string[];
  totalRows: number;
  importedRows: number;
  duplicateRows: number;
  reviewRows: number;
  status: "completed" | "completed_with_errors" | "failed";
  branchId: { _id: string; branchName?: string } | string;
  uploadedByRole: string;
  isActive: boolean;
  previousBatchId?: string | null;
  addedRows: number;
  changedRows: number;
  removedRows: number;
  unchangedRows: number;
  revenueBefore: number;
  revenueAfter: number;
  revenueDelta: number;
  changesMarkdown: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartsBatchesResponse {
  success: boolean;
  data: PartsBatchDTO[];
}

export interface PartsAiResponse {
  success: boolean;
  data: { answer: string; model: string };
}

export interface PartsFilters {
  page?: number;
  limit?: number;
  batchId?: string;
  needsReview?: boolean;
  branchId?: string;
}

export interface PartsStockKpiByDate {
  batchId: string;
  date: string;
  branchId?: string;
  branchName?: string;
  revenueAfter: number;
  revenueDelta: number;
  addedRows: number;
  changedRows: number;
  removedRows: number;
}

export interface PartsStockLatestChange {
  batchId: string;
  fileName: string;
  branchId?: string;
  branchName?: string;
  createdAt: string;
  changesMarkdown: string;
  addedRows: number;
  changedRows: number;
  removedRows: number;
  revenueDelta: number;
}

export interface PartsStockStatusResponse {
  success: boolean;
  data: {
    totalItems: number;
    totalRevenue: number;
    avgUnitPrice: number;
    byDate: PartsStockKpiByDate[];
    latestChange: PartsStockLatestChange | null;
  };
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const partsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    importPartsReport: builder.mutation<PartsImportResponse, FormData>({
      query: (formData) => ({
        url: "/parts/import",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Parts", "PartsBatch", "PartsStats", "PartsStockStatus"],
    }),

    getPartsStats: builder.query<
      PartsStatsResponse,
      { year?: number; branchId?: string } | void
    >({
      query: (params) => {
        const p = new URLSearchParams();
        if (params?.year) p.append("year", String(params.year));
        if (params?.branchId) p.append("branchId", params.branchId);
        const qs = p.toString();
        return `/parts/stats${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["PartsStats"],
    }),

    getAllParts: builder.query<PartsListResponse, PartsFilters | void>({
      query: (filters) => {
        const p = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined && v !== "") p.append(k, String(v));
          });
        }
        const qs = p.toString();
        return `/parts${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Parts"],
    }),

    getPartsBatches: builder.query<
      PartsBatchesResponse,
      { branchId?: string } | void
    >({
      query: (params) => {
        const p = new URLSearchParams();
        if (params?.branchId) p.append("branchId", params.branchId);
        const qs = p.toString();
        return `/parts/batches${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["PartsBatch"],
    }),

    getPartsStockStatus: builder.query<
      PartsStockStatusResponse,
      { branchId?: string } | void
    >({
      query: (params) => {
        const p = new URLSearchParams();
        if (params?.branchId) p.append("branchId", params.branchId);
        const qs = p.toString();
        return `/parts/stock-status${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["PartsStockStatus"],
    }),

    askPartsAi: builder.mutation<
      PartsAiResponse,
      { mode: "summary" | "chat"; question?: string; branchId?: string }
    >({
      query: (body) => ({
        url: "/parts/ai",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useImportPartsReportMutation,
  useGetPartsStatsQuery,
  useGetAllPartsQuery,
  useGetPartsBatchesQuery,
  useGetPartsStockStatusQuery,
  useAskPartsAiMutation,
} = partsApi;
