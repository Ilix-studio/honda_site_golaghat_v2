import { motion } from "framer-motion";

import {
  Building2,
  Users,
  Eye,
  Clock,
  Settings,
  PersonStanding,
  Bike,
  Wrench,
} from "lucide-react";
import { useGetBranchesQuery } from "@/redux-store/services/branchApi";
import {
  useGetAllBranchAdminsQuery,
  useGetAllPartAdminsQuery,
  useGetAllServiceAdminsQuery,
  useGetAllStaffQuery,
} from "@/redux-store/services/adminApi";

import { useGetVisitorStatsQuery } from "@/redux-store/services/visitorApi";

import { formatTimeAgo, MetricTile, StatCard, StatCardProps } from "./StatCard";

import SeparateStats from "./StatsUI/SeparateStats";
import { useGetBikesQuery } from "@/redux-store/services/BikeSystemApi/bikeApi";
import { useGetNewCustomersQuery } from "@/redux-store/services/customer/customerAdminApi";

// ─── main ────────────────────────────────────────────────────────────────────
const BranchQueries = () => {
  const { data: branchesData, isLoading: branchesLoading } =
    useGetBranchesQuery();
  const { data: branchManagersData, isLoading: managersLoading } =
    useGetAllBranchAdminsQuery();
  const { data: serviceManagersData, isLoading: serviceManagersLoading } =
    useGetAllServiceAdminsQuery();
  const { data: staffData, isLoading: staffLoading } = useGetAllStaffQuery();
  const { data: visitorStatsData } = useGetVisitorStatsQuery();
  const { data: partsAdminData, isLoading: partsAdminLoading } =
    useGetAllPartAdminsQuery();
  const { data: allVehicleData, isLoading: bikesLoading } = useGetBikesQuery(
    {}
  );
  const { data: newCustomersData, isLoading: newCustomersLoading } =
    useGetNewCustomersQuery({ limit: 1 }, { skip: false });

  const stats: Omit<StatCardProps, "index">[] = [
    {
      title: "View Branches",
      value: branchesData?.count ?? 0,
      icon: Building2,
      loading: branchesLoading,
      description: "Service locations",
      action: { label: "View Branches", href: "/admin/branches" },
    },
    {
      title: "Add Branch Admins",
      value: branchManagersData?.count ?? 0,
      icon: Users,
      loading: managersLoading,
      description: "Active managers",
      action: { label: "Add Manager", href: "/admin/branches/managers" },
    },
    {
      title: "Add Service Admins",
      value: serviceManagersData?.count ?? 0,
      icon: Settings,
      loading: serviceManagersLoading,
      description: "Active service admins",
      action: {
        label: "Add Service Admin",
        href: "/admin/branches/service-admins",
      },
    },
    {
      title: "Add Parts Admins",
      value: partsAdminData?.count ?? 0,
      icon: Wrench,
      loading: partsAdminLoading,
      description: "Active parts admins",
      action: {
        label: "View Parts Admins",
        href: "/admin/branches/part-admins",
      },
    },
    {
      title: "Add Staff",
      value: staffData?.count ?? 0,
      icon: PersonStanding,
      loading: staffLoading,
      description: "Active staff",
      action: {
        label: "View Staff",
        href: "/admin/viewStaff",
      },
    },

    {
      title: "View All Vehicles",
      value: allVehicleData?.data.pagination.total ?? 0,
      icon: Bike,
      loading: bikesLoading,
      description: "All Vehicles shown in Homepage",
      action: {
        label: "View Vehicles",
        href: "/admin/viewVehicles",
      },
    },
    {
      title: "View Customer List",
      value: newCustomersData?.pagination.total ?? 0,
      icon: Users,
      loading: newCustomersLoading,
      description: "All Customer Detected by this project",
      action: { label: "Open", href: "/customers/new" },
    },
  ];

  const vs = visitorStatsData?.data;
  const growth = vs?.weeklyStats?.growth ?? 0;

  return (
    <div className='space-y-8'>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='space-y-4'
      >
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {stats.map((s, i) => (
            <StatCard key={s.title} {...s} index={i} />
          ))}
        </div>
      </motion.div>

      <SeparateStats />

      {/* ── visitor analytics ── */}
      {vs && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className='rounded-2xl bg-white border border-gray-300 shadow-sm overflow-hidden'
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
                <p className='text-xs text-gray-500'>
                  Real-time traffic overview
                </p>
              </div>
            </div>

            {vs.lastVisit && (
              <div className='hidden sm:flex items-center gap-1.5 text-xs text-gray-500'>
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
              value={vs.totalVisitors?.toLocaleString("en-IN") ?? "0"}
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
            <p className='text-xs text-gray-500 mt-1.5'>
              Today's share of total traffic
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BranchQueries;
