import { apiSlice } from "./apiSlice";
import type {
  DataImportConfigResponse,
  PreviewResponse,
  CommitResponse,
  DatasetsListResponse,
  DatasetRowsResponse,
  DeleteDatasetResponse,
  DatasetsFilters,
  DatasetRowsFilters,
  SalesTimeseriesResponse,
  SalesTimeseriesFilters,
  PartsStockStatusResponse,
} from "./dataImport.types";

export const dataImportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDataImportConfig: builder.query<DataImportConfigResponse, void>({
      query: () => "/data-import/config",
      providesTags: ["DataImportConfig"],
    }),

    previewImport: builder.mutation<PreviewResponse, FormData>({
      query: (formData) => ({
        url: "/data-import/preview",
        method: "POST",
        body: formData,
      }),
    }),

    commitImport: builder.mutation<CommitResponse, FormData>({
      query: (formData) => ({
        url: "/data-import/commit",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["DataImportDataset", "SalesTimeseries"],
    }),

    getDatasets: builder.query<DatasetsListResponse, DatasetsFilters | void>({
      query: (filters) => {
        const p = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined && v !== "") p.append(k, String(v));
          });
        }
        const qs = p.toString();
        return `/data-import/datasets${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["DataImportDataset"],
    }),

    getDatasetRows: builder.query<DatasetRowsResponse, DatasetRowsFilters>({
      query: ({ batchId, page, limit }) => {
        const p = new URLSearchParams();
        if (page) p.append("page", String(page));
        if (limit) p.append("limit", String(limit));
        const qs = p.toString();
        return `/data-import/datasets/${batchId}/rows${qs ? `?${qs}` : ""}`;
      },
      providesTags: (_result, _error, arg) => [
        { type: "DataImportRow", id: arg.batchId },
      ],
    }),

    deleteDataset: builder.mutation<DeleteDatasetResponse, string>({
      query: (batchId) => ({
        url: `/data-import/datasets/${batchId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DataImportDataset", "SalesTimeseries"],
    }),

    getSalesTimeseries: builder.query<
      SalesTimeseriesResponse,
      SalesTimeseriesFilters
    >({
      query: (filters) => {
        const p = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== undefined && v !== "") p.append(k, String(v));
        });
        const qs = p.toString();
        return `/data-import/sales/timeseries${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["SalesTimeseries"],
    }),

    getPartsStockStatus: builder.query<PartsStockStatusResponse, { branchId?: string } | void>({
      query: (filters) => {
        const p = new URLSearchParams();
        if (filters?.branchId) p.append("branchId", filters.branchId);
        const qs = p.toString();
        return `/data-import/parts-stock/status${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["DataImportDataset"],
    }),
  }),
});

export const {
  useGetDataImportConfigQuery,
  usePreviewImportMutation,
  useCommitImportMutation,
  useGetDatasetsQuery,
  useGetDatasetRowsQuery,
  useDeleteDatasetMutation,
  useGetSalesTimeseriesQuery,
  useGetPartsStockStatusQuery,
} = dataImportApi;
