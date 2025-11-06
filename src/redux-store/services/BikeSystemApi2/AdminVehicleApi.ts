import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery, handleApiError } from "../../../lib/apiConfig";

// ===================== TYPES & INTERFACES =====================
// Service Types
type ServiceType = "Regular" | "Overdue" | "Due Soon" | "Up to Date";
type NextServiceType =
  | "firstService"
  | "secondService"
  | "thirdService"
  | "paidServiceOne"
  | "paidServiceTwo"
  | "paidServiceThree"
  | "paidServiceFour"
  | "paidServiceFive";

// Customer Vehicle Interface
export interface ICustomerVehicle {
  _id: string;
  modelName: string;

  // Reference to StockConcept for vehicle details
  stockConcept?: string; // ObjectId as string

  // Vehicle ownership details
  registrationDate?: Date;
  insurance: boolean;
  isPaid: boolean;
  isFinance: boolean;
  color?: string;
  purchaseDate?: Date;
  customerPhoneNumber: string; // ObjectId as string - Reference to BaseCustomer
  numberPlate?: string;
  registeredOwnerName?: string;
  motorcyclePhoto?: string;

  // RTO Information
  rtoInfo?: {
    rtoCode: string;
    rtoName: string;
    rtoAddress: string;
    state: string;
  };

  // Service tracking
  serviceStatus: {
    lastServiceDate?: Date;
    nextServiceDue?: Date;
    serviceType: ServiceType;
    kilometers: number;
    serviceHistory: number;
  };

  // Service package assignment
  servicePackage: {
    packageId: string; // ObjectId as string - Reference to ServiceAddons
    activatedDate?: Date;
    currentServiceLevel: number;
    nextServiceType: NextServiceType;
    completedServices: NextServiceType[];
  };

  // Value added services
  activeValueAddedServices: Array<{
    serviceId: string; // ObjectId as string - Reference to ValueAddedService
    activatedDate: Date;
    expiryDate: Date;
    activatedBy: string; // ObjectId as string - Reference to admin user
    purchasePrice: number;
    coverageYears: number;
    isActive: boolean;
    activeBadges: string[];
  }>;

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Populated Vehicle Interface (with related data)
export interface IPopulatedCustomerVehicle
  extends Omit<ICustomerVehicle, "stockConcept"> {
  stockConcept?: {
    _id: string;
    stockId: string;
    bikeInfo: {
      bikeModelId: string;
      modelName: string;
      category: string;
      engineCC: number;
      fuelType: string;
      color: string;
      variant: string;
      yearOfManufacture: number;
    };
    engineDetails: {
      engineNumber: string;
      chassisNumber: string;
      engineType: string;
      maxPower: string;
      maxTorque: string;
      displacement: number;
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
  };
  customerPhoneNumberDetails?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  servicePackageDetails?: {
    _id: string;
    serviceName: any; // ServicePackage details
  };
}

// Request/Response Types
export interface CustomerVehicleResponse {
  success: boolean;
  data: ICustomerVehicle;
  message?: string;
}

export interface PopulatedCustomerVehicleResponse {
  success: boolean;
  data: IPopulatedCustomerVehicle;
  message?: string;
}

export interface CustomerVehicleListResponse {
  success: boolean;
  data: ICustomerVehicle[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
}

export interface PopulatedCustomerVehicleListResponse {
  success: boolean;
  data: IPopulatedCustomerVehicle[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
}

export interface CreateCustomerVehicleRequest {
  modelName: string;
  stockConcept?: string;
  registrationDate?: Date;
  insurance: boolean;
  isPaid: boolean;
  isFinance: boolean;
  color?: string;
  purchaseDate?: Date;
  customerPhoneNumber: string;
  numberPlate?: string;
  registeredOwnerName?: string;
  motorcyclePhoto?: string;
  rtoInfo?: {
    rtoCode: string;
    rtoName: string;
    rtoAddress: string;
    state: string;
  };
  servicePackage: {
    packageId: string;
    currentServiceLevel?: number;
    nextServiceType?: NextServiceType;
  };
}

export interface UpdateCustomerVehicleRequest
  extends Partial<CreateCustomerVehicleRequest> {
  isActive?: boolean;
}

export interface UpdateServiceStatusRequest {
  lastServiceDate?: Date;
  nextServiceDue?: Date;
  serviceType?: ServiceType;
  kilometers?: number;
  serviceHistory?: number;
}

export interface UpdateServicePackageRequest {
  packageId?: string;
  currentServiceLevel?: number;
  nextServiceType?: NextServiceType;
  completedServices?: NextServiceType[];
}

export interface AddValueAddedServiceRequest {
  serviceId: string;
  activatedBy: string;
  purchasePrice: number;
  coverageYears: number;
  activeBadges?: string[];
}

export interface UpdateValueAddedServiceRequest {
  serviceIndex: number;
  isActive?: boolean;
  activeBadges?: string[];
}

export interface CustomerVehicleFilters {
  page?: number;
  limit?: number;
  customerId?: string;
  modelName?: string;
  serviceType?: ServiceType;
  nextServiceType?: NextServiceType;
  rtoCode?: string;
  color?: string;
  insurance?: boolean;
  isPaid?: boolean;
  isFinance?: boolean;
  isActive?: boolean;
  hasVAS?: boolean; // Has active value-added services
  search?: string;
  registrationFrom?: string; // ISO date string
  registrationTo?: string; // ISO date string
  purchaseFrom?: string; // ISO date string
  purchaseTo?: string; // ISO date string
  serviceDueFrom?: string; // ISO date string
  serviceDueTo?: string; // ISO date string
}

export interface CustomerVehicleStatsResponse {
  success: boolean;
  data: {
    totalVehicles: number;
    activeVehicles: number;
    insuredVehicles: number;
    paidVehicles: number;
    financeVehicles: number;
    vehiclesWithVAS: number;
    serviceStats: {
      upToDate: number;
      dueSoon: number;
      overdue: number;
      regular: number;
    };
    servicePackageStats: Array<{
      packageId: string;
      packageName: string;
      vehicleCount: number;
    }>;
    rtoStats: Array<{
      rtoCode: string;
      rtoName: string;
      vehicleCount: number;
    }>;
    modelStats: Array<{
      modelName: string;
      vehicleCount: number;
    }>;
    recentRegistrations: Array<{
      date: string;
      count: number;
    }>;
  };
  message?: string;
}

export interface ServiceHistoryResponse {
  success: boolean;
  data: Array<{
    _id: string;
    vehicleId: string;
    serviceType: NextServiceType;
    serviceDate: Date;
    kilometers: number;
    serviceNotes?: string;
    cost?: number;
    technician?: string;
    branchId: string;
    branchName: string;
  }>;
  message?: string;
}

export interface VehicleTransferRequest {
  fromCustomerId: string;
  toCustomerId: string;
  transferDate: Date;
  transferReason: string;
  updatedBy: string;
}

export interface BulkUpdateVehiclesRequest {
  vehicleIds: string[];
  updates: {
    serviceType?: ServiceType;
    insurance?: boolean;
    isPaid?: boolean;
    isActive?: boolean;
  };
}

// ===================== CUSTOMER VEHICLE API SLICE =====================
export const adminVehicleApi = createApi({
  reducerPath: "adminVehicleApi",
  baseQuery,
  tagTypes: ["CustomerVehicle", "VehicleStats", "ServiceHistory"],
  endpoints: (builder) => ({
    // ===== PUBLIC/CUSTOMER ENDPOINTS =====

    // Get customer's vehicles
    getCustomerVehicles: builder.query<
      CustomerVehicleListResponse,
      { customerId?: string; page?: number; limit?: number }
    >({
      query: ({ customerId, page = 1, limit = 10 }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (customerId) params.append("customerId", customerId);

        return `/customer-vehicles?${params.toString()}`;
      },
      providesTags: ["CustomerVehicle"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get my vehicles (authenticated customer)
    // getMyVehicles: builder.query<
    //   PopulatedCustomerVehicleListResponse,
    //   { page?: number; limit?: number }
    // >({
    //   query: ({ page = 1, limit = 10 }) => {
    //     const params = new URLSearchParams();
    //     params.append("page", page.toString());
    //     params.append("limit", limit.toString());
    //     return `/customer-vehicles/my-vehicles?${params.toString()}`;
    //   },
    //   providesTags: ["CustomerVehicle"],
    //   transformErrorResponse: (response) => handleApiError(response),
    // }),

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

    // Get vehicles by customer phone/ID
    getVehiclesByCustomer: builder.query<
      PopulatedCustomerVehicleListResponse,
      { customerId: string; includeInactive?: boolean }
    >({
      query: ({ customerId, includeInactive = false }) => {
        const params = new URLSearchParams();
        if (includeInactive) params.append("includeInactive", "true");

        return `/customer-vehicles/customer/${customerId}${
          params.toString() ? `?${params.toString()}` : ""
        }`;
      },
      providesTags: ["CustomerVehicle"],
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

    // ===== ADMIN ENDPOINTS =====

    // Get all vehicles with filters (admin)
    getAllCustomerVehicles: builder.query<
      PopulatedCustomerVehicleListResponse,
      CustomerVehicleFilters
    >({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.customerId) params.append("customerId", filters.customerId);
        if (filters.modelName) params.append("modelName", filters.modelName);
        if (filters.serviceType)
          params.append("serviceType", filters.serviceType);
        if (filters.nextServiceType)
          params.append("nextServiceType", filters.nextServiceType);
        if (filters.rtoCode) params.append("rtoCode", filters.rtoCode);
        if (filters.color) params.append("color", filters.color);
        if (filters.insurance !== undefined)
          params.append("insurance", filters.insurance.toString());
        if (filters.isPaid !== undefined)
          params.append("isPaid", filters.isPaid.toString());
        if (filters.isFinance !== undefined)
          params.append("isFinance", filters.isFinance.toString());
        if (filters.isActive !== undefined)
          params.append("isActive", filters.isActive.toString());
        if (filters.hasVAS !== undefined)
          params.append("hasVAS", filters.hasVAS.toString());
        if (filters.search) params.append("search", filters.search);
        if (filters.registrationFrom)
          params.append("registrationFrom", filters.registrationFrom);
        if (filters.registrationTo)
          params.append("registrationTo", filters.registrationTo);
        if (filters.purchaseFrom)
          params.append("purchaseFrom", filters.purchaseFrom);
        if (filters.purchaseTo) params.append("purchaseTo", filters.purchaseTo);
        if (filters.serviceDueFrom)
          params.append("serviceDueFrom", filters.serviceDueFrom);
        if (filters.serviceDueTo)
          params.append("serviceDueTo", filters.serviceDueTo);

        const queryString = params.toString();
        return `/customer-vehicles/admin/all${
          queryString ? `?${queryString}` : ""
        }`;
      },
      providesTags: ["CustomerVehicle"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Create customer vehicle (admin)
    createCustomerVehicle: builder.mutation<
      CustomerVehicleResponse,
      CreateCustomerVehicleRequest
    >({
      query: (data) => ({
        url: "/customer-vehicles/admin/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CustomerVehicle", "VehicleStats"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Update customer vehicle (admin)
    updateCustomerVehicle: builder.mutation<
      CustomerVehicleResponse,
      { id: string; data: UpdateCustomerVehicleRequest }
    >({
      query: ({ id, data }) => ({
        url: `/customer-vehicles/admin/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "CustomerVehicle", id },
        "CustomerVehicle",
        "VehicleStats",
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Delete customer vehicle (admin)
    deleteCustomerVehicle: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/customer-vehicles/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CustomerVehicle", "VehicleStats"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Update vehicle service status (admin)
    updateVehicleServiceStatus: builder.mutation<
      CustomerVehicleResponse,
      { id: string; data: UpdateServiceStatusRequest }
    >({
      query: ({ id, data }) => ({
        url: `/customer-vehicles/admin/${id}/service-status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "CustomerVehicle", id },
        { type: "ServiceHistory", id },
        "CustomerVehicle",
        "VehicleStats",
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Update service package (admin)
    updateVehicleServicePackage: builder.mutation<
      CustomerVehicleResponse,
      { id: string; data: UpdateServicePackageRequest }
    >({
      query: ({ id, data }) => ({
        url: `/customer-vehicles/admin/${id}/service-package`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "CustomerVehicle", id },
        "CustomerVehicle",
        "VehicleStats",
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Add value-added service to vehicle (admin)
    addValueAddedService: builder.mutation<
      CustomerVehicleResponse,
      { id: string; data: AddValueAddedServiceRequest }
    >({
      query: ({ id, data }) => ({
        url: `/customer-vehicles/admin/${id}/add-vas`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "CustomerVehicle", id },
        "CustomerVehicle",
        "VehicleStats",
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Update value-added service (admin)
    updateValueAddedService: builder.mutation<
      CustomerVehicleResponse,
      { id: string; data: UpdateValueAddedServiceRequest }
    >({
      query: ({ id, data }) => ({
        url: `/customer-vehicles/admin/${id}/update-vas`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "CustomerVehicle", id },
        "CustomerVehicle",
        "VehicleStats",
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Remove value-added service (admin)
    removeValueAddedService: builder.mutation<
      CustomerVehicleResponse,
      { id: string; serviceIndex: number }
    >({
      query: ({ id, serviceIndex }) => ({
        url: `/customer-vehicles/admin/${id}/remove-vas`,
        method: "DELETE",
        body: { serviceIndex },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "CustomerVehicle", id },
        "CustomerVehicle",
        "VehicleStats",
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Transfer vehicle ownership (admin)
    transferVehicleOwnership: builder.mutation<
      CustomerVehicleResponse,
      { id: string; data: VehicleTransferRequest }
    >({
      query: ({ id, data }) => ({
        url: `/customer-vehicles/admin/${id}/transfer`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "CustomerVehicle", id },
        "CustomerVehicle",
        "VehicleStats",
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Bulk update vehicles (admin)
    bulkUpdateVehicles: builder.mutation<
      { success: boolean; message: string; updated: number },
      BulkUpdateVehiclesRequest
    >({
      query: (data) => ({
        url: "/customer-vehicles/admin/bulk-update",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["CustomerVehicle", "VehicleStats"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get vehicle statistics (admin)
    getVehicleStats: builder.query<
      CustomerVehicleStatsResponse,
      { customerId?: string; dateRange?: { from: string; to: string } }
    >({
      query: ({ customerId, dateRange }) => {
        const params = new URLSearchParams();
        if (customerId) params.append("customerId", customerId);
        if (dateRange) {
          params.append("from", dateRange.from);
          params.append("to", dateRange.to);
        }

        return `/customer-vehicles/admin/stats${
          params.toString() ? `?${params.toString()}` : ""
        }`;
      },
      providesTags: ["VehicleStats"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get vehicles due for service (admin)
    getVehiclesDueForService: builder.query<
      PopulatedCustomerVehicleListResponse,
      { daysAhead?: number; page?: number; limit?: number }
    >({
      query: ({ daysAhead = 30, page = 1, limit = 10 }) => {
        const params = new URLSearchParams();
        params.append("daysAhead", daysAhead.toString());
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        return `/customer-vehicles/admin/service-due?${params.toString()}`;
      },
      providesTags: ["CustomerVehicle"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Export vehicles data (admin)
    exportVehicles: builder.mutation<
      { success: boolean; data: { downloadUrl: string }; message?: string },
      { format: "csv" | "xlsx"; filters?: CustomerVehicleFilters }
    >({
      query: ({ format, filters }) => ({
        url: `/customer-vehicles/admin/export?format=${format}`,
        method: "POST",
        body: filters || {},
      }),
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Import vehicles data (admin)
    importVehicles: builder.mutation<
      {
        success: boolean;
        data: { imported: number; errors: string[] };
        message?: string;
      },
      FormData
    >({
      query: (formData) => ({
        url: "/customer-vehicles/admin/import",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["CustomerVehicle", "VehicleStats"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Validate number plate uniqueness (admin)
    validateNumberPlate: builder.query<
      {
        success: boolean;
        data: { isUnique: boolean; existingVehicleId?: string };
        message?: string;
      },
      { numberPlate: string; excludeVehicleId?: string }
    >({
      query: ({ numberPlate, excludeVehicleId }) => {
        const params = new URLSearchParams();
        params.append("numberPlate", numberPlate);
        if (excludeVehicleId)
          params.append("excludeVehicleId", excludeVehicleId);

        return `/customer-vehicles/admin/validate-number-plate?${params.toString()}`;
      },
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Send service reminders (admin)
    sendServiceReminders: builder.mutation<
      { success: boolean; data: { sent: number }; message?: string },
      { vehicleIds?: string[]; daysAhead?: number }
    >({
      query: (data) => ({
        url: "/customer-vehicles/admin/send-service-reminders",
        method: "POST",
        body: data,
      }),
      transformErrorResponse: (response) => handleApiError(response),
    }),
  }),
});

// ===================== EXPORT HOOKS =====================
export const {
  // Customer/Public hooks
  // useGetMyVehiclesQuery, // Add this
  useGetCustomerVehiclesQuery,
  useGetCustomerVehicleByIdQuery,
  useGetVehicleServiceHistoryQuery,
  useGetVehiclesByCustomerQuery,
  useCheckVehicleEligibilityQuery,
  useLazyGetCustomerVehiclesQuery,
  useLazyGetVehiclesByCustomerQuery,
  useLazyCheckVehicleEligibilityQuery,

  // Admin hooks
  useGetAllCustomerVehiclesQuery,
  useCreateCustomerVehicleMutation,
  useUpdateCustomerVehicleMutation,
  useDeleteCustomerVehicleMutation,
  useUpdateVehicleServiceStatusMutation,
  useUpdateVehicleServicePackageMutation,
  useAddValueAddedServiceMutation,
  useUpdateValueAddedServiceMutation,
  useRemoveValueAddedServiceMutation,
  useTransferVehicleOwnershipMutation,
  useBulkUpdateVehiclesMutation,
  useGetVehicleStatsQuery,
  useGetVehiclesDueForServiceQuery,
  useExportVehiclesMutation,
  useImportVehiclesMutation,
  useValidateNumberPlateQuery,
  useSendServiceRemindersMutation,
  //
  // useLazyGetMyVehiclesQuery, // Add this
  useLazyGetAllCustomerVehiclesQuery,
  useLazyGetVehicleStatsQuery,
  useLazyGetVehiclesDueForServiceQuery,
  useLazyValidateNumberPlateQuery,
} = adminVehicleApi;
