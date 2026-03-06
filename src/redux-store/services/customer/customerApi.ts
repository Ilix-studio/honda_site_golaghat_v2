import { apiSlice } from "../apiSlice";
import {
  CreateProfileRequest,
  Customer,
  CustomerAuthResponse,
} from "@/types/customer/customer.types";

export const customerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get customer profile
    getCustomerProfile: builder.query<CustomerAuthResponse, void>({
      query: () => "/customer-profile/get",
      extraOptions: { isCustomer: true },
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
        extraOptions: { isCustomer: true },
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
      extraOptions: { isCustomer: true },
      invalidatesTags: ["Customer"],
    }),

    // Get customer by ID (for admin or self-access)
    getCustomerById: builder.query<CustomerAuthResponse, string>({
      query: (customerId) => `/customer-profile/${customerId}`,
      extraOptions: { isCustomer: true },
      providesTags: (_result, _error, customerId) => [
        { type: "Customer", id: customerId },
      ],
    }),

    // Get all customers (admin only - likely uses Admin auth, but let's check original behavior. Original used customerBaseQuery so maybe mixed? Admin usually uses admin auth. 
    // Wait, the original file imported `customerBaseQuery`. So it used Firebase token. 
    // If Admin uses this endpoint, Admin needs Firebase token? Or is this endpoint actually for Admin usage?
    // "Get all customers (admin only)" comment implies Admin. 
    // If the backend expects Admin Bearer token, then we shouldn't use `isCustomer: true`.
    // However, the original code used `customerBaseQuery` for the WHOLE file. 
    // Let's assume for now everything in this file was using Firebase Auth.
getAllCustomers: builder.query<
  { success: boolean; data: Customer[]; pagination?: { page: number; limit: number; total: number } },
  { page?: number; limit?: number; isVerified?: boolean }
>({
  query: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.isVerified !== undefined)
      searchParams.append("isVerified", params.isVerified.toString());
    return `/customer-profile?${searchParams.toString()}`;
  },
  // No isCustomer — admin JWT route
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


