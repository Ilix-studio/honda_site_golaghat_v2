import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery, handleApiError } from "@/lib/apiConfig";

// ===================== INTERFACES =====================

export interface IStockConceptCSV {
  _id: string;
  stockId: string;
  modelName: string;
  engineNumber: string;
  chassisNumber: string;
  color: string;
  csvImportBatch: string;
  csvImportDate: string;
  csvFileName: string;
  csvData: Record<string, unknown>;
  schemaVersion: number;
  detectedColumns: string[];
  stockStatus: {
    status: "Available" | "Sold" | "Reserved" | "Service";
    location: string;
    branchId: string | { _id: string; branchName: string };
    updatedBy: string;
  };
  salesInfo?: {
    soldTo?: string;
    soldDate?: string;
    salePrice?: number;
    invoiceNumber?: string;
    paymentStatus?: "Paid" | "Partial" | "Pending";
    customerVehicleId?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Import Response
export interface CSVImportResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
    totalRows: number;
    successCount: number;
    failureCount: number;
    batchId: string;
    detectedColumns: string[];
    errors: Array<{
      row: number;
      data: Record<string, unknown>;
      error: string;
    }>;
    created: string[];
  };
}

// Get CSV Stocks Response
export interface GetCSVStocksResponse {
  success: boolean;
  data: IStockConceptCSV[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Query Filters
export interface CSVStockFilters {
  page?: number;
  limit?: number;
  batchId?: string;
  status?: IStockConceptCSV["stockStatus"]["status"];
  location?: string;
}

// ===================== API SLICE =====================

export const csvStockApi = createApi({
  reducerPath: "csvStockApi",
  baseQuery,
  tagTypes: ["CSVStock", "CSVStockList"],
  endpoints: (builder) => ({
    // POST /api/csv-stock/import - Import CSV stock (Super-Admin only)
    importCSVStock: builder.mutation<CSVImportResponse, FormData>({
      query: (formData) => ({
        url: "/csv-stock/import",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["CSVStockList"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // GET /api/csv-stock - Get all CSV stocks with filters
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
  }),
});

// ===================== EXPORTED HOOKS =====================

export const {
  useImportCSVStockMutation,
  useGetCSVStocksQuery,
  useLazyGetCSVStocksQuery,
} = csvStockApi;
