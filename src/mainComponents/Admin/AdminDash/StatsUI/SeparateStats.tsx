import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import {
  TrendingUp,
  Activity,
  Wrench,
  ChevronRight,
  BarChart,
} from "lucide-react";

interface QuickActionItem {
  title: string;
  description: string;
  icon: React.ElementType;
  accent: string;
  href: string;
}

// ─── QuickActions ─────────────────────────────────────────────────────────────

const QuickActions = ({ items }: { items: QuickActionItem[] }) => (
  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
    {items.map((item) => {
      const Icon = item.icon;
      return (
        <Link
          key={item.title}
          to={item.href || "#"}
          className='group flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow'
        >
          <div
            className='w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0'
            style={{ backgroundColor: `${item.accent}18` }}
          >
            <Icon className='w-4 h-4' style={{ color: item.accent }} />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-semibold text-gray-900 truncate'>
              {item.title}
            </p>
            <p className='text-xs text-gray-400 truncate'>{item.description}</p>
          </div>
          <ChevronRight className='w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0' />
        </Link>
      );
    })}
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const SeparateStats = () => {
  const quickActions: QuickActionItem[] = [
    {
      title: "VAS Customers",
      description: "total • Activate VAS on vehicles",
      icon: TrendingUp,
      accent: "#10b981",
      href: "/admin/view-total-vas",
    },
    {
      title: "Sales Report ",
      description: "All Sales Data",
      icon: Activity,
      accent: "#f59e0b",
      href: "/admin/sales-report",
    },

    {
      title: "Service Revenue",
      description: "all Service Revenue Data",
      icon: BarChart,
      accent: "#382c18ff",
      href: "/admin/service-revenue-stats",
    },
    {
      title: "Leave Requests",
      description: "pending",
      icon: Wrench,
      accent: "#3b82f6",
      href: "/admin/leave-requests",
    },
  ];

  return (
    <div className='space-y-8'>
      {/* ── stat cards ── */}

      {/* ── quick actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className='space-y-3 border border-gray-500 p-4 rounded-xl bg-white'
      >
        <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide px-0.5'>
          Sales Details and Leave Requests
        </h3>
        <QuickActions items={quickActions} />
      </motion.div>
    </div>
  );
};

export default SeparateStats;
