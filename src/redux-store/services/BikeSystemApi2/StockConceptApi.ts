import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery, handleApiError } from "../../../lib/apiConfig";

// ===================== TYPES & INTERFACES =====================

// Stock Concept Interface
export interface IStockConcept {
  _id: string;
  stockId: string;
  bikeInfo: {
    bikeModelId: string; // ObjectId as string
    modelName: string;
    category: string;
    engineCC: number;
    fuelType: "Petrol" | "Electric" | "Hybrid";
    color: string;
    variant: string;
    yearOfManufacture: number;
  };
  uniqueBookRecord?: string;
  engineDetails: {
    engineNumber: string;
    chassisNumber: string;
    engineType: string;
    maxPower: string;
    maxTorque: string;
    displacement: number;
  };
  fitnessUpto: number;
  stockStatus: {
    status:
      | "Available"
      | "Sold"
      | "Reserved"
      | "Service"
      | "Damaged"
      | "Transit";
    location: "Showroom" | "Warehouse" | "Service Center" | "Customer";
    branchId: string; // ObjectId as string
    lastUpdated: Date;
    updatedBy: string; // ObjectId as string
  };
  salesInfo?: {
    soldTo?: string; // ObjectId as string - Reference to BaseCustomer
    soldDate?: Date;
    salePrice?: number;
    salesPerson?: string; // ObjectId as string - Reference to User
    invoiceNumber?: string;
    paymentStatus?: "Paid" | "Partial" | "Pending";
    customerVehicleId?: string; // ObjectId as string - Reference to CustomerVehicle
  };
  priceInfo: {
    exShowroomPrice: number;
    roadTax: number;
    insurance: number;
    additionalCharges: number;
    onRoadPrice: number;
    discount?: number;
    finalPrice: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response Types
export interface StockConceptResponse {
  success: boolean;
  data: IStockConcept;
  message?: string;
}

export interface StockConceptListResponse {
  success: boolean;
  data: IStockConcept[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
}

export interface CreateStockConceptRequest {
  stockId?: string; // Auto-generated if not provided
  bikeInfo: {
    bikeModelId: string;
    modelName: string;
    category: string;
    engineCC: number;
    fuelType: "Petrol" | "Electric" | "Hybrid";
    color: string;
    variant: string;
    yearOfManufacture: number;
  };
  uniqueBookRecord?: string;
  engineDetails: {
    engineNumber: string;
    chassisNumber: string;
    engineType: string;
    maxPower: string;
    maxTorque: string;
    displacement: number;
  };
  fitnessUpto: number;
  stockStatus: {
    branchId: string;
    location?: "Showroom" | "Warehouse" | "Service Center" | "Customer";
    updatedBy: string;
  };
  priceInfo: {
    exShowroomPrice: number;
    roadTax?: number;
    insurance?: number;
    additionalCharges?: number;
    onRoadPrice: number;
    discount?: number;
    finalPrice: number;
  };
}

export interface UpdateStockConceptRequest
  extends Partial<CreateStockConceptRequest> {
  isActive?: boolean;
}

export interface UpdateStockStatusRequest {
  status: IStockConcept["stockStatus"]["status"];
  location?: IStockConcept["stockStatus"]["location"];
  branchId?: string;
  updatedBy: string;
}

export interface SellVehicleRequest {
  soldTo: string; // Customer ID
  salePrice: number;
  salesPerson: string; // User ID
  invoiceNumber: string;
  paymentStatus: "Paid" | "Partial" | "Pending";
  customerVehicleId?: string;
}

export interface StockConceptFilters {
  page?: number;
  limit?: number;
  status?: IStockConcept["stockStatus"]["status"];
  location?: IStockConcept["stockStatus"]["location"];
  branchId?: string;
  modelName?: string;
  category?: string;
  fuelType?: "Petrol" | "Electric" | "Hybrid";
  color?: string;
  variant?: string;
  yearOfManufacture?: number;
  engineCC?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isActive?: boolean;
  soldFrom?: string; // ISO date string
  soldTo?: string; // ISO date string
}

export interface StockConceptStatsResponse {
  success: boolean;
  data: {
    totalStock: number;
    availableStock: number;
    soldStock: number;
    reservedStock: number;
    damagedStock: number;
    stockByBranch: Array<{
      branchId: string;
      branchName: string;
      total: number;
      available: number;
      sold: number;
      reserved: number;
    }>;
    stockByModel: Array<{
      modelName: string;
      count: number;
      available: number;
      sold: number;
    }>;
    stockByStatus: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    revenueStats: {
      totalRevenue: number;
      averageSalePrice: number;
      revenueThisMonth: number;
      revenueLastMonth: number;
    };
    topSellingModels: Array<{
      modelName: string;
      soldCount: number;
      revenue: number;
    }>;
  };
  message?: string;
}

export interface StockAvailabilityResponse {
  success: boolean;
  data: {
    modelName: string;
    totalStock: number;
    availableStock: number;
    branches: Array<{
      branchId: string;
      branchName: string;
      available: number;
      showroom: number;
      warehouse: number;
    }>;
    colors: Array<{
      color: string;
      available: number;
    }>;
    variants: Array<{
      variant: string;
      available: number;
    }>;
  };
  message?: string;
}

export interface BulkUpdateStockRequest {
  stockIds: string[];
  updates: {
    status?: IStockConcept["stockStatus"]["status"];
    location?: IStockConcept["stockStatus"]["location"];
    branchId?: string;
    isActive?: boolean;
  };
  updatedBy: string;
}

export interface TransferStockRequest {
  stockId: string;
  fromBranchId: string;
  toBranchId: string;
  newLocation?: IStockConcept["stockStatus"]["location"];
  transferReason: string;
  updatedBy: string;
}

// ===================== STOCK CONCEPT API SLICE =====================
export const stockConceptApi = createApi({
  reducerPath: "stockConceptApi",
  baseQuery,
  tagTypes: ["StockConcept", "StockStats", "StockAvailability"],
  endpoints: (builder) => ({
    // ===== PUBLIC ENDPOINTS =====

    // Get available stock (for customers)
    getAvailableStock: builder.query<
      StockConceptListResponse,
      StockConceptFilters
    >({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.branchId) params.append("branchId", filters.branchId);
        if (filters.modelName) params.append("modelName", filters.modelName);
        if (filters.category) params.append("category", filters.category);
        if (filters.fuelType) params.append("fuelType", filters.fuelType);
        if (filters.color) params.append("color", filters.color);
        if (filters.variant) params.append("variant", filters.variant);
        if (filters.yearOfManufacture)
          params.append(
            "yearOfManufacture",
            filters.yearOfManufacture.toString()
          );
        if (filters.engineCC)
          params.append("engineCC", filters.engineCC.toString());
        if (filters.minPrice)
          params.append("minPrice", filters.minPrice.toString());
        if (filters.maxPrice)
          params.append("maxPrice", filters.maxPrice.toString());
        if (filters.search) params.append("search", filters.search);

        const queryString = params.toString();
        return `/stock-concept/available${
          queryString ? `?${queryString}` : ""
        }`;
      },
      providesTags: ["StockConcept"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get stock by ID (public)
    getStockById: builder.query<StockConceptResponse, string>({
      query: (id) => `/stock-concept/${id}`,
      providesTags: (_result, _error, id) => [{ type: "StockConcept", id }],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Check stock availability for a model
    checkStockAvailability: builder.query<
      StockAvailabilityResponse,
      { modelId: string; branchId?: string }
    >({
      query: ({ modelId, branchId }) => {
        const params = new URLSearchParams();
        if (branchId) params.append("branchId", branchId);

        return `/stock-concept/availability/${modelId}${
          params.toString() ? `?${params.toString()}` : ""
        }`;
      },
      providesTags: ["StockAvailability"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get stock by branch
    getStockByBranch: builder.query<
      StockConceptListResponse,
      { branchId: string; page?: number; limit?: number; status?: string }
    >({
      query: ({ branchId, page = 1, limit = 10, status }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (status) params.append("status", status);

        return `/stock-concept/branch/${branchId}?${params.toString()}`;
      },
      providesTags: ["StockConcept"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // ===== ADMIN ENDPOINTS =====

    // Get all stock (admin)
    getAllStock: builder.query<StockConceptListResponse, StockConceptFilters>({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.status) params.append("status", filters.status);
        if (filters.location) params.append("location", filters.location);
        if (filters.branchId) params.append("branchId", filters.branchId);
        if (filters.modelName) params.append("modelName", filters.modelName);
        if (filters.category) params.append("category", filters.category);
        if (filters.fuelType) params.append("fuelType", filters.fuelType);
        if (filters.color) params.append("color", filters.color);
        if (filters.variant) params.append("variant", filters.variant);
        if (filters.yearOfManufacture)
          params.append(
            "yearOfManufacture",
            filters.yearOfManufacture.toString()
          );
        if (filters.engineCC)
          params.append("engineCC", filters.engineCC.toString());
        if (filters.minPrice)
          params.append("minPrice", filters.minPrice.toString());
        if (filters.maxPrice)
          params.append("maxPrice", filters.maxPrice.toString());
        if (filters.search) params.append("search", filters.search);
        if (filters.isActive !== undefined)
          params.append("isActive", filters.isActive.toString());
        if (filters.soldFrom) params.append("soldFrom", filters.soldFrom);
        if (filters.soldTo) params.append("soldTo", filters.soldTo);

        const queryString = params.toString();
        return `/stock-concept/admin/all${
          queryString ? `?${queryString}` : ""
        }`;
      },
      providesTags: ["StockConcept"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Create new stock (admin)
    createStock: builder.mutation<
      StockConceptResponse,
      CreateStockConceptRequest
    >({
      query: (data) => ({
        url: "/stock-concept/admin/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["StockConcept", "StockStats", "StockAvailability"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Update stock (admin)
    updateStock: builder.mutation<
      StockConceptResponse,
      { id: string; data: UpdateStockConceptRequest }
    >({
      query: ({ id, data }) => ({
        url: `/stock-concept/admin/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "StockConcept", id },
        "StockConcept",
        "StockStats",
        "StockAvailability",
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Delete stock (admin)
    deleteStock: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/stock-concept/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StockConcept", "StockStats", "StockAvailability"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Update stock status (admin)
    updateStockStatus: builder.mutation<
      StockConceptResponse,
      { id: string; data: UpdateStockStatusRequest }
    >({
      query: ({ id, data }) => ({
        url: `/stock-concept/admin/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "StockConcept", id },
        "StockConcept",
        "StockStats",
        "StockAvailability",
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Sell vehicle (admin)
    sellVehicle: builder.mutation<
      StockConceptResponse,
      { id: string; data: SellVehicleRequest }
    >({
      query: ({ id, data }) => ({
        url: `/stock-concept/admin/${id}/sell`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "StockConcept", id },
        "StockConcept",
        "StockStats",
        "StockAvailability",
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Reserve vehicle (admin)
    reserveVehicle: builder.mutation<
      StockConceptResponse,
      {
        id: string;
        data: {
          reservedFor: string;
          reservationNotes?: string;
          updatedBy: string;
        };
      }
    >({
      query: ({ id, data }) => ({
        url: `/stock-concept/admin/${id}/reserve`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "StockConcept", id },
        "StockConcept",
        "StockStats",
        "StockAvailability",
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Release reservation (admin)
    releaseReservation: builder.mutation<
      StockConceptResponse,
      { id: string; updatedBy: string }
    >({
      query: ({ id, updatedBy }) => ({
        url: `/stock-concept/admin/${id}/release-reservation`,
        method: "PATCH",
        body: { updatedBy },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "StockConcept", id },
        "StockConcept",
        "StockStats",
        "StockAvailability",
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Transfer stock between branches (admin)
    transferStock: builder.mutation<StockConceptResponse, TransferStockRequest>(
      {
        query: (data) => ({
          url: "/stock-concept/admin/transfer",
          method: "POST",
          body: data,
        }),
        invalidatesTags: ["StockConcept", "StockStats", "StockAvailability"],
        transformErrorResponse: (response) => handleApiError(response),
      }
    ),

    // Bulk update stock (admin)
    bulkUpdateStock: builder.mutation<
      { success: boolean; message: string; updated: number },
      BulkUpdateStockRequest
    >({
      query: (data) => ({
        url: "/stock-concept/admin/bulk-update",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["StockConcept", "StockStats", "StockAvailability"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get stock statistics (admin)
    getStockStats: builder.query<
      StockConceptStatsResponse,
      { branchId?: string; dateRange?: { from: string; to: string } }
    >({
      query: ({ branchId, dateRange }) => {
        const params = new URLSearchParams();
        if (branchId) params.append("branchId", branchId);
        if (dateRange) {
          params.append("from", dateRange.from);
          params.append("to", dateRange.to);
        }

        return `/stock-concept/admin/stats${
          params.toString() ? `?${params.toString()}` : ""
        }`;
      },
      providesTags: ["StockStats"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Export stock data (admin)
    exportStock: builder.mutation<
      { success: boolean; data: { downloadUrl: string }; message?: string },
      { format: "csv" | "xlsx"; filters?: StockConceptFilters }
    >({
      query: ({ format, filters }) => ({
        url: `/stock-concept/admin/export?format=${format}`,
        method: "POST",
        body: filters || {},
      }),
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Import stock data (admin)
    importStock: builder.mutation<
      {
        success: boolean;
        data: { imported: number; errors: string[] };
        message?: string;
      },
      FormData
    >({
      query: (formData) => ({
        url: "/stock-concept/admin/import",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["StockConcept", "StockStats", "StockAvailability"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Validate engine/chassis numbers (admin)
    validateEngineNumbers: builder.query<
      {
        success: boolean;
        data: { isValid: boolean; conflicts: string[] };
        message?: string;
      },
      { engineNumber: string; chassisNumber: string; excludeId?: string }
    >({
      query: ({ engineNumber, chassisNumber, excludeId }) => {
        const params = new URLSearchParams();
        params.append("engineNumber", engineNumber);
        params.append("chassisNumber", chassisNumber);
        if (excludeId) params.append("excludeId", excludeId);

        return `/stock-concept/admin/validate-engine-numbers?${params.toString()}`;
      },
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get low stock alerts (admin)
    getLowStockAlerts: builder.query<
      {
        success: boolean;
        data: Array<{
          modelName: string;
          currentStock: number;
          minimumStock: number;
          branchId: string;
          branchName: string;
        }>;
        message?: string;
      },
      { branchId?: string; threshold?: number }
    >({
      query: ({ branchId, threshold = 5 }) => {
        const params = new URLSearchParams();
        if (branchId) params.append("branchId", branchId);
        params.append("threshold", threshold.toString());

        return `/stock-concept/admin/low-stock-alerts?${params.toString()}`;
      },
      providesTags: ["StockStats"],
      transformErrorResponse: (response) => handleApiError(response),
    }),
  }),
});

// ===================== EXPORT HOOKS =====================
export const {
  // Public hooks
  useGetAvailableStockQuery,
  useGetStockByIdQuery,
  useCheckStockAvailabilityQuery,
  useGetStockByBranchQuery,
  useLazyGetAvailableStockQuery,
  useLazyCheckStockAvailabilityQuery,

  // Admin hooks
  useGetAllStockQuery,
  useCreateStockMutation,
  useUpdateStockMutation,
  useDeleteStockMutation,
  useUpdateStockStatusMutation,
  useSellVehicleMutation,
  useReserveVehicleMutation,
  useReleaseReservationMutation,
  useTransferStockMutation,
  useBulkUpdateStockMutation,
  useGetStockStatsQuery,
  useExportStockMutation,
  useImportStockMutation,
  useValidateEngineNumbersQuery,
  useGetLowStockAlertsQuery,
  useLazyGetAllStockQuery,
  useLazyGetStockStatsQuery,
  useLazyValidateEngineNumbersQuery,
  useLazyGetLowStockAlertsQuery,
} = stockConceptApi;
