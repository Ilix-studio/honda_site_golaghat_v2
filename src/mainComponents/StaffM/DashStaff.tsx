import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cog, User, Activity, FileText, Webhook } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { selectAuth } from "../../redux-store/slices/authSlice";
import {
  selectActiveTab,
  setActiveTab,
} from "../../redux-store/slices/dashboardTabsSlice";

import { StatCard, type StatCardProps } from "../Admin/AdminDash/StatCard";

import { useGetAllBookingsQuery } from "@/redux-store/services/BikeSystemApi2/ServiceBookAdminApi";

import { useGetQuotationsQuery } from "@/redux-store/services/NewFeatures/quotationApi";

const STAFF_DASHBOARD_TAB_KEY = "staffDashboard";

const DashStaff = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector(selectAuth);
  const activeTab =
    useAppSelector(selectActiveTab(STAFF_DASHBOARD_TAB_KEY)) ?? "operations";
  const [currentTime, setCurrentTime] = useState(new Date());

  // RTK Query hooks — skip until authenticated to avoid 401s
  const { data: serviceBookingData, isLoading: serviceBookingLoading } =
    useGetAllBookingsQuery({ page: 1, limit: 1 }, { skip: !isAuthenticated });

  const { data: quotationsData, isLoading: quotationsLoading } =
    useGetQuotationsQuery({ limit: 1 }, { skip: !isAuthenticated });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/staff/login");
    }
  }, [isAuthenticated, navigate]);

  const greeting = (() => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  })();

  // Stat cards built from live query data
  const operationsStats: Omit<StatCardProps, "index">[] = [
    {
      title: "Create Quotation",
      value: quotationsData?.total ?? 0,
      icon: FileText,
      loading: quotationsLoading,
      description: "Build a customer price quotation",
      action: { label: "Open Quotations", href: "/staff/quotations" },
    },
    {
      title: "Apply Leave",
      //Add Badge
      value: 0,
      icon: Activity,
      loading: false,
      description: "Leave Application",
      action: { label: "Open", href: "/staff/apply-leave" },
    },

    {
      title: "Sell Scanfleet Stickers",
      value: serviceBookingData?.total ?? 0,
      icon: User,
      loading: serviceBookingLoading,
      description: "Number of stickers sold",
      action: {
        label: "Sell Stickers",
        href: "/buy-sticker",
      },
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
      <div className='relative overflow-hidden bg-white rounded-b-xl shadow-md '>
        <div className='absolute inset-0 opacity-[0.04]'>
          <div className='absolute inset-0' />
        </div>

        <div className='relative container px-4 py-10 md:py-14'>
          <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6'>
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <div className='h-1 w-8 bg-black rounded-full' />
                <span className='text-black text-xs font-semibold tracking-[0.2em] uppercase'>
                  Staff Access Panel
                </span>
              </div>
              <h1 className='text-3xl md:text-4xl font-bold text-black tracking-tight'>
                {greeting},{" "}
                <span className=' text-black/90 font-bold'>
                  {user?.name || "Manager"}
                </span>
              </h1>
              <p className='text-gray-500 mt-2 text-sm md:text-base max-w-lg'>
                Manage your service operations, track service bookings, and open
                job cards for customers.
              </p>
            </div>

            <div className='flex flex-col items-start md:items-end gap-3'>
              <Button
                className='text-black text-xs gap-1.5 font-medium px-3 py-1.5 rounded-full border-2 bg-white border-black hover:bg-blue-700/10 hover:text-orange-700 transition-all duration-200'
                onClick={() => navigate("/staff/profile")}
              >
                <Webhook className='h-3 w-3 text-black' /> See Profile
              </Button>
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-black'>
                  <div className='h-1.5 w-1.5 rounded-full bg-black animate-pulse' />
                  <span className='text-black text-xs font-medium'>
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
      <div className='container px-4 py-8'>
        <Tabs
          value={activeTab}
          onValueChange={(v) =>
            dispatch(setActiveTab({ key: STAFF_DASHBOARD_TAB_KEY, value: v }))
          }
          className='w-full'
        >
          <TabsList className='inline-flex h-12 w-full md:w-auto bg-white border border-gray-200 shadow-sm rounded-xl p-1 gap-1'>
            <TabsTrigger
              value='operations'
              className='flex items-center gap-2 px-5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md'
            >
              <Cog className='h-4 w-4' />
              <span>Basic Stuff</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='operations' className='mt-6'>
            <Card
              size='sm'
              className='border border-gray-200 shadow-sm rounded-2xl overflow-hidden'
            >
              <CardContent className='p-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  {operationsStats.map((stat, i) => (
                    <StatCard key={stat.title} {...stat} index={i} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashStaff;
