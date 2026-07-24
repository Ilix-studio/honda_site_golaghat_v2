import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useGetPartsStatsQuery } from "@/redux-store/services/partsApi";
import {
  useGetDatasetsQuery,
  useGetDatasetRowsQuery,
} from "@/redux-store/services/dataImportApi";
import {
  StatCard,
  type StatCardProps,
} from "@/mainComponents/Admin/AdminDash/StatCard";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  UploadCloud,
  Boxes,
  Wallet,
  ShoppingCart,
  Cog,
  TrendingUp,
  Users,
  ReceiptText,
  Webhook,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { selectAuth } from "@/redux-store/slices/authSlice";
import {
  selectActiveTab,
  setActiveTab,
} from "@/redux-store/slices/dashboardTabsSlice";
import { useGetNewCustomersQuery } from "@/redux-store/services/customer/customerAdminApi";
import PartsKpiCharts from "./PartsKpiCharts";
import { useGetCounterSaleBatchesQuery } from "@/redux-store/services/counterSaleApi";

const YEARS = [2026, 2025, 2024];
const PARTS_ADMIN_DASHBOARD_TAB_KEY = "partsAdminDashboard";

export default function PartsAdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector(selectAuth);
  const activeTab =
    useAppSelector(selectActiveTab(PARTS_ADMIN_DASHBOARD_TAB_KEY)) ??
    "operations";
  const [year, setYear] = useState(new Date().getFullYear());
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: statsData, isLoading: statsLoading } = useGetPartsStatsQuery(
    {
      year,
    },
    { skip: !isAuthenticated },
  );

  const stats = statsData?.data;

  // Latest parts-stock import (from the generic DataImport module)
  const { data: stockBatches, isLoading: stockBatchesLoading } =
    useGetDatasetsQuery({
      datasetType: "parts-stock",
      page: 1,
      limit: 1,
    });
  const latestStockBatchId = stockBatches?.data?.[0]?.batchId;
  const { data: stockRows, isLoading: stockRowsLoading } =
    useGetDatasetRowsQuery(
      { batchId: latestStockBatchId as string, page: 1, limit: 1000 },
      { skip: !latestStockBatchId },
    );
  const { data: counterSaleBatches, isLoading: counterSaleBatchesLoading } =
    useGetCounterSaleBatchesQuery(undefined, {
      skip: !isAuthenticated,
    });

  const stockKpis = useMemo(() => {
    const rows = stockRows?.data ?? [];
    const totalQuantity = rows.reduce(
      (sum, r) => sum + (Number(r.normalized?.quantity) || 0),
      0,
    );
    const totalStockValue = rows.reduce(
      (sum, r) => sum + (Number(r.normalized?.stockValue) || 0),
      0,
    );
    return { totalQuantity, totalStockValue };
  }, [stockRows]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  // Parts sold (from invoice dataset)
  const { data: invoiceBatches, isLoading: invoiceBatchesLoading } =
    useGetDatasetsQuery({
      datasetType: "invoice",
      page: 1,
      limit: 1,
    });
  const latestInvoiceBatchId = invoiceBatches?.data?.[0]?.batchId;
  const { data: invoiceRows, isLoading: invoiceRowsLoading } =
    useGetDatasetRowsQuery(
      { batchId: latestInvoiceBatchId as string, page: 1, limit: 1000 },
      { skip: !latestInvoiceBatchId },
    );

  const partsSold = useMemo(() => {
    const rows = invoiceRows?.data ?? [];
    const totalAmount = rows.reduce(
      (sum, r) => sum + (Number(r.normalized?.totalAmount) || 0),
      0,
    );
    return { count: rows.length, totalAmount };
  }, [invoiceRows]);
  const { data: newCustomersData, isLoading: newCustomersLoading } =
    useGetNewCustomersQuery({ limit: 1 }, { skip: !isAuthenticated });

  const kpis: Omit<StatCardProps, "index">[] = [
    {
      title: "Total Parts",
      value: stats?.totals.totalParts ?? "—",
      icon: Package,
      loading: statsLoading,
      description: "View Upload Records",
      action: { label: "View parts", href: "/part-admin/folder" },
    },

    {
      title: "View Customer List",
      value: newCustomersData?.pagination.total ?? 0,
      icon: Users,
      loading: newCustomersLoading,
      description: "All Customer Detected by this project",
      action: { label: "Open", href: "/customers/new" },
    },
    {
      title: "Counter Sale Reports",
      value: counterSaleBatches?.data?.length ?? 0,
      loading: counterSaleBatchesLoading,
      icon: ReceiptText,
      description: "Upload and browse channel-partner counter sale reports",
      action: { label: "Open", href: "/part-admin/counter-sale" },
    },
  ];

  const stockValueKpis: Omit<StatCardProps, "index">[] = [
    {
      title: "Stock Quantity",
      value:
        stockBatchesLoading || stockRowsLoading ? "—" : stockKpis.totalQuantity,
      icon: Boxes,
      loading: stockBatchesLoading || stockRowsLoading,
      description: latestStockBatchId
        ? `From batch ${latestStockBatchId}`
        : "No parts-stock import yet",

      action: {
        label: "Upload stock file",
        href: "/part-admin/parts-stock/upload",
      },
    },
    {
      title: "Stock Value",
      value:
        stockBatchesLoading || stockRowsLoading
          ? "—"
          : `₹${stockKpis.totalStockValue.toLocaleString("en-IN")}`,
      icon: Wallet,
      loading: stockBatchesLoading || stockRowsLoading,
      description: "Sum of stock value, latest batch",

      action: {
        label: "Upload stock file",
        href: "/part-admin/parts-stock/upload",
      },
    },
    {
      title: "Parts Sold",
      value:
        invoiceBatchesLoading || invoiceRowsLoading ? "—" : partsSold.count,
      icon: ShoppingCart,
      loading: invoiceBatchesLoading || invoiceRowsLoading,
      description: `₹${partsSold.totalAmount.toLocaleString("en-IN")} from invoices`,

      action: {
        label: "Upload invoice",
        href: "/part-admin/data-import/upload",
      },
    },
  ];
  const greeting = (() => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  })();

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Hero Banner */}
      <div className='relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-red-950 rounded-b-xl shadow-md'>
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
                <div className='h-1 w-8 bg-blue-500 rounded-full' />
                <span className='text-blue-400 text-xs font-semibold tracking-[0.2em] uppercase'>
                  Parts Admin Panel
                </span>
              </div>
              <h1 className='text-3xl md:text-4xl font-bold text-white tracking-tight'>
                {greeting},{" "}
                <span className='bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent'>
                  {user?.name || "Manager"}
                </span>
              </h1>
              <p className='text-gray-400 mt-2 text-sm md:text-base max-w-lg'>
                Manage your service operations, track service bookings, and open
                job cards for customers.
              </p>
            </div>

            <div className='flex flex-col items-start md:items-end gap-3'>
              <Button
                className='text-white text-xs gap-1.5 font-medium px-3 py-1.5 rounded-full border-2 bg-white/5 border-blue-700 hover:bg-blue-700/10 hover:text-gray-200 transition-all duration-200'
                onClick={() => navigate("/part-admin/profile")}
              >
                <Webhook className='h-3 w-3 text-white' /> See Profile
              </Button>
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20'>
                  <div className='h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse' />
                  <span className='text-blue-400 text-xs font-medium'>
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
        <Tabs
          value={activeTab}
          onValueChange={(v) =>
            dispatch(
              setActiveTab({ key: PARTS_ADMIN_DASHBOARD_TAB_KEY, value: v }),
            )
          }
          className='w-full'
        >
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
                <div className='flex items-center justify-between flex-wrap gap-3'>
                  <div className='flex items-center gap-3'>
                    <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-gray-900 text-white shadow-sm'>
                      <Package className='h-5 w-5' />
                    </div>
                    <div>
                      <CardTitle className='text-lg font-semibold text-gray-900'>
                        Parts Operations
                      </CardTitle>
                      <CardDescription className='text-gray-500 mt-0.5'>
                        Report uploads, review queue, and inventory overview
                      </CardDescription>
                    </div>
                  </div>
                  <Link to='/part-admin/parts-stock/upload'>
                    <Button className='bg-gray-600 hover:bg-blue-700'>
                      <UploadCloud className='w-4 h-4 mr-2' />
                      Upload Report
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className='p-2'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  {kpis.map((kpi, i) => (
                    <StatCard key={kpi.title} {...kpi} index={i} />
                  ))}
                </div>
              </CardContent>

              <CardContent className='p-2 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm'>
                <div className='flex items-center justify-between flex-wrap gap-3 p-3'>
                  <h3 className='text-sm font-semibold text-gray-900'>
                    Monthly Parts Imported — {year}
                  </h3>
                  <select
                    value={String(year)}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className='h-9 rounded-md border border-gray-200 bg-white px-3 text-sm'
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                {statsLoading ? (
                  <div className='h-56 flex items-center justify-center'>
                    <p className='text-sm text-gray-400 animate-pulse'>
                      Loading chart...
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width='100%' height={240}>
                    <BarChart
                      data={stats?.monthly}
                      margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                      <XAxis
                        dataKey='month'
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        allowDecimals={false}
                      />
                      <Tooltip />
                      <Bar
                        dataKey='partCount'
                        fill='#2563eb'
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
              {/* <RagAssistant
                title='Parts AI Assistant'
                subtitle='Ask questions about your branch parts data — answers are grounded in the uploaded reports.'
                sourceTypes={["parts"]}
                placeholder='e.g. Which month had the most parts imported?'
              /> */}
            </Card>
          </TabsContent>

          <TabsContent value='sales-data' className='mt-2'>
            <div className='flex justify-end'>
              <Link to='/part-admin/parts-stock/upload'>
                <Button className='bg-green-700 text-white hover:bg-blue-700'>
                  <UploadCloud className='w-4 h-4 mr-2' />
                  Upload Data
                </Button>
              </Link>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 py-3'>
              {stockValueKpis.map((kpi, i) => (
                <StatCard key={kpi.title} {...kpi} index={i} />
              ))}
            </div>

            <PartsKpiCharts />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
