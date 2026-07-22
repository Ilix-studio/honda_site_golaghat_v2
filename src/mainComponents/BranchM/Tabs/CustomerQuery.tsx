import { AlertTriangle, BanknoteIcon, MessageCircleCode } from "lucide-react";

import { useGetAllApplicationsQuery } from "@/redux-store/services/customer/getApprovedApi";
import { useGetContactMessagesQuery } from "@/redux-store/services/contactApi";
import {
  StatCard,
  StatCardProps,
} from "@/mainComponents/Admin/AdminDash/StatCard";

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

      action: {
        label: "View Finance Enquiry",
        href: "/manager/finanace-query",
      },
    },

    {
      title: "Message by Users",
      value: messagesData?.pagination.total ?? 0,
      icon: MessageCircleCode,
      loading: false,
      description: "Pending review",
      action: { label: "Read Messages", href: "/manager/any-messages" },
    },
    {
      title: "Accident Reports",
      value: 10,
      icon: AlertTriangle,
      loading: false,
      description: "",

      action: { label: "View Reports", href: "/accident-reports" },
    },
  ];

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 p-3'>
      {stats.map((stat, i) => (
        <StatCard key={stat.title} {...stat} index={i} />
      ))}
    </div>
  );
};

export default CustomerQueries;
