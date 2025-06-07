import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../lib/apiConfig";
import { Bike } from "../slices/bikesSlice";

export interface BikeFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  branch?: string;
  search?: string;
  sortBy?: string;
  limit?: number;
  page?: number;
}

export interface BikeResponse {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: Bike[];
}

export interface CreateBikeRequest {
  modelName: string;
  category: string;
  year: number;
  price: number;
  engine: string;
  power: number;
  transmission: string;
  features?: string[];
  colors?: string[];
  images?: string[];
  inStock?: boolean;
  quantity?: number;
  branch: string;
}

export const bikesApi = createApi({
  reducerPath: "bikesApi",
  baseQuery,
  tagTypes: ["Bike"],
  endpoints: (builder) => ({
    getBikes: builder.query<BikeResponse, BikeFilters>({
      query: (filters) => ({
        url: "/bikes/getBikes",
        method: "POST",
        body: filters,
      }),
      providesTags: ["Bike"],
    }),
    getBikeById: builder.query<{ success: boolean; data: Bike }, string>({
      query: (id) => ({
        url: `/bikes/getBike/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Bike", id }],
    }),
    createBike: builder.mutation<
      { success: boolean; data: Bike },
      CreateBikeRequest
    >({
      query: (bikeData) => ({
        url: "/bikes/addBikes",
        method: "POST",
        body: bikeData,
      }),
      invalidatesTags: ["Bike"],
    }),
    updateBike: builder.mutation<
      { success: boolean; data: Bike },
      { id: string; data: Partial<CreateBikeRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/bikes/updateBike/${id}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Bike", id }],
    }),
    deleteBike: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/bikes/deleteBike/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["Bike"],
    }),
  }),
});

export const {
  useGetBikesQuery,
  useGetBikeByIdQuery,
  useCreateBikeMutation,
  useUpdateBikeMutation,
  useDeleteBikeMutation,
} = bikesApi;
