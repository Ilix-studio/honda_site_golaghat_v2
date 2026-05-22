import { apiSlice } from "../apiSlice";
import {
  LineItemType,
  CreateCatalogItemBody,
  UpdateCatalogItemBody,
} from "@/types/jobCard.types";

// ─── Response Shape Types ─────────────────────────────────────────────────────

export interface CatalogItemResponse {
  _id: string;
  branch: string;
  itemType: LineItemType;
  name: string;
  description?: string;
  defaultUnitPrice: number;
  defaultTaxRate: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogListResponse {
  success: boolean;
  count: number;
  data: CatalogItemResponse[];
}

export interface CatalogSingleResponse {
  success: boolean;
  message: string;
  data: CatalogItemResponse;
}

export interface CatalogDeleteResponse {
  success: boolean;
  message: string;
}

// ─── Query Filter Args ────────────────────────────────────────────────────────

export interface ListCatalogArgs {
  itemType?: LineItemType;
  search?: string;
  /** Super-Admin only — filter across branches */
  branchId?: string;
  /** Include inactive items. Defaults to false. */
  includeInactive?: boolean;
}

// ─── API Slice ────────────────────────────────────────────────────────────────

export const jobCardCatalogApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ── Create catalog item ───────────────────────────────────────────────────
    createCatalogItem: builder.mutation<
      CatalogSingleResponse,
      CreateCatalogItemBody
    >({
      query: (body) => ({
        url: "/job-card-catalog",
        method: "POST",
        body,
      }),
      invalidatesTags: ["JobCardCatalog"],
    }),

    // ── List catalog items (branch-scoped, with optional filters) ─────────────
    listCatalogItems: builder.query<CatalogListResponse, ListCatalogArgs>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.itemType) searchParams.append("itemType", params.itemType);
        if (params.search) searchParams.append("search", params.search);
        if (params.branchId) searchParams.append("branchId", params.branchId);
        if (params.includeInactive)
          searchParams.append("includeInactive", "true");
        const qs = searchParams.toString();
        return `/job-card-catalog${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["JobCardCatalog"],
    }),

    // ── Update catalog item ───────────────────────────────────────────────────
    updateCatalogItem: builder.mutation<
      CatalogSingleResponse,
      { id: string; body: UpdateCatalogItemBody }
    >({
      query: ({ id, body }) => ({
        url: `/job-card-catalog/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "JobCardCatalog",
        { type: "JobCardCatalogItem", id },
      ],
    }),

    // ── Delete catalog item ───────────────────────────────────────────────────
    deleteCatalogItem: builder.mutation<CatalogDeleteResponse, string>({
      query: (id) => ({
        url: `/job-card-catalog/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        "JobCardCatalog",
        { type: "JobCardCatalogItem", id },
      ],
    }),
  }),
});

export const {
  useCreateCatalogItemMutation,
  useListCatalogItemsQuery,
  useLazyListCatalogItemsQuery,
  useUpdateCatalogItemMutation,
  useDeleteCatalogItemMutation,
} = jobCardCatalogApi;
