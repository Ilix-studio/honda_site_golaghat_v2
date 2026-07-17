import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Home,
  Building2,
  Cog,
  User,
  Activity,
  Wrench,
  TrendingUp,
  UploadCloud,
  Users,
} from "lucide-react";
import { useAppSelector } from "../../hooks/redux";
import { selectAuth } from "../../redux-store/slices/authSlice";

import { StatCard, type StatCardProps } from "../Admin/AdminDash/StatCard";

import { useGetAllBookingsQuery } from "@/redux-store/services/BikeSystemApi2/ServiceBookAdminApi";
import OpenJobCards from "./OpenJobCards";
import { useGetMyLeavesQuery } from "@/redux-store/services/NewFeatures/leaveApi";
import { useGetSalesTimeseriesQuery } from "@/redux-store/services/dataImportApi";
import { useGetNewCustomersQuery } from "@/redux-store/services/customer/customerAdminApi";
import type { Granularity } from "@/redux-store/services/dataImport.types";
import SalesTrendChart from "@/mainComponents/DataImport/SalesTrendChart";

const DashServiceAdmins = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector(selectAuth);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [granularity, setGranularity] = useState<Granularity>("day");

  const { data: salesData, isLoading: salesLoading } =
    useGetSalesTimeseriesQuery({ granularity }, { skip: !isAuthenticated });

  // RTK Query hooks — skip until authenticated to avoid 401s
  const { data: serviceBookingData, isLoading: serviceBookingLoading } =
    useGetAllBookingsQuery({ page: 1, limit: 1 }, { skip: !isAuthenticated });
  const { data: bookingsData } = useGetAllBookingsQuery({
    page: 1,
    limit: 1,
  });
  const { data: myLeaveData, isLoading: myLeaveLoading } = useGetMyLeavesQuery(
    {},
    { skip: !isAuthenticated },
  );
  const { data: newCustomersData, isLoading: newCustomersLoading } =
    useGetNewCustomersQuery({ limit: 1 }, { skip: !isAuthenticated });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/service-admin/login");
    }
  }, [isAuthenticated, navigate]);

  const greeting = (() => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  })();

  const formattedDate = currentTime.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Stat cards built from live query data
  const operationsStats: Omit<StatCardProps, "index">[] = [
    {
      title: "Service Booking Requests",
      value: bookingsData?.total ?? "—",
      icon: Wrench,
      loading: serviceBookingLoading,
      description: "Total Service Bookings",
      accent: "#3b82f6",
      action: {
        label: "Open Service Booking form",
        href: "/service-admin/service-bookings",
      },
    },
    {
      title: "Job Card Stuff",
      value: serviceBookingData?.total ?? 0,
      icon: User,
      loading: serviceBookingLoading,
      description: "Total Job Cards",
      accent: "#ac3ea7ff",
      action: {
        label: "Open Job Card form",
        href: "/service-admin/job-card",
      },
    },
    {
      title: "Apply Leave",
      //Add Badge
      value: myLeaveData?.data?.length ?? 0,
      icon: Activity,
      loading: myLeaveLoading,
      description: "My Leave Application",
      accent: "#f59e0b",
      action: { label: "Open", href: "/service-admin/apply-leave" },
    },
    {
      title: "Job Card Catalog",
      value: 0,
      icon: Wrench,
      loading: false,
      description: "Job card catalog",
      accent: "#1f8438ff",
      action: { label: "Open", href: "/service-admin/catalog" },
    },
    {
      title: "View Customer List",
      value: newCustomersData?.pagination.total ?? 0,
      icon: Users,
      loading: newCustomersLoading,
      description: "All Customer Detected by this project",
      accent: "#222222c2",
      action: { label: "Open", href: "/customers/new" },
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-red-950'>
        <div className='flex flex-col items-center gap-4'>
          <div className='relative'>
            <div className='animate-spin h-10 w-10 border-[3px] border-red-500 rounded-full border-t-transparent' />
            <div className='absolute inset-0 animate-ping h-10 w-10 border border-red-500/20 rounded-full' />
          </div>
          <p className='text-gray-400 text-sm tracking-wide'>
            Authenticating...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Hero Banner */}
      <div className='relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-red-950'>
        <div className='absolute inset-0 opacity-[0.04]'>
          <div
            className='absolute inset-0'
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className='absolute -top-24 -right-24 w-96 h-96 bg-red-600/10 rounded-full blur-3xl' />
        <div className='absolute -bottom-32 -left-32 w-80 h-80 bg-red-500/5 rounded-full blur-3xl' />

        <div className='relative container px-4 py-10 md:py-8'>
          <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6'>
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <div className='h-1 w-8 bg-red-500 rounded-full' />
                <span className='text-red-400 text-xs font-semibold tracking-[0.2em] uppercase'>
                  Service Admin Panel
                </span>
              </div>
              <h1 className='text-3xl md:text-4xl font-bold text-white tracking-tight'>
                {greeting},{" "}
                <span className='bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent'>
                  {user?.name || "Manager"}
                </span>
              </h1>
              <p className='text-gray-400 mt-2 text-sm md:text-base max-w-lg'>
                Manage your service operations, track service bookings, and open
                job cards for customers.
              </p>
            </div>

            <div className='flex flex-col items-start md:items-end gap-3'>
              <div className='flex items-center gap-2 text-gray-400 text-sm'>
                <Clock className='h-3.5 w-3.5' />
                <span>{formattedDate}</span>
              </div>
              <Button
                className='text-gray-400 text-xs gap-1.5 font-medium px-3 py-1.5 rounded-full bg-white/5 border border-white/10'
                onClick={() => navigate("/")}
              >
                <Home className='h-3 w-3 text-gray-400' /> Visit Homepage
              </Button>
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20'>
                  <div className='h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse' />
                  <span className='text-emerald-400 text-xs font-medium'>
                    {user?.branch?.branchName || "Branch"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent' />
      </div>

      {/* Main Content */}
      <div className='container px-2 py-2'>
        <Tabs defaultValue='operations' className='w-full'>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className='sticky top-1 z-10 mb-2'
          >
            <TabsList className='inline-flex h-12 w-full md:w-auto bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md rounded-xl p-1 gap-1'>
              <TabsTrigger
                value='operations'
                className='flex items-center gap-2 px-5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md'
              >
                <Cog className='h-4 w-4' />
                <span>Operations</span>
              </TabsTrigger>

              <TabsTrigger
                value='sales-data'
                className='flex items-center gap-2 px-5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md'
              >
                <TrendingUp className='h-4 w-4' />
                <span>Sales & Data</span>
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value='operations' className='mt-2'>
            <Card
              size='sm'
              className='border border-gray-200 shadow-sm rounded-2xl overflow-hidden'
            >
              <CardHeader className='bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-6 py-5'>
                <div className='flex items-center gap-3'>
                  <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-gray-900 text-white shadow-sm'>
                    <Building2 className='h-5 w-5' />
                  </div>
                  <div>
                    <CardTitle className='text-lg font-semibold text-gray-900'>
                      Service Operations
                    </CardTitle>
                    <CardDescription className='text-gray-500 mt-0.5'>
                      Service booking requests and Job Card Stuff overview
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='p-2'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {operationsStats.map((stat, i) => (
                    <StatCard key={stat.title} {...stat} index={i} />
                  ))}
                </div>
              </CardContent>
              <CardContent className='p-2 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm'>
                <OpenJobCards />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='sales-data' className='mt-2'>
            <div className='flex justify-end'>
              <Link to='/service-admin/service-records'>
                <Button className='bg-green-700 text-white hover:bg-blue-700'>
                  <UploadCloud className='w-4 h-4 mr-2 ' />
                  Upload Data
                </Button>
              </Link>
            </div>

            <SalesTrendChart
              granularity={granularity}
              onGranularityChange={setGranularity}
              data={salesData?.data?.timeseries ?? []}
              loading={salesLoading}
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-1 py-3'>
              <Card size='sm' className='border border-gray-200 shadow-sm'>
                <CardHeader>
                  <CardTitle>Revenue by Model</CardTitle>
                </CardHeader>
                <CardContent>
                  {!salesData?.data?.byModel?.length ? (
                    <p className='text-sm text-gray-400'>No data yet.</p>
                  ) : (
                    <table className='w-full text-sm'>
                      <thead className='text-gray-500 text-left'>
                        <tr>
                          <th className='py-2 pr-4'>Model</th>
                          <th className='py-2 pr-4'>Revenue</th>
                          <th className='py-2 pr-4'>Job Cards</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesData.data.byModel.map((m) => (
                          <tr
                            key={m.modelName}
                            className='border-t border-gray-100'
                          >
                            <td className='py-2 pr-4 font-medium text-gray-800'>
                              {m.modelName || "—"}
                            </td>
                            <td className='py-2 pr-4 tabular-nums'>
                              ₹{m.totalRevenue.toLocaleString("en-IN")}
                            </td>
                            <td className='py-2 pr-4 tabular-nums'>
                              {m.jobCardCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>

              <Card size='sm' className='border border-gray-200 shadow-sm'>
                <CardHeader>
                  <CardTitle>Revenue by Technician</CardTitle>
                </CardHeader>
                <CardContent>
                  {!salesData?.data?.byTechnician?.length ? (
                    <p className='text-sm text-gray-400'>No data yet.</p>
                  ) : (
                    <table className='w-full text-sm'>
                      <thead className='text-gray-500 text-left'>
                        <tr>
                          <th className='py-2 pr-4'>Technician</th>
                          <th className='py-2 pr-4'>Revenue</th>
                          <th className='py-2 pr-4'>Job Cards</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesData.data.byTechnician.map((t) => (
                          <tr
                            key={t.technicianName}
                            className='border-t border-gray-100'
                          >
                            <td className='py-2 pr-4 font-medium text-gray-800'>
                              {t.technicianName || "—"}
                            </td>
                            <td className='py-2 pr-4 tabular-nums'>
                              ₹{t.totalRevenue.toLocaleString("en-IN")}
                            </td>
                            <td className='py-2 pr-4 tabular-nums'>
                              {t.jobCardCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashServiceAdmins;
