// src/components/admin/forms/SelectStockForm.tsx

import { useNavigate } from "react-router-dom";
import {
  FileSpreadsheet,
  Database,
  LayoutList,
  ArrowRight,
  Package2,
} from "lucide-react";
import { motion } from "framer-motion";

const STOCK_OPTIONS = [
  {
    id: "csv",
    title: "CSV Stock Import",
    description:
      "Import stock data from CSV files. Best for bulk uploads from dealer management systems or spreadsheets.",
    icon: FileSpreadsheet,
    route: "/admin/forms/stock-concept-csv",
    buttonText: "Upload CSV",
    accent: "#10b981", // emerald
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-600",
    border: "hover:border-emerald-300",
    btn: "bg-emerald-600 hover:bg-emerald-700",
    tag: "CSV Import",
    tagBg: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "manual",
    title: "Manual Stock Entry",
    description:
      "Add stock items individually with full control over all fields. Best for single entries or corrections.",
    icon: Database,
    route: "/admin/forms/stock-concept",
    buttonText: "Add Manually",
    accent: "#3b82f6", // blue
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
    border: "hover:border-blue-300",
    btn: "bg-blue-600 hover:bg-blue-700",
    tag: "Manual",
    tagBg: "bg-blue-100 text-blue-700",
  },
  {
    id: "view_all",
    title: "View Stock Data",
    description:
      "Browse all manual entries and CSV import batches in one unified view.",
    icon: LayoutList,
    route: "/admin/get/all-stock",
    buttonText: "View All Stock Entries",
    accent: "#f97316", // orange
    bg: "bg-orange-50",
    iconBg: "bg-orange-100",
    iconText: "text-orange-600",
    border: "hover:border-orange-300",
    btn: "bg-orange-500 hover:bg-orange-600",
    tag: "Read-only",
    tagBg: "bg-orange-100 text-orange-700",
  },
];

const SelectStockForm = () => {
  const navigate = useNavigate();

  return (
    <div className='max-w-4xl mx-auto py-10 px-4 space-y-8'>
      {/* ── header ── */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-8 py-7 text-white shadow-lg'>
        <div className='pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/5' />
        <div className='pointer-events-none absolute -bottom-8 left-6 h-28 w-28 rounded-full bg-white/[0.03]' />
        <div className='relative flex items-center gap-4'>
          <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm'>
            <Package2 className='h-6 w-6 text-white' />
          </div>
          <div>
            <h1 className='text-xl font-bold tracking-tight'>Stock Manager</h1>
            <p className='text-sm text-gray-400 mt-0.5'>
              Choose how you want to manage stock items
            </p>
          </div>
        </div>
      </div>

      {/* ── cards ── */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        {STOCK_OPTIONS.map((opt, i) => (
          <motion.div
            key={opt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            onClick={() => navigate(opt.route)}
            className={`group cursor-pointer rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-200 ${opt.border} hover:-translate-y-0.5 overflow-hidden`}
          >
            {/* colored top strip */}
            <div className='h-1.5 w-full' style={{ background: opt.accent }} />

            <div className='p-5 flex flex-col h-full gap-4'>
              {/* icon + tag */}
              <div className='flex items-start justify-between'>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${opt.iconBg}`}
                >
                  <opt.icon className={`h-5 w-5 ${opt.iconText}`} />
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${opt.tagBg}`}
                >
                  {opt.tag}
                </span>
              </div>

              {/* text */}
              <div className='flex-1 space-y-1.5'>
                <h2 className='text-base font-bold text-gray-900'>
                  {opt.title}
                </h2>
                <p className='text-sm text-gray-500 leading-relaxed'>
                  {opt.description}
                </p>
              </div>

              {/* button */}
              <button
                className={`inline-flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-colors ${opt.btn}`}
              >
                {opt.buttonText}
                <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SelectStockForm;
