import { apiSlice } from "../apiSlice";
import { handleApiError } from "@/lib/apiConfig";
import {
  B2BSalesKPIsFilters,
  B2BSalesListFilters,
  CreateB2BSaleRequest,
  CreateB2BSaleResponse,
  GetB2BSaleResponse,
  GetB2BSalesKPIsResponse,
  GetB2BSalesResponse,
  SearchStockForB2BSaleResponse,
  UpdateB2BSaleRequest,
} from "@/types/b2bSales/b2bSales.types";

export const b2bSalesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // POST /api/b2b-sales
    createB2BSale: builder.mutation<CreateB2BSaleResponse, CreateB2BSaleRequest>({
      query: (data) => ({
        url: "/b2b-sales",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "B2BSales", id: "LIST" }],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // GET /api/b2b-sales/search-stock
    searchStockForB2BSale: builder.query<SearchStockForB2BSaleResponse, string>({
      query: (search) => {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        return `/b2b-sales/search-stock?${params.toString()}`;
      },
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // GET /api/b2b-sales
    getB2BSales: builder.query<GetB2BSalesResponse, B2BSalesListFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined && v !== "") params.append(k, String(v));
          });
        }
        const qs = params.toString();
        return `/b2b-sales${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "B2BSales" as const,
                id: _id,
              })),
              { type: "B2BSales", id: "LIST" },
            ]
          : [{ type: "B2BSales", id: "LIST" }],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // GET /api/b2b-sales/:id
    getB2BSaleById: builder.query<GetB2BSaleResponse, string>({
      query: (id) => `/b2b-sales/${id}`,
      providesTags: (_result, _error, id) => [{ type: "B2BSales", id }],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // PUT /api/b2b-sales/:id
    updateB2BSale: builder.mutation<GetB2BSaleResponse, UpdateB2BSaleRequest>({
      query: ({ id, data }) => ({
        url: `/b2b-sales/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "B2BSales", id },
        { type: "B2BSales", id: "LIST" },
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // DELETE /api/b2b-sales/:id
    deleteB2BSale: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/b2b-sales/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "B2BSales", id },
        { type: "B2BSales", id: "LIST" },
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // GET /api/b2b-sales/kpis
    getB2BSalesKPIs: builder.query<GetB2BSalesKPIsResponse, B2BSalesKPIsFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters?.branchId) params.append("branchId", filters.branchId);
        const qs = params.toString();
        return `/b2b-sales/kpis${qs ? `?${qs}` : ""}`;
      },
      providesTags: [{ type: "B2BSales", id: "KPIS" }],
      transformErrorResponse: (response) => handleApiError(response),
    }),
  }),
});

export const {
  useCreateB2BSaleMutation,
  useSearchStockForB2BSaleQuery,
  useGetB2BSalesQuery,
  useGetB2BSaleByIdQuery,
  useUpdateB2BSaleMutation,
  useDeleteB2BSaleMutation,
  useGetB2BSalesKPIsQuery,
} = b2bSalesApi;
