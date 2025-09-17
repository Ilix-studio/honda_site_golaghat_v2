// src/redux-store/api/bikeApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../../lib/apiConfig";
import {
  Bike,
  BikeFormData,
  BikeFilters,
  GetBikesResponse,
  GetBikeResponse,
} from "../../slices/BikeSystemSlice/bikesSlice";

// Helper function to build query string from filters
const buildQueryString = (filters: BikeFilters): string => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value.toString());
    }
  });

  return params.toString();
};

// Create bike response interface
export interface CreateBikeResponse {
  success: boolean;
  message: string;
  data: {
    bikeId: string;
  } & Bike;
}

// Update bike response interface
export interface UpdateBikeResponse {
  success: boolean;
  message: string;
  data: Bike;
}

// Delete bike response interface
export interface DeleteBikeResponse {
  success: boolean;
  message: string;
}

export const bikeApi = createApi({
  reducerPath: "bikeApi",
  baseQuery,
  tagTypes: ["Bike", "BikeList"],
  endpoints: (builder) => ({
    // GET /api/bikes - Get all bikes with filters
    getBikes: builder.query<GetBikesResponse, BikeFilters>({
      query: (filters = {}) => {
        const queryString = buildQueryString(filters);
        return `bikes/get${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.bikes.map(({ _id }) => ({
                type: "Bike" as const,
                id: _id,
              })),
              { type: "BikeList", id: "LIST" },
            ]
          : [{ type: "BikeList", id: "LIST" }],
    }),

    // GET /api/bikes/:id - Get single bike by ID
    getBikeById: builder.query<GetBikeResponse, string>({
      query: (id) => `bikes/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Bike", id }],
    }),

    // GET /api/bikes/search - Search bikes
    searchBikes: builder.query<
      GetBikesResponse,
      { query: string } & BikeFilters
    >({
      query: ({ query, ...filters }) => {
        const queryString = buildQueryString({ ...filters });
        return `bikes/search?${queryString}`;
      },
      providesTags: [{ type: "BikeList", id: "SEARCH" }],
    }),

    // GET /api/bikes/category/:category - Get bikes by category
    getBikesByCategory: builder.query<
      GetBikesResponse,
      { category: string } & BikeFilters
    >({
      query: ({ category, ...filters }) => {
        const queryString = buildQueryString(filters);
        return `bikes/category/${category}${
          queryString ? `?${queryString}` : ""
        }`;
      },
      providesTags: (_result, _error, { category }) => [
        { type: "BikeList", id: `CATEGORY_${category}` },
      ],
    }),

    // GET /api/bikes/main-category/:mainCategory - Get bikes by main category
    getBikesByMainCategory: builder.query<
      GetBikesResponse,
      { mainCategory: "bike" | "scooter" } & BikeFilters
    >({
      query: ({ mainCategory, ...filters }) => {
        const queryString = buildQueryString(filters);
        return `bikes/main-category/${mainCategory}${
          queryString ? `?${queryString}` : ""
        }`;
      },
      providesTags: (_result, _error, { mainCategory }) => [
        { type: "BikeList", id: `MAIN_CATEGORY_${mainCategory}` },
      ],
    }),

    // GET /api/bikes/fuel-norms/:fuelNorms - Get bikes by fuel norms
    getBikesByFuelNorms: builder.query<
      GetBikesResponse,
      { fuelNorms: string } & BikeFilters
    >({
      query: ({ fuelNorms, ...filters }) => {
        const queryString = buildQueryString(filters);
        return `bikes/fuel-norms/${fuelNorms}${
          queryString ? `?${queryString}` : ""
        }`;
      },
      providesTags: (_result, _error, { fuelNorms }) => [
        { type: "BikeList", id: `FUEL_NORMS_${fuelNorms}` },
      ],
    }),

    // GET /api/bikes/e20-efficient - Get E20 efficient bikes
    getE20EfficientBikes: builder.query<GetBikesResponse, BikeFilters>({
      query: (filters = {}) => {
        const queryString = buildQueryString(filters);
        return `bikes/e20-efficient${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: [{ type: "BikeList", id: "E20_EFFICIENT" }],
    }),

    // POST /api/bikes/create - Create new bike
    createBike: builder.mutation<CreateBikeResponse, BikeFormData>({
      query: (bikeData) => ({
        url: "bikes/create",
        method: "POST",
        body: bikeData,
      }),
      invalidatesTags: [{ type: "BikeList", id: "LIST" }],
    }),

    // PATCH /api/bikes/:id - Update bike
    updateBike: builder.mutation<
      UpdateBikeResponse,
      { id: string; data: Partial<BikeFormData> }
    >({
      query: ({ id, data }) => ({
        url: `bikes/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Bike", id },
        { type: "BikeList", id: "LIST" },
      ],
    }),

    // DELETE /api/bikes/:id - Delete bike
    deleteBike: builder.mutation<DeleteBikeResponse, string>({
      query: (id) => ({
        url: `bikes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Bike", id },
        { type: "BikeList", id: "LIST" },
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetBikesQuery,
  useGetBikeByIdQuery,
  useSearchBikesQuery,
  useGetBikesByCategoryQuery,
  useGetBikesByMainCategoryQuery,
  useGetBikesByFuelNormsQuery,
  useGetE20EfficientBikesQuery,
  useCreateBikeMutation,
  useUpdateBikeMutation,
  useDeleteBikeMutation,

  // Lazy queries for manual triggering
  useLazyGetBikesQuery,
  useLazySearchBikesQuery,
  useLazyGetBikesByCategoryQuery,
  useLazyGetBikesByMainCategoryQuery,
  useLazyGetBikesByFuelNormsQuery,
  useLazyGetE20EfficientBikesQuery,
} = bikeApi;

// Export the reducer
export default bikeApi.reducer;
