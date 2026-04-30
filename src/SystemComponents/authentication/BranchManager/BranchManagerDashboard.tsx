// mainComponents/Admin/BranchM/BranchManagerDashboard.tsx
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
import {
  Calendar,
  FileText,
  Package,
  Wrench,
  DollarSign,
  Clock,
  Home,
  Building2,
  Plus,
  UserPlus,
  Upload,
  Settings,
} from "lucide-react";
import { useAppSelector } from "../../../hooks/redux";
import { selectAuth } from "../../../redux-store/slices/authSlice";

const BranchManagerDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector(selectAuth);
  const [currentTime, setCurrentTime] = useState(new Date());

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

  const menuItems = [
    {
      title: "Service Bookings",
      description: "Manage service appointments",
      icon: Calendar,
      path: "/manager/service-bookings",
      color: "bg-blue-500",
    },
    {
      title: "Accident Reports",
      description: "View and manage accident reports",
      icon: FileText,
      path: "/manager/accident-reports",
      color: "bg-red-500",
    },

    {
      title: "Stock Management",
      description: "Manage branch stock",
      icon: Package,
      path: "/manager/stock",
      color: "bg-orange-500",
    },
    {
      title: "Value Added Services",
      description: "Manage VAS offerings",
      icon: Wrench,
      path: "/manager/vas",
      color: "bg-cyan-500",
    },
    {
      title: "Customer Vehicles",
      description: "View customer vehicle information",
      icon: Settings,
      path: "/manager/customer-vehicles",
      color: "bg-pink-500",
    },
    {
      title: "Finance Queries",
      description: "Manage finance enquiries",
      icon: DollarSign,
      path: "/manager/finance-queries",
      color: "bg-yellow-500",
    },
  ];

  const quickActions = [
    {
      title: "Add Stock",
      icon: Plus,
      path: "/manager/stockC/select",
      color: "text-orange-600 bg-orange-50 hover:bg-orange-100",
    },
    {
      title: "Upload CSV",
      icon: Upload,
      path: "/manager/forms/stock-concept-csv",
      color: "text-blue-600 bg-blue-50 hover:bg-blue-100",
    },
    {
      title: "Add VAS",
      icon: Wrench,
      path: "/manager/vas/select",
      color: "text-cyan-600 bg-cyan-50 hover:bg-cyan-100",
    },
    {
      title: "Register Customer",
      icon: UserPlus,
      path: "/customers/signup",
      color: "text-green-600 bg-green-50 hover:bg-green-100",
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
                  {(user as any)?.applicationId || user?.name || "Manager"}
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
      <div className='container px-4 py-8 space-y-6'>
        {/* Quick Actions */}
        <Card className='border border-gray-200 shadow-sm rounded-2xl overflow-hidden'>
          <CardHeader className='px-6 py-4 border-b border-gray-100'>
            <CardTitle className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className='p-4'>
            <div className='flex flex-wrap gap-3'>
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${action.color}`}
                  >
                    <Icon className='h-4 w-4' />
                    {action.title}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Operations Grid */}
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
                  Quick access to branch management features
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.path}
                    className='group cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300'
                    onClick={() => navigate(item.path)}
                  >
                    <CardContent className='p-6'>
                      <div className='flex items-start gap-4'>
                        <div
                          className={`flex items-center justify-center h-12 w-12 rounded-xl ${item.color} text-white shadow-sm group-hover:scale-110 transition-transform duration-200`}
                        >
                          <Icon className='h-6 w-6' />
                        </div>
                        <div className='flex-1'>
                          <h3 className='font-semibold text-gray-900 mb-1'>
                            {item.title}
                          </h3>
                          <p className='text-sm text-gray-500'>
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BranchManagerDashboard;
