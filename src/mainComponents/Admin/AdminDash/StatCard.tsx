import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, ChevronRight } from "lucide-react";

import { Link } from "react-router-dom"; // ─── helpers ────────────────────────────────────────────────────────────────
export const formatTimeAgo = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime();
  const h = Math.floor(diff / 36e5);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return "Just now";
};

// ─── stat card ──────────────────────────────────────────────────────────────
export interface StatCardProps {
  title: string;
  value?: number | string;
  icon: React.ElementType;
  loading?: boolean;
  description: string;
  action: { label: string; href: string };
  accent: string;
  index: number;
}

// ─── visitor metric tile ─────────────────────────────────────────────────────
export interface MetricTileProps {
  label: string;
  value: string | number;
  bg: string;
  text: string;
  sub: string;
  index: number;
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  loading,
  description,
  action,
  accent,
  index,
}: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay: index * 0.07, ease: "easeOut" }}
    className='group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300'
  >
    {/* accent bar */}
    <div
      className='absolute top-0 left-0 h-1 w-full'
      style={{ background: accent }}
    />

    {/* subtle grid texture */}
    <div
      className='absolute inset-0 opacity-[0.025] pointer-events-none'
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 1px,transparent 20px),repeating-linear-gradient(90deg,#000 0,#000 1px,transparent 1px,transparent 20px)",
      }}
    />

    <div className='relative p-5 flex flex-col gap-4'>
      {/* header */}
      <div className='flex items-start justify-between'>
        <div
          className='flex items-center justify-center w-11 h-11 rounded-xl'
          style={{ background: `${accent}18` }}
        >
          <Icon className='w-5 h-5' style={{ color: accent }} />
        </div>

        <Link to={action.href}>
          <motion.div
            whileHover={{ scale: 1.1, rotate: -5 }}
            className='w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 border border-gray-200 cursor-pointer hover:border-gray-400 transition-colors'
          >
            <ArrowUpRight className='w-3.5 h-3.5 text-gray-500' />
          </motion.div>
        </Link>
      </div>

      {/* value */}
      <div>
        <p className='text-xs font-semibold uppercase tracking-widest text-gray-800 mb-1'>
          {title}
        </p>
        {loading ? (
          <div className='h-9 w-20 bg-gray-100 animate-pulse rounded-lg' />
        ) : value !== undefined ? (
          <p className='text-4xl font-black text-gray-900 leading-none tabular-nums'>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        ) : (
          <p className='text-sm text-gray-800 italic'>{description}</p>
        )}
        {value !== undefined && (
          <p className='text-xs text-gray-400 mt-1'>{description}</p>
        )}
      </div>

      {/* action */}
      <Link to={action.href}>
        <Button
          variant='ghost'
          size='sm'
          className='w-full justify-between px-3 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all group/btn'
        >
          <span className='flex items-center gap-1.5 text-xs font-medium'>
            <Plus className='w-3 h-3' />
            {action.label}
          </span>
          <ChevronRight className='w-3 h-3 opacity-0 group-hover/btn:opacity-100 transition-opacity' />
        </Button>
      </Link>
    </div>
  </motion.div>
);
export const MetricTile = ({
  label,
  value,
  bg,
  text,
  sub,
  index,
}: MetricTileProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.35 + index * 0.07, duration: 0.4 }}
    className={`relative overflow-hidden rounded-2xl p-5 ${bg} flex flex-col justify-between min-h-[110px]`}
  >
    <p className={`text-xs font-semibold uppercase tracking-widest ${sub}`}>
      {label}
    </p>
    <p className={`text-3xl font-black tabular-nums ${text}`}>{value}</p>
  </motion.div>
);
