import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../../lib/apiConfig";
import {
  AssignVehicleRequest,
  CreateVehicleRequest,
  CustomerDashboardResponse,
  CustomerVehiclesResponse,
  GetAllVehiclesFilters,
  ServiceHistoryResponse,
  TransferOwnershipRequest,
  UpdateServiceStatusRequest,
  UpdateVehicleRequest,
  VehicleResponse,
  VehicleStatsResponse,
} from "@/types/customer/customerDash.types";

export const customerDashboardApi = createApi({
  reducerPath: "customerDashboardApi",
  baseQuery,
  tagTypes: ["CustomerDashboard", "Vehicle", "VehicleStats", "ServiceHistory"],
  keepUnusedDataFor: 300, // 5 minutes
  endpoints: (builder) => ({
    // ===== CUSTOMER ENDPOINTS =====

    // Get customer dashboard overview
    getCustomerDashboard: builder.query<CustomerDashboardResponse, void>({
      query: () => "/customer-dashboard",
      providesTags: ["CustomerDashboard"],
    }),

    // Get customer vehicles with pagination
    getCustomerVehicles: builder.query<
      CustomerVehiclesResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 } = {}) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        return `/customer-dashboard/vehicles?${params.toString()}`;
      },
      providesTags: ["Vehicle"],
    }),

    // Get single vehicle by ID (customer or admin)
    getCustomerVehicleById: builder.query<VehicleResponse, string>({
      query: (vehicleId) => `/customer-dashboard/vehicles/${vehicleId}`,
      providesTags: (_result, _error, vehicleId) => [
        { type: "Vehicle", id: vehicleId },
      ],
    }),

    // Get vehicle service history
    getVehicleServiceHistory: builder.query<ServiceHistoryResponse, string>({
      query: (vehicleId) =>
        `/customer-dashboard/vehicles/${vehicleId}/service-history`,
      providesTags: (_result, _error, vehicleId) => [
        { type: "ServiceHistory", id: vehicleId },
      ],
    }),

    // ===== ADMIN ENDPOINTS =====

    // Create new vehicle (admin only)
    createCustomerVehicle: builder.mutation<
      VehicleResponse,
      CreateVehicleRequest
    >({
      query: (vehicleData) => ({
        url: "/customer-dashboard/vehicles",
        method: "POST",
        body: vehicleData,
      }),
      invalidatesTags: ["Vehicle", "CustomerDashboard", "VehicleStats"],
    }),

    // Update vehicle (admin only)
    updateCustomerVehicle: builder.mutation<
      VehicleResponse,
      { id: string; data: UpdateVehicleRequest }
    >({
      query: ({ id, data }) => ({
        url: `/customer-dashboard/vehicles/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Vehicle", id },
        "CustomerDashboard",
        "VehicleStats",
      ],
    }),

    // Delete vehicle (admin only)
    deleteCustomerVehicle: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/customer-dashboard/vehicles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vehicle", "CustomerDashboard", "VehicleStats"],
    }),

    // Get all vehicles with filters (admin only)
    getAllCustomerVehicles: builder.query<
      CustomerVehiclesResponse,
      GetAllVehiclesFilters
    >({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.serviceType)
          params.append("serviceType", filters.serviceType);
        if (filters.rtoCode) params.append("rtoCode", filters.rtoCode);
        if (filters.customerId) params.append("customerId", filters.customerId);

        const queryString = params.toString();
        return `/customer-dashboard/admin/vehicles${
          queryString ? `?${queryString}` : ""
        }`;
      },
      providesTags: ["Vehicle"],
    }),

    // Get vehicle statistics (admin only)
    getVehicleStats: builder.query<VehicleStatsResponse, void>({
      query: () => "/customer-dashboard/admin/stats",
      providesTags: ["VehicleStats"],
    }),

    // Get service due vehicles (admin only)
    getServiceDueVehicles: builder.query<CustomerVehiclesResponse, void>({
      query: () => "/customer-dashboard/admin/service-due",
      providesTags: ["Vehicle"],
    }),

    // Update vehicle service status (admin only)
    updateVehicleServiceStatus: builder.mutation<
      VehicleResponse,
      { id: string; data: UpdateServiceStatusRequest }
    >({
      query: ({ id, data }) => ({
        url: `/customer-dashboard/vehicles/${id}/service-status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Vehicle", id },
        { type: "ServiceHistory", id },
        "CustomerDashboard",
        "VehicleStats",
      ],
    }),

    // Assign vehicle to customer (admin only)
    assignVehicleToCustomer: builder.mutation<
      VehicleResponse,
      { id: string; data: AssignVehicleRequest }
    >({
      query: ({ id, data }) => ({
        url: `/customer-dashboard/vehicles/${id}/assign`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Vehicle", id },
        "CustomerDashboard",
        "VehicleStats",
      ],
    }),

    // Transfer vehicle ownership (admin only)
    transferVehicleOwnership: builder.mutation<
      VehicleResponse,
      { id: string; data: TransferOwnershipRequest }
    >({
      query: ({ id, data }) => ({
        url: `/customer-dashboard/vehicles/${id}/transfer`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Vehicle", id },
        "CustomerDashboard",
        "VehicleStats",
      ],
    }),
  }),
});

// ===================== EXPORT HOOKS =====================
export const {
  // Customer hooks
  useGetCustomerDashboardQuery,
  useGetCustomerVehiclesQuery,
  useGetCustomerVehicleByIdQuery,
  useGetVehicleServiceHistoryQuery,
  useLazyGetCustomerVehiclesQuery,
  useLazyGetVehicleServiceHistoryQuery,

  // Admin hooks
  useCreateCustomerVehicleMutation,
  useUpdateCustomerVehicleMutation,
  useDeleteCustomerVehicleMutation,
  useGetAllCustomerVehiclesQuery,
  useGetVehicleStatsQuery,
  useGetServiceDueVehiclesQuery,
  useUpdateVehicleServiceStatusMutation,
  useAssignVehicleToCustomerMutation,
  useTransferVehicleOwnershipMutation,
  useLazyGetAllCustomerVehiclesQuery,
  useLazyGetServiceDueVehiclesQuery,
} = customerDashboardApi;
