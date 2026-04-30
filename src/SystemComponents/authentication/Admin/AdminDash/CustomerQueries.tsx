import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Package,
  ArrowUpRight,
  ChevronRight,
  BanknoteIcon,
  MessageCircleCode,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useGetAllApplicationsQuery } from "@/redux-store/services/customer/getApprovedApi";
import { useGetContactMessagesQuery } from "@/redux-store/services/contactApi";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  loading?: boolean;
  description: string;
  action: { label: string; href: string };
  accent: string;
  index: number;
}

const StatCard = ({
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
    <div
      className='absolute top-0 left-0 h-1 w-full'
      style={{ background: accent }}
    />
    <div
      className='absolute inset-0 opacity-[0.025] pointer-events-none'
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 1px,transparent 20px),repeating-linear-gradient(90deg,#000 0,#000 1px,transparent 1px,transparent 20px)",
      }}
    />

    <div className='relative p-5 flex flex-col gap-4'>
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

      <div>
        <p className='text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1'>
          {title}
        </p>
        {loading ? (
          <div className='h-9 w-20 bg-gray-100 animate-pulse rounded-lg' />
        ) : (
          <p className='text-4xl font-black text-gray-900 leading-none tabular-nums'>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        )}
        <p className='text-xs text-gray-400 mt-1'>{description}</p>
      </div>

      <Link to={action.href}>
        <Button
          variant='ghost'
          size='sm'
          className='w-full justify-between px-3 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-all group/btn'
        >
          <span className='text-xs font-medium'>{action.label}</span>
          <ChevronRight className='w-3 h-3 opacity-0 group-hover/btn:opacity-100 transition-opacity' />
        </Button>
      </Link>
    </div>
  </motion.div>
);

const CustomerQueries = () => {
  const { data: financeData, isLoading: financeLoading } =
    useGetAllApplicationsQuery({
      page: 1,
      limit: 1,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  const { data: messagesData } = useGetContactMessagesQuery({ limit: 1 });

  const stats: Omit<StatCardProps, "index">[] = [
    {
      title: "Finance Enquiry",
      value: financeData?.total ?? "—",
      icon: BanknoteIcon,
      loading: financeLoading,
      description: "Total finance applications",
      accent: "#f97316",
      action: { label: "View Finance Enquiry", href: "/admin/finanace-query" },
    },
    {
      title: "Message by Users",
      value: messagesData?.pagination.total ?? 0,
      icon: MessageCircleCode,
      loading: false,
      description: "Pending review",
      accent: "#ef4444",
      action: { label: "View Reports", href: "/admin/any-messages" },
    },
    {
      title: "Accident Reports",
      value: 10,
      icon: AlertTriangle,
      loading: false,
      description: "",
      accent: "#ef4444",
      action: { label: "View Reports", href: "/admin/accident-reports" },
    },
    {
      title: "Parts Ordered",
      value: 33,
      icon: Package,
      loading: false,
      description: "Orders in pipeline",
      accent: "#8b5cf6",
      action: { label: "View Orders", href: "/admin/orders" },
    },
  ];

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
      {stats.map((stat, i) => (
        <StatCard key={stat.title} {...stat} index={i} />
      ))}
    </div>
  );
};

export default CustomerQueries;
