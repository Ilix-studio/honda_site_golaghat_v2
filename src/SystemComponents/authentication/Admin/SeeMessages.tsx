import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MailOpen,
  Trash2,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Inbox,
  Clock,
  User,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

import {
  useGetContactMessagesQuery,
  useGetContactMessageByIdQuery,
  useMarkMessageAsReadMutation,
  useDeleteContactMessageMutation,
} from "@/redux-store/services/contactApi";
import { IContact } from "@/types/contact.type";

// ─── helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ─── message detail panel ─────────────────────────────────────────────────────

interface DetailPanelProps {
  messageId: string;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const DetailPanel = ({ messageId, onClose, onDelete }: DetailPanelProps) => {
  const { data, isLoading } = useGetContactMessageByIdQuery(messageId);
  const [markAsRead] = useMarkMessageAsReadMutation();
  const msg = data?.data;

  // auto-marks as read via the backend (getMessageById does it server-side)
  // but we expose manual toggle here for unread
  const handleToggleRead = async () => {
    if (!msg) return;
    try {
      await markAsRead({ id: msg._id, isRead: !msg.isRead }).unwrap();
      toast.success(msg.isRead ? "Marked as unread" : "Marked as read");
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <div className='h-6 w-6 animate-spin border-2 border-red-500 border-t-transparent rounded-full' />
      </div>
    );
  }

  if (!msg) return null;

  return (
    <motion.div
      key={messageId}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.2 }}
      className='flex-1 flex flex-col min-h-0'
    >
      {/* Detail header */}
      <div className='flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-100 shrink-0'>
        <div className='flex-1 min-w-0'>
          <h2 className='font-bold text-gray-900 text-base truncate'>
            {msg.subject}
          </h2>
          <div className='flex items-center gap-3 mt-1 text-xs text-gray-400'>
            <span className='flex items-center gap-1'>
              <User className='h-3 w-3' />
              {msg.name}
            </span>
            <span className='flex items-center gap-1'>
              <Mail className='h-3 w-3' />
              <a
                href={`mailto:${msg.email}`}
                className='hover:text-red-600 transition-colors'
              >
                {msg.email}
              </a>
            </span>
            <span className='flex items-center gap-1'>
              <Clock className='h-3 w-3' />
              {formatDate(msg.createdAt)}
            </span>
          </div>
        </div>

        <div className='flex items-center gap-1.5 shrink-0'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleToggleRead}
            className='h-7 px-2 rounded-lg text-xs'
          >
            {msg.isRead ? (
              <>
                <Mail className='h-3.5 w-3.5 mr-1' />
                Mark Unread
              </>
            ) : (
              <>
                <MailOpen className='h-3.5 w-3.5 mr-1' />
                Mark Read
              </>
            )}
          </Button>
          <Button
            size='sm'
            onClick={() => onDelete(msg._id)}
            className='h-7 px-2 rounded-lg text-xs bg-red-600 hover:bg-red-700'
          >
            <Trash2 className='h-3.5 w-3.5 mr-1' />
            Delete
          </Button>
          <button
            onClick={onClose}
            className='ml-1 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors'
          >
            <ChevronRight className='h-4 w-4' />
          </button>
        </div>
      </div>

      {/* Message body */}
      <div className='flex-1 overflow-y-auto px-6 py-5'>
        <div className='max-w-2xl'>
          <div className='mb-4 flex items-center gap-2'>
            <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>
              Message
            </span>
            {!msg.isRead && (
              <Badge className='text-[10px] h-4 bg-red-100 text-red-700 border-red-200 font-semibold'>
                Unread
              </Badge>
            )}
          </div>
          <p className='text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-xl p-4 border border-gray-100'>
            {msg.message}
          </p>

          <div className='mt-5 flex items-center gap-2'>
            <a
              href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(
                msg.subject
              )}`}
              className='inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors'
            >
              <Mail className='h-3.5 w-3.5' />
              Reply via Email
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── message row ──────────────────────────────────────────────────────────────

interface MessageRowProps {
  message: IContact;
  isSelected: boolean;
  onClick: () => void;
}

const MessageRow = ({ message, isSelected, onClick }: MessageRowProps) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors duration-150 ${
      isSelected
        ? "bg-red-50 border-l-2 border-l-red-500"
        : "hover:bg-gray-50 border-l-2 border-l-transparent"
    }`}
  >
    <div className='flex items-start gap-3'>
      {/* unread dot */}
      <div className='mt-1.5 shrink-0'>
        {!message.isRead ? (
          <div className='w-2 h-2 rounded-full bg-red-500' />
        ) : (
          <div className='w-2 h-2 rounded-full bg-gray-200' />
        )}
      </div>

      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between gap-2 mb-0.5'>
          <span
            className={`text-xs truncate ${
              !message.isRead
                ? "font-bold text-gray-900"
                : "font-medium text-gray-600"
            }`}
          >
            {message.name}
          </span>
          <span className='text-[10px] text-gray-400 shrink-0'>
            {timeAgo(message.createdAt)}
          </span>
        </div>
        <p
          className={`text-xs truncate mb-0.5 ${
            !message.isRead ? "font-semibold text-gray-800" : "text-gray-500"
          }`}
        >
          {message.subject}
        </p>
        <p className='text-[11px] text-gray-400 truncate'>{message.message}</p>
      </div>
    </div>
  </button>
);

// ─── main component ───────────────────────────────────────────────────────────

export default function SeeMessages() {
  const [page, setPage] = useState(1);
  const [readFilter, setReadFilter] = useState<boolean | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const LIMIT = 20;

  const { data, isLoading, isError, refetch, isFetching } =
    useGetContactMessagesQuery({ page, limit: LIMIT, read: readFilter });

  const [deleteMessage] = useDeleteContactMessageMutation();
  const [markAsRead] = useMarkMessageAsReadMutation();

  const messages = data?.data ?? [];
  const pagination = data?.pagination;
  const unreadCount = data?.unreadCount ?? 0;

  // Client-side search filter (name, email, subject)
  const filtered = search.trim()
    ? messages.filter((m) =>
        [m.name, m.email, m.subject].some((f) =>
          f.toLowerCase().includes(search.toLowerCase())
        )
      )
    : messages;

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this message? This cannot be undone.")) return;
    try {
      await deleteMessage(id).unwrap();
      if (selectedId === id) setSelectedId(null);
      toast.success("Message deleted");
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const handleMarkAllRead = async () => {
    const unread = messages.filter((m) => !m.isRead);
    if (!unread.length) return;
    await Promise.all(
      unread.map((m) =>
        markAsRead({ id: m._id, isRead: true })
          .unwrap()
          .catch(() => null)
      )
    );
    toast.success(
      `${unread.length} message${unread.length > 1 ? "s" : ""} marked as read`
    );
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 py-6'>
        {/* Page header */}
        <div className='flex items-center justify-between mb-5'>
          <div>
            <h1 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
              <Inbox className='h-5 w-5 text-red-600' />
              Contact Messages
              {unreadCount > 0 && (
                <span className='inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-red-600 text-white text-[10px] font-bold'>
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className='text-xs text-gray-400 mt-0.5'>
              Messages from website visitors
            </p>
          </div>

          <div className='flex items-center gap-2'>
            {unreadCount > 0 && (
              <Button
                variant='outline'
                size='sm'
                onClick={handleMarkAllRead}
                className='h-8 text-xs rounded-xl'
              >
                <MailOpen className='h-3.5 w-3.5 mr-1.5' />
                Mark all read
              </Button>
            )}
            <Button
              variant='outline'
              size='sm'
              onClick={() => refetch()}
              disabled={isFetching}
              className='h-8 text-xs rounded-xl'
            >
              <RefreshCw
                className={`h-3.5 w-3.5 mr-1.5 ${
                  isFetching ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
          </div>
        </div>

        <div className='flex gap-4 h-[calc(100vh-160px)]'>
          {/* ── Left panel: list ── */}
          <div
            className={`flex flex-col rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden transition-all duration-200 ${
              selectedId ? "w-80 shrink-0" : "flex-1"
            }`}
          >
            {/* Filters */}
            <div className='px-3 py-3 border-b border-gray-100 space-y-2 shrink-0'>
              <div className='relative'>
                <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400' />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Search name, email, subject…'
                  className='pl-8 h-8 text-xs rounded-xl'
                />
              </div>

              <div className='flex gap-1'>
                {(
                  [
                    { label: "All", value: undefined },
                    { label: "Unread", value: false },
                    { label: "Read", value: true },
                  ] as const
                ).map(({ label, value }) => (
                  <button
                    key={label}
                    onClick={() => {
                      setReadFilter(value);
                      setPage(1);
                      setSelectedId(null);
                    }}
                    className={`flex-1 text-[11px] font-semibold py-1 rounded-lg transition-colors ${
                      readFilter === value
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* List body */}
            <div className='flex-1 overflow-y-auto'>
              {isLoading ? (
                <div className='space-y-0'>
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className='px-4 py-3 border-b border-gray-50 animate-pulse'
                    >
                      <div className='flex gap-3'>
                        <div className='w-2 h-2 rounded-full bg-gray-200 mt-1.5 shrink-0' />
                        <div className='flex-1 space-y-1.5'>
                          <div className='h-3 bg-gray-200 rounded w-1/2' />
                          <div className='h-2.5 bg-gray-200 rounded w-3/4' />
                          <div className='h-2 bg-gray-200 rounded w-full' />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div className='flex flex-col items-center justify-center py-16 text-red-500'>
                  <AlertTriangle className='h-8 w-8 mb-2' />
                  <p className='text-sm'>Failed to load messages</p>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => refetch()}
                    className='mt-3 rounded-xl'
                  >
                    Retry
                  </Button>
                </div>
              ) : filtered.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-16 text-gray-400'>
                  <Inbox className='h-8 w-8 mb-2' />
                  <p className='text-sm'>No messages found</p>
                </div>
              ) : (
                <AnimatePresence>
                  {filtered.map((message) => (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <MessageRow
                        message={message}
                        isSelected={selectedId === message._id}
                        onClick={() => setSelectedId(message._id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className='flex items-center justify-between px-4 py-2.5 border-t border-gray-100 shrink-0'>
                <span className='text-[11px] text-gray-400'>
                  Page {pagination.current} of {pagination.pages} ·{" "}
                  {pagination.total} total
                </span>
                <div className='flex gap-1'>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className='p-1 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors'
                  >
                    <ChevronLeft className='h-4 w-4 text-gray-600' />
                  </button>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(pagination.pages, p + 1))
                    }
                    disabled={page === pagination.pages}
                    className='p-1 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors'
                  >
                    <ChevronRight className='h-4 w-4 text-gray-600' />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right panel: detail ── */}
          <AnimatePresence>
            {selectedId && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className='flex-1 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col'
              >
                <DetailPanel
                  messageId={selectedId}
                  onClose={() => setSelectedId(null)}
                  onDelete={handleDelete}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state when no message selected */}
          {!selectedId && !isLoading && filtered.length > 0 && (
            <div className='hidden lg:flex flex-1 rounded-2xl bg-white border border-gray-100 shadow-sm items-center justify-center flex-col text-gray-300'>
              <Tag className='h-10 w-10 mb-3' />
              <p className='text-sm font-medium'>Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
