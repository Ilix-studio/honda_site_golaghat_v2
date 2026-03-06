import { apiSlice } from "../apiSlice";
import { handleApiError } from "../../../lib/apiConfig";

// ===================== TYPES & INTERFACES =====================

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

export interface ICustomerActiveService {
  _id?: string;
  serviceId: string;
  activatedDate: Date;
  expiryDate: Date;
  purchasePrice: number;
  coverageYears: number;
  isActive: boolean;
}

export interface BackendPaginationResponse<T> {
  success: boolean;
  count: number;
  total: number;
  pages: number;
  currentPage: number;
  data: T[];
  message?: string;
}

export interface VASResponse {
  success: boolean;
  data: IValueAddedService;
  message?: string;
}

export interface VASListResponse
  extends BackendPaginationResponse<IValueAddedService> {}

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
  serviceType?: string;
  isActive?: boolean;
  branchId?: string;
  search?: string;
}

export interface PriceCalculationRequest {
  serviceId: string;
  vehicleId: string;
  selectedYears: number;
}

export interface PriceCalculationResponse {
  success: boolean;
  data: {
    service: string;
    vehicle: string;
    selectedYears: number;
    calculatedPrice: number;
  };
  message?: string;
}

// ===================== VAS API SLICE =====================
export const vasApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ===== PUBLIC/MIXED ROUTES =====
    getServicesByType: builder.query<VASListResponse, string>({
      query: (serviceType) => `/value-added-services/types/${serviceType}`,
      providesTags: ["VAS"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // ===== CUSTOMER ROUTES =====
    getCustomerActiveServices: builder.query<
      CustomerActiveServicesResponse,
      void
    >({
      query: () => "/value-added-services/my-services",
      extraOptions: { isCustomer: true },
      providesTags: ["CustomerActiveService"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

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
    createVAS: builder.mutation<VASResponse, CreateVASRequest>({
      query: (vasData) => ({
        url: "/value-added-services",
        method: "POST",
        body: vasData,
      }),
      invalidatesTags: ["VAS"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

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

    getCustomersWithActiveVAS: builder.query<
      BackendPaginationResponse<any>,
      VASFilters | void
    >({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters && typeof filters === "object") {
          if (filters.page) params.append("page", filters.page.toString());
          if (filters.limit) params.append("limit", filters.limit.toString());
        }
        const queryString = params.toString();
        return `/value-added-services/admin/customers${
          queryString ? `?${queryString}` : ""
        }`;
      },
      providesTags: ["CustomerActiveService"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    getVASById: builder.query<VASResponse, string>({
      query: (id) => `/value-added-services/admin/${id}`,
      providesTags: (_result, _error, id) => [{ type: "VAS", id }],
      transformErrorResponse: (response) => handleApiError(response),
    }),

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
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    deleteVAS: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/value-added-services/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["VAS"],
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
      invalidatesTags: ["CustomerActiveService"],
      transformErrorResponse: (response) => handleApiError(response),
    }),
  }),
});

// ===================== EXPORT HOOKS =====================
export const {
  // Public/Mixed
  useGetServicesByTypeQuery,

  // Customer
  useGetCustomerActiveServicesQuery,

  useCalculateVASPriceMutation,

  // Admin
  useGetAllVASQuery,

  useGetVASByIdQuery,

  useGetCustomersWithActiveVASQuery,

  useCreateVASMutation,
  useUpdateVASMutation,
  useDeleteVASMutation,
  useActivateServiceForCustomerMutation,
} = vasApi;
