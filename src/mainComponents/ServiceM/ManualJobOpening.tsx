import { User, Wrench } from "lucide-react";

import { StatCard, type StatCardProps } from "../Admin/AdminDash/StatCard";

import { useGetAllBookingsQuery } from "@/redux-store/services/BikeSystemApi2/ServiceBookAdminApi";
import { Card, CardContent } from "@/components/ui/card";

const ManualJobOpening = () => {
  // RTK Query hooks — skip until authenticated to avoid 401s
  const { data: serviceBookingData, isLoading: serviceBookingLoading } =
    useGetAllBookingsQuery({ page: 1, limit: 1 }, { skip: false });

  const operationsStats: Omit<StatCardProps, "index">[] = [
    {
      title: "Manual Job Openings",
      value: serviceBookingData?.total ?? 0,
      icon: User,
      loading: serviceBookingLoading,
      description: "Total Job Cards",
      action: {
        label: "Open Job Card form",
        href: "/service-admin/job-card",
      },
    },
    {
      title: "Job Card Catalog",
      value: 0,
      icon: Wrench,
      loading: false,
      description: "Job card catalog",
      action: { label: "Open", href: "/service-admin/catalog" },
    },
  ];
  return (
    <div>
      <Card>
        <CardContent className='p-2'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {operationsStats.map((stat, i) => (
              <StatCard key={stat.title} {...stat} index={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualJobOpening;
