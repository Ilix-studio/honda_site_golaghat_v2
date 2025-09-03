import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../../lib/apiConfig";

// Export types to avoid TypeScript errors
export interface CustomerLoginRequest {
  idToken: string;
  phoneNumber: string;
}

export interface Customer {
  id: string;
  phoneNumber: string;
  firebaseUid: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isVerified: boolean;
}

export interface CustomerAuthResponse {
  success: boolean;
  message: string;
  data: {
    customer: Customer;
    token?: string;
  };
}

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery,
  tagTypes: ["Customer"],
  endpoints: (builder) => ({
    // Firebase token authentication - handles login/registration
    authenticateCustomer: builder.mutation<
      CustomerAuthResponse,
      CustomerLoginRequest
    >({
      query: (data) => ({
        url: "/customers/auth",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Customer"],
    }),

    // Get customer profile
    getCustomerProfile: builder.query<CustomerAuthResponse, void>({
      query: () => "/customers/profile",
      providesTags: ["Customer"],
    }),

    // Update customer profile
    updateCustomerProfile: builder.mutation<
      CustomerAuthResponse,
      Partial<Customer>
    >({
      query: (data) => ({
        url: "/customers/profile",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Customer"],
    }),
  }),
});

export const {
  useAuthenticateCustomerMutation,
  useGetCustomerProfileQuery,
  useUpdateCustomerProfileMutation,
} = customerApi;
