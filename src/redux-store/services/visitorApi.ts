import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery, handleApiError } from "../../lib/apiConfig";

// Define interfaces for visitor API responses
export interface VisitorCountResponse {
  success: boolean;
  count: number;
  message?: string;
}

export interface DailyStat {
  date: string;
  count: number;
}

export interface WeeklyStats {
  thisWeek: number;
  lastWeek: number;
  growth: number;
}

export interface VisitorStatsResponse {
  success: boolean;
  data: {
    totalVisitors: number;
    todayVisitors: number;
    lastVisit: string | null;
    dailyStats: DailyStat[];
    weeklyStats: WeeklyStats;
  };
}

export interface VisitorResetResponse {
  success: boolean;
  message: string;
  count: number;
}

// Create the Visitor API slice
export const visitorApi = createApi({
  reducerPath: "visitorApi",
  baseQuery,
  tagTypes: ["VisitorCount", "VisitorStats"],
  endpoints: (builder) => ({
    // PUBLIC ENDPOINTS

    // Increment visitor counter (for new visitors)
    incrementVisitorCounter: builder.mutation<VisitorCountResponse, void>({
      query: () => ({
        url: "/visitor/increment-counter",
        method: "POST",
      }),
      invalidatesTags: ["VisitorCount", "VisitorStats"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get current visitor count (for returning visitors)
    getVisitorCount: builder.query<VisitorCountResponse, void>({
      query: () => ({
        url: "/visitor/visitor-count",
        method: "GET",
      }),
      providesTags: ["VisitorCount"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // PROTECTED ENDPOINTS (Admin only)

    // Get detailed visitor statistics for admin dashboard
    getVisitorStats: builder.query<VisitorStatsResponse, void>({
      query: () => ({
        url: "/visitor/stats",
        method: "GET",
      }),
      providesTags: ["VisitorStats"],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Reset visitor counter (Admin only)
    resetVisitorCounter: builder.mutation<VisitorResetResponse, void>({
      query: () => ({
        url: "/visitor/reset",
        method: "POST",
      }),
      invalidatesTags: ["VisitorCount", "VisitorStats"],
      transformErrorResponse: (response) => handleApiError(response),
    }),
  }),
});

// Export hooks for using the API endpoints
export const {
  // Public endpoints
  useIncrementVisitorCounterMutation,
  useGetVisitorCountQuery,
  useLazyGetVisitorCountQuery,

  // Admin endpoints
  useGetVisitorStatsQuery,
  useLazyGetVisitorStatsQuery,
  useResetVisitorCounterMutation,
} = visitorApi;
