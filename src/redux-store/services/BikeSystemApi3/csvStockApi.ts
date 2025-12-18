// src/redux-store/services/BikeSystemApi3/csvStockApi.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery, handleApiError } from "@/lib/apiConfig";
import {
  AssignStockRequest,
  BatchStockFilters,
  CSVImportResponse,
  CSVStockFilters,
  GetCSVBatchesResponse,
  GetCSVStocksResponse,
  GetStockByIdResponse,
} from "@/types/customer/stockcsv.types";
import { UpdateStatusRequest } from "@/types/getApproved.types";

export const csvStockApi = createApi({
  reducerPath: "csvStockApi",
  baseQuery,
  tagTypes: ["CSVStock", "CSVStockList", "CSVBatch"],
  endpoints: (builder) => ({
    // POST /api/csv-stock/import
    importCSVStock: builder.mutation<CSVImportResponse, FormData>({
      query: (formData) => ({
        url: "/csv-stock/import",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["CSVStockList", "CSVBatch"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // GET /api/csv-stock
    getCSVStocks: builder.query<GetCSVStocksResponse, CSVStockFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.batchId) params.append("batchId", filters.batchId);
        if (filters.status) params.append("status", filters.status);
        if (filters.location) params.append("location", filters.location);
        const queryString = params.toString();
        return `/csv-stock${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "CSVStock" as const,
                id: _id,
              })),
              { type: "CSVStockList", id: "LIST" },
            ]
          : [{ type: "CSVStockList", id: "LIST" }],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // GET /api/csv-stock/:stockId
    getCSVStockById: builder.query<GetStockByIdResponse, string>({
      query: (stockId) => `/csv-stock/${stockId}`,
      providesTags: (_result, _error, stockId) => [
        { type: "CSVStock", id: stockId },
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // GET /api/csv-stock/batches/list
    getCSVBatches: builder.query<
      GetCSVBatchesResponse,
      { page?: number; limit?: number }
    >({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        const queryString = queryParams.toString();
        return `/csv-stock/batches/list${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: [{ type: "CSVBatch", id: "LIST" }],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // GET /api/csv-stock/batch/:batchId
    getStocksByBatch: builder.query<
      GetCSVStocksResponse,
      { batchId: string } & BatchStockFilters
    >({
      query: ({ batchId, ...filters }) => {
        const params = new URLSearchParams();
        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.status) params.append("status", filters.status);
        const queryString = params.toString();
        return `/csv-stock/batch/${batchId}${
          queryString ? `?${queryString}` : ""
        }`;
      },
      providesTags: (_result, _error, { batchId }) => [
        { type: "CSVBatch", id: batchId },
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // PATCH /api/csv-stock/:stockId/status
    updateCSVStockStatus: builder.mutation<
      GetStockByIdResponse,
      { stockId: string; data: UpdateStatusRequest }
    >({
      query: ({ stockId, data }) => ({
        url: `/csv-stock/${stockId}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { stockId }) => [
        { type: "CSVStock", id: stockId },
        { type: "CSVStockList", id: "LIST" },
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // POST /api/csv-stock/assign/:stockId
    assignCSVStock: builder.mutation<
      { success: boolean; message: string; data: unknown },
      { stockId: string; data: AssignStockRequest }
    >({
      query: ({ stockId, data }) => ({
        url: `/csv-stock/assign/${stockId}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { stockId }) => [
        { type: "CSVStock", id: stockId },
        { type: "CSVStockList", id: "LIST" },
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // POST /api/csv-stock/unassign/:stockId
    unassignCSVStock: builder.mutation<
      GetStockByIdResponse,
      { stockId: string; reason?: string }
    >({
      query: ({ stockId, reason }) => ({
        url: `/csv-stock/unassign/${stockId}`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { stockId }) => [
        { type: "CSVStock", id: stockId },
        { type: "CSVStockList", id: "LIST" },
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // DELETE /api/csv-stock/:stockId
    deleteCSVStock: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (stockId) => ({
        url: `/csv-stock/${stockId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, stockId) => [
        { type: "CSVStock", id: stockId },
        { type: "CSVStockList", id: "LIST" },
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),
  }),
});

// ===================== EXPORTED HOOKS =====================

export const {
  useImportCSVStockMutation,
  useGetCSVStocksQuery,
  useGetCSVStockByIdQuery,
  useGetCSVBatchesQuery,
  useGetStocksByBatchQuery,
  useUpdateCSVStockStatusMutation,
  useAssignCSVStockMutation,
  useUnassignCSVStockMutation,
  useDeleteCSVStockMutation,
} = csvStockApi;
