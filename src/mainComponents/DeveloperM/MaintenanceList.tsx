import { AlertTriangle, CalendarClock, Clock, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type {
  MaintenanceRecord,
  MaintenanceStatus,
} from "@/redux-store/services/maintenanceApi";

const STATUS_STYLE: Record<MaintenanceStatus, { label: string; cls: string }> = {
  open: { label: "Open", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  in_progress: {
    label: "In progress",
    cls: "bg-blue-50 text-blue-700 border-blue-200",
  },
  resolved: {
    label: "Resolved",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

const PRIORITY_STYLE: Record<string, string> = {
  low: "bg-gray-100 text-gray-600 border-gray-200",
  normal: "bg-gray-100 text-gray-700 border-gray-200",
  high: "bg-red-50 text-red-700 border-red-200",
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/** A deadline in the past on an unresolved request is worth flagging. */
const isOverdue = (record: MaintenanceRecord) =>
  !!record.deadline &&
  record.status !== "resolved" &&
  new Date(record.deadline).getTime() < Date.now();

const branchName = (branch: MaintenanceRecord["branch"]): string | null => {
  if (!branch) return null;
  if (typeof branch === "string") return null;
  return branch.branchName ?? null;
};

export default function MaintenanceList({
  records,
  isLoading,
  emptyMessage,
  renderActions,
}: {
  records: MaintenanceRecord[];
  isLoading?: boolean;
  emptyMessage: string;
  /** Developer-only controls; omitted for the reporter's read-only view. */
  renderActions?: (record: MaintenanceRecord) => React.ReactNode;
}) {
  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-5 w-5 animate-spin text-gray-400' />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <p className='text-sm text-gray-400 py-8 text-center'>{emptyMessage}</p>
    );
  }

  return (
    <div className='space-y-3'>
      {records.map((record) => {
        const status = STATUS_STYLE[record.status];
        const overdue = isOverdue(record);
        const branch = branchName(record.branch);

        return (
          <div
            key={record._id}
            className='rounded-xl border border-gray-200 bg-white p-4'
          >
            <div className='flex items-start justify-between gap-3 flex-wrap'>
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2 flex-wrap'>
                  <p className='font-semibold text-gray-900'>{record.title}</p>
                  <Badge variant='outline' className={status.cls}>
                    {status.label}
                  </Badge>
                  {record.priority === "high" && (
                    <Badge
                      variant='outline'
                      className={PRIORITY_STYLE[record.priority]}
                    >
                      High priority
                    </Badge>
                  )}
                </div>
                <p className='text-sm text-gray-600 mt-1.5 whitespace-pre-wrap'>
                  {record.description}
                </p>
              </div>
              {renderActions && (
                <div className='shrink-0'>{renderActions(record)}</div>
              )}
            </div>

            <div className='mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500'>
              <span>
                {record.raisedByName}{" "}
                <span className='text-gray-400'>({record.raisedByRole})</span>
                {branch && <span className='text-gray-400'> · {branch}</span>}
              </span>
              <span className='flex items-center gap-1'>
                <Clock className='h-3 w-3' />
                {formatDateTime(record.createdAt)}
              </span>
              {record.deadline && (
                <span
                  className={`flex items-center gap-1 ${
                    overdue ? "text-red-600 font-semibold" : ""
                  }`}
                >
                  {overdue ? (
                    <AlertTriangle className='h-3 w-3' />
                  ) : (
                    <CalendarClock className='h-3 w-3' />
                  )}
                  Deadline {formatDate(record.deadline)}
                  {overdue && " · overdue"}
                </span>
              )}
              {record.resolvedAt && (
                <span className='text-emerald-600'>
                  Resolved {formatDateTime(record.resolvedAt)}
                </span>
              )}
            </div>

            {record.developerNote && (
              <p className='mt-2 text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2'>
                <span className='font-semibold text-gray-700'>
                  Developer note:{" "}
                </span>
                {record.developerNote}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
