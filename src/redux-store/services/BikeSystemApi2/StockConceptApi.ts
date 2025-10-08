import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery, handleApiError } from "../../../lib/apiConfig";

// ===================== TYPES & INTERFACES =====================

export interface IStockConcept {
  _id: string;
  stockId: string;
  modelName: string;
  category: "Bike" | "Scooty";
  engineCC: number;
  color: string;
  variant: string;
  yearOfManufacture: number;
  uniqueBookRecord?: string;
  engineNumber: string;
  chassisNumber: string;
  stockStatus: {
    status:
      | "Available"
      | "Sold"
      | "Reserved"
      | "Service"
      | "Damaged"
      | "Transit";
    location: "Showroom" | "Warehouse" | "Service Center" | "Customer";
    branchId: string;
    lastUpdated: Date;
    updatedBy: string;
  };
  salesInfo?: {
    soldTo?: string;
    soldDate?: Date;
    salePrice?: number;
    salesPerson?: string;
    invoiceNumber?: string;
    paymentStatus?: "Paid" | "Partial" | "Pending";
    customerVehicleId?: string;
  };
  salesHistory: Array<{
    soldTo: string;
    soldDate: Date;
    salePrice: number;
    salesPerson: string;
    invoiceNumber: string;
    paymentStatus: "Paid" | "Partial" | "Pending";
    customerVehicleId: string;
    transferType?: "New Sale" | "Ownership Transfer" | "Resale";
  }>;
  priceInfo: {
    exShowroomPrice: number;
    roadTax: number;
    onRoadPrice: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockConceptResponse {
  success: boolean;
  data: IStockConcept;
  message?: string;
}

export interface StockConceptListResponse {
  success: boolean;
  data: IStockConcept[];
  count: number;
  total: number;
  pages: number;
  currentPage: number;
  message?: string;
}

export interface CreateStockConceptRequest {
  modelName: string;
  category: "Bike" | "Scooty";
  engineCC: number;
  engineNumber: string;
  chassisNumber: string;
  color: string;
  variant: string;
  yearOfManufacture: number;
  exShowroomPrice: number;
  roadTax?: number;
  branchId: string;
  location?: "Showroom" | "Warehouse" | "Service Center" | "Customer";
  uniqueBookRecord?: string;
}

export interface AssignToCustomerRequest {
  phoneNumber: string;
  salePrice: number;
  invoiceNumber: string;
  paymentStatus?: "Paid" | "Partial" | "Pending";
  registrationDate?: string;
  numberPlate?: string;
  registeredOwnerName?: string;
  insurance?: boolean;
  isPaid?: boolean;
  isFinance?: boolean;
}

export interface AssignToCustomerResponse {
  success: boolean;
  message: string;
  data: {
    stockItem: IStockConcept;
    customerVehicle: {
      _id: string;
      modelName: string;
      numberPlate?: string;
    };
  };
}

export interface StockConceptFilters {
  page?: number;
  limit?: number;
  status?: IStockConcept["stockStatus"]["status"];
  location?: IStockConcept["stockStatus"]["location"];
  branchId?: string;
  category?: "Bike" | "Scooty";
  search?: string;
}

// ===================== STOCK CONCEPT API SLICE =====================
export const stockConceptApi = createApi({
  reducerPath: "stockConceptApi",
  baseQuery,
  tagTypes: ["StockConcept"],
  endpoints: (builder) => ({
    // Get all stock items with filtering
    getAllStockItems: builder.query<
      StockConceptListResponse,
      StockConceptFilters
    >({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.status) params.append("status", filters.status);
        if (filters.location) params.append("location", filters.location);
        if (filters.branchId) params.append("branchId", filters.branchId);
        if (filters.category) params.append("category", filters.category);
        if (filters.search) params.append("search", filters.search);

        const queryString = params.toString();
        return `/stock-concept${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["StockConcept"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get stock item by ID
    getStockItemById: builder.query<StockConceptResponse, string>({
      query: (id) => `/stock-concept/${id}`,
      providesTags: (_result, _error, id) => [{ type: "StockConcept", id }],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Create new stock item
    createStockItem: builder.mutation<
      StockConceptResponse,
      CreateStockConceptRequest
    >({
      query: (data) => ({
        url: "/stock-concept",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["StockConcept"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Assign stock to customer
    assignToCustomer: builder.mutation<
      AssignToCustomerResponse,
      { id: string; data: AssignToCustomerRequest }
    >({
      query: ({ id, data }) => ({
        url: `/stock-concept/${id}/assign`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "StockConcept", id },
        "StockConcept",
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),
  }),
});

// ===================== EXPORT HOOKS =====================
export const {
  useGetAllStockItemsQuery,
  useGetStockItemByIdQuery,
  useCreateStockItemMutation,
  useAssignToCustomerMutation,
  useLazyGetAllStockItemsQuery,
  useLazyGetStockItemByIdQuery,
} = stockConceptApi;
