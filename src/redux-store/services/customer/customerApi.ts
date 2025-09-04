import { customerBaseQuery } from "@/lib/customerApiConfigs";
import {
  CreateProfileRequest,
  Customer,
  CustomerAuthResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
} from "@/types/customer/customer.types";
import { createApi } from "@reduxjs/toolkit/query/react";

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: customerBaseQuery, // Updated to use customerBaseQuery
  tagTypes: ["Customer"],
  endpoints: (builder) => ({
    // Verify OTP endpoint
    verifyOTP: builder.mutation<VerifyOTPResponse, VerifyOTPRequest>({
      query: (data) => ({
        url: "/customer/verify-otp",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Customer"],
    }),

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
  useVerifyOTPMutation,
  useGetCustomerProfileQuery,
  useCreateProfileMutation,
  useUpdateCustomerProfileMutation,
} = customerApi;
