// mainComponents/CustomerSystem/AccidentReport.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  MapPin,
  Calendar,
  Clock,
  Shield,
  ShieldOff,
  CheckCircle2,
  FileText,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useGetBranchesQuery } from "@/redux-store/services/branchApi";
import { useCreateAccidentReportMutation } from "@/redux-store/services/accidentReportApi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  title: string;
  date: string;
  time: string;
  location: string;
  isInsuranceAvailable: boolean;
  branchId: string;
}

interface FormErrors {
  title?: string;
  date?: string;
  time?: string;
  location?: string;
  branchId?: string;
}

const initialState: FormState = {
  title: "",
  date: "",
  time: "",
  location: "",
  isInsuranceAvailable: false,
  branchId: "",
};

// ─── Validation ───────────────────────────────────────────────────────────────

const validate = (form: FormState): FormErrors => {
  const errors: FormErrors = {};
  if (!form.title.trim()) errors.title = "Title is required";
  else if (form.title.trim().length > 200) errors.title = "Max 200 characters";

  if (!form.date) errors.date = "Date is required";
  else if (new Date(form.date) > new Date())
    errors.date = "Date cannot be in the future";

  if (!form.time) errors.time = "Time is required";
  else if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(form.time))
    errors.time = "Invalid time format";

  if (!form.location.trim()) errors.location = "Location is required";
  else if (form.location.trim().length > 500)
    errors.location = "Max 500 characters";

  if (!form.branchId) errors.branchId = "Please select a branch";

  return errors;
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
   ${
     error
       ? "border-red-400 bg-red-50/30"
       : "border-gray-200 hover:border-gray-300"
   }`;

// ─── Success Screen ───────────────────────────────────────────────────────────

const SuccessScreen: React.FC<{ reportId: string; onDone: () => void }> = ({
  reportId,
  onDone,
}) => (
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
    <h2 className='text-2xl font-bold text-gray-900 mb-2'>Report Submitted</h2>
    <p className='text-gray-500 text-sm mb-4 max-w-xs'>
      Your accident report has been received. Our team will review it shortly.
    </p>
    <div className='bg-gray-50 border border-gray-200 rounded-xl px-6 py-3 mb-8'>
      <p className='text-xs text-gray-500 mb-1'>Report ID</p>
      <p className='font-mono font-bold text-red-600 text-lg tracking-widest'>
        {reportId}
      </p>
    </div>
    <button
      onClick={onDone}
      className='px-8 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl
                 hover:bg-red-700 transition-colors'
    >
      Back to Dashboard
    </button>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AccidentReport: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [createdReportId, setCreatedReportId] = useState("");

  const { data: branchesResponse, isLoading: branchesLoading } =
    useGetBranchesQuery();
  const branches = branchesResponse?.data ?? [];

  const [createAccidentReport, { isLoading }] =
    useCreateAccidentReportMutation();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

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
      const result = await createAccidentReport({
        title: form.title.trim(),
        date: form.date,
        time: form.time,
        location: form.location.trim(),
        isInsuranceAvailable: form.isInsuranceAvailable,
        branchId: form.branchId,
      }).unwrap();

      setCreatedReportId(result.data.reportId);
      setSubmitted(true);
      toast.success("Accident report submitted successfully");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to submit report. Try again.");
    }
  };

  if (submitted) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-start justify-center py-10 px-4'>
        <div className='w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100'>
          <SuccessScreen
            reportId={createdReportId}
            onDone={() => navigate("/customer/dashboard")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-10 px-4'>
      <div className=' mx-auto'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-6'
        >
          <div className='flex items-center gap-3 mb-1'>
            <div className='w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center'>
              <AlertTriangle className='h-5 w-5 text-red-600' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>
                Accident Report
              </h1>
              <p className='text-xs text-gray-500'>
                For insurance claim documentation
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
        >
          <div className='p-6 space-y-5'>
            {/* Title */}
            <div>
              <FieldLabel label='Incident Title' required />
              <div className='relative'>
                <FileText className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                <input
                  type='text'
                  name='title'
                  value={form.title}
                  onChange={handleChange}
                  placeholder='e.g., Rear-end collision on NH37'
                  maxLength={200}
                  className={`${inputClass(errors.title)} pl-9`}
                />
              </div>
              <FieldError message={errors.title} />
            </div>

            {/* Date + Time */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <FieldLabel label='Date of Accident' required />
                <div className='relative'>
                  <Calendar className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <input
                    type='date'
                    name='date'
                    value={form.date}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                    className={`${inputClass(errors.date)} pl-9`}
                  />
                </div>
                <FieldError message={errors.date} />
              </div>
              <div>
                <FieldLabel label='Time' required />
                <div className='relative'>
                  <Clock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <input
                    type='time'
                    name='time'
                    value={form.time}
                    onChange={handleChange}
                    className={`${inputClass(errors.time)} pl-9`}
                  />
                </div>
                <FieldError message={errors.time} />
              </div>
            </div>

            {/* Location */}
            <div>
              <FieldLabel label='Location of Accident' required />
              <div className='relative'>
                <MapPin className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                <textarea
                  name='location'
                  value={form.location}
                  onChange={handleChange}
                  placeholder=' Address....'
                  rows={2}
                  maxLength={500}
                  className={`${inputClass(errors.location)} pl-9 resize-none`}
                />
              </div>
              <FieldError message={errors.location} />
            </div>

            {/* Branch */}
            <div>
              <FieldLabel label='Nearest Branch' required />
              <select
                name='branchId'
                value={form.branchId}
                onChange={handleChange}
                disabled={branchesLoading}
                className={inputClass(errors.branchId)}
              >
                <option value=''>
                  {branchesLoading ? "Loading branches..." : "Select a branch"}
                </option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.branchName}
                  </option>
                ))}
              </select>
              <FieldError message={errors.branchId} />
            </div>

            {/* Insurance Toggle */}
            <div>
              <FieldLabel label='Insurance Availability' />
              <button
                type='button'
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    isInsuranceAvailable: !prev.isInsuranceAvailable,
                  }))
                }
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2
                            transition-all duration-200 text-sm font-medium
                            ${
                              form.isInsuranceAvailable
                                ? "border-green-500 bg-green-50 text-green-700"
                                : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                            }`}
              >
                <div className='flex items-center gap-2.5'>
                  <AnimatePresence mode='wait'>
                    <motion.div
                      key={String(form.isInsuranceAvailable)}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {form.isInsuranceAvailable ? (
                        <Shield className='h-4 w-4 text-green-600' />
                      ) : (
                        <ShieldOff className='h-4 w-4 text-gray-400' />
                      )}
                    </motion.div>
                  </AnimatePresence>
                  {form.isInsuranceAvailable
                    ? "Insurance is available"
                    : "No insurance / unsure"}
                </div>
                {/* Toggle pill */}
                <div
                  className={`w-10 h-5 rounded-full transition-colors duration-200 relative
                              ${
                                form.isInsuranceAvailable
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                >
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow
                                ${
                                  form.isInsuranceAvailable
                                    ? "left-5"
                                    : "left-0.5"
                                }`}
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className='px-6 pb-6'>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className='w-full flex items-center justify-center gap-2 py-3 bg-red-600
                         text-white text-sm font-semibold rounded-xl
                         hover:bg-red-700 active:scale-[0.99] transition-all
                         disabled:opacity-60 disabled:cursor-not-allowed'
            >
              {isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Report
                  <ChevronRight className='h-4 w-4' />
                </>
              )}
            </button>
            <p className='text-center text-xs text-gray-400 mt-3'>
              Your report will be reviewed by our team within 24 hours.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AccidentReport;
