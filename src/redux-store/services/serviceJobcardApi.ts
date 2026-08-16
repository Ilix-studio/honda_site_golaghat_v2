import { apiSlice } from "./apiSlice";
import type {
  SalesTimeseriesResponse,
  SalesTimeseriesFilters,
} from "./dataImport.types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ServiceJobcardAutoRegistrationSummary {
  vehicleMatchedServiceUpdated: number;
  customersRepaired: number;
  customerCreatedVehicleCreated: number;
  customerMatchedVehicleCreated: number;
  conflicts: number;
  skipped: number;
  freeServicesDisabled: number;
  nameMismatches: number;
}

export interface ServiceJobcardImportResponse {
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
    // Upload-over-upload comparison (see serviceJobcardDiff.service.ts) — no
    // "removed" bucket, unlike parts-stock: a job-card export is a period's
    // newly-closed cards, not a full historical re-export.
    duplicate?: boolean;
    previousBatchId?: string | null;
    addedRows?: number;
    changedRows?: number;
    unchangedRows?: number;
    revenueBefore?: number;
    revenueAfter?: number;
    revenueDelta?: number;
    changesMarkdown?: string;
    autoRegistration?: ServiceJobcardAutoRegistrationSummary;
  };
}

export interface ServiceJobcardStatsResponse {
  success: boolean;
  data: {
    year: number;
    monthly: { month: string; jobCardCount: number; reviewCount: number }[];
    totals: { totalJobCards: number; reviewJobCards: number; totalBatches: number };
  };
}

export interface ServiceJobcardNormalizedRow {
  jobCardNumber?: string;
  frameNumber?: string;
  customerName?: string;
  customerMobile?: string;
  modelName?: string;
  modelVariant?: string;
  serviceType?: string;
  amcService?: string;
  currentKms?: number;
  jobCardClosedDate?: string;
  jobCardCreatedDate?: string;
  labourRevenue?: number;
  partsRevenue?: number;
  lubesRevenue?: number;
  accessoriesRevenue?: number;
  totalJobCardRevenue?: number;
  technicianName?: string;
  registrationNumber?: string;
}

export interface ServiceJobcardRowDTO {
  _id: string;
  recordId: string;
  rowData: Record<string, any>;
  normalized: ServiceJobcardNormalizedRow;
  detectedColumns: string[];
  sourceFormat: string;
  importBatch: string;
  importDate: string;
  needsReview: boolean;
  isCurrent?: boolean;
  changeType?: "added" | "changed";
  nameVerification?: "match" | "mismatch" | "unverified";
  branchId: { _id: string; branchName?: string } | string;
  createdAt: string;
}

export interface ServiceJobcardListResponse {
  success: boolean;
  data: ServiceJobcardRowDTO[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface ServiceJobcardByDateFilters extends ServiceJobcardFilters {
  date: string;
}

export interface ServiceJobcardBatchDTO {
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
  unchangedRows: number;
  revenueBefore: number;
  revenueAfter: number;
  revenueDelta: number;
  changesMarkdown: string;
  autoRegistration: ServiceJobcardAutoRegistrationSummary;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceJobcardBatchesResponse {
  success: boolean;
  data: ServiceJobcardBatchDTO[];
}

export interface ServiceJobcardBatchesByDateFilters {
  date: string;
  branchId?: string;
}

export interface ServiceJobcardFilters {
  page?: number;
  limit?: number;
  batchId?: string;
  needsReview?: boolean;
  branchId?: string;
}

export interface ServiceJobcardKpiByDate {
  batchId: string;
  date: string;
  branchId?: string;
  branchName?: string;
  revenueAfter: number;
  revenueDelta: number;
  addedRows: number;
  changedRows: number;
}

export interface ServiceJobcardLatestChange {
  batchId: string;
  fileName: string;
  branchId?: string;
  branchName?: string;
  createdAt: string;
  changesMarkdown: string;
  addedRows: number;
  changedRows: number;
  revenueDelta: number;
}

export interface ServiceJobcardStatusResponse {
  success: boolean;
  data: {
    totalItems: number;
    totalRevenue: number;
    avgRevenuePerCard: number;
    byDate: ServiceJobcardKpiByDate[];
    latestChange: ServiceJobcardLatestChange | null;
  };
}

export interface ServiceJobcardRerunRegistrationResponse {
  success: boolean;
  message: string;
  data: {
    batchId: string;
    rowCount: number;
    autoRegistration: ServiceJobcardAutoRegistrationSummary;
  };
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const serviceJobcardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    importServiceJobcardReport: builder.mutation<ServiceJobcardImportResponse, FormData>({
      query: (formData) => ({
        url: "/service-jobcard/import",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [
        "ServiceJobcard",
        "ServiceJobcardBatch",
        "ServiceJobcardStats",
        "ServiceJobcardStatus",
        "SalesTimeseries",
      ],
    }),

    getServiceJobcardStats: builder.query<
      ServiceJobcardStatsResponse,
      { year?: number; branchId?: string } | void
    >({
      query: (params) => {
        const p = new URLSearchParams();
        if (params?.year) p.append("year", String(params.year));
        if (params?.branchId) p.append("branchId", params.branchId);
        const qs = p.toString();
        return `/service-jobcard/stats${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["ServiceJobcardStats"],
    }),

    getAllServiceJobcards: builder.query<ServiceJobcardListResponse, ServiceJobcardFilters | void>({
      query: (filters) => {
        const p = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined && v !== "") p.append(k, String(v));
          });
        }
        const qs = p.toString();
        return `/service-jobcard${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["ServiceJobcard"],
    }),

    getServiceJobcardsByDate: builder.query<
      ServiceJobcardListResponse,
      ServiceJobcardByDateFilters
    >({
      query: (filters) => {
        const p = new URLSearchParams();
        p.append("date", filters.date);
        Object.entries(filters).forEach(([k, v]) => {
          if (k === "date") return;
          if (v !== undefined && v !== "") p.append(k, String(v));
        });
        const qs = p.toString();
        return `/service-jobcard/by-date${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["ServiceJobcard"],
    }),

    getServiceJobcardBatches: builder.query<
      ServiceJobcardBatchesResponse,
      { branchId?: string } | void
    >({
      query: (params) => {
        const p = new URLSearchParams();
        if (params?.branchId) p.append("branchId", params.branchId);
        const qs = p.toString();
        return `/service-jobcard/batches${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["ServiceJobcardBatch"],
    }),

    getServiceJobcardBatchesByDate: builder.query<
      ServiceJobcardBatchesResponse,
      ServiceJobcardBatchesByDateFilters
    >({
      query: (params) => {
        const p = new URLSearchParams();
        p.append("date", params.date);
        if (params.branchId) p.append("branchId", params.branchId);
        const qs = p.toString();
        return `/service-jobcard/batches/by-date${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["ServiceJobcardBatch"],
    }),

    getServiceJobcardStatus: builder.query<
      ServiceJobcardStatusResponse,
      { branchId?: string } | void
    >({
      query: (params) => {
        const p = new URLSearchParams();
        if (params?.branchId) p.append("branchId", params.branchId);
        const qs = p.toString();
        return `/service-jobcard/stock-status${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["ServiceJobcardStatus"],
    }),

    getServiceJobcardSalesTimeseries: builder.query<
      SalesTimeseriesResponse,
      SalesTimeseriesFilters
    >({
      query: (filters) => {
        const p = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== undefined && v !== "") p.append(k, String(v));
        });
        const qs = p.toString();
        return `/service-jobcard/sales/timeseries${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["SalesTimeseries"],
    }),

    rerunServiceJobcardRegistration: builder.mutation<
      ServiceJobcardRerunRegistrationResponse,
      string
    >({
      query: (batchId) => ({
        url: `/service-jobcard/batches/${batchId}/rerun-registration`,
        method: "POST",
      }),
      invalidatesTags: ["ServiceJobcardBatch", "ServiceJobcardStatus"],
    }),

    deleteServiceJobcardBatch: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (batchId) => ({
        url: `/service-jobcard/batches/${batchId}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        "ServiceJobcard",
        "ServiceJobcardBatch",
        "ServiceJobcardStats",
        "ServiceJobcardStatus",
        "SalesTimeseries",
      ],
    }),
  }),
});

export const {
  useImportServiceJobcardReportMutation,
  useGetServiceJobcardStatsQuery,
  useGetAllServiceJobcardsQuery,
  useGetServiceJobcardsByDateQuery,
  useGetServiceJobcardBatchesQuery,
  useGetServiceJobcardBatchesByDateQuery,
  useGetServiceJobcardStatusQuery,
  useGetServiceJobcardSalesTimeseriesQuery,
  useRerunServiceJobcardRegistrationMutation,
  useDeleteServiceJobcardBatchMutation,
} = serviceJobcardApi;
