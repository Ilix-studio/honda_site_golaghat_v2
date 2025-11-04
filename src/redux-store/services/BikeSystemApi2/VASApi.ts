import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery, handleApiError } from "../../../lib/apiConfig";

// Value Added Service Interface - Updated to match backend
export interface IValueAddedService {
  _id: string;
  serviceName: string;
  description: string;
  coverageYears: number;
  priceStructure: {
    basePrice: number;
  };
  benefits: string[];
  isActive: boolean;
  applicableBranches: string[];
  validFrom: Date;
  validUntil: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Customer Active Services Model - Updated to match backend structure
export interface ICustomerActiveService {
  _id?: string;
  serviceId: string;
  activatedDate: Date;
  expiryDate: Date;
  purchasePrice: number;
  coverageYears: number;
  isActive: boolean;
}

// Response type for backend pagination structure
export interface BackendPaginationResponse<T> {
  success: boolean;
  count: number;
  total: number;
  pages: number;
  currentPage: number;
  data: T[];
  message?: string;
}

// Request/Response Types
export interface VASResponse {
  success: boolean;
  data: IValueAddedService;
  message?: string;
}

export interface VASListResponse
  extends BackendPaginationResponse<IValueAddedService> {}

export interface CustomerActiveServiceResponse {
  success: boolean;
  data: ICustomerActiveService;
  message?: string;
}

export interface CustomerActiveServicesResponse {
  success: boolean;
  data: {
    vehicle: {
      _id: string;
      modelName: string;
      numberPlate: string;
      customer: string;
    };
    services: ICustomerActiveService[];
  }[];
}

export interface CreateVASRequest {
  serviceName: string;
  coverageYears: number;
  priceStructure: {
    basePrice: number;
  };
  benefits: string[];
  applicableBranches: string[];
}

export interface UpdateVASRequest extends Partial<CreateVASRequest> {
  isActive?: boolean;
}

export interface VASFilters {
  page?: number;
  limit?: number;
  serviceType?: string; // Added to match backend controller
  isActive?: boolean;
  branchId?: string;
  search?: string;
}

export interface PriceCalculationRequest {
  vehicleId: string; // Changed to match backend route
  selectedYears: number;
}

export interface PriceCalculationResponse {
  success: boolean;
  data: {
    customer: string;
    vehicle: string;
    selectedYears: number;
    calculatedPrice: number;
  };
  message?: string;
}

// ===================== VAS API SLICE =====================
export const vasApi = createApi({
  reducerPath: "vasApi",
  baseQuery,
  tagTypes: ["VAS", "CustomerActiveService", "VASStats"],
  endpoints: (builder) => ({
    // ===== PUBLIC/MIXED ROUTES =====

    // Get services by type - matches backend route
    getServicesByType: builder.query<VASListResponse, string>({
      query: (serviceType) => `/value-added-services/types/${serviceType}`,
      providesTags: ["VAS"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // ===== CUSTOMER ROUTES =====

    // Get customer's active services - matches backend route
    getCustomerActiveServices: builder.query<
      CustomerActiveServicesResponse,
      void
    >({
      query: () => "/value-added-services/my-services",
      providesTags: ["CustomerActiveService"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Calculate price for a service - matches backend route
    calculateVASPrice: builder.mutation<
      PriceCalculationResponse,
      PriceCalculationRequest
    >({
      query: (data) => ({
        url: "/value-added-services/calculate-price",
        method: "POST",
        body: data,
      }),
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // ===== ADMIN ROUTES =====

    // Create new VAS (admin only) - matches backend route
    createVAS: builder.mutation<VASResponse, CreateVASRequest>({
      query: (vasData) => ({
        url: "/value-added-services",
        method: "POST",
        body: vasData,
      }),
      invalidatesTags: ["VAS", "VASStats"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get all VAS (admin) - matches backend route
    getAllVAS: builder.query<VASListResponse, VASFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();

        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.serviceType)
          params.append("serviceType", filters.serviceType);
        if (filters.isActive !== undefined)
          params.append("isActive", filters.isActive.toString());

        const queryString = params.toString();
        return `/value-added-services/admin${
          queryString ? `?${queryString}` : ""
        }`;
      },
      providesTags: ["VAS"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get customers with active VAS - matches backend route
    getCustomersWithActiveVAS: builder.query<any, void>({
      query: () => "/value-added-services/admin/customers",
      providesTags: ["CustomerActiveService"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get VAS by ID (admin) - matches backend route
    getVASById: builder.query<VASResponse, string>({
      query: (id) => `/value-added-services/admin/${id}`,
      providesTags: (_result, _error, id) => [{ type: "VAS", id }],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Update VAS (admin only) - matches backend route
    updateVAS: builder.mutation<
      VASResponse,
      { id: string; data: UpdateVASRequest }
    >({
      query: ({ id, data }) => ({
        url: `/value-added-services/admin/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "VAS", id },
        "VAS",
        "VASStats",
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Delete VAS (admin only) - matches backend route
    deleteVAS: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/value-added-services/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["VAS", "VASStats"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    activateServiceForCustomer: builder.mutation<
      any,
      { serviceId: string; customerId: string }
    >({
      query: ({ serviceId, customerId }) => ({
        url: `/value-added-services/activate`,
        method: "POST",
        body: { serviceId, customerId },
      }),
      invalidatesTags: ["CustomerActiveService", "VASStats"],
      transformErrorResponse: (response) => handleApiError(response),
    }),
  }),
});

// ===================== EXPORT HOOKS =====================
export const {
  // Public/Mixed hooks
  useGetServicesByTypeQuery,
  useLazyGetServicesByTypeQuery,

  // Customer hooks
  useGetCustomerActiveServicesQuery,
  useCalculateVASPriceMutation,
  useLazyGetCustomerActiveServicesQuery,

  // Admin hooks
  useGetAllVASQuery,
  useCreateVASMutation,
  useUpdateVASMutation,
  useDeleteVASMutation,
  useActivateServiceForCustomerMutation,
  useGetCustomersWithActiveVASQuery,
  useGetVASByIdQuery,
  useLazyGetAllVASQuery,
  useLazyGetCustomersWithActiveVASQuery,
  useLazyGetVASByIdQuery,
} = vasApi;
