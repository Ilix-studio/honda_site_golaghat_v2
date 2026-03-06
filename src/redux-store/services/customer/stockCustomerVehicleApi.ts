import { apiSlice } from "../apiSlice";
import { handleApiError } from "@/lib/apiConfig";

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
    branchId: {
      _id: string;
      branchName: string;
      address: string;
    };
    lastUpdated: Date;
    updatedBy: string;
  };
  salesInfo?: {
    soldTo?: {
      _id: string;
      phoneNumber: string;
      firstName?: string;
      lastName?: string;
    };
    soldDate?: Date;
    salePrice?: number;
    salesPerson?: {
      _id: string;
      name: string;
      email: string;
    };
    invoiceNumber?: string;
    paymentStatus?: "Paid" | "Partial" | "Pending";
    customerVehicleId?: {
      _id: string;
      modelName: string;
      numberPlate?: string;
    };
  };
  salesHistory: Array<{
    soldTo: {
      _id: string;
      phoneNumber: string;
      firstName?: string;
      lastName?: string;
    };
    soldDate: Date;
    salePrice: number;
    salesPerson: {
      _id: string;
      name: string;
      email: string;
    };
    invoiceNumber: string;
    paymentStatus: "Paid" | "Partial" | "Pending";
    customerVehicleId: {
      _id: string;
      modelName: string;
      numberPlate?: string;
    };
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

export interface StockVehicleResponse {
  success: boolean;
  data: IStockConcept;
  message?: string;
}

export interface StockVehicleListResponse {
  success: boolean;
  data: IStockConcept[];
  count: number;
  message?: string;
}






export const stockCustomerVehicleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyStockVehicles: builder.query<StockVehicleListResponse, void>({
      query: () => "/stock-concept/my-vehicles",
      extraOptions: { isCustomer: true },
      providesTags: ["CustomerStockVehicle"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    getStockVehicleById: builder.query<StockVehicleResponse, string>({
      query: (vehicleId) => `/stock-concept/${vehicleId}`,
      extraOptions: { isCustomer: true },
      providesTags: (_result, _error, vehicleId) => [
        { type: "CustomerStockVehicle", id: vehicleId },
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),
  }),
});

export const {
  useGetMyStockVehiclesQuery,
  useGetStockVehicleByIdQuery,
  useLazyGetMyStockVehiclesQuery,
  useLazyGetStockVehicleByIdQuery,
} = stockCustomerVehicleApi;