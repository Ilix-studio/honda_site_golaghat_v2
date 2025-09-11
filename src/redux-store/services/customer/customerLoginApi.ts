// Create: src/redux-store/services/customerApi.ts
import { customerBaseQuery } from "@/lib/customerApiConfigs";
import { createApi } from "@reduxjs/toolkit/query/react";

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

export const customerLoginApi = createApi({
  reducerPath: "customerLoginApi",
  baseQuery: customerBaseQuery,
  endpoints: (builder) => ({
    saveAuthData: builder.mutation<SaveAuthDataResponse, SaveAuthDataRequest>({
      query: (data) => ({
        url: "/customer/save-auth-data",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useSaveAuthDataMutation } = customerLoginApi;
