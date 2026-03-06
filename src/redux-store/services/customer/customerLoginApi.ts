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
  }),
});

export const { useSaveAuthDataMutation } = customerLoginApi;
