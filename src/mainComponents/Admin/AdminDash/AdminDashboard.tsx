import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Clock, Home, Package, Bot, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Redux
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
  selectIsAdmin,
  selectUser,
} from "../../../redux-store/slices/authSlice";
import {
  selectActiveTab,
  setActiveTab,
} from "../../../redux-store/slices/dashboardTabsSlice";

// Import the new components
import BranchQueries from "./BranchQueries";

import { Button } from "@/components/ui/button";
import { DashboardsPanel } from "./SuperDashBoards";
import AiAssistantPanel from "./AiAssistantPanel";

const ADMIN_DASHBOARD_TAB_KEY = "adminDashboard";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectIsAdmin);
  const user = useAppSelector(selectUser);
  const activeTab =
    useAppSelector(selectActiveTab(ADMIN_DASHBOARD_TAB_KEY)) ?? "dashboards";
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin/login");
    }
  }, [isAdmin, navigate]);

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

  if (!isAdmin) {
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
      <div className='relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-red-950 rounded-b-xl shadow-md '>
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

        <div className='relative container px-4 py-6 md:py-8'>
          <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-4'>
            {/* Left: Greeting */}
            <div>
              <div className='flex items-center gap-2 mb-2'>
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
              <p className='text-gray-400 mt-1.5 text-sm md:text-base max-w-lg'>
                Manage your TsangPool Honda dealership operations, track branch
                performance, and monitor customer engagement.
              </p>
            </div>

            {/* Right: Date + Status */}
            <div className='flex flex-col items-start md:items-end gap-2'>
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
            </div>
          </div>
        </div>

        {/* Bottom edge fade */}
        <div className='absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent' />
      </div>

      {/* Main Content */}
      <div className='container px-2 py-2'>
        <Tabs
          value={activeTab}
          onValueChange={(v) =>
            dispatch(setActiveTab({ key: ADMIN_DASHBOARD_TAB_KEY, value: v }))
          }
          className='w-full'
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className='sticky top-1 z-10 mb-0.1'
          >
            <TabsList className='inline-flex h-12 w-full md:w-auto bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md rounded-xl p-1 gap-1'>
              <TabsTrigger
                value='dashboards'
                className='flex items-center gap-2 px-5 rounded-lg text-sm font-medium text-gray-500 transition-all duration-200 hover:text-blue-700 hover:bg-blue-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md'
              >
                <Bot className='h-4 w-4' />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger
                value='branch-queries'
                className='flex items-center gap-1.5 px-5 rounded-lg text-sm font-medium text-gray-500 transition-all duration-200 hover:text-gray-900 hover:bg-gray-50 data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md'
              >
                <Building2 className='h-4 w-4' />
                <span>Branch Area</span>
              </TabsTrigger>

              <TabsTrigger
                value='ai-assistant'
                className='flex items-center gap-2 px-5 rounded-lg text-sm font-medium text-gray-500 transition-all duration-200 hover:text-violet-700 hover:bg-violet-50 data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md'
              >
                <Sparkles className='h-4 w-4' />
                <span>AI</span>
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value='dashboards' className='mt-2'>
            <Card
              size='sm'
              className='border border-gray-200 shadow-sm rounded-2xl overflow-hidden'
            >
              <CardHeader className='bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-4 py-3'>
                <div className='flex items-center gap-3'>
                  <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-blue-600 text-white shadow-sm'>
                    <Package className='h-5 w-5' />
                  </div>
                  <div>
                    <CardTitle className='text-lg font-semibold text-gray-900'>
                      Dashboards
                    </CardTitle>
                    <CardDescription className='text-gray-500 mt-0.5'>
                      Dashboard KPIs across branches
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='p-2'>
                <DashboardsPanel />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='branch-queries' className='mt-2'>
            <Card
              size='sm'
              className='border border-gray-200 shadow-sm rounded-2xl overflow-hidden'
            >
              <CardHeader className='bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-4 py-3'>
                <div className='flex items-center gap-2'>
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
              <CardContent className='p-2'>
                <BranchQueries />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='ai-assistant' className='mt-2'>
            <Card
              size='sm'
              className='border border-gray-200 shadow-sm rounded-2xl overflow-hidden'
            >
              <CardHeader className='bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-4 py-3'>
                <div className='flex items-center gap-3'>
                  <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-violet-600 text-white shadow-sm'>
                    <Sparkles className='h-5 w-5' />
                  </div>
                  <div>
                    <CardTitle className='text-lg font-semibold text-gray-900'>
                      AI Assistant
                    </CardTitle>
                    <CardDescription className='text-gray-500 mt-0.5'>
                      Ask questions grounded in live data, with chart previews
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='p-2'>
                <AiAssistantPanel />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
