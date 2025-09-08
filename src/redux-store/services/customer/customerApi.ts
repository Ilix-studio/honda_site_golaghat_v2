import { customerBaseQuery } from "@/lib/customerApiConfigs";

import { createApi } from "@reduxjs/toolkit/query/react";
import {
  CreateProfileRequest,
  Customer,
  CustomerAuthResponse,
} from "@/types/customer/customer.types";

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: customerBaseQuery,
  tagTypes: ["Customer"],
  endpoints: (builder) => ({
    // Get customer profile
    getCustomerProfile: builder.query<CustomerAuthResponse, void>({
      query: () => "/customer-profile/profile",
      providesTags: ["Customer"],
    }),

    // Create customer profile
    createProfile: builder.mutation<CustomerAuthResponse, CreateProfileRequest>(
      {
        query: (data) => ({
          url: "/customer-profile/create",
          method: "POST",
          body: data,
        }),
        invalidatesTags: ["Customer"],
      }
    ),

    // Update customer profile
    updateCustomerProfile: builder.mutation<
      CustomerAuthResponse,
      Partial<Customer>
    >({
      query: (data) => ({
        url: "/customer-profile/profile",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Customer"],
    }),

    // Get customer by ID (for admin or self-access)
    getCustomerById: builder.query<CustomerAuthResponse, string>({
      query: (customerId) => `/customer-profile/${customerId}`,
      providesTags: (_result, _error, customerId) => [
        { type: "Customer", id: customerId },
      ],
    }),

    // Get all customers (admin only)
    getAllCustomers: builder.query<
      {
        success: boolean;
        data: Customer[];
        pagination?: {
          page: number;
          limit: number;
          total: number;
        };
      },
      { page?: number; limit?: number; isVerified?: boolean }
    >({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append("page", params.page.toString());
        if (params.limit) searchParams.append("limit", params.limit.toString());
        if (params.isVerified !== undefined) {
          searchParams.append("isVerified", params.isVerified.toString());
        }
        return `/customer-profile?${searchParams.toString()}`;
      },
      providesTags: ["Customer"],
    }),
  }),
});

export const {
  useGetCustomerProfileQuery,
  useCreateProfileMutation,
  useUpdateCustomerProfileMutation,
  useGetCustomerByIdQuery,
  useGetAllCustomersQuery,
} = customerApi;
