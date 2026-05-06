// mainComponents/BranchM/ApplyLeave.tsx
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Calendar,
  FileText,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Info,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  useApplyLeaveMutation,
  useCancelLeaveMutation,
  useGetLeaveBalanceQuery,
  useGetMyLeavesQuery,
} from "@/redux-store/services/NewFeatures/leaveApi";
import { LeaveStatus, LeaveType } from "@/types/leave_types";

export interface ApplyLeaveProps {
  dashboardPath: string; // caller provides role-specific path
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  leaveType: LeaveType | "";
  startDate: string;
  endDate: string;
  reason: string;
}

interface FormErrors {
  leaveType?: string;
  startDate?: string;
  endDate?: string;
  reason?: string;
}

const initialState: FormState = {
  leaveType: "",
  startDate: "",
  endDate: "",
  reason: "",
};
type ActiveTab = "apply" | "history" | "balance";
// ─── Validation ───────────────────────────────────────────────────────────────

const validate = (form: FormState): FormErrors => {
  const errors: FormErrors = {};

  if (!form.leaveType) {
    errors.leaveType = "Leave type is required";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxFuture = new Date();
  maxFuture.setDate(maxFuture.getDate() + 90);

  if (!form.startDate) {
    errors.startDate = "Start date is required";
  } else {
    const start = new Date(form.startDate);
    if (start < today) errors.startDate = "Start date cannot be in the past";
    else if (start > maxFuture)
      errors.startDate = "Cannot apply more than 90 days in advance";
  }

  if (!form.endDate) {
    errors.endDate = "End date is required";
  } else if (
    form.startDate &&
    new Date(form.endDate) < new Date(form.startDate)
  ) {
    errors.endDate = "End date cannot be before start date";
  }

  if (!form.reason.trim()) {
    errors.reason = "Reason is required";
  } else if (form.reason.trim().length > 500) {
    errors.reason = "Max 500 characters";
  }

  return errors;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Business days preview (mirrors backend logic — for display only)
const calcBusinessDays = (start: string, end: string): number => {
  if (!start || !end) return 0;
  let count = 0;
  const cur = new Date(start);
  const endDate = new Date(end);
  while (cur <= endDate) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

const todayISO = () => new Date().toISOString().split("T")[0];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  LeaveStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  Pending: {
    label: "Pending",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: <Clock className='h-3 w-3' />,
  },
  Approved: {
    label: "Approved",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: <CheckCircle className='h-3 w-3' />,
  },
  Rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: <XCircle className='h-3 w-3' />,
  },
  Cancelled: {
    label: "Cancelled",
    className: "bg-gray-50 text-gray-500 border-gray-200",
    icon: <Ban className='h-3 w-3' />,
  },
};

const StatusBadge: React.FC<{ status: LeaveStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${cfg.className}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const FieldLabel: React.FC<{ label: string; required?: boolean }> = ({
  label,
  required,
}) => (
  <label className='block text-sm font-semibold text-gray-700 mb-1.5'>
    {label}
    {required && <span className='text-red-500 ml-1'>*</span>}
  </label>
);

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? (
    <p className='mt-1 text-xs text-red-500 flex items-center gap-1'>
      <AlertTriangle className='h-3 w-3' />
      {message}
    </p>
  ) : null;

const inputClass = (error?: string) =>
  `w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 bg-white
   placeholder:text-gray-400 transition-all duration-200 outline-none
   focus:ring-2 focus:ring-red-500/40 focus:border-red-500
   ${error ? "border-red-400 bg-red-50/30" : "border-gray-200 hover:border-gray-300"}`;

// ─── Success Screen ───────────────────────────────────────────────────────────

const SuccessScreen: React.FC<{ onDone: () => void }> = ({ onDone }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className='flex flex-col items-center justify-center py-16 px-8 text-center'
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
      className='w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6'
    >
      <CheckCircle2 className='h-10 w-10 text-green-600' />
    </motion.div>
    <h2 className='text-2xl font-bold text-gray-900 mb-2'>
      Application Submitted
    </h2>
    <p className='text-gray-500 text-sm mb-8 max-w-xs'>
      Your leave application has been submitted. You will be notified once it is
      reviewed by the Super-Admin.
    </p>
    <button
      onClick={onDone}
      className='px-8 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl
                 hover:bg-red-700 transition-colors'
    >
      Back to Dashboard
    </button>
  </motion.div>
);

// ─── Balance Tab ──────────────────────────────────────────────────────────────

const BalanceTab: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { data, isLoading } = useGetLeaveBalanceQuery(currentYear);
  const balance = data?.data?.balance;

  if (isLoading) {
    return (
      <div className='flex justify-center py-12'>
        <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
      </div>
    );
  }

  return (
    <div className='p-6 space-y-4'>
      <p className='text-xs text-gray-400 font-medium uppercase tracking-widest'>
        {currentYear} Leave Balance
      </p>
      {balance ? (
        <div className='grid grid-cols-2 gap-4'>
          {(["Sick", "Casual"] as LeaveType[]).map((type) => {
            const entry = balance[type];
            const pct = Math.round((entry.used / entry.total) * 100);
            return (
              <div
                key={type}
                className='bg-gray-50 border border-gray-100 rounded-xl p-4'
              >
                <p className='text-sm font-semibold text-gray-700 mb-3'>
                  {type} Leave
                </p>
                <div className='flex items-end justify-between mb-2'>
                  <span className='text-2xl font-bold text-gray-900'>
                    {entry.remaining}
                  </span>
                  <span className='text-xs text-gray-400'>
                    of {entry.total} days
                  </span>
                </div>
                {/* Progress bar */}
                <div className='h-1.5 bg-gray-200 rounded-full overflow-hidden'>
                  <div
                    className={`h-full rounded-full transition-all ${
                      pct >= 75
                        ? "bg-red-500"
                        : pct >= 50
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className='text-xs text-gray-400 mt-1.5'>
                  {entry.used} used · {entry.remaining} remaining
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className='text-sm text-gray-400 text-center py-8'>
          Balance data unavailable
        </p>
      )}
    </div>
  );
};

// ─── History Tab ──────────────────────────────────────────────────────────────

const HistoryTab: React.FC = () => {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { data, isLoading } = useGetMyLeavesQuery({});
  const [cancelLeave] = useCancelLeaveMutation();

  const applications = data?.data ?? [];

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await cancelLeave(id).unwrap();
      toast.success("Leave application cancelled");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to cancel. Try again.");
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center py-12'>
        <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-14 text-center px-6'>
        <div className='w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3'>
          <FileText className='h-6 w-6 text-gray-300' />
        </div>
        <p className='text-sm font-medium text-gray-700'>No applications yet</p>
        <p className='text-xs text-gray-400 mt-1'>
          Your submitted leave applications will appear here
        </p>
      </div>
    );
  }

  return (
    <div className='divide-y divide-gray-100'>
      {applications.map((app) => (
        <div key={app._id} className='p-4 space-y-2'>
          <div className='flex items-start justify-between gap-2'>
            <div>
              <p className='text-sm font-semibold text-gray-800'>
                {app.leaveType} Leave
              </p>
              <p className='text-xs text-gray-400 mt-0.5'>
                {formatDate(app.startDate)} → {formatDate(app.endDate)} ·{" "}
                <span className='font-medium text-gray-600'>
                  {app.totalDays}d
                </span>
              </p>
            </div>
            <StatusBadge status={app.status as LeaveStatus} />
          </div>

          <p className='text-xs text-gray-500 line-clamp-2'>{app.reason}</p>

          {app.reviewNote && (
            <p className='text-xs text-gray-400 italic'>
              Note: {app.reviewNote}
            </p>
          )}

          {/* Cancel — only for Pending */}
          {app.status === "Pending" && (
            <button
              onClick={() => handleCancel(app._id)}
              disabled={cancellingId === app._id}
              className='flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700
                         disabled:opacity-50 transition-colors mt-1'
            >
              {cancellingId === app._id ? (
                <Loader2 className='h-3 w-3 animate-spin' />
              ) : (
                <XCircle className='h-3 w-3' />
              )}
              Cancel Application
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ApplyLeave: React.FC<ApplyLeaveProps> = ({ dashboardPath }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("apply");
  const [applyLeave, { isLoading }] = useApplyLeaveMutation();

  const businessDays = calcBusinessDays(form.startDate, form.endDate);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await applyLeave({
        leaveType: form.leaveType as LeaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason.trim(),
      }).unwrap();

      setSubmitted(true);
      toast.success("Leave application submitted successfully");
    } catch (err: any) {
      toast.error(
        err?.data?.message ?? "Failed to submit application. Try again.",
      );
    }
  };

  if (submitted) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-start justify-center py-10 px-4'>
        <div className='w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100'>
          <SuccessScreen onDone={() => navigate(dashboardPath)} />
        </div>
      </div>
    );
  }

  const TABS: { key: ActiveTab; label: string }[] = [
    { key: "apply", label: "Apply" },
    { key: "history", label: "My Applications" },
    { key: "balance", label: "Balance" },
  ];

  return (
    <>
      <div className='min-h-screen bg-gray-50 py-10 px-4'>
        <div className='max-w-lg mx-auto'>
          {/* Back button */}
          <button
            onClick={() => navigate("/manager/dashboard")}
            className='flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800
                     transition-colors mb-6'
          >
            <ArrowLeft className='h-4 w-4' />
            Back to Dashboard
          </button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-6'
          >
            <div className='flex items-center gap-3 mb-1'>
              <div className='w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center'>
                <FileText className='h-5 w-5 text-red-600' />
              </div>
              <div>
                <h1 className='text-xl font-bold text-gray-900'>
                  Apply for Leave
                </h1>
                <p className='text-xs text-gray-500'>
                  Sick · 12 days/year &nbsp;|&nbsp; Casual · 12 days/year
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tab bar */}
          <div className='flex gap-1 bg-gray-100 rounded-xl p-1 mb-4'>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === tab.key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
          >
            <AnimatePresence mode='wait'>
              {activeTab === "apply" && (
                <div className='p-6 space-y-5'>
                  {/* Leave Type */}
                  <div>
                    <FieldLabel label='Leave Type' required />
                    <select
                      name='leaveType'
                      value={form.leaveType}
                      onChange={handleChange}
                      className={inputClass(errors.leaveType)}
                    >
                      <option value=''>Select leave type</option>
                      <option value='Sick'>Sick Leave</option>
                      <option value='Casual'>Casual Leave</option>
                    </select>
                    <FieldError message={errors.leaveType} />
                  </div>

                  {/* Date Range */}
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <FieldLabel label='Start Date' required />
                      <div className='relative'>
                        <Calendar className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none' />
                        <input
                          type='date'
                          name='startDate'
                          value={form.startDate}
                          min={todayISO()}
                          onChange={handleChange}
                          className={`${inputClass(errors.startDate)} pl-10`}
                        />
                      </div>
                      <FieldError message={errors.startDate} />
                    </div>
                    <div>
                      <FieldLabel label='End Date' required />
                      <div className='relative'>
                        <Calendar className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none' />
                        <input
                          type='date'
                          name='endDate'
                          value={form.endDate}
                          min={form.startDate || todayISO()}
                          onChange={handleChange}
                          className={`${inputClass(errors.endDate)} pl-10`}
                        />
                      </div>
                      <FieldError message={errors.endDate} />
                    </div>
                  </div>

                  {/* Business days preview */}
                  {businessDays > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className='flex items-center gap-2 px-4 py-2.5 bg-blue-50 border
                               border-blue-100 rounded-xl text-sm text-blue-700'
                    >
                      <Info className='h-4 w-4 flex-shrink-0' />
                      <span>
                        <span className='font-semibold'>{businessDays}</span>{" "}
                        business day{businessDays !== 1 ? "s" : ""} will be
                        deducted
                      </span>
                    </motion.div>
                  )}

                  {/* Reason */}
                  <div>
                    <FieldLabel label='Reason' required />
                    <textarea
                      name='reason'
                      value={form.reason}
                      onChange={handleChange}
                      rows={4}
                      maxLength={500}
                      placeholder='Briefly describe the reason for your leave...'
                      className={inputClass(errors.reason)}
                    />
                    <div className='flex justify-between items-start mt-1'>
                      <FieldError message={errors.reason} />
                      <span className='text-xs text-gray-400 ml-auto'>
                        {form.reason.length}/500
                      </span>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className='w-full flex items-center justify-center gap-2 py-3 bg-red-600
                             text-white text-sm font-semibold rounded-xl hover:bg-red-700
                             disabled:opacity-60 disabled:cursor-not-allowed transition-colors'
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </div>
              )}

              {activeTab === "history" && <HistoryTab />}
              {activeTab === "balance" && <BalanceTab />}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ApplyLeave;
