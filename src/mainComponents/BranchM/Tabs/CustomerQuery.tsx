import {
  AlertTriangle,
  BanknoteIcon,
  MessageCircleCode,
  PartyPopper,
} from "lucide-react";

import { useAppSelector } from "@/hooks/redux";
import { selectUserRole } from "@/redux-store/slices/authSlice";
import { useGetAllApplicationsQuery } from "@/redux-store/services/customer/getApprovedApi";
import { useGetContactMessagesQuery } from "@/redux-store/services/contactApi";
import { useGetAllAccidentReportsQuery } from "@/redux-store/services/accidentReportApi";
import { useGetCounterSaleBatchesQuery } from "@/redux-store/services/counterSaleApi";
import {
  StatCard,
  StatCardProps,
} from "@/mainComponents/Admin/AdminDash/StatCard";

/**
 * Roles that render this card section. Both reach the same four pages, which
 * are registered under each role's own prefix and branch-scoped server-side —
 * so the role only decides the URLs, never what the endpoints return.
 */
type ReportRole = "Branch-Admin" | "Staff";

type ReportPaths = {
  financeEnquiry: string;
  messages: string;
  accidentReports: string;
  counterSale: string;
};

/**
 * Written out per role rather than built from a prefix: Branch-Admin's accident
 * list is the un-prefixed shared route, because "/manager/accident-reports" is
 * a placeholder stub with no list in it. The other three do follow the prefix.
 *
 * Note "finanace-query" — the typo is load-bearing, it is the registered path.
 */
const ROLE_REPORT_PATHS: Record<ReportRole, ReportPaths> = {
  "Branch-Admin": {
    financeEnquiry: "/manager/finanace-query",
    messages: "/manager/any-messages",
    accidentReports: "/accident-reports",
    counterSale: "/manager/counter-sale",
  },
  Staff: {
    financeEnquiry: "/staff/finanace-query",
    messages: "/staff/any-messages",
    accidentReports: "/staff/accident-reports",
    counterSale: "/staff/counter-sale",
  },
};

const CustomerQueries = () => {
  const role = useAppSelector(selectUserRole);
  const paths =
    role && role in ROLE_REPORT_PATHS
      ? ROLE_REPORT_PATHS[role as ReportRole]
      : ROLE_REPORT_PATHS["Branch-Admin"];

  // limit: 1 everywhere — these cards only need the `total`, not the rows.
  const { data: financeData, isLoading: financeLoading } =
    useGetAllApplicationsQuery({
      page: 1,
      limit: 1,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  const { data: messagesData, isLoading: messagesLoading } =
    useGetContactMessagesQuery({ limit: 1 });
  const { data: accidentData, isLoading: accidentLoading } =
    useGetAllAccidentReportsQuery({ page: 1, limit: 1 });
  const { data: counterSaleData, isLoading: counterSaleLoading } =
    useGetCounterSaleBatchesQuery();

  const stats: Omit<StatCardProps, "index">[] = [
    {
      title: "Finance Enquiry",
      value: financeData?.total ?? "—",
      icon: BanknoteIcon,
      loading: financeLoading,
      description: "Total finance applications",

      action: {
        label: "View Finance Enquiry",
        href: paths.financeEnquiry,
      },
    },

    {
      title: "Message by Users",
      value: messagesData?.pagination.total ?? 0,
      icon: MessageCircleCode,
      loading: messagesLoading,
      description: "Pending review",
      action: { label: "Read Messages", href: paths.messages },
    },
    {
      title: "Accident Reports",
      value: accidentData?.total ?? 0,
      icon: AlertTriangle,
      loading: accidentLoading,
      description: "Reports filed",
      action: { label: "View Reports", href: paths.accidentReports },
    },
    {
      title: "Counter Sales Reports",
      value: counterSaleData?.data.length ?? 0,
      icon: PartyPopper,
      loading: counterSaleLoading,
      description: "Uploaded batches",
      action: { label: "View Reports", href: paths.counterSale },
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
