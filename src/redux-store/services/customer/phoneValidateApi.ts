import { apiSlice } from "../apiSlice";

export interface PhoneCheckRequest { phoneNumber: string; }
export interface PhoneCheckResponse {
  success: boolean;
  exists: boolean;
  data?: { phoneNumber: string; isVerified: boolean };
  message: string;
}
export interface BatchPhoneCheckRequest { phoneNumbers: string[]; }
export interface BatchPhoneCheckResponse {
  success: boolean;
  data: Array<{ phoneNumber: string; exists: boolean; isVerified: boolean }>;
  message: string;
}

export const phoneValidationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    checkPhoneNumber: builder.mutation<PhoneCheckResponse, PhoneCheckRequest>({
      query: (data) => ({
        url: "/customer/check-phone",
        method: "POST",
        body: data,
      }),
      extraOptions: { isCustomer: true },
    }),

    checkPhoneNumbersBatch: builder.mutation<BatchPhoneCheckResponse, BatchPhoneCheckRequest>({
      query: (data) => ({
        url: "/customer/check-phones-batch",
        method: "POST",
        body: data,
      }),
      extraOptions: { isCustomer: true },
    }),
  }),
});

export const {
  useCheckPhoneNumberMutation,
  useCheckPhoneNumbersBatchMutation,
} = phoneValidationApi;