import { handleApiError } from "@/lib/apiConfig";
import { apiSlice } from "./apiSlice";
import {
  ContactFormData,
  ContactMessageResponse,
  ContactMessagesResponse,
  GetMessagesParams,
  MarkAsReadRequest,
  SendMessageResponse,
} from "@/types/contact.type";

export const contactApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Send contact message (Public)
    sendContactMessage: builder.mutation<
      SendMessageResponse,
      ContactFormData & { recaptchaToken: string }
    >({
      query: (data) => ({
        url: "/messages/send",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "ContactMessages", id: "LIST" }],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get all contact messages (Admin only)
    getContactMessages: builder.query<
      ContactMessagesResponse,
      GetMessagesParams | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.limit)
          searchParams.append("limit", params.limit.toString());
        if (params?.read !== undefined)
          searchParams.append("read", params.read.toString());
        const queryString = searchParams.toString();
        return `/messages/get${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "ContactMessages" as const,
                id: _id,
              })),
              { type: "ContactMessages" as const, id: "LIST" },
            ]
          : [{ type: "ContactMessages" as const, id: "LIST" }],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Get contact message by ID (Admin only)
    getContactMessageById: builder.query<ContactMessageResponse, string>({
      query: (id) => `/messages/${id}`,
      providesTags: (_, __, id) => [{ type: "ContactMessage" as const, id }],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Mark message as read/unread (Admin only)
    markMessageAsRead: builder.mutation<
      ContactMessageResponse,
      MarkAsReadRequest
    >({
      query: ({ id, isRead }) => ({
        url: `/messages/${id}/read`,
        method: "PATCH",
        body: { isRead },
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "ContactMessages" as const, id: "LIST" },
        { type: "ContactMessage" as const, id },
      ],
      transformErrorResponse: (response) => handleApiError(response),
    }),

    // Delete contact message (Admin only)
    deleteContactMessage: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/messages/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "ContactMessages" as const, id: "LIST" }],
      transformErrorResponse: (response) => handleApiError(response),
    }),
  }),
});

export const {
  useSendContactMessageMutation,
  useGetContactMessagesQuery,
  useGetContactMessageByIdQuery,
  useMarkMessageAsReadMutation,
  useDeleteContactMessageMutation,
} = contactApi;
