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

export interface QuotationAccessory {
  name: string;
  quantity: number;
  amount: number;
}

export interface QuotationTo {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
}

export interface Quotation {
  _id: string;
  quotationNo: string;
  publicToken: string;
  bike: string;
  bikeSnapshot: QuotationBikeSnapshot;
  pricingType: QuotationPricingType;
  exShowroomPrice: number;
  onRoadTax: number;
  onRoadPrice?: number;
  variation?: QuotationVariation;
  insurance?: QuotationInsurance;
  vasSelections: QuotationVasSelection[];
  accessories: QuotationAccessory[];
  to: QuotationTo;
  topHeading: string;
  bankDetails: string;
  termsAndConditions: string;
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
  accessories?: QuotationAccessory[];
  to: QuotationTo;
  topHeading?: string;
  bankDetails?: string;
  termsAndConditions?: string;
}

export interface UpdateQuotationRequest
  extends Partial<Omit<CreateQuotationRequest, "to">> {
  id: string;
  to?: QuotationTo;
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

    // Anonymous share-link read — no auth needed, but reusing the standard
    // base query is harmless since this route sits outside `protect`.
    getPublicQuotation: builder.query<
      SingleQuotationResponse,
      { quotationNo: string; token: string }
    >({
      query: ({ quotationNo, token }) => `/quotations/public/${quotationNo}/${token}`,
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
  useGetPublicQuotationQuery,
} = quotationApi;
