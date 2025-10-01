import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery, handleApiError } from "../../../lib/apiConfig";

// ===================== TYPES & INTERFACES =====================

// Service Package Interface
export interface IServicePackage {
  name: string;
  kilometers: number;
  months: number;
  isFree: boolean;
  cost: number; // in INR
  items: string[];
  laborCharges: number;
  partsReplaced: string[];
  estimatedTime: number; // in minutes
}

// Service Addon Interface (Simplified version)
export interface IServiceAddon {
  _id: string;
  serviceName: IServicePackage;
  validFrom: Date;
  validUntil: Date;
  branch: string; // ObjectId as string
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Extended Service Addon Interface (Full version with all service types)
export interface IServiceAddonExtended {
  _id: string;
  modelName: string; // ObjectId as string

  // Free Services (Usually first 3 services)
  firstService: IServicePackage;
  secondService: IServicePackage;
  thirdService: IServicePackage;

  // Paid Services
  paidServiceOne: IServicePackage; // 4th service
  paidServiceTwo: IServicePackage; // 5th service
  paidServiceThree: IServicePackage; // 6th service
  paidServiceFour: IServicePackage; // 7th service
  paidServiceFive: IServicePackage; // 8th service

  // Additional Services
  additionalServices: IServicePackage[];

  // General Info
  validFrom: Date;
  validUntil: Date;
  applicableBranches: string[]; // ObjectId as string array

  // Status
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response Types
export interface ServiceAddonResponse {
  success: boolean;
  data: IServiceAddon;
  message?: string;
}

export interface ServiceAddonExtendedResponse {
  success: boolean;
  data: IServiceAddonExtended;
  message?: string;
}

export interface ServiceAddonsListResponse {
  success: boolean;
  data: IServiceAddon[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
}

export interface ServiceAddonsExtendedListResponse {
  success: boolean;
  data: IServiceAddonExtended[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
}

export interface CreateServiceAddonRequest {
  serviceName: IServicePackage;
  validFrom: Date;
  validUntil: Date;
  branch: string;
}

export interface CreateServiceAddonExtendedRequest {
  modelName: string;
  firstService: IServicePackage;
  secondService: IServicePackage;
  thirdService: IServicePackage;
  paidServiceOne: IServicePackage;
  paidServiceTwo: IServicePackage;
  paidServiceThree: IServicePackage;
  paidServiceFour: IServicePackage;
  paidServiceFive: IServicePackage;
  additionalServices: IServicePackage[];
  validFrom: Date;
  validUntil: Date;
  applicableBranches: string[];
}

export interface UpdateServiceAddonRequest
  extends Partial<CreateServiceAddonRequest> {
  isActive?: boolean;
}

export interface UpdateServiceAddonExtendedRequest
  extends Partial<CreateServiceAddonExtendedRequest> {
  isActive?: boolean;
}

export interface ServiceAddonFilters {
  page?: number;
  limit?: number;
  branch?: string;
  modelName?: string;
  isActive?: boolean;
  isFree?: boolean;
  search?: string;
  minCost?: number;
  maxCost?: number;
  validDate?: string; // ISO date string to check validity
}

export interface ServicePackageCalculation {
  serviceType:
    | "firstService"
    | "secondService"
    | "thirdService"
    | "paidServiceOne"
    | "paidServiceTwo"
    | "paidServiceThree"
    | "paidServiceFour"
    | "paidServiceFive";
  kilometers: number;
  months: number;
}

export interface ServiceCostCalculationRequest {
  serviceAddonId: string;
  calculations: ServicePackageCalculation[];
}

export interface ServiceCostCalculationResponse {
  success: boolean;
  data: {
    totalCost: number;
    totalLaborCharges: number;
    totalEstimatedTime: number; // in minutes
    breakdown: Array<{
      serviceType: string;
      serviceName: string;
      cost: number;
      laborCharges: number;
      estimatedTime: number;
      isFree: boolean;
    }>;
  };
  message?: string;
}

export interface ServiceAddonStatsResponse {
  success: boolean;
  data: {
    totalServiceAddons: number;
    activeServiceAddons: number;
    totalBranches: number;
    totalModels: number;
    averageCostPerService: number;
    mostPopularServices: Array<{
      serviceName: string;
      count: number;
      branch: string;
    }>;
    revenueByBranch: Array<{
      branchId: string;
      branchName: string;
      totalRevenue: number;
      serviceCount: number;
    }>;
  };
  message?: string;
}

// ===================== SERVICE ADDONS API SLICE =====================
export const serviceAddonsApi = createApi({
  reducerPath: "serviceAddonsApi",
  baseQuery,
  tagTypes: ["ServiceAddon", "ServiceAddonExtended", "ServiceAddonStats"],
  endpoints: (builder) => ({
    // ===== PUBLIC ENDPOINTS =====

    // Get all active service addons (simplified)
    getActiveServiceAddons: builder.query<
      ServiceAddonsListResponse,
      ServiceAddonFilters
    >({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.branch) params.append("branch", filters.branch);
        if (filters.search) params.append("search", filters.search);
        if (filters.isFree !== undefined)
          params.append("isFree", filters.isFree.toString());
        if (filters.minCost)
          params.append("minCost", filters.minCost.toString());
        if (filters.maxCost)
          params.append("maxCost", filters.maxCost.toString());
        if (filters.validDate) params.append("validDate", filters.validDate);

        const queryString = params.toString();
        return `/service-packages/active${
          queryString ? `?${queryString}` : ""
        }`;
      },
      providesTags: ["ServiceAddon"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get service addon by ID (simplified)
    getServiceAddonById: builder.query<ServiceAddonResponse, string>({
      query: (id) => `/service-packages/${id}`,
      providesTags: (_result, _error, id) => [{ type: "ServiceAddon", id }],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get service addons by branch
    getServiceAddonsByBranch: builder.query<
      ServiceAddonsListResponse,
      { branchId: string; page?: number; limit?: number }
    >({
      query: ({ branchId, page = 1, limit = 10 }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        return `/service-packages/branch/${branchId}?${params.toString()}`;
      },
      providesTags: ["ServiceAddon"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Calculate service cost
    calculateServiceCost: builder.query<
      ServiceCostCalculationResponse,
      ServiceCostCalculationRequest
    >({
      query: ({ serviceAddonId, calculations }) => ({
        url: `/service-packages/${serviceAddonId}/calculate-cost`,
        method: "POST",
        body: { calculations },
      }),
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // ===== EXTENDED ENDPOINTS (Full Service Addon Model) =====

    // Get all extended service addons
    getExtendedServiceAddons: builder.query<
      ServiceAddonsExtendedListResponse,
      ServiceAddonFilters
    >({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.modelName) params.append("modelName", filters.modelName);
        if (filters.isActive !== undefined)
          params.append("isActive", filters.isActive.toString());
        if (filters.search) params.append("search", filters.search);

        const queryString = params.toString();
        return `/service-packages/extended${
          queryString ? `?${queryString}` : ""
        }`;
      },
      providesTags: ["ServiceAddonExtended"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get extended service addon by ID
    getExtendedServiceAddonById: builder.query<
      ServiceAddonExtendedResponse,
      string
    >({
      query: (id) => `/service-packages/extended/${id}`,
      providesTags: (_result, _error, id) => [
        { type: "ServiceAddonExtended", id },
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get service addons by model
    getServiceAddonsByModel: builder.query<
      ServiceAddonsExtendedListResponse,
      { modelId: string; page?: number; limit?: number }
    >({
      query: ({ modelId, page = 1, limit = 10 }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        return `/service-packages/model/${modelId}?${params.toString()}`;
      },
      providesTags: ["ServiceAddonExtended"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // ===== ADMIN ENDPOINTS =====

    // Get all service addons (admin)
    getAllServiceAddons: builder.query<
      ServiceAddonsListResponse,
      ServiceAddonFilters
    >({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.branch) params.append("branch", filters.branch);
        if (filters.isActive !== undefined)
          params.append("isActive", filters.isActive.toString());
        if (filters.search) params.append("search", filters.search);
        if (filters.isFree !== undefined)
          params.append("isFree", filters.isFree.toString());
        if (filters.minCost)
          params.append("minCost", filters.minCost.toString());
        if (filters.maxCost)
          params.append("maxCost", filters.maxCost.toString());

        const queryString = params.toString();
        return `/service-packages/admin/all${
          queryString ? `?${queryString}` : ""
        }`;
      },
      providesTags: ["ServiceAddon"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Create service addon (simplified)
    createServiceAddon: builder.mutation<
      ServiceAddonResponse,
      CreateServiceAddonRequest
    >({
      query: (data) => ({
        url: "/service-packages/admin/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ServiceAddon", "ServiceAddonStats"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Create extended service addon
    createExtendedServiceAddon: builder.mutation<
      ServiceAddonExtendedResponse,
      CreateServiceAddonExtendedRequest
    >({
      query: (data) => ({
        url: "/service-packages/admin/create-extended",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ServiceAddonExtended", "ServiceAddonStats"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Update service addon (simplified)
    updateServiceAddon: builder.mutation<
      ServiceAddonResponse,
      { id: string; data: UpdateServiceAddonRequest }
    >({
      query: ({ id, data }) => ({
        url: `/service-packages/admin/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ServiceAddon", id },
        "ServiceAddon",
        "ServiceAddonStats",
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Update extended service addon
    updateExtendedServiceAddon: builder.mutation<
      ServiceAddonExtendedResponse,
      { id: string; data: UpdateServiceAddonExtendedRequest }
    >({
      query: ({ id, data }) => ({
        url: `/service-packages/admin/extended/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ServiceAddonExtended", id },
        "ServiceAddonExtended",
        "ServiceAddonStats",
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Delete service addon
    deleteServiceAddon: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/service-packages/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        "ServiceAddon",
        "ServiceAddonExtended",
        "ServiceAddonStats",
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Bulk update service addon status
    bulkUpdateServiceAddonStatus: builder.mutation<
      { success: boolean; message: string; updated: number },
      { ids: string[]; isActive: boolean }
    >({
      query: ({ ids, isActive }) => ({
        url: "/service-packages/admin/bulk-update-status",
        method: "PATCH",
        body: { ids, isActive },
      }),
      invalidatesTags: [
        "ServiceAddon",
        "ServiceAddonExtended",
        "ServiceAddonStats",
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Clone service addon to different branch
    cloneServiceAddon: builder.mutation<
      ServiceAddonResponse,
      { id: string; targetBranchId: string }
    >({
      query: ({ id, targetBranchId }) => ({
        url: `/service-packages/admin/${id}/clone`,
        method: "POST",
        body: { targetBranchId },
      }),
      invalidatesTags: ["ServiceAddon", "ServiceAddonStats"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get service addon statistics
    getServiceAddonStats: builder.query<ServiceAddonStatsResponse, void>({
      query: () => "/service-packages/admin/stats",
      providesTags: ["ServiceAddonStats"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Export service addons
    exportServiceAddons: builder.mutation<
      { success: boolean; data: { downloadUrl: string }; message?: string },
      { format: "csv" | "xlsx"; filters?: ServiceAddonFilters }
    >({
      query: ({ format, filters }) => ({
        url: `/service-packages/admin/export?format=${format}`,
        method: "POST",
        body: filters || {},
      }),
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Import service addons
    importServiceAddons: builder.mutation<
      {
        success: boolean;
        data: { imported: number; errors: string[] };
        message?: string;
      },
      FormData
    >({
      query: (formData) => ({
        url: "/service-packages/admin/import",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [
        "ServiceAddon",
        "ServiceAddonExtended",
        "ServiceAddonStats",
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Validate service addon dates
    validateServiceAddonDates: builder.query<
      {
        success: boolean;
        data: { isValid: boolean; conflicts: string[] };
        message?: string;
      },
      {
        validFrom: string;
        validUntil: string;
        branchId?: string;
        excludeId?: string;
      }
    >({
      query: ({ validFrom, validUntil, branchId, excludeId }) => {
        const params = new URLSearchParams();
        params.append("validFrom", validFrom);
        params.append("validUntil", validUntil);
        if (branchId) params.append("branchId", branchId);
        if (excludeId) params.append("excludeId", excludeId);

        return `/service-packages/admin/validate-dates?${params.toString()}`;
      },
      transformErrorResponse: (response) => handleApiError(response),
    }),
  }),
});

// ===================== EXPORT HOOKS =====================
export const {
  // Public hooks
  useGetActiveServiceAddonsQuery,
  useGetServiceAddonByIdQuery,
  useGetServiceAddonsByBranchQuery,
  useCalculateServiceCostQuery,
  useLazyGetActiveServiceAddonsQuery,
  useLazyCalculateServiceCostQuery,

  // Extended hooks
  useGetExtendedServiceAddonsQuery,
  useGetExtendedServiceAddonByIdQuery,
  useGetServiceAddonsByModelQuery,
  useLazyGetExtendedServiceAddonsQuery,

  // Admin hooks
  useGetAllServiceAddonsQuery,
  useCreateServiceAddonMutation,
  useCreateExtendedServiceAddonMutation,
  useUpdateServiceAddonMutation,
  useUpdateExtendedServiceAddonMutation,
  useDeleteServiceAddonMutation,
  useBulkUpdateServiceAddonStatusMutation,
  useCloneServiceAddonMutation,
  useGetServiceAddonStatsQuery,
  useExportServiceAddonsMutation,
  useImportServiceAddonsMutation,
  useValidateServiceAddonDatesQuery,
  useLazyGetAllServiceAddonsQuery,
  useLazyGetServiceAddonStatsQuery,
  useLazyValidateServiceAddonDatesQuery,
} = serviceAddonsApi;
