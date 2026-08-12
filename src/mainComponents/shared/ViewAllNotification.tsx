import { useMemo } from "react";
import {
  Bell,
  Check,
  ArrowLeft,
  Inbox,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  type AppNotification,
} from "@/redux-store/services/notificationApi";
import { timeAgo } from "./NotificationBell";

const ViewAllNotification = () => {
  const navigate = useNavigate();

  const { data, isLoading, isFetching, refetch } = useGetNotificationsQuery(
    { page: 1, limit: 20 },
    { pollingInterval: 60000 },
  );
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const notifications = data?.data ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  const readCount = useMemo(
    () => Math.max(notifications.length - unreadCount, 0),
    [notifications.length, unreadCount],
  );

  const handleOpen = (n: AppNotification) => {
    if (!n.isRead) markRead(n._id);
    const route = n.data?.route;
    if (route) navigate(route);
  };

  return (
    <div className='min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-white to-white'>
      <div className='mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8'>
        <div className='mb-6 flex items-start justify-between gap-4'>
          <div className='flex items-start gap-4'>
            <button
              onClick={() => navigate(-1)}
              className='mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50'
              aria-label='Go back'
            >
              <ArrowLeft className='h-4 w-4' />
            </button>

            <div>
              <div className='inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700'>
                <Bell className='h-3.5 w-3.5' />
                Notification Center
              </div>
              <h1 className='mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl'>
                Notifications
              </h1>
              <p className='mt-1 max-w-2xl text-sm text-gray-500 sm:text-base'>
                Review updates, assignments, and actions that need your
                attention. Unread items stay highlighted until you open them.
              </p>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            className='inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50'
          >
            {isFetching ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Bell className='h-4 w-4' />
            )}
            Refresh
          </button>
        </div>

        <div className='mb-6 grid gap-4 sm:grid-cols-3'>
          <div className='rounded-2xl border border-gray-200 bg-white p-4 shadow-sm'>
            <p className='text-xs font-medium uppercase tracking-wider text-gray-400'>
              Total
            </p>
            <p className='mt-2 text-2xl font-bold text-gray-900'>
              {notifications.length}
            </p>
            <p className='mt-1 text-sm text-gray-500'>notifications received</p>
          </div>
          <div className='rounded-2xl border border-red-100 bg-red-50/70 p-4 shadow-sm'>
            <p className='text-xs font-medium uppercase tracking-wider text-red-500'>
              Unread
            </p>
            <p className='mt-2 text-2xl font-bold text-red-700'>
              {unreadCount}
            </p>
            <p className='mt-1 text-sm text-red-600/80'>
              still waiting for review
            </p>
          </div>
          <div className='rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm'>
            <p className='text-xs font-medium uppercase tracking-wider text-emerald-600'>
              Read
            </p>
            <p className='mt-2 text-2xl font-bold text-emerald-700'>
              {readCount}
            </p>
            <p className='mt-1 text-sm text-emerald-600/80'>
              already opened
            </p>
          </div>
        </div>

        <div className='overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg'>
          <div className='flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h2 className='text-base font-semibold text-gray-900'>
                All notifications
              </h2>
              <p className='text-sm text-gray-500'>
                {unreadCount > 0
                  ? `${unreadCount} unread item${unreadCount === 1 ? "" : "s"} need attention`
                  : "Everything is caught up"}
              </p>
            </div>

            <button
              onClick={() => markAllRead()}
              disabled={unreadCount === 0}
              className='inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400'
            >
              <Check className='h-4 w-4' />
              Mark all read
            </button>
          </div>

          <div className='max-h-[68vh] overflow-y-auto'>
            {isLoading ? (
              <div className='space-y-3 p-5'>
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className='animate-pulse rounded-2xl border border-gray-100 bg-gray-50 p-4'
                  >
                    <div className='flex items-start gap-3'>
                      <div className='h-10 w-10 rounded-2xl bg-gray-200' />
                      <div className='min-w-0 flex-1 space-y-2'>
                        <div className='h-4 w-2/3 rounded bg-gray-200' />
                        <div className='h-3 w-full rounded bg-gray-200' />
                        <div className='h-3 w-1/3 rounded bg-gray-200' />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className='flex flex-col items-center justify-center px-6 py-16 text-center'>
                <div className='flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-100 text-gray-400'>
                  <Inbox className='h-8 w-8' />
                </div>
                <h3 className='mt-4 text-lg font-semibold text-gray-900'>
                  No notifications yet
                </h3>
                <p className='mt-2 max-w-sm text-sm text-gray-500'>
                  When something new arrives, it will appear here with the
                  latest status and timestamp.
                </p>
              </div>
            ) : (
              <ul className='divide-y divide-gray-100'>
                {notifications.map((n) => (
                  <li key={n._id}>
                    <button
                      onClick={() => handleOpen(n)}
                      className={`group flex w-full items-stretch gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50 ${
                        n.isRead ? "bg-white" : "bg-red-50/30"
                      }`}
                    >
                      <div className='pt-1'>
                        <span
                          className={`flex h-3 w-3 rounded-full ring-4 ring-offset-0 ${
                            n.isRead ? "bg-gray-300 ring-gray-100" : "bg-red-500 ring-red-100"
                          }`}
                        />
                      </div>

                      <div className='min-w-0 flex-1'>
                        <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
                          <div className='min-w-0'>
                            <p
                              className={`truncate text-sm font-semibold ${
                                n.isRead ? "text-gray-900" : "text-gray-950"
                              }`}
                            >
                              {n.title}
                            </p>
                            <p className='mt-1 line-clamp-2 text-sm text-gray-600'>
                              {n.body}
                            </p>
                          </div>

                          <div className='flex shrink-0 items-center gap-2 text-xs text-gray-400'>
                            <span>{timeAgo(n.createdAt)}</span>
                            <ChevronRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
                          </div>
                        </div>

                        <div className='mt-3 flex items-center gap-2'>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                              n.isRead
                                ? "bg-gray-100 text-gray-600"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {n.isRead ? "Read" : "Unread"}
                          </span>
                          <span className='text-[11px] text-gray-400'>
                            Open to view the linked screen
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAllNotification;
