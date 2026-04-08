import { apiSlice } from "../apiSlice";
import { handleApiError } from "@/lib/apiConfig";

// Bike Management Types
export interface BikeImage {
  _id: string;
  src: string;
  alt: string;
  isPrimary?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Bike {
  _id: string;
  modelName: string;
  mainCategory: "bike" | "scooter";
  category: string;
  year: number;
  variants: Array<{
    name: string;
    features: string[];
    priceAdjustment: number;
    isAvailable: boolean;
  }>;
  priceBreakdown: {
    exShowroomPrice: number;
    rtoCharges: number;
    insuranceComprehensive: number;
    onRoadPrice?: number;
  };
  engineSize: string;
  power: number;
  transmission: string;
  fuelNorms: string;
  isE20Efficiency: boolean;
  features: string[];
  colors: string[];
  stockAvailable: number;
  isNewModel?: boolean;
  isActive: boolean;
  keySpecifications: {
    engine?: string;
    power?: string;
    transmission?: string;
    year?: number;
    fuelNorms?: string;
    isE20Efficiency?: boolean;
  };
  images?: BikeImage[];
  createdAt: string;
  updatedAt: string;
}

export interface AvailableBikesResponse {
  success: boolean;
  data: Bike[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AssignBikeRequest {
  customerId: string;
  registrationDate?: string;
  numberPlate?: string;
  registeredOwnerName?: string;
  purchaseDate?: string;
}

export interface BikeAssignment {
  _id: string;
  bike: Bike;
  customer: {
    _id: string;
    fullName?: string;
    phoneNumber: string;
    email?: string;
  };
  registrationDate?: string;
  purchaseDate?: string;
  numberPlate?: string;
  registeredOwnerName?: string;
  isPaid: boolean;
  isFinance: boolean;
  insurance: boolean;
  serviceStatus: {
    kilometers: number;
    serviceHistory: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BikeAssignmentResponse {
  success: boolean;
  message: string;
  data: BikeAssignment;
}

export interface BikeAssignmentsResponse {
  success: boolean;
  data: BikeAssignment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const bikeManagementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get available bikes for assignment
    getAvailableBikes: builder.query<
      AvailableBikesResponse,
      {
        page?: number;
        limit?: number;
        category?: string;
        search?: string;
      }
    >({
      query: ({ page = 1, limit = 10, category, search }) => ({
        url: "/admin/bike-management/available",
        params: { page, limit, category, search },
      }),
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get bike by ID
    getBikeById: builder.query<{ success: boolean; data: Bike }, string>({
      query: (id) => `/admin/bike-management/${id}`,
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Assign bike to customer
    assignBikeToCustomer: builder.mutation<
      BikeAssignmentResponse,
      { bikeId: string; assignmentData: AssignBikeRequest }
    >({
      query: ({ bikeId, assignmentData }) => ({
        url: `/admin/bike-management/${bikeId}/assign`,
        method: "POST",
        body: assignmentData,
      }),
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Remove bike assignment
    unassignBikeFromCustomer: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (bikeId) => ({
        url: `/admin/bike-management/${bikeId}/unassign`,
        method: "DELETE",
      }),
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get bike assignment history
    getBikeAssignments: builder.query<
      BikeAssignmentsResponse,
      { bikeId: string; page?: number; limit?: number }
    >({
      query: ({ bikeId, page = 1, limit = 10 }) => ({
        url: `/admin/bike-management/${bikeId}/assignments`,
        params: { page, limit },
      }),
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Update bike stock
    updateBikeStock: builder.mutation<
      { success: boolean; message: string; data: Bike },
      { bikeId: string; stockAvailable: number }
    >({
      query: ({ bikeId, stockAvailable }) => ({
        url: `/admin/bike-management/${bikeId}/stock`,
        method: "PATCH",
        body: { stockAvailable },
      }),
      transformErrorResponse: (response) => handleApiError(response),
    }),
  }),
});

export const {
  useGetAvailableBikesQuery,
  useGetBikeByIdQuery,
  useAssignBikeToCustomerMutation,
  useUnassignBikeFromCustomerMutation,
  useGetBikeAssignmentsQuery,
  useUpdateBikeStockMutation,
} = bikeManagementApi;
