import { motion } from "framer-motion";

import {
  TrendingUp,
  Building2,
  Users,
  User,
  Activity,
  Eye,
  Clock,
  Wrench,
} from "lucide-react";
import { useGetBranchesQuery } from "@/redux-store/services/branchApi";
import { useGetAllBranchManagersQuery } from "@/redux-store/services/branchManagerApi";

import { useGetVisitorStatsQuery } from "@/redux-store/services/visitorApi";
import RecentMotorcycles from "./RecentMotocycles";
import { useGetAllCustomersQuery } from "@/redux-store/services/customer/customerApi";
import { formatTimeAgo, MetricTile, StatCard, StatCardProps } from "./StatCard";
import { useGetAllVASQuery } from "@/redux-store/services/BikeSystemApi2/VASApi";
import { useGetCSVBatchesQuery } from "@/redux-store/services/BikeSystemApi3/csvStockApi";
import { useGetAllStockItemsQuery } from "@/redux-store/services/BikeSystemApi2/StockConceptApi";
import { useGetAllBookingsQuery } from "@/redux-store/services/BikeSystemApi2/ServiceBookAdminApi";

// ─── main ────────────────────────────────────────────────────────────────────
const BranchQueries = () => {
  const { data: branchesData, isLoading: branchesLoading } =
    useGetBranchesQuery();
  const { data: branchManagersData, isLoading: managersLoading } =
    useGetAllBranchManagersQuery();
  const { data: visitorStatsData } = useGetVisitorStatsQuery();
  const { data: customersData, isLoading: customersLoading } =
    useGetAllCustomersQuery({ limit: 1 });
  const { data: vasData } = useGetAllVASQuery({});
  const { data: csvBatchData } = useGetCSVBatchesQuery({ page: 1, limit: 1 });
  const { data: stockData } = useGetAllStockItemsQuery({ page: 1, limit: 1 });

  const stockTotal =
    (csvBatchData?.pagination?.total ?? 0) + (stockData?.total ?? 0);
  const { data: bookingsData } = useGetAllBookingsQuery({
    page: 1,
    limit: 1,
  });

  const stats: Omit<StatCardProps, "index">[] = [
    {
      title: "Customers",
      value: customersData?.pagination?.total ?? 0,
      icon: User,
      loading: customersLoading,
      description: "Total registered",
      accent: "#f97316",
      action: { label: "Open Sign-up form", href: "/admin/customers/signup" },
    },
    {
      title: "Branches",
      value: branchesData?.count ?? 0,
      icon: Building2,
      loading: branchesLoading,
      description: "Service locations",
      accent: "#3b82f6",
      action: { label: "Add Branch", href: "/admin/branches/add" },
    },
    {
      title: "Branch Managers",
      value: branchManagersData?.count ?? 0,
      icon: Users,
      loading: managersLoading,
      description: "Active managers",
      accent: "#8b5cf6",
      action: { label: "Add Manager", href: "/admin/branches/managers" },
    },
    {
      title: "Value-Added Services",
      value: vasData?.total ?? "—",
      icon: TrendingUp,
      loading: false,
      description: "Activate VAS on vehicles",
      accent: "#10b981",
      action: { label: "Open VAS Manager", href: "/admin/vas/select" },
    },
    {
      title: "Stock Queries",
      value: stockTotal,
      icon: Activity,
      loading: false,
      description: "Vehicles in branch",
      accent: "#f59e0b",
      action: { label: "Open Stock Manager", href: "/admin/stockC/select" },
    },
    {
      title: "Service Bookings",
      value: bookingsData?.total ?? "—",
      icon: Wrench,
      loading: false,
      description: "Active bookings",
      accent: "#3b82f6",
      action: { label: "View All", href: "/admin/service-bookings" },
    },
  ];

  const vs = visitorStatsData?.data;
  const growth = vs?.weeklyStats?.growth ?? 0;

  return (
    <div className='space-y-8'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4'>
        {stats.map((s, i) => (
          <StatCard key={s.title} {...s} index={i} />
        ))}
      </div>

      {/* ── visitor analytics ── */}
      {vs && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className='rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden'
        >
          {/* panel header */}
          <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
            <div className='flex items-center gap-2.5'>
              <div className='w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center'>
                <Eye className='w-4 h-4 text-orange-500' />
              </div>
              <div>
                <h3 className='text-sm font-bold text-gray-900'>
                  Visitor Analytics
                </h3>
                <p className='text-xs text-gray-400'>
                  Real-time traffic overview
                </p>
              </div>
            </div>

            {vs.lastVisit && (
              <div className='hidden sm:flex items-center gap-1.5 text-xs text-gray-400'>
                <Clock className='w-3 h-3' />
                Last visit: {formatTimeAgo(vs.lastVisit)}
              </div>
            )}
          </div>

          {/* metric tiles */}
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 p-6'>
            <MetricTile
              index={0}
              label='Total Visitors'
              value={vs.totalVisitors?.toLocaleString() ?? "0"}
              bg='bg-orange-50'
              text='text-orange-900'
              sub='text-orange-400'
            />
            <MetricTile
              index={1}
              label='Today'
              value={vs.todayVisitors ?? 0}
              bg='bg-blue-50'
              text='text-blue-900'
              sub='text-blue-400'
            />
            <MetricTile
              index={2}
              label='This Week'
              value={vs.weeklyStats?.thisWeek ?? 0}
              bg='bg-green-50'
              text='text-green-900'
              sub='text-green-400'
            />
            <MetricTile
              index={3}
              label='Weekly Growth'
              value={`${growth >= 0 ? "+" : ""}${growth}%`}
              bg={growth >= 0 ? "bg-emerald-50" : "bg-red-50"}
              text={growth >= 0 ? "text-emerald-900" : "text-red-900"}
              sub={growth >= 0 ? "text-emerald-400" : "text-red-400"}
            />
          </div>

          {/* bottom bar */}
          <div className='px-6 pb-4'>
            <div className='h-1.5 w-full bg-gray-100 rounded-full overflow-hidden'>
              <motion.div
                className='h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600'
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(
                    ((vs.todayVisitors ?? 0) /
                      Math.max(vs.totalVisitors ?? 1, 1)) *
                      100 *
                      10,
                    100
                  )}%`,
                }}
                transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className='text-xs text-gray-400 mt-1.5'>
              Today's share of total traffic
            </p>
          </div>
        </motion.div>
      )}

      {/* ── recent motorcycles ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.45 }}
      >
        <RecentMotorcycles />
      </motion.div>
    </div>
  );
};

export default BranchQueries;
