// store/api/quotationApi.ts
import { apiSlice } from "../apiSlice";

// ─── Types ─────────────────────────────────────────────────────────────────

export type QuotationPricingType = "standard" | "variation";

export interface QuotationBikeSnapshot {
  modelName: string;
  category: string;
  mainCategory: "bike" | "scooter";
  image?: { src: string; alt: string };
}

export interface QuotationVariation {
  label: string;
  price: number;
  onRoadPrice: number;
}

export interface QuotationInsurance {
  provider?: string;
  premium?: number;
  notes?: string;
}

export interface QuotationVasSelection {
  vas: string;
  serviceName: string;
  price: number;
}

export interface Quotation {
  _id: string;
  bike: string;
  bikeSnapshot: QuotationBikeSnapshot;
  pricingType: QuotationPricingType;
  exShowroomPrice: number;
  onRoadTax: number;
  variation?: QuotationVariation;
  insurance?: QuotationInsurance;
  vasSelections: QuotationVasSelection[];
  createdByRole: "Branch-Admin" | "Staff";
  branch: string | { _id: string; branchName: string; address?: string };
  createdAt: string;
  updatedAt: string;
}

// ─── Request Types ────────────────────────────────────────────────────────────

export interface CreateQuotationRequest {
  bikeId: string;
  pricingType: QuotationPricingType;
  exShowroomPrice?: number;
  onRoadTax?: number;
  variation?: QuotationVariation;
  insurance?: QuotationInsurance;
  vasSelections?: { vasId: string }[];
}

export interface UpdateQuotationRequest extends Partial<CreateQuotationRequest> {
  id: string;
}

export interface GetQuotationsParams {
  page?: number;
  limit?: number;
  branch?: string;
}

// ─── Response Wrappers ────────────────────────────────────────────────────────

interface SingleQuotationResponse {
  success: boolean;
  message: string;
  data: Quotation;
}

interface QuotationListResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: Quotation[];
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

export const quotationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createQuotation: builder.mutation<SingleQuotationResponse, CreateQuotationRequest>({
      query: (body) => ({
        url: "/quotations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Quotation"],
    }),

    getQuotations: builder.query<QuotationListResponse, GetQuotationsParams | void>({
      query: (params = {}) => {
        const search = new URLSearchParams();
        if (params?.page) search.set("page", String(params.page));
        if (params?.limit) search.set("limit", String(params.limit));
        if (params?.branch) search.set("branch", params.branch);
        const qs = search.toString();
        return `/quotations${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Quotation"],
    }),

    getQuotationById: builder.query<SingleQuotationResponse, string>({
      query: (id) => `/quotations/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Quotation", id }],
    }),

    updateQuotation: builder.mutation<SingleQuotationResponse, UpdateQuotationRequest>({
      query: ({ id, ...body }) => ({
        url: `/quotations/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Quotation"],
    }),

    deleteQuotation: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/quotations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Quotation"],
    }),
  }),
});

export const {
  useCreateQuotationMutation,
  useGetQuotationsQuery,
  useGetQuotationByIdQuery,
  useUpdateQuotationMutation,
  useDeleteQuotationMutation,
} = quotationApi;
