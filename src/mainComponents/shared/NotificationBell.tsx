import { useEffect, useRef, useState } from "react";
import { Bell, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  type AppNotification,
} from "@/redux-store/services/notificationApi";
import { selectUserRole } from "@/redux-store/slices/authSlice";
import { selectCustomerAuth } from "@/redux-store/slices/customer/customerAuthSlice";
import { getNotificationRoutePath } from "./notificationRoutes";

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/**
 * Notification bell + dropdown history panel for admin/staff headers. Backed by
 * the DB-persisted notification list (`/api/notifications`) with a light poll so
 * the badge stays current even without a live push. Foreground FCM messages also
 * invalidate this query (see usePushRegistration), refreshing it immediately.
 */
const NotificationBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const role = useSelector(selectUserRole);
  const customerAuth = useSelector(selectCustomerAuth);
  const notificationPath = getNotificationRoutePath({
    role,
    isCustomer: customerAuth.isAuthenticated && !!customerAuth.firebaseToken,
  });
  const hiddenRoles = new Set(["Branch-Admin", "Service-Admin", "Part-Admin"]);
  const isCustomerView = customerAuth.isAuthenticated;

  const { data } = useGetNotificationsQuery(
    { page: 1, limit: 20 },
    { pollingInterval: 60000 },
  );
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const notifications = (data?.data ?? []).filter((notification) =>
    isCustomerView ? !hiddenRoles.has(notification.role) : true,
  );
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  const handleOpen = (n: AppNotification) => {
    if (!n.isRead) markRead(n._id);
    setOpen(false);
    const route = n.data?.route;
    if (route) navigate(route);
  };

  return (
    <div ref={containerRef} className='relative'>
      <button
        onClick={() => setOpen((o) => !o)}
        className='relative flex items-center justify-center w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors'
        aria-label='Notifications'
      >
        <Bell className='w-4 h-4' />
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center'>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className='absolute right-0 top-[calc(100%+8px)] w-80 max-h-[70vh] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl z-50 flex flex-col'>
          <div className='flex items-center justify-between px-4 py-2.5 border-b border-gray-100'>
            <span className='text-sm font-bold text-gray-900'>
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className='flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700'
              >
                <Check className='w-3.5 h-3.5' />
                Mark all read
              </button>
            )}
            <button
              className='text-sm font-medium text-blue-600 hover:text-blue-700'
              onClick={() => navigate(notificationPath)}
            >
              View All
            </button>
          </div>

          <div className='overflow-y-auto'>
            {notifications.length === 0 ? (
              <p className='px-4 py-8 text-center text-sm text-gray-400'>
                No notifications yet
              </p>
            ) : (
              <ul className='divide-y divide-gray-50'>
                {notifications.map((n) => (
                  <li key={n._id}>
                    <button
                      onClick={() => handleOpen(n)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                        n.isRead ? "" : "bg-red-50/40"
                      }`}
                    >
                      <div className='flex items-start gap-2'>
                        {!n.isRead && (
                          <span className='mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0' />
                        )}
                        <div className={n.isRead ? "pl-3.5" : ""}>
                          <p className='text-sm font-semibold text-gray-900'>
                            {n.title}
                          </p>
                          <p className='text-xs text-gray-600 mt-0.5'>
                            {n.body}
                          </p>
                          <p className='text-[11px] text-gray-400 mt-1'>
                            {timeAgo(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
