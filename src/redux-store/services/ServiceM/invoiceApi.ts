import { apiSlice } from "../apiSlice";
import { InvoiceSingleResponse } from "@/types/jobCard.types";

export interface InvoiceListItem {
  _id: string;
  invoiceNumber: string;
  grandTotal: number;
  subtotal: number;
  taxTotal: number;
  issuedAt: string;
  branch?: { _id: string; branchName: string; address?: string };
  customer?: { _id: string; phoneNumber: string };
  vehicle?: { _id: string; numberPlate: string };
}

export interface InvoiceListResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: InvoiceListItem[];
}

export const invoiceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Customer: get single invoice by invoice _id
    getInvoiceByIdCustomer: builder.query<InvoiceSingleResponse, string>({
      query: (id) => `/invoices/${id}`,
      extraOptions: { isCustomer: true },
      providesTags: (_r, _e, id) => [{ type: "JobCardInvoice", id }],
    }),

    // Customer: list own invoices
    getMyInvoices: builder.query<
      InvoiceListResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page, limit } = {}) => {
        const p = new URLSearchParams();
        if (page) p.append("page", String(page));
        if (limit) p.append("limit", String(limit));
        const qs = p.toString();
        return `/invoices/my-invoices${qs ? `?${qs}` : ""}`;
      },
      extraOptions: { isCustomer: true },
      providesTags: ["JobCardInvoice"],
    }),

    // Admin: get single invoice by invoice _id
    getInvoiceByIdAdmin: builder.query<InvoiceSingleResponse, string>({
      query: (id) => `/invoices/${id}`,
      providesTags: (_r, _e, id) => [{ type: "JobCardInvoice", id }],
    }),

    // Admin: list invoices (branch-scoped)
    listInvoicesAdmin: builder.query<
      InvoiceListResponse,
      { branchId?: string; startDate?: string; endDate?: string; page?: number; limit?: number }
    >({
      query: (params = {}) => {
        const p = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined) p.append(k, String(v));
        });
        const qs = p.toString();
        return `/invoices${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["JobCardInvoice"],
    }),
  }),
});

export const {
  useGetInvoiceByIdCustomerQuery,
  useGetMyInvoicesQuery,
  useGetInvoiceByIdAdminQuery,
  useListInvoicesAdminQuery,
} = invoiceApi;