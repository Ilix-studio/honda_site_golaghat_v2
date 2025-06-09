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
    // GET /api/bikes - with query parameters
    getBikes: builder.query<BikeResponse, BikeFilters>({
      query: (filters) => {
        // Convert filters to query string parameters
        const params = new URLSearchParams();

        if (filters.category) params.append("category", filters.category);
        if (filters.minPrice !== undefined)
          params.append("minPrice", filters.minPrice.toString());
        if (filters.maxPrice !== undefined)
          params.append("maxPrice", filters.maxPrice.toString());
        if (filters.inStock !== undefined)
          params.append("inStock", filters.inStock.toString());
        if (filters.branch) params.append("branch", filters.branch);
        if (filters.search) params.append("search", filters.search);
        if (filters.sortBy) params.append("sortBy", filters.sortBy);
        if (filters.limit !== undefined)
          params.append("limit", filters.limit.toString());
        if (filters.page !== undefined)
          params.append("page", filters.page.toString());

        const queryString = params.toString();
        return {
          url: `/bikes${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["Bike"],
    }),

    // Alternative: POST /api/bikes/search - with request body (for complex filters)
    searchBikes: builder.query<BikeResponse, BikeFilters>({
      query: (filters) => ({
        url: "/bikes/search",
        method: "POST",
        body: filters,
      }),
      providesTags: ["Bike"],
    }),

    // GET /api/bikes/:id - Fixed URL
    getBikeById: builder.query<{ success: boolean; data: Bike }, string>({
      query: (id) => ({
        url: `/bikes/${id}`, // Changed from /bikes/getBike/${id}
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Bike", id }],
    }),

    // POST /api/bikes - Fixed URL
    createBike: builder.mutation<
      { success: boolean; data: Bike; message: string },
      CreateBikeRequest
    >({
      query: (bikeData) => ({
        url: "/bikes", // Changed from /bikes/addBikes
        method: "POST",
        body: bikeData,
      }),
      invalidatesTags: ["Bike"],
    }),

    // PUT /api/bikes/:id - Fixed URL and method
    updateBike: builder.mutation<
      { success: boolean; data: Bike; message: string },
      { id: string; data: Partial<CreateBikeRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/bikes/${id}`, // Changed from /bikes/updateBike/${id}
        method: "PUT", // Changed from POST to PUT
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Bike", id }],
    }),

    // DELETE /api/bikes/:id - Fixed URL and method
    deleteBike: builder.mutation<{ success: boolean; message: string }, string>(
      {
        query: (id) => ({
          url: `/bikes/${id}`, // Changed from /bikes/deleteBike/${id}
          method: "DELETE", // Changed from POST to DELETE
        }),
        invalidatesTags: ["Bike"],
      }
    ),
  }),
});

export const {
  useGetBikesQuery,
  useSearchBikesQuery,
  useGetBikeByIdQuery,
  useCreateBikeMutation,
  useUpdateBikeMutation,
  useDeleteBikeMutation,
} = bikesApi;

// Where to implement these new hook "useSearchBikesQuery" in components
