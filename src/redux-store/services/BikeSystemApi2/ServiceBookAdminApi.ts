import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/apiConfig";
import { BookingsResponse, ServiceBooking } from "@/types/serviceBooking.types";

// Admin API
export const serviceBookingAdminApi = createApi({
  reducerPath: "serviceBookingAdminApi",
  baseQuery: baseQuery,
  tagTypes: ["AdminBooking", "AdminStats", "UpcomingAppointments"],
  endpoints: (builder) => ({
    getAllBookings: builder.query<
      BookingsResponse,
      {
        status?: string;
        branchId?: string;
        startDate?: string;
        endDate?: string;
        serviceType?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: string;
      }
    >({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
        return `/service-bookings/admin/all?${searchParams.toString()}`;
      },
      providesTags: ["AdminBooking"],
    }),

    updateBookingStatus: builder.mutation<
      { success: boolean; message: string },
      {
        id: string;
        status?: string;
        assignedTechnician?: string;
        serviceNotes?: string;
        estimatedCost?: number;
        actualCost?: number;
        estimatedDuration?: string;
      }
    >({
      query: ({ id, ...data }) => ({
        url: `/service-bookings/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["AdminBooking", "AdminStats"],
    }),

    getBookingStats: builder.query<
      any,
      {
        branchId?: string;
        startDate?: string;
        endDate?: string;
      }
    >({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
        return `/service-bookings/admin/stats?${searchParams.toString()}`;
      },
      providesTags: ["AdminStats"],
    }),

    getBranchUpcomingAppointments: builder.query<
      { success: boolean; count: number; data: ServiceBooking[] },
      { branchId: string; days?: number }
    >({
      query: ({ branchId, days = 7 }) =>
        `/service-bookings/branch/${branchId}/upcoming?days=${days}`,
      providesTags: ["UpcomingAppointments"],
    }),
  }),
});
1
export const {
  useGetAllBookingsQuery,
  useUpdateBookingStatusMutation,
  useGetBookingStatsQuery,
  useGetBranchUpcomingAppointmentsQuery,
  useLazyGetAllBookingsQuery,
  useLazyGetBookingStatsQuery,
} = serviceBookingAdminApi;
