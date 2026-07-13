import { apiSlice } from "./apiSlice";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PartsImportResponse {
  success: boolean;
  message: string;
  data: {
    totalRows: number;
    successCount: number;
    failureCount: number;
    reviewCount: number;
    batchId: string;
    sourceFormat: "xlsx" | "csv" | "pdf";
    detectedColumns: string[];
    errors: { row: number; data: Record<string, any>; error: string }[];
    created: string[];
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

export interface PartsListResponse {
  success: boolean;
  data: Array<{
    _id: string;
    partId: string;
    rowData: Record<string, any>;
    detectedColumns: string[];
    sourceFormat: string;
    importBatch: string;
    importDate: string;
    needsReview: boolean;
    branchId: { _id: string; branchName?: string } | string;
    createdAt: string;
  }>;
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface PartsBatchesResponse {
  success: boolean;
  data: Array<{
    batchId: string;
    fileName: string;
    sourceFormat: string;
    importDate: string;
    totalParts: number;
    reviewParts: number;
  }>;
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

// ─── API ─────────────────────────────────────────────────────────────────────

export const partsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    importPartsReport: builder.mutation<PartsImportResponse, FormData>({
      query: (formData) => ({
        url: "/parts/import",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Parts", "PartsBatch", "PartsStats"],
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
  useAskPartsAiMutation,
} = partsApi;
