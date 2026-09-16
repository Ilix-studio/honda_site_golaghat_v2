import { apiSlice } from "../apiSlice";

/**
 * The four pipelines that put a customer on record. Mirrors
 * server3/src/service/customerSources.service.ts#CUSTOMER_SOURCE_TAGS.
 *
 * Distinct from `creationSource`, which records how a customer FIRST entered
 * the system and never changes — a customer carries every tag they currently
 * match, so a sales-report buyer who later turns up on a service invoice
 * carries both.
 */
export const CUSTOMER_SOURCE_TAGS = [
  "sales-report",
  "manual-assign",
  "csv-assign",
  "service-upload",
] as const;

export type CustomerSourceTag = (typeof CUSTOMER_SOURCE_TAGS)[number];

export interface NewCustomerDTO {
  _id: string;
  phoneNumber: string;
  isVerified: boolean;
  creationSource:
    | "otp"
    | "automatic_creation"
    | "branch_admin_manual"
    | "new_csv_sales_report"
    | undefined;
  createdAt: string;
  name: string | null;
  /** Every pipeline this customer currently appears in; may be empty. */
  sources: CustomerSourceTag[];
  hasVehicle: boolean;
  vehicleSummary?: {
    engineNumber: string | null;
    stockType: "StockConcept" | "StockConceptCSV";
  } | null;
}

export interface NewCustomersFilters {
  page?: number;
  limit?: number;
  days?: number;
  /** Matches phone number, profile name, sales-report name, or job-card name. */
  search?: string;
  /** Narrows the list to customers carrying one source tag. */
  source?: CustomerSourceTag;
}

export interface NewCustomersResponse {
  success: boolean;
  data: NewCustomerDTO[];
  /**
   * Totals per pipeline across the whole search/date-filtered set — computed
   * WITHOUT the `source` filter applied, so the tab labels stay stable while
   * one tab is selected.
   */
  sourceCounts: Record<CustomerSourceTag, number>;
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const customerAdminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNewCustomers: builder.query<NewCustomersResponse, NewCustomersFilters | void>({
      query: (filters) => {
        const p = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined) p.append(k, String(v));
          });
        }
        const qs = p.toString();
        return `/customer/list${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Customer"],
    }),
  }),
});

export const { useGetNewCustomersQuery } = customerAdminApi;
