import { apiSlice } from "../apiSlice";


export interface ScanFleetAddress {
  village: string;
  postOffice: string;
  policeStation: string;
  district: string;
  state: string;
}

export interface ScanFleetProfile {
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  familyNumber1: string;
  familyNumber2?: string | null;
  bloodGroup?: string;
  address: ScanFleetAddress;
  profileCompleted: boolean;
}

export interface ActivateTokenRequest {
  attachCode: string;
  vehicleNumber: string;
  vehicleType: string;
  vehicleModel: string;
}

export interface ActivateTokenResponse {
  tokenId: string;
  qrId: string;
  maskedNumber: string;
  vehicleNumber: string;
  remainingDealerTokens: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const scanfleetApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getScanFleetProfile: builder.query<ScanFleetProfile, void>({
      query: () => ({
        url: "/scanfleet/profile",
        method: "GET",
      }),
      transformResponse: (res: ApiResponse<ScanFleetProfile>) => res.data,
      providesTags: ["ScanFleetProfile"],
      extraOptions: { isCustomer: true },
    }),

    activateScanFleetToken: builder.mutation<
      ActivateTokenResponse,
      ActivateTokenRequest
    >({
      query: (body) => ({
        url: "/scanfleet/activate",
        method: "POST",
        body,
      }),
      transformResponse: (res: ApiResponse<ActivateTokenResponse>) => res.data,
      invalidatesTags: ["ScanFleetProfile"],
      extraOptions: { isCustomer: true },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetScanFleetProfileQuery,
  useActivateScanFleetTokenMutation,
} = scanfleetApi;