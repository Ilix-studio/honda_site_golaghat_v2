import {
  AlertTriangle,
  BanknoteIcon,
  MessageCircleCode,
  Bike,
} from "lucide-react";

import { useGetAllApplicationsQuery } from "@/redux-store/services/customer/getApprovedApi";
import { useGetContactMessagesQuery } from "@/redux-store/services/contactApi";
import { StatCard, StatCardProps } from "../helperFn";

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
      action: {
        label: "View Finance Enquiry",
        href: "/manager/finanace-query",
      },
    },
    {
      title: "Vehicles Enquiry",
      value: financeData?.total ?? "—",
      icon: Bike,
      loading: financeLoading,
      description: "Total vehicles enquiries",
      accent: "#f97316",
      action: {
        label: "View Vehicles Enquiry",
        href: "/admin/vehicles-enquiry",
      },
    },
    {
      title: "Message by Users",
      value: messagesData?.pagination.total ?? 0,
      icon: MessageCircleCode,
      loading: false,
      description: "Pending review",
      accent: "#ef4444",
      action: { label: "View Reports", href: "/manager/any-messages" },
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
