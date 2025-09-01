import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../../lib/apiConfig";
import {
  CreateProfileRequest,
  CustomerAuthResponse,
  CustomerLoginRequest,
  CustomersListResponse,
  CustomerStatsResponse,
  GetAllCustomersRequest,
  RegisterCustomerRequest,
  ResendOTPRequest,
  SearchCustomersRequest,
  UpdateProfileRequest,
  VerifyOTPRequest,
} from "@/types/customer/customer.types";

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery,
  tagTypes: ["Customer", "CustomerProfile", "CustomerStats"],
  keepUnusedDataFor: 300, // 5 minutes
  endpoints: (builder) => ({
    // ===== PUBLIC ENDPOINTS =====
    registerCustomer: builder.mutation<
      CustomerAuthResponse,
      RegisterCustomerRequest
    >({
      query: (data) => ({
        url: "/customer/register",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Customer"],
    }),

    verifyOTP: builder.mutation<CustomerAuthResponse, VerifyOTPRequest>({
      query: (data) => ({
        url: "/customer/verify-otp",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Customer", "CustomerProfile"],
    }),

    resendOTP: builder.mutation<CustomerAuthResponse, ResendOTPRequest>({
      query: (data) => ({
        url: "/customer/resend-otp",
        method: "POST",
        body: data,
      }),
    }),

    customerLogin: builder.mutation<CustomerAuthResponse, CustomerLoginRequest>(
      {
        query: (data) => ({
          url: "/customer/login",
          method: "POST",
          body: data,
        }),
        invalidatesTags: ["CustomerProfile"],
      }
    ),

    // ===== CUSTOMER PROTECTED ENDPOINTS =====
    createProfile: builder.mutation<CustomerAuthResponse, CreateProfileRequest>(
      {
        query: (data) => ({
          url: "/customer/profile",
          method: "POST",
          body: data,
        }),
        invalidatesTags: ["CustomerProfile", "Customer"],
      }
    ),

    getCustomerProfile: builder.query<CustomerAuthResponse, void>({
      query: () => "/customer/profile",
      providesTags: ["CustomerProfile"],
    }),

    updateCustomerProfile: builder.mutation<
      CustomerAuthResponse,
      UpdateProfileRequest
    >({
      query: (data) => ({
        url: "/customer/profile",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["CustomerProfile", "Customer"],
    }),

    getCustomerById: builder.query<CustomerAuthResponse, string>({
      query: (customerId) => `/customer/${customerId}`,
      providesTags: (_result, _error, customerId) => [
        { type: "Customer", id: customerId },
      ],
    }),

    // ===== ADMIN ENDPOINTS =====
    getAllCustomers: builder.query<
      CustomersListResponse,
      GetAllCustomersRequest
    >({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.search) params.append("search", filters.search);
        if (filters.isVerified !== undefined)
          params.append("isVerified", filters.isVerified.toString());
        if (filters.district) params.append("district", filters.district);
        if (filters.state) params.append("state", filters.state);

        const queryString = params.toString();
        return `/customer${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Customer"],
    }),

    getCustomerStats: builder.query<CustomerStatsResponse, void>({
      query: () => "/customers/stats",
      providesTags: ["CustomerStats"],
    }),

    searchCustomers: builder.query<
      CustomersListResponse,
      SearchCustomersRequest
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();

        searchParams.append("query", params.query);
        if (params.field) searchParams.append("field", params.field);
        if (params.page) searchParams.append("page", params.page.toString());
        if (params.limit) searchParams.append("limit", params.limit.toString());

        return `/customer/search?${searchParams.toString()}`;
      },
      providesTags: ["Customer"],
    }),

    getCustomersByLocation: builder.query<CustomersListResponse, string>({
      query: (district) => `/customer/location/${district}`,
      providesTags: ["Customer"],
    }),

    // Admin Actions
    verifyCustomer: builder.mutation<CustomerAuthResponse, string>({
      query: (customerId) => ({
        url: `/customer/${customerId}/verify`,
        method: "PATCH",
      }),
      invalidatesTags: ["Customer", "CustomerStats"],
    }),

    deleteCustomer: builder.mutation<CustomerAuthResponse, string>({
      query: (customerId) => ({
        url: `/customer/${customerId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Customer", "CustomerStats"],
    }),
  }),
});

// ============= EXPORT HOOKS =============
export const {
  // Public hooks
  useRegisterCustomerMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
  useCustomerLoginMutation,

  // Customer protected hooks
  useCreateProfileMutation,
  useGetCustomerProfileQuery,
  useUpdateCustomerProfileMutation,
  useGetCustomerByIdQuery,

  // Admin hooks
  useGetAllCustomersQuery,
  useGetCustomerStatsQuery,
  useSearchCustomersQuery,
  useGetCustomersByLocationQuery,
  useVerifyCustomerMutation,
  useDeleteCustomerMutation,

  // Utility hooks
  useLazyGetCustomerProfileQuery,
  useLazySearchCustomersQuery,
  useLazyGetCustomersByLocationQuery,
} = customerApi;
