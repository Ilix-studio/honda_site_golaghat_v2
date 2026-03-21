// store/api/accidentReportApi.ts

import { handleApiError } from "../../lib/apiConfig";
import { apiSlice } from "./apiSlice";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReportStatus = "pending" | "reviewed" | "closed";

export interface AccidentReport {
  _id: string;
  reportId: string;
  customer: { _id: string; phoneNumber: string } | string;
  branch: { _id: string; branchName: string; address: string } | string;
  title: string;
  date: string; // ISO string
  time: string; // HH:MM
  location: string;
  isInsuranceAvailable: boolean;
  status: ReportStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Request / Response ────────────────────────────────────────────────────────

export interface CreateAccidentReportRequest {
  title: string;
  date: string; // ISO string or YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  isInsuranceAvailable: boolean;
  branchId: string;
}

export interface AccidentReportFilters {
  status?: ReportStatus;
  branchId?: string;
  isInsuranceAvailable?: boolean;
  page?: number;
  limit?: number;
}

export interface AccidentReportListResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: AccidentReport[];
}

export interface AccidentReportResponse {
  success: boolean;
  data: AccidentReport;
}

export interface UpdateReportStatusRequest {
  id: string;
  status?: ReportStatus;
  adminNotes?: string;
}

// ─── API Slice ────────────────────────────────────────────────────────────────

export const accidentReportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ── CUSTOMER ──────────────────────────────────────────────────────────────

    createAccidentReport: builder.mutation<
      AccidentReportResponse,
      CreateAccidentReportRequest
    >({
      query: (body) => ({
        url: "/accident-reports",
        method: "POST",
        body,
      }),
      extraOptions: { isCustomer: true },
      invalidatesTags: ["AccidentReport"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    getMyAccidentReports: builder.query<AccidentReportListResponse, void>({
      query: () => "/accident-reports/my-reports",
      extraOptions: { isCustomer: true },
      providesTags: ["AccidentReport"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    getMyAccidentReportById: builder.query<AccidentReportResponse, string>({
      query: (id) => `/accident-reports/my-reports/${id}`,
      extraOptions: { isCustomer: true },
      providesTags: (_result, _error, id) => [{ type: "AccidentReport", id }],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // ── ADMIN ─────────────────────────────────────────────────────────────────

    getAllAccidentReports: builder.query<
      AccidentReportListResponse,
      AccidentReportFilters
    >({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status) params.append("status", filters.status);
        if (filters.branchId) params.append("branchId", filters.branchId);
        if (filters.isInsuranceAvailable !== undefined)
          params.append(
            "isInsuranceAvailable",
            String(filters.isInsuranceAvailable)
          );
        if (filters.page) params.append("page", String(filters.page));
        if (filters.limit) params.append("limit", String(filters.limit));
        const qs = params.toString();
        return `/accident-reports${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["AccidentReport"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    getAccidentReportById: builder.query<AccidentReportResponse, string>({
      query: (id) => `/accident-reports/${id}`,
      providesTags: (_result, _error, id) => [{ type: "AccidentReport", id }],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    updateReportStatus: builder.mutation<
      AccidentReportResponse,
      UpdateReportStatusRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/accident-reports/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "AccidentReport",
        { type: "AccidentReport", id },
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Returns a blob — use useLazyDownloadAccidentReportsCsvQuery
    // and handle the response as a Blob in the component.
    downloadAccidentReportsCsv: builder.query<Blob, AccidentReportFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status) params.append("status", filters.status);
        if (filters.branchId) params.append("branchId", filters.branchId);
        if (filters.isInsuranceAvailable !== undefined)
          params.append(
            "isInsuranceAvailable",
            String(filters.isInsuranceAvailable)
          );
        const qs = params.toString();
        return {
          url: `/accident-reports/download${qs ? `?${qs}` : ""}`,
          responseHandler: (response) => response.blob(),
          // Disable default JSON cache behaviour for binary response
          cache: "no-cache",
        };
      },
      transformErrorResponse: (response) => handleApiError(response),
    }),
  }),
});

export const {
  // Customer
  useCreateAccidentReportMutation,
  useGetMyAccidentReportsQuery,
  useGetMyAccidentReportByIdQuery,
  // Admin
  useGetAllAccidentReportsQuery,
  useGetAccidentReportByIdQuery,
  useUpdateReportStatusMutation,
  useLazyDownloadAccidentReportsCsvQuery,
} = accidentReportApi;
