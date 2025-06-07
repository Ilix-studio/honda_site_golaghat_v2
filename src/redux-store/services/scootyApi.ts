import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../lib/apiConfig";
import { Scooty } from "../slices/scootySlice";

export interface ScootyFilters {
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

export interface ScootyResponse {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: Scooty[];
}

export interface CreateScootyRequest {
  modelName: string;
  category: string;
  year: number;
  price: number;
  engine: string;
  power: string;
  features?: string[];
  colors?: string[];
  images?: string[];
  inStock?: boolean;
  quantity?: number;
  branch: string;
}

export const scootyApi = createApi({
  reducerPath: "scootyApi",
  baseQuery,
  tagTypes: ["Scooty"],
  endpoints: (builder) => ({
    getScooties: builder.query<ScootyResponse, ScootyFilters>({
      query: (filters) => ({
        url: "/scooty",
        method: "GET",
        params: filters,
      }),
      providesTags: ["Scooty"],
    }),
    getScootyById: builder.query<{ success: boolean; data: Scooty }, string>({
      query: (id) => ({
        url: `/scooty/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Scooty", id }],
    }),
    createScooty: builder.mutation<
      { success: boolean; data: Scooty },
      CreateScootyRequest
    >({
      query: (scootyData) => ({
        url: "/scooty/add",
        method: "POST",
        body: scootyData,
      }),
      invalidatesTags: ["Scooty"],
    }),
    updateScooty: builder.mutation<
      { success: boolean; data: Scooty },
      { id: string; data: Partial<CreateScootyRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/scooty/put/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Scooty", id }],
    }),
    deleteScooty: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/scooty/del/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Scooty"],
    }),
  }),
});

export const {
  useGetScootiesQuery,
  useGetScootyByIdQuery,
  useCreateScootyMutation,
  useUpdateScootyMutation,
  useDeleteScootyMutation,
} = scootyApi;
