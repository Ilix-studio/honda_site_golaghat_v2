export type NotificationRouteRole =
  | "Super-Admin"
  | "Branch-Admin"
  | "Service-Admin"
  | "Part-Admin"
  | "Staff";

type NotificationRouteInput = {
  role?: string | null;
  isCustomer?: boolean;
};

const ROLE_NOTIFICATION_PATHS: Record<NotificationRouteRole, string> = {
  "Super-Admin": "/admin/notifications",
  "Branch-Admin": "/manager/notifications",
  "Service-Admin": "/service-admin/notifications",
  "Part-Admin": "/part-admin/notifications",
  Staff: "/staff/notifications",
};

export const getNotificationRoutePath = ({
  role,
  isCustomer,
}: NotificationRouteInput = {}) => {
  if (isCustomer) return "/customer/notifications";
  if (role && role in ROLE_NOTIFICATION_PATHS) {
    return ROLE_NOTIFICATION_PATHS[role as NotificationRouteRole];
  }
  return "/notifications";
};
