import { apiSlice } from "../apiSlice";
import {
  AvailabilityResponse,
  BookingsResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  CustomerVehicleInfoResponse,
  ServiceBooking,
  ServiceStatsResponse,
} from "@/types/serviceBooking.types";

export const serviceBookingCustomerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyVehicleInfo: builder.query<CustomerVehicleInfoResponse, void>({
      query: () => "/service-bookings/my-vehicle-info",
      extraOptions: { isCustomer: true },
      providesTags: ["CustomerVehicle"],
    }),
    createServiceBooking: builder.mutation<
      CreateBookingResponse,
      CreateBookingRequest
    >({
      query: (data) => ({
        url: "/service-bookings",
        method: "POST",
        body: data,
      }),
      extraOptions: { isCustomer: true },
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
          if (value !== undefined) searchParams.append(key, value.toString());
        });
        return `/service-bookings/my-bookings?${searchParams.toString()}`;
      },
      extraOptions: { isCustomer: true },
      providesTags: ["ServiceBooking"],
    }),

    getMyServiceStats: builder.query<ServiceStatsResponse, void>({
      query: () => "/service-bookings/my-stats",
      extraOptions: { isCustomer: true },
      providesTags: ["BookingStats"],
    }),

    checkAvailability: builder.query<
      AvailabilityResponse,
      { branchId: string; date: string }
    >({
      query: ({ branchId, date }) =>
        `/service-bookings/availability?branchId=${branchId}&date=${date}`,
      extraOptions: { isCustomer: true },
      providesTags: ["Availability"],
    }),

    getBookingById: builder.query<
      { success: boolean; data: ServiceBooking },
      string
    >({
      query: (id) => `/service-bookings/${id}`,
      extraOptions: { isCustomer: true },
      providesTags: (_result, _error, id) => [{ type: "ServiceBooking", id }],
    }),

    cancelBooking: builder.mutation<
      { success: boolean; message: string },
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/service-bookings/${id}/cancel`,
        method: "DELETE",
        body: reason ? { reason } : {},
      }),
      extraOptions: { isCustomer: true },
      invalidatesTags: ["ServiceBooking", "BookingStats"],
    }),
  }),
});

export const {
  useGetMyVehicleInfoQuery,
  useCreateServiceBookingMutation,
  useGetMyBookingsQuery,
  useGetMyServiceStatsQuery,
  useCheckAvailabilityQuery,
  useGetBookingByIdQuery,
  useCancelBookingMutation,
  useLazyCheckAvailabilityQuery,
  useLazyGetMyBookingsQuery,
} = serviceBookingCustomerApi;
