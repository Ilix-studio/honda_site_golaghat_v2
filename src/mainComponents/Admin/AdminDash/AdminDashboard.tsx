import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, MessageSquare, Clock, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Redux
import { useAppSelector } from "../../../hooks/redux";
import { selectAuth } from "../../../redux-store/slices/authSlice";

// Import the new components
import CustomerQueries from "./CustomerQueries";
import BranchQueries from "./BranchQueries";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector(selectAuth);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/superlogin");
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
        {/* Background pattern */}
        <div className='absolute inset-0 opacity-[0.04]'>
          <div
            className='absolute inset-0'
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        {/* Accent glow */}
        <div className='absolute -top-24 -right-24 w-96 h-96 bg-red-600/10 rounded-full blur-3xl' />
        <div className='absolute -bottom-32 -left-32 w-80 h-80 bg-red-500/5 rounded-full blur-3xl' />

        <div className='relative container px-4 py-10 md:py-14'>
          <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6'>
            {/* Left: Greeting */}
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <div className='h-1 w-8 bg-red-500 rounded-full' />
                <span className='text-red-400 text-xs font-semibold tracking-[0.2em] uppercase'>
                  Super Admin Panel
                </span>
              </div>
              <h1 className='text-3xl md:text-4xl font-bold text-white tracking-tight'>
                {greeting},{" "}
                <span className='bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent'>
                  {user?.name || "Admin"}
                </span>
              </h1>
              <p className='text-gray-400 mt-2 text-sm md:text-base max-w-lg'>
                Manage your TsangPool Honda dealership operations, track branch
                performance, and monitor customer engagement.
              </p>
            </div>

            {/* Right: Date + Status */}
            <div className='flex flex-col items-start md:items-end gap-3'>
              <div className='flex items-center gap-2 text-gray-400 text-sm'>
                <Clock className='h-3.5 w-3.5' />
                <span>{formattedDate}</span>
              </div>
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20'>
                  <div className='h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse' />
                  <span className='text-emerald-400 text-xs font-medium'>
                    System Online
                  </span>
                </div>
                <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10'>
                  <Shield className='h-3 w-3 text-gray-400' />
                  <span className='text-gray-400 text-xs font-medium'>
                    Secure Session
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom edge fade */}
        <div className='absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent' />
      </div>

      {/* Main Content */}
      <div className='container px-4 py-8'>
        <Tabs defaultValue='branch-queries' className='w-full'>
          <TabsList className='inline-flex h-12 w-full md:w-auto bg-white border border-gray-200 shadow-sm rounded-xl p-1 gap-1'>
            <TabsTrigger
              value='branch-queries'
              className='flex items-center gap-2 px-5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md'
            >
              <Building2 className='h-4 w-4' />
              <span>Branch Area</span>
            </TabsTrigger>
            <TabsTrigger
              value='customer-queries'
              className='flex items-center gap-2 px-5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md'
            >
              <MessageSquare className='h-4 w-4' />
              <span>Customer Area</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='branch-queries' className='mt-6'>
            <Card className='border border-gray-200 shadow-sm rounded-2xl overflow-hidden'>
              <CardHeader className='bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-6 py-5'>
                <div className='flex items-center gap-3'>
                  <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-gray-900 text-white shadow-sm'>
                    <Building2 className='h-5 w-5' />
                  </div>
                  <div>
                    <CardTitle className='text-lg font-semibold text-gray-900'>
                      Branch Management & Analytics
                    </CardTitle>
                    <CardDescription className='text-gray-500 mt-0.5'>
                      Monitor branch performance, managers, and operations
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='p-6'>
                <BranchQueries />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='customer-queries' className='mt-6'>
            <Card className='border border-gray-200 shadow-sm rounded-2xl overflow-hidden'>
              <CardHeader className='bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-6 py-5'>
                <div className='flex items-center gap-3'>
                  <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-red-600 text-white shadow-sm'>
                    <MessageSquare className='h-5 w-5' />
                  </div>
                  <div>
                    <CardTitle className='text-lg font-semibold text-gray-900'>
                      Customer Analytics & Services
                    </CardTitle>
                    <CardDescription className='text-gray-500 mt-0.5'>
                      Track customer engagement, services, and support metrics
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='p-6'>
                <CustomerQueries />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
