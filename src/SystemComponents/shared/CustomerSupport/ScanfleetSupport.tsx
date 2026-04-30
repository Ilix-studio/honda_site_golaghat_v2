import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Phone,
  PhoneCall,
  PhoneMissed,
  Clock,
  Download,
  RefreshCw,
  ChevronDown,
  Shield,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────────

type CallStatus = "completed" | "answered" | "failed" | "initiated";
type FilterStatus = "all" | CallStatus;

interface CallLog {
  sessionUuid: string;
  tokenId: string;
  callerNumber: string;
  virtualNumber: string;
  ownerNumber: string;
  eventName: string;
  status: CallStatus;
  duration?: number;
  billedDuration?: number;
  amount?: number;
  startTime: Date;
  endTime?: Date;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────────

const VIRTUAL_NUMBER = "+91-9876-543-210";
const VIRTUAL_NUMBER1 = "+91-9876-543-211";

const MOCK_CALL_LOGS: CallLog[] = [
  {
    sessionUuid: "sess_001",
    tokenId: "TOK-A1B2C3",
    callerNumber: "+91-98765-11111",
    virtualNumber: VIRTUAL_NUMBER,
    ownerNumber: "+91-98765-99999",
    eventName: "inbound.answered",
    status: "completed",
    duration: 247,
    billedDuration: 300,
    amount: 1.5,
    startTime: new Date("2025-03-02T10:15:00"),
    endTime: new Date("2025-03-02T10:19:07"),
  },
  {
    sessionUuid: "sess_002",
    tokenId: "TOK-D4E5F6",
    callerNumber: "+91-98765-22222",
    virtualNumber: VIRTUAL_NUMBER,
    ownerNumber: "+91-98765-99999",
    eventName: "inbound.answered",
    status: "completed",
    duration: 83,
    billedDuration: 120,
    amount: 0.75,
    startTime: new Date("2025-03-02T09:40:00"),
    endTime: new Date("2025-03-02T09:41:23"),
  },
  {
    sessionUuid: "sess_003",
    tokenId: "TOK-G7H8I9",
    callerNumber: "+91-98765-33333",
    virtualNumber: VIRTUAL_NUMBER,
    ownerNumber: "+91-98765-99999",
    eventName: "inbound.missed",
    status: "failed",
    startTime: new Date("2025-03-02T08:55:00"),
  },
  {
    sessionUuid: "sess_004",
    tokenId: "TOK-J0K1L2",
    callerNumber: "+91-98765-44444",
    virtualNumber: VIRTUAL_NUMBER,
    ownerNumber: "+91-98765-99999",
    eventName: "inbound.answered",
    status: "completed",
    duration: 512,
    billedDuration: 540,
    amount: 2.7,
    startTime: new Date("2025-03-01T16:30:00"),
    endTime: new Date("2025-03-01T16:38:32"),
  },
  {
    sessionUuid: "sess_005",
    tokenId: "TOK-M3N4O5",
    callerNumber: "+91-98765-55555",
    virtualNumber: VIRTUAL_NUMBER,
    ownerNumber: "+91-98765-99999",
    eventName: "inbound.answered",
    status: "answered",
    duration: 34,
    billedDuration: 60,
    amount: 0.5,
    startTime: new Date("2025-03-01T14:10:00"),
    endTime: new Date("2025-03-01T14:10:34"),
  },
  {
    sessionUuid: "sess_006",
    tokenId: "TOK-P6Q7R8",
    callerNumber: "+91-98765-66666",
    virtualNumber: VIRTUAL_NUMBER,
    ownerNumber: "+91-98765-99999",
    eventName: "inbound.initiated",
    status: "initiated",
    startTime: new Date("2025-03-01T11:05:00"),
  },
  {
    sessionUuid: "sess_007",
    tokenId: "TOK-S9T0U1",
    callerNumber: "+91-98765-77777",
    virtualNumber: VIRTUAL_NUMBER,
    ownerNumber: "+91-98765-99999",
    eventName: "inbound.answered",
    status: "completed",
    duration: 178,
    billedDuration: 180,
    amount: 0.9,
    startTime: new Date("2025-02-29T17:20:00"),
    endTime: new Date("2025-02-29T17:23:00"),
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────────

function formatDuration(seconds?: number): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function maskNumber(num: string): string {
  return num.replace(/(\+\d{2}-?\d{0,5})\d{3}(\d{3})/, "$1XXX$2");
}

const STATUS_CONFIG: Record<
  CallStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  completed: {
    label: "Completed",
    icon: <CheckCircle2 size={11} />,
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  answered: {
    label: "Answered",
    icon: <Phone size={11} />,
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  initiated: {
    label: "Initiated",
    icon: <Activity size={11} />,
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  failed: {
    label: "Missed",
    icon: <PhoneMissed size={11} />,
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────────

function VirtualNumberCard() {
  const totalBilled = MOCK_CALL_LOGS.reduce(
    (acc, c) => acc + (c.amount ?? 0),
    0
  );
  const completedCount = MOCK_CALL_LOGS.filter(
    (c) => c.status === "completed"
  ).length;

  return (
    <div className='rounded-2xl bg-white border border-gray-100 shadow-sm p-5'>
      <div className='flex items-center gap-2 mb-4'>
        <div className='w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0'>
          <Shield className='h-4 w-4 text-red-600' />
        </div>
        <div>
          <h3 className='text-sm font-bold text-gray-900'>Virtual Number</h3>
          <p className='text-xs text-gray-400'>Exotel masked number</p>
        </div>
        <div className='ml-auto flex items-center gap-1.5'>
          <span className='relative flex h-2 w-2'>
            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75' />
            <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-500' />
          </span>
          <span className='text-xs font-semibold text-emerald-600'>Active</span>
        </div>
      </div>

      <p className='text-xl font-bold text-gray-900 font-mono tracking-wider mb-1'>
        {VIRTUAL_NUMBER1}
      </p>
      <p className='text-xs text-gray-400 mb-4'>Active since Mar 1, 2025</p>

      <div className='grid grid-cols-3 gap-3'>
        {[
          {
            label: "Total Calls",
            value: MOCK_CALL_LOGS.length,
            color: "text-gray-900",
          },
          {
            label: "Completed",
            value: completedCount,
            color: "text-emerald-600",
          },
          {
            label: "Total Billed",
            value: `₹${totalBilled.toFixed(2)}`,
            color: "text-red-600",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className='p-3 rounded-xl bg-gray-50 border border-gray-100'
          >
            <p className='text-[10px] text-gray-400 mb-0.5'>{label}</p>
            <p className={`text-sm font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CallLogRow({ log }: { log: CallLog }) {
  const cfg = STATUS_CONFIG[log.status];
  return (
    <tr className='border-b border-gray-50 hover:bg-gray-50/60 transition-colors'>
      <td className='px-4 py-3 text-xs text-gray-500'>
        {formatDateTime(log.startTime)}
      </td>
      <td className='px-4 py-3'>
        <span className='text-xs text-gray-700 font-mono'>
          {maskNumber(log.callerNumber)}
        </span>
      </td>
      <td className='px-4 py-3'>
        <span className='text-xs text-gray-400 font-mono'>{log.tokenId}</span>
      </td>
      <td className='px-4 py-3'>
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold",
            cfg.className
          )}
        >
          {cfg.icon}
          {cfg.label}
        </span>
      </td>
      <td className='px-4 py-3'>
        <span className='flex items-center gap-1 text-xs text-gray-500'>
          <Clock size={11} className='text-gray-300' />
          {formatDuration(log.duration)}
        </span>
      </td>
      <td className='px-4 py-3 text-xs'>
        {log.amount != null ? (
          <span className='font-semibold text-gray-700'>
            ₹{log.amount.toFixed(2)}
          </span>
        ) : (
          <span className='text-gray-400'>—</span>
        )}
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────────

export default function ScanfleetSupport() {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filtered =
    filter === "all"
      ? MOCK_CALL_LOGS
      : MOCK_CALL_LOGS.filter((l) => l.status === filter);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 900);
  };

  const FILTERS: { label: string; value: FilterStatus }[] = [
    { label: "All", value: "all" },
    { label: "Completed", value: "completed" },
    { label: "Answered", value: "answered" },
    { label: "Missed", value: "failed" },
    { label: "Initiated", value: "initiated" },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-6xl mx-auto px-4 py-6 space-y-5'>
        {/* Page header */}
        <div>
          <h1 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
            <PhoneCall className='h-5 w-5 text-red-600' />
            Customer Support
          </h1>
          <p className='text-xs text-gray-400 mt-0.5'>
            Manage your virtual number and monitor incoming call activity
          </p>
        </div>

        <VirtualNumberCard />

        {/* Call Logs */}
        <div className='rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden'>
          {/* Header */}
          <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-3'>
            <div className='flex items-center gap-2'>
              <div className='w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center'>
                <PhoneCall className='h-3.5 w-3.5 text-red-600' />
              </div>
              <h3 className='text-sm font-bold text-gray-900'>Call Logs</h3>
              <span className='text-xs text-gray-400'>
                {filtered.length} of {MOCK_CALL_LOGS.length}
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleRefresh}
                className='h-8 px-3 rounded-xl text-xs'
              >
                <RefreshCw
                  size={13}
                  className={cn("mr-1.5", isRefreshing && "animate-spin")}
                />
                Refresh
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='h-8 px-3 rounded-xl text-xs'
              >
                <Download size={13} className='mr-1.5' />
                Export
              </Button>
            </div>
          </div>

          {/* Filter pills */}
          <div className='flex items-center gap-1.5 px-5 py-3 border-b border-gray-50 flex-wrap'>
            {FILTERS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition-colors border",
                  filter === value
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-gray-100 text-gray-500 border-gray-100 hover:bg-gray-200 hover:text-gray-700"
                )}
              >
                {label}
                {value === "all" && (
                  <span
                    className={cn(
                      "ml-1.5",
                      filter === "all" ? "text-red-200" : "text-gray-400"
                    )}
                  >
                    {MOCK_CALL_LOGS.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-gray-100 bg-gray-50/50'>
                  {[
                    "Date & Time",
                    "Caller",
                    "Token ID",
                    "Status",
                    "Duration",
                    "Billed",
                  ].map((h) => (
                    <th
                      key={h}
                      className='px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider'
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((log) => (
                    <CallLogRow key={log.sessionUuid} log={log} />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className='px-4 py-12 text-center text-sm text-gray-400'
                    >
                      No call logs found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className='px-5 py-3 border-t border-gray-100 flex items-center justify-between'>
              <span className='text-xs text-gray-400'>
                Showing {filtered.length} of {MOCK_CALL_LOGS.length} records
              </span>
              <Button
                variant='ghost'
                size='sm'
                className='text-xs text-gray-400 hover:text-gray-700 gap-1 h-7 rounded-lg'
              >
                Load more <ChevronDown size={13} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
