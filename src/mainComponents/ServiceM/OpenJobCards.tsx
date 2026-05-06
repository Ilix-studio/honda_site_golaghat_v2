import { useNavigate } from "react-router-dom";
import {
  Plus,
  Wrench,
  CheckCircle2,
  Clock,
  ChevronRight,
  AlertCircle,
  User,
  Bike,
  CalendarDays,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

import { useListJobCardsQuery } from "@/redux-store/services/ServiceM/jobCardApi";
import { JobCard, JobCardStatus } from "@/types/jobCard.types";

// ─── Status config ────────────────────────────────────────────────────────────

const ONGOING_STATUSES: JobCardStatus[] = [
  "draft",
  "temp_bill_sent",
  "customer_reviewed",
  "in_progress",
  "final_bill_sent",
];

const DONE_STATUSES: JobCardStatus[] = [
  "customer_confirmed",
  "invoice_generated",
  "closed",
];

const STATUS_PILL: Record<JobCardStatus, { label: string; className: string }> =
  {
    draft: {
      label: "Draft",
      className: "bg-gray-100 text-gray-500 border-gray-200",
    },
    temp_bill_sent: {
      label: "Temp Bill",
      className: "bg-amber-50 text-amber-600 border-amber-200",
    },
    customer_reviewed: {
      label: "Reviewed",
      className: "bg-blue-50 text-blue-600 border-blue-200",
    },
    in_progress: {
      label: "In Progress",
      className: "bg-orange-50 text-orange-600 border-orange-200",
    },
    final_bill_sent: {
      label: "Final Bill",
      className: "bg-purple-50 text-purple-600 border-purple-200",
    },
    customer_confirmed: {
      label: "Confirmed",
      className: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    invoice_generated: {
      label: "Invoiced",
      className: "bg-teal-50 text-teal-600 border-teal-200",
    },
    closed: {
      label: "Closed",
      className: "bg-gray-100 text-gray-400 border-gray-200",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-50 text-red-500 border-red-200",
    },
  };

// ─── Job card row ─────────────────────────────────────────────────────────────

function JobCardRow({ card }: { card: JobCard }) {
  const navigate = useNavigate();
  const pill = STATUS_PILL[card.status];
  const vehicleName =
    card.vehicle?.stockConcept?.modelName ?? card.vehicle?.numberPlate ?? "—";
  const customerPhone = card.customer?.phoneNumber ?? "—";

  const timeAgo = (() => {
    const diff = Date.now() - new Date(card.createdAt).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  })();

  return (
    <button
      onClick={() => navigate(`/service-admin/job-card/${card._id}`)}
      className='w-full group flex items-center gap-3 px-4 py-3 rounded-xl
                 bg-gray-50 border border-gray-200
                 hover:bg-gray-100 hover:border-gray-300
                 transition-all duration-200 text-left'
    >
      {/* Icon */}
      <div className='shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 group-hover:border-gray-300 transition-colors'>
        <Wrench className='w-3.5 h-3.5 text-gray-400' />
      </div>

      {/* Main info */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <span className='text-xs font-black text-gray-900 tracking-tight truncate'>
            {card.jobCardNumber}
          </span>
          <span
            className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${pill.className}`}
          >
            {pill.label}
          </span>
        </div>
        <div className='flex items-center gap-3 mt-0.5'>
          <span className='flex items-center gap-1 text-[11px] text-gray-400'>
            <Bike className='w-3 h-3' />
            {vehicleName}
          </span>
          <span className='flex items-center gap-1 text-[11px] text-gray-400'>
            <User className='w-3 h-3' />
            {customerPhone}
          </span>
        </div>
      </div>

      {/* Right meta */}
      <div className='shrink-0 flex flex-col items-end gap-1'>
        <span className='text-[10px] text-gray-400'>{timeAgo}</span>
        <span className='text-[11px] font-bold text-gray-900'>
          ₹{card.grandTotal.toLocaleString("en-IN")}
        </span>
      </div>

      <ChevronRight className='shrink-0 w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors' />
    </button>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptySlot({ label }: { label: string }) {
  return (
    <div className='flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed border-gray-200 text-center'>
      <div className='w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center mb-2'>
        <AlertCircle className='w-3.5 h-3.5 text-gray-300' />
      </div>
      <p className='text-xs text-gray-400'>No {label} job cards</p>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  cards: JobCard[];
  isLoading: boolean;
  emptyLabel: string;
  onViewAll: () => void;
}

function Section({
  title,
  icon,
  iconBg,
  cards,
  isLoading,
  emptyLabel,
  onViewAll,
}: SectionProps) {
  const visible = cards.slice(0, 4);

  return (
    <div className='flex-1 min-w-0 flex flex-col gap-3'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center ${iconBg}`}
          >
            {icon}
          </div>
          <span className='text-xs font-black text-gray-700 tracking-tight uppercase'>
            {title}
          </span>
          <span className='inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-gray-100 border border-gray-200 text-[10px] font-bold text-gray-500'>
            {isLoading ? "—" : cards.length}
          </span>
        </div>
        {cards.length > 4 && (
          <button
            onClick={onViewAll}
            className='flex items-center gap-0.5 text-[10px] font-semibold text-gray-400 hover:text-red-500 transition-colors'
          >
            View all <ArrowUpRight className='w-3 h-3' />
          </button>
        )}
      </div>

      {/* Cards list */}
      <div className='flex flex-col gap-2'>
        {isLoading ? (
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='w-4 h-4 text-gray-300 animate-spin' />
          </div>
        ) : visible.length > 0 ? (
          visible.map((card) => <JobCardRow key={card._id} card={card} />)
        ) : (
          <EmptySlot label={emptyLabel} />
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const OpenJobCards: React.FC = () => {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().slice(0, 10);

  const { data: ongoingData, isLoading: ongoingLoading } = useListJobCardsQuery(
    { limit: 50 },
  );
  const { data: todayData, isLoading: todayLoading } = useListJobCardsQuery({
    startDate: todayStr,
    endDate: todayStr,
    limit: 1,
  });

  const allCards: JobCard[] = (ongoingData?.data ?? []) as JobCard[];
  const ongoing = allCards.filter((c) => ONGOING_STATUSES.includes(c.status));
  const completed = allCards.filter((c) => DONE_STATUSES.includes(c.status));
  const todayCount = todayData?.total ?? 0;

  return (
    <div className='relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm'>
      {/* ── Panel header ── */}
      <div className='relative flex items-center justify-between px-5 py-4 border-b border-gray-100'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center w-8 h-8 rounded-xl bg-red-50 border border-red-100'>
            <Wrench className='w-3.5 h-3.5 text-red-500' />
          </div>
          <div>
            <h2 className='text-sm font-black text-gray-900 tracking-tight'>
              Open Job Cards
            </h2>
            <p className='text-[11px] text-gray-400 mt-px'>
              Active service sessions
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {/* Today count badge */}
          <div className='flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200'>
            <CalendarDays className='w-3 h-3 text-gray-400' />
            <span className='text-[11px] text-gray-500'>Today</span>
            <span className='text-[11px] font-black text-gray-900'>
              {todayLoading ? "…" : String(todayCount).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className='relative p-5'>
        <div className='flex flex-col lg:flex-row gap-6'>
          {/* + New shortcut tile */}
          <button
            onClick={() => navigate("/service-admin/job-card")}
            className='group shrink-0 w-full lg:w-28 h-24 lg:h-auto 
                       flex lg:flex-col items-center justify-center gap-2
                       rounded-xl border-2 border-dashed border-red-300
                       hover:border-green-700 hover:bg-green-50/50
                       transition-all duration-300'
          >
            <div
              className='w-10 h-10 rounded-xl bg-gray-50 border border-red-400
                         group-hover:border-gray-200 group-hover:bg-green-50
                         flex items-center justify-center transition-all duration-300'
            >
              <Plus className='w-5 h-5 text-green-900 group-hover:text-gray-500 transition-colors' />
            </div>
            <span className='text-[10px] font-bold text-green-900 group-hover:text-gray-500 transition-colors uppercase tracking-wide'>
              New Job Card
            </span>
          </button>

          {/* Dividers */}
          <div className='hidden lg:block w-px bg-gray-100 self-stretch' />
          <div className='lg:hidden h-px bg-gray-100' />

          {/* Ongoing */}
          <Section
            title='Ongoing'
            icon={<Clock className='w-3 h-3 text-orange-500' />}
            iconBg='bg-orange-50 border border-orange-100'
            cards={ongoing}
            isLoading={ongoingLoading}
            emptyLabel='ongoing'
            onViewAll={() =>
              navigate("/service-admin/job-cards?filter=ongoing")
            }
          />

          <div className='hidden lg:block w-px bg-gray-100 self-stretch' />
          <div className='lg:hidden h-px bg-gray-100' />

          {/* Completed */}
          <Section
            title='Completed'
            icon={<CheckCircle2 className='w-3 h-3 text-emerald-500' />}
            iconBg='bg-emerald-50 border border-emerald-100'
            cards={completed}
            isLoading={ongoingLoading}
            emptyLabel='completed'
            onViewAll={() =>
              navigate("/service-admin/job-cards?filter=completed")
            }
          />
        </div>
      </div>

      {/* Bottom accent */}
      <div className='absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-300/40 to-transparent' />
    </div>
  );
};

export default OpenJobCards;
