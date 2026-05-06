import { apiSlice } from "../apiSlice";
import {
  JobCardStatus,
  PriorityLevel,
  JobCardListResponse,
  JobCardSingleResponse,
  JobCardMutationResponse,
  InvoiceSingleResponse,
  OtpRequestResponse,
  ConfirmResponse,
  CreateJobCardBody,
  AddLineItemBody,
  CustomerReviewBody,
  CancelJobCardBody,
} from "@/types/jobCard.types";

// ─── Query Filter Args ────────────────────────────────────────────────────────

export interface ListJobCardsArgs {
  status?: JobCardStatus;
  branchId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  priority?: PriorityLevel;
  page?: number;
  limit?: number;
}

// ─── API Slice ────────────────────────────────────────────────────────────────

export const jobCardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ── Admin: Create JobCard ─────────────────────────────────────────────────
    createJobCard: builder.mutation<JobCardMutationResponse, CreateJobCardBody>(
      {
        query: (body) => ({
          url: "/job-cards",
          method: "POST",
          body,
        }),
        invalidatesTags: ["JobCard", "JobCardList"],
      },
    ),

    // ── Admin: List JobCards (branch-scoped, paginated) ───────────────────────
    listJobCards: builder.query<JobCardListResponse, ListJobCardsArgs>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) searchParams.append(key, String(value));
        });
        const qs = searchParams.toString();
        return `/job-cards${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["JobCardList"],
    }),

    // ── Admin + Customer: Get single JobCard ──────────────────────────────────
    // Admin: uses JWT (default baseQuery)
    getJobCardAdmin: builder.query<JobCardSingleResponse, string>({
      query: (id) => `/job-cards/${id}`,
      providesTags: (_result, _error, id) => [{ type: "JobCard", id }],
    }),

    // Customer: uses Firebase token (isCustomer: true)
    getJobCardCustomer: builder.query<JobCardSingleResponse, string>({
      query: (id) => `/job-cards/${id}`,
      extraOptions: { isCustomer: true },
      providesTags: (_result, _error, id) => [{ type: "JobCard", id }],
    }),

    // ── Admin: Add line item ──────────────────────────────────────────────────
    addLineItem: builder.mutation<
      JobCardMutationResponse,
      { id: string; body: AddLineItemBody }
    >({
      query: ({ id, body }) => ({
        url: `/job-cards/${id}/line-items`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "JobCard", id },
        "JobCardList",
      ],
    }),

    // ── Admin: Remove line item ───────────────────────────────────────────────
    removeLineItem: builder.mutation<
      JobCardMutationResponse,
      { id: string; itemId: string }
    >({
      query: ({ id, itemId }) => ({
        url: `/job-cards/${id}/line-items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "JobCard", id },
        "JobCardList",
      ],
    }),

    // ── Admin: Send temp bill to customer ─────────────────────────────────────
    sendTempBill: builder.mutation<JobCardMutationResponse, string>({
      query: (id) => ({
        url: `/job-cards/${id}/send-temp-bill`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "JobCard", id },
        "JobCardList",
      ],
    }),

    // ── Customer: Review temp bill ────────────────────────────────────────────
    customerReviewBill: builder.mutation<
      JobCardMutationResponse,
      { id: string; body: CustomerReviewBody }
    >({
      query: ({ id, body }) => ({
        url: `/job-cards/${id}/customer-review`,
        method: "PATCH",
        body,
      }),
      extraOptions: { isCustomer: true },
      invalidatesTags: (_result, _error, { id }) => [{ type: "JobCard", id }],
    }),

    // ── Admin: Acknowledge customer review ────────────────────────────────────
    acknowledgeReview: builder.mutation<JobCardMutationResponse, string>({
      query: (id) => ({
        url: `/job-cards/${id}/acknowledge`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "JobCard", id },
        "JobCardList",
      ],
    }),

    // ── Admin: Send final bill ────────────────────────────────────────────────
    sendFinalBill: builder.mutation<
      JobCardMutationResponse,
      { id: string; internalNotes?: string }
    >({
      query: ({ id, internalNotes }) => ({
        url: `/job-cards/${id}/send-final-bill`,
        method: "PATCH",
        body: internalNotes ? { internalNotes } : {},
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "JobCard", id },
        "JobCardList",
      ],
    }),

    // ── Customer: Request OTP ─────────────────────────────────────────────────
    requestConfirmationOtp: builder.mutation<OtpRequestResponse, string>({
      query: (id) => ({
        url: `/job-cards/${id}/confirm/request-otp`,
        method: "POST",
      }),
      extraOptions: { isCustomer: true },
    }),

    // ── Customer: Verify OTP ──────────────────────────────────────────────────
    verifyConfirmationOtp: builder.mutation<
      ConfirmResponse,
      { id: string; otp: string }
    >({
      query: ({ id, otp }) => ({
        url: `/job-cards/${id}/confirm/verify-otp`,
        method: "POST",
        body: { otp },
      }),
      extraOptions: { isCustomer: true },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "JobCard", id },
        "JobCardList",
        "JobCardInvoice",
      ],
    }),

    // ── Customer: Confirm via button ──────────────────────────────────────────
    confirmViaButton: builder.mutation<ConfirmResponse, string>({
      query: (id) => ({
        url: `/job-cards/${id}/confirm/button`,
        method: "POST",
      }),
      extraOptions: { isCustomer: true },
      invalidatesTags: (_result, _error, id) => [
        { type: "JobCard", id },
        "JobCardList",
        "JobCardInvoice",
      ],
    }),

    // ── Admin + Customer: Get invoice ─────────────────────────────────────────
    getInvoiceAdmin: builder.query<InvoiceSingleResponse, string>({
      query: (id) => `/job-cards/${id}/invoice`,
      providesTags: (_result, _error, id) => [
        { type: "JobCardInvoice", id },
        { type: "JobCard", id },
      ],
    }),

    getInvoiceCustomer: builder.query<InvoiceSingleResponse, string>({
      query: (id) => `/job-cards/${id}/invoice`,
      extraOptions: { isCustomer: true },
      providesTags: (_result, _error, id) => [
        { type: "JobCardInvoice", id },
        { type: "JobCard", id },
      ],
    }),

    // ── Admin: Cancel job card ────────────────────────────────────────────────
    cancelJobCard: builder.mutation<
      JobCardMutationResponse,
      { id: string } & CancelJobCardBody
    >({
      query: ({ id, cancellationReason }) => ({
        url: `/job-cards/${id}`,
        method: "DELETE",
        body: { cancellationReason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "JobCard", id },
        "JobCardList",
      ],
    }),
  }),
});

export const {
  // Admin mutations
  useCreateJobCardMutation,
  useAddLineItemMutation,
  useRemoveLineItemMutation,
  useSendTempBillMutation,
  useAcknowledgeReviewMutation,
  useSendFinalBillMutation,
  useCancelJobCardMutation,
  // Admin queries
  useListJobCardsQuery,
  useLazyListJobCardsQuery,
  useGetJobCardAdminQuery,
  useLazyGetJobCardAdminQuery,
  useGetInvoiceAdminQuery,
  useLazyGetInvoiceAdminQuery,
  // Customer mutations
  useCustomerReviewBillMutation,
  useRequestConfirmationOtpMutation,
  useVerifyConfirmationOtpMutation,
  useConfirmViaButtonMutation,
  // Customer queries
  useGetJobCardCustomerQuery,
  useLazyGetJobCardCustomerQuery,
  useGetInvoiceCustomerQuery,
  useLazyGetInvoiceCustomerQuery,
} = jobCardApi;
