import { apiSlice } from "./apiSlice";
import type {
  RagQueryResponse,
  RagQueryArgs,
  RagSourcesResponse,
  RagReindexResponse,
  RagReindexArgs,
  KpiResponse,
  KpiArgs,
  KpiMetricsResponse,
} from "./ragApi.types";

export const ragApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    queryRag: builder.mutation<RagQueryResponse, RagQueryArgs>({
      query: (body) => ({
        url: "/rag/query",
        method: "POST",
        body,
      }),
    }),

    getRagSources: builder.query<RagSourcesResponse, void>({
      query: () => "/rag/sources",
      providesTags: ["RagChat"],
    }),

    generateKpi: builder.mutation<KpiResponse, KpiArgs>({
      query: (body) => ({
        url: "/rag/kpi",
        method: "POST",
        body,
      }),
    }),

    getKpiMetrics: builder.query<KpiMetricsResponse, void>({
      query: () => "/rag/kpi/metrics",
      providesTags: ["RagChat"],
    }),

    reindexRag: builder.mutation<RagReindexResponse, RagReindexArgs>({
      query: (body) => ({
        url: "/rag/reindex",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RagChat"],
    }),
  }),
});

export const {
  useQueryRagMutation,
  useGetRagSourcesQuery,
  useReindexRagMutation,
  useGenerateKpiMutation,
  useGetKpiMetricsQuery,
} = ragApi;
