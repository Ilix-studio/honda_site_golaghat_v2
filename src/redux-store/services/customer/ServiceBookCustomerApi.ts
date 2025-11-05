import { createApi } from "@reduxjs/toolkit/query/react";
import { customerBaseQuery } from "@/lib/customerApiConfigs";
import {
  AvailabilityResponse,
  BookingsResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  ServiceBooking,
  ServiceStatsResponse,
} from "@/types/serviceBooking.types";

// Customer API
export const serviceBookingApi = createApi({
  reducerPath: "serviceBookingApi",
  baseQuery: customerBaseQuery,
  tagTypes: ["ServiceBooking", "BookingStats", "Availability"],
  endpoints: (builder) => ({
    createServiceBooking: builder.mutation<
      CreateBookingResponse,
      CreateBookingRequest
    >({
      query: (data) => ({
        url: "/service-bookings",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ServiceBooking", "BookingStats"],
    }),

    getMyBookings: builder.query<
      BookingsResponse,
      {
        status?: string;
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
        return `/service-bookings/my-bookings?${searchParams.toString()}`;
      },
      providesTags: ["ServiceBooking"],
    }),

    getMyServiceStats: builder.query<ServiceStatsResponse, void>({
      query: () => "/service-bookings/my-stats",
      providesTags: ["BookingStats"],
    }),

    checkAvailability: builder.query<
      AvailabilityResponse,
      {
        branchId: string;
        date: string;
      }
    >({
      query: ({ branchId, date }) =>
        `/service-bookings/availability?branchId=${branchId}&date=${date}`,
      providesTags: ["Availability"],
    }),

    getBookingById: builder.query<
      { success: boolean; data: ServiceBooking },
      string
    >({
      query: (id) => `/service-bookings/${id}`,
      providesTags: (_result, _error, id) => [{ type: "ServiceBooking", id }],
    }),

    cancelBooking: builder.mutation<
      { success: boolean; message: string },
      {
        id: string;
        reason?: string;
      }
    >({
      query: ({ id, reason }) => ({
        url: `/service-bookings/${id}/cancel`,
        method: "DELETE",
        body: reason ? { reason } : {},
      }),
      invalidatesTags: ["ServiceBooking", "BookingStats"],
    }),
  }),
});

export const {
  useCreateServiceBookingMutation,
  useGetMyBookingsQuery,
  useGetMyServiceStatsQuery,
  useCheckAvailabilityQuery,
  useGetBookingByIdQuery,
  useCancelBookingMutation,
  useLazyCheckAvailabilityQuery,
  useLazyGetMyBookingsQuery,
} = serviceBookingApi;
