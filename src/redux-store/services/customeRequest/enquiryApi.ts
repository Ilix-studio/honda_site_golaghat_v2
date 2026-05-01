// features/enquiry/enquiryApi.ts

import { apiSlice } from "../apiSlice";

interface Address {
  village: string;
  district: string;
  state: string;
  pinCode: string;
}

interface Enquiry {
  _id: string;
  name: string;
  phoneNumber: string;
  address: Address;
  status: "new" | "contacted" | "converted" | "closed";
  createdAt: string;
  updatedAt: string;
}

interface CreateEnquiryRequest {
  name: string;
  phoneNumber: string;
  address: Address;
}

interface GetAllEnquiriesParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface GetAllEnquiriesResponse {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: Enquiry[];
}

interface EnquiryStatsResponse {
  success: boolean;
  data: {
    totalEnquiries: number;
    enquiriesToday: number;
    enquiriesLastWeek: number;
    enquiriesLastMonth: number;
    statusCounts: Record<string, number>;
    topStates: Array<{ _id: string; count: number }>;
    topDistricts: Array<{ _id: string; count: number }>;
  };
}

export const enquiryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createEnquiry: builder.mutation<
      { success: boolean; data: Enquiry; message: string },
      CreateEnquiryRequest
    >({
      query: (data) => ({
        url: "/enquiry-form",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Enquiry"],
    }),

    getAllEnquiries: builder.query<
      GetAllEnquiriesResponse,
      GetAllEnquiriesParams | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        const safeParams = params || {};

        if (safeParams.page)
          searchParams.append("page", safeParams.page.toString());
        if (safeParams.limit)
          searchParams.append("limit", safeParams.limit.toString());
        if (safeParams.status) searchParams.append("status", safeParams.status);
        if (safeParams.search) searchParams.append("search", safeParams.search);
        if (safeParams.sortBy) searchParams.append("sortBy", safeParams.sortBy);
        if (safeParams.sortOrder)
          searchParams.append("sortOrder", safeParams.sortOrder);

        const queryString = searchParams.toString();
        return `/enquiry-form${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Enquiry" as const,
                id: _id,
              })),
              { type: "Enquiry", id: "LIST" },
            ]
          : [{ type: "Enquiry", id: "LIST" }],
    }),

    getEnquiryById: builder.query<{ success: boolean; data: Enquiry }, string>({
      query: (id) => `/enquiry-form/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Enquiry", id }],
    }),

    deleteEnquiry: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/enquiry-form/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Enquiry", id },
        { type: "Enquiry", id: "LIST" },
      ],
    }),

    getEnquiryStats: builder.query<EnquiryStatsResponse, void>({
      query: () => "/enquiry-form/stats",
      providesTags: [{ type: "Enquiry", id: "STATS" }],
    }),
  }),
});

export const {
  useCreateEnquiryMutation,
  useGetAllEnquiriesQuery,
  useGetEnquiryByIdQuery,
  useDeleteEnquiryMutation,
  useGetEnquiryStatsQuery,
} = enquiryApi;
