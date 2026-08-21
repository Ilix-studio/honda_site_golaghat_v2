import { Cog, Settings2, TrendingUp, Package, Regex, Bot } from "lucide-react";

import { StatCard, type StatCardProps } from "../../Admin/AdminDash/StatCard";

import {
  useGetAllPartAdminsQuery,
  useGetAllServiceAdminsQuery,
  useGetAllStaffQuery,
} from "../../../redux-store/services/adminApi";
import { useGetAllVASQuery } from "@/redux-store/services/BikeSystemApi2/VASApi";
import { useGetMyLeavesQuery } from "@/redux-store/services/NewFeatures/leaveApi";

const OperationOpz = () => {
  const { data: staffData, isLoading: staffLoading } =
    useGetAllStaffQuery(undefined);

  const { data: vasData, isLoading: vasLoading } = useGetAllVASQuery({
    page: 1,
    limit: 1,
  });

  const { data: partsAdminData, isLoading: partsAdminLoading } =
    useGetAllPartAdminsQuery();
  const { data: serviceAdminsData, isLoading: serviceAdminsLoading } =
    useGetAllServiceAdminsQuery();
  const { data: myLeaveData, isLoading: myLeaveLoading } = useGetMyLeavesQuery(
    {},
  );

  // Stat cards built from live query data
  const operationsStatsZ: Omit<StatCardProps, "index">[] = [
    {
      title: "Add Value-Added Services",
      value: vasData?.total ?? "—",
      icon: TrendingUp,
      loading: vasLoading,
      description: "Activate VAS on vehicles",
      action: { label: "Open VAS Manager", href: "/manager/vas/select" },
    },

    {
      title: "Add Service Admins",
      value: serviceAdminsData?.count ?? 0,
      icon: Cog,
      loading: serviceAdminsLoading,
      description: "Create & manage Service Admins for your branch",
      action: {
        label: "Manage Service Admins",
        href: "/manager/service-admins",
      },
    },
    {
      title: "Add Part Admins",
      value: partsAdminData?.count ?? 0,
      icon: Package,
      loading: partsAdminLoading,
      description: "Create & manage Part Admins for your branch",
      action: { label: "Manage Part Admins", href: "/manager/part-admins" },
    },
    {
      title: "Add Staff Memebers",
      value: staffData?.count ?? 0,
      icon: Settings2,
      loading: staffLoading,
      description: "Active other staff",
      action: {
        label: "Add Other Staff",
        href: "/manager/staff",
      },
    },
    {
      title: "Apply Leave",
      //Add Badge
      value: myLeaveData?.data?.length ?? 0,
      icon: Regex,
      loading: myLeaveLoading,
      description: "My Leave Application",
      action: { label: "Open", href: "/manager/apply-leave" },
    },
    {
      title: "Raise Maintenance Request",
      //Add Badge
      value: "_",
      icon: Bot,
      loading: false,
      description: "My Leave Application",
      action: { label: "Open", href: "/manager/raise-maintenance-request" },
    },
  ];

  return (
    <>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {operationsStatsZ.map((stat, i) => (
          <StatCard key={stat.title} {...stat} index={i} />
        ))}
      </div>
    </>
  );
};

export default OperationOpz;
