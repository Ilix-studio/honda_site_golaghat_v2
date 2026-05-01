import { apiSlice } from "../apiSlice";
import {
  CheckStatusRequest,
  CheckStatusResponse,
  DeleteApplicationResponse,
  GetApplicationByIdResponse,
  GetApplicationsFilters,
  GetApplicationsResponse,
  GetApplicationsWithBikesFilters,
  GetStatsResponse,
  GetStatsResponseWithBikes,
  SubmitApplicationRequest,
  SubmitApplicationResponse,
  UpdateStatusRequest,
  UpdateStatusResponse,
} from "@/types/getApproved.types";

export const getApprovedApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    submitApplication: builder.mutation<
      SubmitApplicationResponse,
      SubmitApplicationRequest
    >({
      query: (applicationData) => ({
        url: "/getapproved/add",
        method: "POST",
        body: applicationData,
      }),
      invalidatesTags: ["GetApproved", "GetApprovedStats"],
    }),

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

    getApplicationById: builder.query<GetApplicationByIdResponse, string>({
      query: (id) => `/getapproved/${id}`,
      providesTags: (_result, _error, id) => [{ type: "GetApproved", id }],
    }),

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
        return `/getapproved/all${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["GetApproved"],
    }),
    getApplicationsWithBikes: builder.query<
      GetStatsResponseWithBikes,
      GetApplicationsWithBikesFilters
    >({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.page !== undefined)
          params.append("page", filters.page.toString());
        if (filters.limit !== undefined)
          params.append("limit", filters.limit.toString());
        if (filters.status) params.append("status", filters.status);
        if (filters.enquiryType)
          params.append("enquiryType", filters.enquiryType);
        if (filters.category) params.append("category", filters.category);
        if (filters.urgency) params.append("urgency", filters.urgency);
        if (filters.hasTradeIn !== undefined)
          params.append("hasTradeIn", String(filters.hasTradeIn));
        if (filters.search) params.append("search", filters.search);
        if (filters.sortBy) params.append("sortBy", filters.sortBy);
        if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
        const qs = params.toString();
        return `/getapproved/with-bikes${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["GetApproved"],
    }),

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

    getApplicationStats: builder.query<GetStatsResponse, void>({
      query: () => "/getapproved/stats",
      providesTags: ["GetApprovedStats"],
    }),

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
        return `/getapproved/branch/${branchId}${
          queryString ? `?${queryString}` : ""
        }`;
      },
      providesTags: (_result, _error, { branchId }) => [
        { type: "GetApproved", id: `branch-${branchId}` },
      ],
    }),
  }),
});

export const {
  useSubmitApplicationMutation,
  useCheckApplicationStatusMutation,
  useGetApplicationByIdQuery,
  useGetAllApplicationsQuery,
  useGetApplicationStatsQuery,
  useGetApplicationsByBranchQuery,
  useUpdateApplicationStatusMutation,
  useDeleteApplicationMutation,
  useLazyGetAllApplicationsQuery,
  useLazyGetApplicationByIdQuery,
  useLazyGetApplicationStatsQuery,
  useLazyGetApplicationsByBranchQuery,
  //
  useGetApplicationsWithBikesQuery,
  useLazyGetApplicationsWithBikesQuery,
} = getApprovedApi;
