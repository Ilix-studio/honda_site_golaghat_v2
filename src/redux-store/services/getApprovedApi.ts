// src/redux-store/services/getApprovedApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../lib/apiConfig";
import {
  CheckStatusRequest,
  CheckStatusResponse,
  DeleteApplicationResponse,
  GetApplicationByIdResponse,
  GetApplicationsFilters,
  GetApplicationsResponse,
  GetStatsResponse,
  SubmitApplicationRequest,
  SubmitApplicationResponse,
  UpdateStatusRequest,
  UpdateStatusResponse,
} from "@/types/getApproved.types";

export const getApprovedApi = createApi({
  reducerPath: "getApprovedApi",
  baseQuery,
  tagTypes: ["GetApproved", "GetApprovedStats"],
  endpoints: (builder) => ({
    // Public endpoints

    // Submit new application
    submitApplication: builder.mutation<
      SubmitApplicationResponse,
      SubmitApplicationRequest
    >({
      query: (applicationData) => ({
        url: "/getapproved",
        method: "POST",
        body: applicationData,
      }),
      invalidatesTags: ["GetApproved", "GetApprovedStats"],
    }),

    // Check application status (public)
    checkApplicationStatus: builder.mutation<
      CheckStatusResponse,
      CheckStatusRequest
    >({
      query: (data) => ({
        url: "/getapproved/check-status",
        method: "POST",
        body: data,
      }),
    }),

    // Get application by ID (can be public with application ID)
    getApplicationById: builder.query<GetApplicationByIdResponse, string>({
      query: (id) => ({
        url: `/getapproved/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "GetApproved", id }],
    }),

    // Protected endpoints (Admin only)

    // Get all applications with filters and pagination
    getAllApplications: builder.query<
      GetApplicationsResponse,
      GetApplicationsFilters
    >({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters.page !== undefined)
          params.append("page", filters.page.toString());
        if (filters.limit !== undefined)
          params.append("limit", filters.limit.toString());
        if (filters.status) params.append("status", filters.status);
        if (filters.employmentType)
          params.append("employmentType", filters.employmentType);
        if (filters.creditScoreRange)
          params.append("creditScoreRange", filters.creditScoreRange);
        if (filters.search) params.append("search", filters.search);
        if (filters.sortBy) params.append("sortBy", filters.sortBy);
        if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
        if (filters.startDate) params.append("startDate", filters.startDate);
        if (filters.endDate) params.append("endDate", filters.endDate);
        if (filters.branch) params.append("branch", filters.branch);

        const queryString = params.toString();
        return {
          url: `/getapproved${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["GetApproved"],
    }),

    // Update application status
    updateApplicationStatus: builder.mutation<
      UpdateStatusResponse,
      { id: string; data: UpdateStatusRequest }
    >({
      query: ({ id, data }) => ({
        url: `/getapproved/${id}/status`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "GetApproved", id },
        "GetApproved",
        "GetApprovedStats",
      ],
    }),

    // Delete application (Super-Admin only)
    deleteApplication: builder.mutation<DeleteApplicationResponse, string>({
      query: (id) => ({
        url: `/getapproved/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "GetApproved", id },
        "GetApproved",
        "GetApprovedStats",
      ],
    }),

    // Get application statistics
    getApplicationStats: builder.query<GetStatsResponse, void>({
      query: () => ({
        url: "/getapproved/stats",
        method: "GET",
      }),
      providesTags: ["GetApprovedStats"],
    }),

    // Get applications by branch
    getApplicationsByBranch: builder.query<
      GetApplicationsResponse,
      { branchId: string; filters?: Omit<GetApplicationsFilters, "branch"> }
    >({
      query: ({ branchId, filters = {} }) => {
        const params = new URLSearchParams();

        if (filters.page !== undefined)
          params.append("page", filters.page.toString());
        if (filters.limit !== undefined)
          params.append("limit", filters.limit.toString());
        if (filters.status) params.append("status", filters.status);

        const queryString = params.toString();
        return {
          url: `/getapproved/branch/${branchId}${
            queryString ? `?${queryString}` : ""
          }`,
          method: "GET",
        };
      },
      providesTags: (_result, _error, { branchId }) => [
        { type: "GetApproved", id: `branch-${branchId}` },
      ],
    }),
  }),
});

export const {
  // Public mutations
  useSubmitApplicationMutation,
  useCheckApplicationStatusMutation,

  // Public queries
  useGetApplicationByIdQuery,

  // Protected queries
  useGetAllApplicationsQuery,
  useGetApplicationStatsQuery,
  useGetApplicationsByBranchQuery,

  // Protected mutations
  useUpdateApplicationStatusMutation,
  useDeleteApplicationMutation,

  // Lazy queries for conditional fetching
  useLazyGetAllApplicationsQuery,
  useLazyGetApplicationByIdQuery,
  useLazyGetApplicationStatsQuery,
  useLazyGetApplicationsByBranchQuery,
} = getApprovedApi;
