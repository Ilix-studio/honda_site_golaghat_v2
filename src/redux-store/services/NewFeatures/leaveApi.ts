// store/api/leaveApi.ts
import { LeaveStatus, LeaveType } from "@/types/leave_types";
import { apiSlice } from "../apiSlice";

// ─── Response Types ───────────────────────────────────────────────────────────

export interface LeaveApplication {
  _id: string;
  applicantId:
    | string
    | { _id: string; name: string; email: string; applicationId: string };
  applicantModel: "BranchManager" | "ServiceAdmin" | "Staff";
  applicantRole: string;
  branch: string | { _id: string; branchName: string };
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: string | { _id: string; name: string; email: string };
  reviewNote?: string;
  reviewedAt?: string;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalanceEntry {
  total: number;
  used: number;
  remaining: number;
}

export interface LeaveBalance {
  Sick: LeaveBalanceEntry;
  Casual: LeaveBalanceEntry;
}

// ─── Request Types ────────────────────────────────────────────────────────────

export interface ApplyLeaveRequest {
  leaveType: LeaveType;
  startDate: string; // ISO date string
  endDate: string;
  reason: string;
}

export interface ReviewLeaveRequest {
  id: string;
  status: "Approved" | "Rejected";
  reviewNote?: string;
}

export interface GetAllLeavesParams {
  status?: LeaveStatus;
  leaveType?: LeaveType;
  branch?: string;
  year?: number;
  page?: number;
  limit?: number;
}

export interface GetMyLeavesParams {
  status?: LeaveStatus;
  year?: number;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

interface SingleLeaveResponse {
  success: boolean;
  message: string;
  data: LeaveApplication;
}

interface MyLeavesResponse {
  success: boolean;
  count: number;
  data: LeaveApplication[];
}

interface AllLeavesResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: LeaveApplication[];
}

interface LeaveBalanceResponse {
  success: boolean;
  data: {
    year: number;
    balance: LeaveBalance;
  };
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

export const leaveApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // POST /api/leaves/apply
    applyLeave: builder.mutation<SingleLeaveResponse, ApplyLeaveRequest>({
      query: (body) => ({
        url: "/leaves/apply",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Leave", "LeaveBalance"],
    }),

    // GET /api/leaves/my?status=&year=
    getMyLeaves: builder.query<MyLeavesResponse, GetMyLeavesParams>({
      query: (params = {}) => {
        const search = new URLSearchParams();
        if (params.status) search.set("status", params.status);
        if (params.year) search.set("year", String(params.year));
        const qs = search.toString();
        return `/leaves/my${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Leave"],
    }),

    // GET /api/leaves/balance?year=
    getLeaveBalance: builder.query<LeaveBalanceResponse, number | void>({
      query: (year) => `/leaves/balance${year ? `?year=${year}` : ""}`,
      providesTags: ["LeaveBalance"],
    }),

    // PATCH /api/leaves/:id/cancel
    cancelLeave: builder.mutation<SingleLeaveResponse, string>({
      query: (id) => ({
        url: `/leaves/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: ["Leave", "LeaveBalance"],
    }),

    // GET /api/leaves (Super-Admin)
    getAllLeaves: builder.query<AllLeavesResponse, GetAllLeavesParams>({
      query: (params = {}) => {
        const search = new URLSearchParams();
        if (params.status) search.set("status", params.status);
        if (params.leaveType) search.set("leaveType", params.leaveType);
        if (params.branch) search.set("branch", params.branch);
        if (params.year) search.set("year", String(params.year));
        if (params.page) search.set("page", String(params.page));
        if (params.limit) search.set("limit", String(params.limit));
        const qs = search.toString();
        return `/leaves${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Leave"],
    }),

    // PATCH /api/leaves/:id/review (Super-Admin)
    reviewLeave: builder.mutation<SingleLeaveResponse, ReviewLeaveRequest>({
      query: ({ id, ...body }) => ({
        url: `/leaves/${id}/review`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Leave"],
    }),
  }),
});

export const {
  useApplyLeaveMutation,
  useGetMyLeavesQuery,
  useLazyGetMyLeavesQuery,
  useGetLeaveBalanceQuery,
  useLazyGetLeaveBalanceQuery,
  useCancelLeaveMutation,
  useGetAllLeavesQuery,
  useLazyGetAllLeavesQuery,
  useReviewLeaveMutation,
} = leaveApi;
