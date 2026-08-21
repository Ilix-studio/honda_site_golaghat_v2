import { apiSlice } from "../apiSlice";

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
  /** Matches phone number, profile name, or the name on an imported job card. */
  search?: string;
}

export interface NewCustomersResponse {
  success: boolean;
  data: NewCustomerDTO[];
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
