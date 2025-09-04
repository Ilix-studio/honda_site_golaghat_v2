import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../../lib/apiConfig";

// Export types to avoid TypeScript errors
export interface CustomerLoginRequest {
  idToken: string;
  phoneNumber: string;
}

export interface CreateProfileRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  village: string;
  postOffice: string;
  policeStation: string;
  district: string;
  state: string;
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
    // Get customer profile
    getCustomerProfile: builder.query<CustomerAuthResponse, void>({
      query: () => "/customer/profile",
      providesTags: ["Customer"],
    }),

    // Create customer profile
    createProfile: builder.mutation<CustomerAuthResponse, CreateProfileRequest>(
      {
        query: (data) => ({
          url: "/customer/profile",
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
        url: "/customer/profile",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Customer"],
    }),
  }),
});

export const {
  useGetCustomerProfileQuery,
  useCreateProfileMutation,
  useUpdateCustomerProfileMutation,
} = customerApi;
