import { apiSlice } from "../apiSlice";

export interface SaveAuthDataRequest {
  phoneNumber: string;
  firebaseUid: string;
}

export interface SaveAuthDataResponse {
  success: boolean;
  message: string;
  data: {
    customer: {
      _id: string;
      phoneNumber: string;
      isVerified: boolean;
      profileCompleted: boolean;
    };
  };
}

export interface BranchAdminRegisterRequest {
  phoneNumber: string;
}

export interface BranchAdminRegisterResponse {
  success: boolean;
  message: string;
  data: {
    customer: {
      _id: string;
      phoneNumber: string;
      isVerified: boolean;
      profileCompleted: boolean;
    };
    customToken: string;
  };
}

export const customerLoginApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    saveAuthData: builder.mutation<SaveAuthDataResponse, SaveAuthDataRequest>({
      query: (data) => ({
        url: "/customer/save-auth-data",
        method: "POST",
        body: data,
      }),
      extraOptions: { isCustomer: true },
    }),

    // Branch-Admin action (no OTP) — admin JWT auth, not Firebase.
    registerCustomerByBranchAdmin: builder.mutation<
      BranchAdminRegisterResponse,
      BranchAdminRegisterRequest
    >({
      query: (data) => ({
        url: "/customer/branch-admin-register",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useSaveAuthDataMutation, useRegisterCustomerByBranchAdminMutation } =
  customerLoginApi;
