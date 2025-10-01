import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery, handleApiError } from "../../../lib/apiConfig";

// ===================== TYPES & INTERFACES =====================

// Badge Interface
export interface IBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
}

// Value Added Service Interface
export interface IValueAddedService {
  _id: string;
  serviceName: string;
  serviceType:
    | "Extended Warranty"
    | "Extended Warranty Plus"
    | "Annual Maintenance Contract"
    | "Engine Health Assurance"
    | "Roadside Assistance";
  description: string;

  // Coverage Details
  coverageYears: number;
  maxEnrollmentPeriod: number; // months
  vehicleEligibility: {
    maxEngineCapacity: number; // 250cc
    categories: string[]; // ["scooter", "motorcycle"]
  };

  // Price Structure
  priceStructure: {
    basePrice: number;
    pricePerYear: number;
    engineCapacityMultiplier?: number;
  };

  // Benefits
  benefits: string[];
  coverage: {
    partsAndLabor: boolean;
    unlimitedKilometers: boolean;
    transferable: boolean;
    panIndiaService: boolean;
  };

  // Terms
  terms: string[];
  exclusions: string[];

  // Badges for customer dashboard
  badges: IBadge[];

  // Admin fields
  isActive: boolean;
  applicableBranches: string[];
  validFrom: Date;
  validUntil: Date;

  createdAt: Date;
  updatedAt: Date;
}

// Customer Active Services Model (for tracking activated services)
export interface ICustomerActiveService {
  _id: string;
  customer: string;
  vehicle: string;
  service: string;
  activatedBy: string; // Admin who activated
  activationDate: Date;
  expiryDate: Date;
  isActive: boolean;
  badges: string[]; // Badge IDs that are active
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response Types
export interface VASResponse {
  success: boolean;
  data: IValueAddedService;
  message?: string;
}

export interface VASListResponse {
  success: boolean;
  data: IValueAddedService[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
}

export interface CustomerActiveServiceResponse {
  success: boolean;
  data: ICustomerActiveService;
  message?: string;
}

export interface CustomerActiveServicesResponse {
  success: boolean;
  data: ICustomerActiveService[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
}

export interface CreateVASRequest {
  serviceName: string;
  serviceType: IValueAddedService["serviceType"];
  description: string;
  coverageYears: number;
  maxEnrollmentPeriod: number;
  vehicleEligibility: {
    maxEngineCapacity: number;
    categories: string[];
  };
  priceStructure: {
    basePrice: number;
    pricePerYear: number;
    engineCapacityMultiplier?: number;
  };
  benefits: string[];
  coverage: {
    partsAndLabor: boolean;
    unlimitedKilometers: boolean;
    transferable: boolean;
    panIndiaService: boolean;
  };
  terms: string[];
  exclusions: string[];
  badges: Omit<IBadge, "id">[];
  applicableBranches: string[];
  validFrom: Date;
  validUntil: Date;
}

export interface UpdateVASRequest extends Partial<CreateVASRequest> {
  isActive?: boolean;
}

export interface ActivateServiceRequest {
  customerId: string;
  vehicleId: string;
  serviceId: string;
  coverageYears: number;
}

export interface VASFilters {
  page?: number;
  limit?: number;
  serviceType?: IValueAddedService["serviceType"];
  isActive?: boolean;
  branchId?: string;
  maxEngineCapacity?: number;
  category?: string;
  search?: string;
}

export interface PriceCalculationRequest {
  serviceId: string;
  vehicleEngineCapacity: number;
  selectedYears: number;
}

export interface PriceCalculationResponse {
  success: boolean;
  data: {
    basePrice: number;
    yearlyPrice: number;
    capacityMultiplier: number;
    totalPrice: number;
    breakdown: {
      base: number;
      yearly: number;
      multiplier: number;
    };
  };
  message?: string;
}

export interface VehicleEligibilityRequest {
  serviceId: string;
  engineCapacity: number;
  category: string;
}

export interface VehicleEligibilityResponse {
  success: boolean;
  data: {
    isEligible: boolean;
    reason?: string;
  };
  message?: string;
}

// ===================== VAS API SLICE =====================
export const vasApi = createApi({
  reducerPath: "vasApi",
  baseQuery,
  tagTypes: ["VAS", "CustomerActiveService", "VASStats"],
  endpoints: (builder) => ({
    // ===== PUBLIC ENDPOINTS =====

    // Get all active VAS (for customers)
    getActiveVAS: builder.query<VASListResponse, VASFilters>({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.serviceType)
          params.append("serviceType", filters.serviceType);
        if (filters.maxEngineCapacity)
          params.append(
            "maxEngineCapacity",
            filters.maxEngineCapacity.toString()
          );
        if (filters.category) params.append("category", filters.category);
        if (filters.search) params.append("search", filters.search);

        const queryString = params.toString();
        return `/value-added-services/active${
          queryString ? `?${queryString}` : ""
        }`;
      },
      providesTags: ["VAS"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get VAS by ID (public)
    getVASById: builder.query<VASResponse, string>({
      query: (id) => `/value-added-services/${id}`,
      providesTags: (_result, _error, id) => [{ type: "VAS", id }],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Calculate price for a service
    calculateVASPrice: builder.query<
      PriceCalculationResponse,
      PriceCalculationRequest
    >({
      query: ({ serviceId, vehicleEngineCapacity, selectedYears }) => {
        const params = new URLSearchParams();
        params.append(
          "vehicleEngineCapacity",
          vehicleEngineCapacity.toString()
        );
        params.append("selectedYears", selectedYears.toString());

        return `/value-added-services/${serviceId}/calculate-price?${params.toString()}`;
      },
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Check vehicle eligibility
    checkVehicleEligibility: builder.query<
      VehicleEligibilityResponse,
      VehicleEligibilityRequest
    >({
      query: ({ serviceId, engineCapacity, category }) => {
        const params = new URLSearchParams();
        params.append("engineCapacity", engineCapacity.toString());
        params.append("category", category);

        return `/value-added-services/${serviceId}/check-eligibility?${params.toString()}`;
      },
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // ===== CUSTOMER ENDPOINTS =====

    // Get customer's active services
    getCustomerActiveServices: builder.query<
      CustomerActiveServicesResponse,
      { customerId?: string; page?: number; limit?: number }
    >({
      query: ({ customerId, page = 1, limit = 10 }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (customerId) params.append("customerId", customerId);

        return `/value-added-services/customer/active-services?${params.toString()}`;
      },
      providesTags: ["CustomerActiveService"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get customer service by ID
    getCustomerActiveServiceById: builder.query<
      CustomerActiveServiceResponse,
      string
    >({
      query: (id) => `/value-added-services/customer/active-services/${id}`,
      providesTags: (_result, _error, id) => [
        { type: "CustomerActiveService", id },
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // ===== ADMIN ENDPOINTS =====

    // Get all VAS (admin - includes inactive)
    getAllVAS: builder.query<VASListResponse, VASFilters>({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.serviceType)
          params.append("serviceType", filters.serviceType);
        if (filters.isActive !== undefined)
          params.append("isActive", filters.isActive.toString());
        if (filters.branchId) params.append("branchId", filters.branchId);
        if (filters.maxEngineCapacity)
          params.append(
            "maxEngineCapacity",
            filters.maxEngineCapacity.toString()
          );
        if (filters.category) params.append("category", filters.category);
        if (filters.search) params.append("search", filters.search);

        const queryString = params.toString();
        return `/value-added-services/admin/all${
          queryString ? `?${queryString}` : ""
        }`;
      },
      providesTags: ["VAS"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Create new VAS (admin only)
    createVAS: builder.mutation<VASResponse, CreateVASRequest>({
      query: (vasData) => ({
        url: "/value-added-services/admin/create",
        method: "POST",
        body: vasData,
      }),
      invalidatesTags: ["VAS", "VASStats"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Update VAS (admin only)
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

    // Delete VAS (admin only)
    deleteVAS: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/value-added-services/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["VAS", "VASStats"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Activate service for customer (admin only)
    activateServiceForCustomer: builder.mutation<
      CustomerActiveServiceResponse,
      ActivateServiceRequest
    >({
      query: (data) => ({
        url: "/value-added-services/admin/activate-service",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CustomerActiveService", "VASStats"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Deactivate customer service (admin only)
    deactivateCustomerService: builder.mutation<
      CustomerActiveServiceResponse,
      string
    >({
      query: (activeServiceId) => ({
        url: `/value-added-services/admin/deactivate-service/${activeServiceId}`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, activeServiceId) => [
        { type: "CustomerActiveService", id: activeServiceId },
        "CustomerActiveService",
        "VASStats",
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get all customer active services (admin only)
    getAllCustomerActiveServices: builder.query<
      CustomerActiveServicesResponse,
      {
        page?: number;
        limit?: number;
        customerId?: string;
        serviceId?: string;
        isActive?: boolean;
      }
    >({
      query: ({ page = 1, limit = 10, customerId, serviceId, isActive }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (customerId) params.append("customerId", customerId);
        if (serviceId) params.append("serviceId", serviceId);
        if (isActive !== undefined)
          params.append("isActive", isActive.toString());

        return `/value-added-services/admin/customer-services?${params.toString()}`;
      },
      providesTags: ["CustomerActiveService"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Update customer active service (admin only)
    updateCustomerActiveService: builder.mutation<
      CustomerActiveServiceResponse,
      { id: string; data: Partial<ICustomerActiveService> }
    >({
      query: ({ id, data }) => ({
        url: `/value-added-services/admin/customer-services/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "CustomerActiveService", id },
        "CustomerActiveService",
        "VASStats",
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get VAS statistics (admin only)
    getVASStats: builder.query<
      {
        success: boolean;
        data: {
          totalServices: number;
          activeServices: number;
          totalCustomerServices: number;
          activeCustomerServices: number;
          revenueThisMonth: number;
          topServices: Array<{
            serviceName: string;
            customerCount: number;
            revenue: number;
          }>;
        };
      },
      void
    >({
      query: () => "/value-added-services/admin/stats",
      providesTags: ["VASStats"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Bulk update VAS status (admin only)
    bulkUpdateVASStatus: builder.mutation<
      { success: boolean; message: string; updated: number },
      { ids: string[]; isActive: boolean }
    >({
      query: ({ ids, isActive }) => ({
        url: "/value-added-services/admin/bulk-update-status",
        method: "PATCH",
        body: { ids, isActive },
      }),
      invalidatesTags: ["VAS", "VASStats"],
      transformErrorResponse: (response) => handleApiError(response),
    }),
  }),
});

// ===================== EXPORT HOOKS =====================
export const {
  // Public hooks
  useGetActiveVASQuery,
  useGetVASByIdQuery,
  useCalculateVASPriceQuery,
  useCheckVehicleEligibilityQuery,
  useLazyGetActiveVASQuery,
  useLazyCalculateVASPriceQuery,
  useLazyCheckVehicleEligibilityQuery,

  // Customer hooks
  useGetCustomerActiveServicesQuery,
  useGetCustomerActiveServiceByIdQuery,
  useLazyGetCustomerActiveServicesQuery,

  // Admin hooks
  useGetAllVASQuery,
  useCreateVASMutation,
  useUpdateVASMutation,
  useDeleteVASMutation,
  useActivateServiceForCustomerMutation,
  useDeactivateCustomerServiceMutation,
  useGetAllCustomerActiveServicesQuery,
  useUpdateCustomerActiveServiceMutation,
  useGetVASStatsQuery,
  useBulkUpdateVASStatusMutation,
  useLazyGetAllVASQuery,
  useLazyGetAllCustomerActiveServicesQuery,
  useLazyGetVASStatsQuery,
} = vasApi;
