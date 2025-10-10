import { createApi } from "@reduxjs/toolkit/query/react";
import { customerBaseQuery } from "@/lib/customerApiConfigs";
import { handleApiError } from "@/lib/apiConfig";
import {
  PopulatedCustomerVehicleListResponse,
  PopulatedCustomerVehicleResponse,
  ServiceHistoryResponse,
} from "../BikeSystemApi2/AdminVehicleApi";

export const customerVehicleApi = createApi({
  reducerPath: "customerVehicleApi",
  baseQuery: customerBaseQuery, // Uses Firebase token
  tagTypes: ["CustomerVehicle", "VehicleStats", "ServiceHistory"],
  endpoints: (builder) => ({
    // Get my vehicles (authenticated customer)
    getMyVehicles: builder.query<
      PopulatedCustomerVehicleListResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        return `/customer-vehicles/my-vehicles?${params.toString()}`;
      },
      providesTags: ["CustomerVehicle"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get customer vehicle by ID (with populated data)
    getCustomerVehicleById: builder.query<
      PopulatedCustomerVehicleResponse,
      string
    >({
      query: (vehicleId) => `/customer-vehicles/${vehicleId}`,
      providesTags: (_result, _error, vehicleId) => [
        { type: "CustomerVehicle", id: vehicleId },
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get vehicle service history
    getVehicleServiceHistory: builder.query<ServiceHistoryResponse, string>({
      query: (vehicleId) => `/customer-vehicles/${vehicleId}/service-history`,
      providesTags: (_result, _error, vehicleId) => [
        { type: "ServiceHistory", id: vehicleId },
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Check vehicle eligibility for services
    checkVehicleEligibility: builder.query<
      {
        success: boolean;
        data: { eligible: boolean; reasons?: string[] };
        message?: string;
      },
      { vehicleId: string; serviceType: string }
    >({
      query: ({ vehicleId, serviceType }) =>
        `/customer-vehicles/${vehicleId}/check-eligibility?serviceType=${serviceType}`,
      transformErrorResponse: (response) => handleApiError(response),
    }),
  }),
});

// Export CUSTOMER hooks only
export const {
  useGetMyVehiclesQuery,
  useGetCustomerVehicleByIdQuery,
  useGetVehicleServiceHistoryQuery,
  useCheckVehicleEligibilityQuery,
  useLazyGetMyVehiclesQuery,
  useLazyGetCustomerVehicleByIdQuery,
  useLazyGetVehicleServiceHistoryQuery,
  useLazyCheckVehicleEligibilityQuery,
} = customerVehicleApi;
