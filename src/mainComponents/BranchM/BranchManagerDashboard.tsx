import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  MessageSquare,
  Clock,
  Home,
  Building2,
  Cog,
  User,
  Settings2,
  TrendingUp,
  Activity,
} from "lucide-react";
import { useAppSelector } from "../../hooks/redux";
import { selectAuth } from "../../redux-store/slices/authSlice";
import { useGetAllStaffQuery } from "../../redux-store/services/adminApi";
import { StatCard, type StatCardProps } from "../Admin/AdminDash/StatCard";
import { useGetAllCustomersQuery } from "@/redux-store/services/customer/customerApi";
import { useGetAllVASQuery } from "@/redux-store/services/BikeSystemApi2/VASApi";
import { useGetAllStockItemsQuery } from "@/redux-store/services/BikeSystemApi2/StockConceptApi";
import CustomerQueries from "./Tabs/CustomerQuery";

const BranchManagerDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector(selectAuth);
  const [currentTime, setCurrentTime] = useState(new Date());

  // RTK Query hooks — skip until authenticated to avoid 401s
  const { data: customersData, isLoading: customersLoading } =
    useGetAllCustomersQuery({ page: 1, limit: 1 }, { skip: !isAuthenticated });

  const { data: staffData, isLoading: staffLoading } = useGetAllStaffQuery(
    undefined,
    { skip: !isAuthenticated },
  );

  const { data: vasData, isLoading: vasLoading } = useGetAllVASQuery(
    { page: 1, limit: 1 },
    { skip: !isAuthenticated },
  );

  const { data: stockData, isLoading: stockLoading } = useGetAllStockItemsQuery(
    { page: 1, limit: 1 },
    { skip: !isAuthenticated },
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/manager-login");
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
      title: "Customers",
      value: customersData?.pagination?.total ?? 0,
      icon: User,
      loading: customersLoading,
      description: "Total registered",
      accent: "#f97316",
      action: { label: "Open Sign-up form", href: "/manager/customers/signup" },
    },
    {
      title: "Create Staff Memebers",
      value: staffData?.count ?? 0,
      icon: Settings2,
      loading: staffLoading,
      description: "Active other staff",
      accent: "#427AB5",
      action: {
        label: "Add Other Staff",
        href: "/manager/staff",
      },
    },
    {
      title: "Value-Added Services",
      value: vasData?.total ?? "—",
      icon: TrendingUp,
      loading: vasLoading,
      description: "Activate VAS on vehicles",
      accent: "#10b981",
      action: { label: "Open VAS Manager", href: "/manager/vas/select" },
    },
    {
      title: "Stock Queries",
      value: stockData?.total ?? 0,
      icon: Activity,
      loading: stockLoading,
      description: "Vehicles in branch",
      accent: "#f59e0b",
      action: { label: "Open Stock Manager", href: "/manager/stock/select" },
    },
    {
      title: "Vehicles Request",
      //Add Badge
      value: stockData?.total ?? 0,
      icon: Activity,
      loading: stockLoading,
      description: "Vehicles in branch",
      accent: "#f59e0b",
      action: { label: "Open", href: "/manager/stock/select" },
    },
    {
      title: "Apply Leave",
      //Add Badge

      icon: Activity,
      loading: false,
      description: "Leave Application",
      accent: "#f59e0b",
      action: { label: "Open", href: "/manager/apply-leave" },
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

        <div className='relative container px-4 py-10 md:py-14'>
          <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6'>
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <div className='h-1 w-8 bg-red-500 rounded-full' />
                <span className='text-red-400 text-xs font-semibold tracking-[0.2em] uppercase'>
                  Branch Admin Panel
                </span>
              </div>
              <h1 className='text-3xl md:text-4xl font-bold text-white tracking-tight'>
                {greeting},{" "}
                <span className='bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent'>
                  {user?.name || "Manager"}
                </span>
              </h1>
              <p className='text-gray-400 mt-2 text-sm md:text-base max-w-lg'>
                Manage your branch operations, track service bookings, and
                monitor customer engagement.
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
                    System Online
                  </span>
                </div>
                <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10'>
                  <Building2 className='h-3 w-3 text-gray-400' />
                  <span className='text-gray-400 text-xs font-medium'>
                    Branch Access
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
        <Tabs defaultValue='operations' className='w-full'>
          <TabsList className='inline-flex h-12 w-full md:w-auto bg-white border border-gray-200 shadow-sm rounded-xl p-1 gap-1'>
            <TabsTrigger
              value='operations'
              className='flex items-center gap-2 px-5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md'
            >
              <Cog className='h-4 w-4' />
              <span>Operations</span>
            </TabsTrigger>
            <TabsTrigger
              value='customer-reports'
              className='flex items-center gap-2 px-5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md'
            >
              <MessageSquare className='h-4 w-4' />
              <span>Customer & Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='operations' className='mt-6'>
            <Card className='border border-gray-200 shadow-sm rounded-2xl overflow-hidden'>
              <CardHeader className='bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-6 py-5'>
                <div className='flex items-center gap-3'>
                  <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-gray-900 text-white shadow-sm'>
                    <Building2 className='h-5 w-5' />
                  </div>
                  <div>
                    <CardTitle className='text-lg font-semibold text-gray-900'>
                      Branch Operations
                    </CardTitle>
                    <CardDescription className='text-gray-500 mt-0.5'>
                      Customers, staff, stock, and VAS overview
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='p-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  {operationsStats.map((stat, i) => (
                    <StatCard key={stat.title} {...stat} index={i} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='customer-reports' className='mt-6'>
            <Card className='border border-gray-200 shadow-sm rounded-2xl overflow-hidden'>
              <CardHeader className='bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-6 py-5'>
                <div className='flex items-center gap-3'>
                  <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-red-600 text-white shadow-sm'>
                    <MessageSquare className='h-5 w-5' />
                  </div>
                  <div>
                    <CardTitle className='text-lg font-semibold text-gray-900'>
                      Customer & Reports
                    </CardTitle>
                    <CardDescription className='text-gray-500 mt-0.5'>
                      Enquiries, applications, finance, and accident reports
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CustomerQueries />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BranchManagerDashboard;
