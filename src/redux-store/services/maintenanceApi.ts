import { apiSlice } from "./apiSlice";

// ─── Types ───────────────────────────────────────────────────────────────────

export type MaintenanceStatus = "open" | "in_progress" | "resolved";
export type MaintenancePriority = "low" | "normal" | "high";

export interface MaintenanceRecord {
  _id: string;
  title: string;
  description: string;
  /** null when the reporter gave no deadline — not a default date. */
  deadline: string | null;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  raisedByRole: string;
  raisedByName: string;
  branch?: { _id: string; branchName?: string } | string | null;
  developerNote?: string;
  resolvedAt: string | null;
  isActive: boolean;
  /** Raised-at timestamp. */
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceListResponse {
  success: boolean;
  data: MaintenanceRecord[];
  /** Totals per status, unaffected by the active status filter. */
  counts: Record<MaintenanceStatus, number>;
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface CreateMaintenanceRequest {
  title: string;
  description: string;
  /** ISO date string, or omitted entirely. */
  deadline?: string;
  priority?: MaintenancePriority;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const maintenanceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMaintenanceServices: builder.query<
      MaintenanceListResponse,
      { status?: MaintenanceStatus; page?: number; limit?: number } | void
    >({
      query: (params) => {
        const p = new URLSearchParams();
        if (params?.status) p.append("status", params.status);
        if (params?.page) p.append("page", String(params.page));
        if (params?.limit) p.append("limit", String(params.limit));
        const qs = p.toString();
        return `/maintenance${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Maintenance"],
    }),

    createMaintenanceService: builder.mutation<
      { success: boolean; message: string; data: MaintenanceRecord },
      CreateMaintenanceRequest
    >({
      query: (body) => ({ url: "/maintenance", method: "POST", body }),
      invalidatesTags: ["Maintenance"],
    }),

    updateMaintenanceService: builder.mutation<
      { success: boolean; message: string; data: MaintenanceRecord },
      { id: string; status?: MaintenanceStatus; developerNote?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/maintenance/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Maintenance"],
    }),

    deleteMaintenanceService: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({ url: `/maintenance/${id}`, method: "DELETE" }),
      invalidatesTags: ["Maintenance"],
    }),
  }),
});

export const {
  useGetMaintenanceServicesQuery,
  useCreateMaintenanceServiceMutation,
  useUpdateMaintenanceServiceMutation,
  useDeleteMaintenanceServiceMutation,
} = maintenanceApi;
