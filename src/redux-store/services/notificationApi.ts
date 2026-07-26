import { apiSlice } from "./apiSlice";

/**
 * Notification event types — mirror of the backend
 * `server3/src/types/notification.types.ts`. Keep in sync.
 */
export const NOTIFICATION_TYPES = {
  SERVICE_BOOKING: "service-booking",
  CONTACT_MESSAGE: "contact-message",
  GET_APPROVED: "get-approved",
  ENQUIRY: "enquiry",
  PARTS_UPLOAD: "parts-upload",
  COUNTER_SALE_UPLOAD: "counter-sale-upload",
  SERVICE_JOBCARD_UPLOAD: "service-jobcard-upload",
  JOB_CARD_INVOICE: "job-card-invoice",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export interface AppNotification {
  _id: string;
  userId: string;
  role: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: AppNotification[];
  unreadCount: number;
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export const notificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Register this device's FCM token (staff/admin JWT auth — default base query)
    registerDeviceToken: builder.mutation<
      { success: boolean },
      { token: string; platform?: string }
    >({
      query: (body) => ({
        url: "/notifications/register-token",
        method: "POST",
        body,
      }),
    }),

    unregisterDeviceToken: builder.mutation<
      { success: boolean },
      { token: string }
    >({
      query: (body) => ({
        url: "/notifications/unregister-token",
        method: "POST",
        body,
      }),
    }),

    getNotifications: builder.query<
      NotificationsResponse,
      { page?: number; limit?: number } | void
    >({
      query: (args) => {
        const page = args?.page ?? 1;
        const limit = args?.limit ?? 20;
        return `/notifications?page=${page}&limit=${limit}`;
      },
      providesTags: ["Notification"],
    }),

    markNotificationRead: builder.mutation<
      { success: boolean },
      string
    >({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    markAllNotificationsRead: builder.mutation<
      { success: boolean; modified: number },
      void
    >({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useRegisterDeviceTokenMutation,
  useUnregisterDeviceTokenMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;
