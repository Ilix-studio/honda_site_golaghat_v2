// ─── Base ─────────────────────────────────────────────────────────────────────

export interface IContact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Request types ────────────────────────────────────────────────────────────

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface GetMessagesParams {
  page?: number;
  limit?: number;
  read?: boolean;
}

export interface MarkAsReadRequest {
  id: string;
  isRead: boolean;
}

// ─── Response types ───────────────────────────────────────────────────────────

/** POST /messages/send */
export interface SendMessageResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    subject: string;
    createdAt: string;
  };
}

/** GET /messages/get */
export interface ContactMessagesResponse {
  success: boolean;
  data: IContact[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  unreadCount: number;
}

/** GET /messages/:id  |  PATCH /messages/:id/read */
export interface ContactMessageResponse {
  success: boolean;
  message?: string;
  data: IContact;
}
