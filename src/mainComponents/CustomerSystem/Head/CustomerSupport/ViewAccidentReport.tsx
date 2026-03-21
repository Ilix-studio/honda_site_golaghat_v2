// mainComponents/CustomerSystem/AccidentReports/ViewAccidentReport.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  MapPin,
  Calendar,
  Clock,
  Shield,
  ShieldOff,
  ChevronRight,
  Plus,
  RefreshCw,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetMyAccidentReportsQuery } from "@/redux-store/services/accidentReportApi";
import type {
  AccidentReport,
  ReportStatus,
} from "@/redux-store/services/accidentReportApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  reviewed: {
    label: "Reviewed",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  closed: {
    label: "Closed",
    className: "bg-green-100 text-green-700 border-green-200",
  },
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const CardSkeleton = () => (
  <div className='bg-white rounded-2xl border border-gray-100 p-4 space-y-3 animate-pulse'>
    <div className='flex justify-between'>
      <div className='h-3 w-24 bg-gray-100 rounded' />
      <div className='h-5 w-16 bg-gray-100 rounded-full' />
    </div>
    <div className='h-4 w-3/4 bg-gray-100 rounded' />
    <div className='h-3 w-1/2 bg-gray-100 rounded' />
    <div className='grid grid-cols-2 gap-2 pt-1'>
      <div className='h-3 w-full bg-gray-100 rounded' />
      <div className='h-3 w-full bg-gray-100 rounded' />
    </div>
  </div>
);

// ─── Report Card ──────────────────────────────────────────────────────────────

const ReportCard = ({ report }: { report: AccidentReport }) => {
  const navigate = useNavigate();
  const status = STATUS_CONFIG[report.status];

  const branchName =
    report.branch && typeof report.branch === "object"
      ? (report.branch as { branchName: string }).branchName
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(`/customer/accident-reports/${report._id}`)}
      className='bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer
                 hover:border-red-200 hover:shadow-sm active:scale-[0.99]
                 transition-all duration-150 group'
    >
      {/* Top row */}
      <div className='flex items-start justify-between gap-2 mb-2'>
        <span className='font-mono text-xs text-red-500 font-semibold tracking-wide'>
          {report.reportId}
        </span>
        <Badge
          variant='outline'
          className={`text-xs flex-shrink-0 ${status.className}`}
        >
          {status.label}
        </Badge>
      </div>

      {/* Title */}
      <p className='text-sm font-semibold text-gray-900 line-clamp-2 mb-3'>
        {report.title}
      </p>

      {/* Meta grid */}
      <div className='grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-3'>
        <span className='flex items-center gap-1.5'>
          <Calendar className='h-3.5 w-3.5 text-gray-400 flex-shrink-0' />
          {fmt(report.date)}
        </span>
        <span className='flex items-center gap-1.5'>
          <Clock className='h-3.5 w-3.5 text-gray-400 flex-shrink-0' />
          {report.time}
        </span>
        <span className='flex items-center gap-1.5 col-span-2 truncate'>
          <MapPin className='h-3.5 w-3.5 text-gray-400 flex-shrink-0' />
          <span className='truncate'>{report.location}</span>
        </span>
      </div>

      {/* Bottom row */}
      <div className='flex items-center justify-between pt-2 border-t border-gray-50'>
        <span
          className={`flex items-center gap-1 text-xs font-medium ${
            report.isInsuranceAvailable ? "text-green-600" : "text-gray-400"
          }`}
        >
          {report.isInsuranceAvailable ? (
            <Shield className='h-3.5 w-3.5' />
          ) : (
            <ShieldOff className='h-3.5 w-3.5' />
          )}
          {report.isInsuranceAvailable ? "Insurance available" : "No insurance"}
        </span>

        <span className='flex items-center gap-1 text-xs text-gray-400 group-hover:text-red-500 transition-colors'>
          {branchName ?? "View details"}
          <ChevronRight className='h-3.5 w-3.5' />
        </span>
      </div>
    </motion.div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ onNew }: { onNew: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className='flex flex-col items-center justify-center py-20 px-6 text-center'
  >
    <div className='w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4'>
      <FileText className='h-8 w-8 text-red-300' />
    </div>
    <h3 className='text-base font-semibold text-gray-800 mb-1'>
      No reports yet
    </h3>
    <p className='text-sm text-gray-400 mb-6 max-w-xs'>
      File an accident report to document incidents and start your insurance
      claim.
    </p>
    <Button
      onClick={onNew}
      className='bg-red-600 hover:bg-red-700 text-white rounded-xl'
    >
      <Plus className='h-4 w-4 mr-1.5' />
      File a Report
    </Button>
  </motion.div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const ViewAccidentReport = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");

  const { data, isLoading, isFetching, refetch } =
    useGetMyAccidentReportsQuery();

  const reports = data?.data ?? [];

  const filtered =
    statusFilter === "all"
      ? reports
      : reports.filter((r) => r.status === statusFilter);

  const STATUS_TABS: { value: ReportStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "reviewed", label: "Reviewed" },
    { value: "closed", label: "Closed" },
  ];

  return (
    <div className=' mx-auto px-4 py-6 space-y-5'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center'>
            <AlertTriangle className='h-5 w-5 text-red-600' />
          </div>
          <div>
            <h1 className='text-lg font-bold text-gray-900'>My Reports</h1>
            <p className='text-xs text-gray-400'>
              {data?.count ?? 0} accident report
              {(data?.count ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => refetch()}
            disabled={isFetching}
            className='text-gray-400 hover:text-gray-600 p-2'
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            size='sm'
            onClick={() => navigate("/customer/support")}
            className='bg-red-600 hover:bg-red-700 text-white rounded-xl'
          >
            <Plus className='h-4 w-4 mr-1' />
            New
          </Button>
        </div>
      </div>

      {/* Status filter tabs */}
      {!isLoading && reports.length > 0 && (
        <div className='flex gap-2 overflow-x-auto pb-1 scrollbar-hide'>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium
                            transition-colors duration-150
                            ${
                              statusFilter === tab.value
                                ? "bg-red-600 text-white"
                                : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
                            }`}
            >
              {tab.label}
              {tab.value !== "all" && (
                <span className='ml-1 opacity-70'>
                  ({reports.filter((r) => r.status === tab.value).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className='space-y-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState onNew={() => navigate("/customer/support")} />
      ) : filtered.length === 0 ? (
        <div className='text-center py-16 text-gray-400 text-sm'>
          No {statusFilter} reports
        </div>
      ) : (
        <AnimatePresence mode='popLayout'>
          <div className='space-y-3'>
            {filtered.map((report) => (
              <ReportCard key={report._id} report={report} />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default ViewAccidentReport;
