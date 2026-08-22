import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import { useAppDispatch, useAppSelector } from "../../../../hooks/redux";
import { useGetStockAssignStatsQuery } from "@/redux-store/services/BikeSystemApi2/StockConceptApi";
import { useGetVasAssignStatsQuery } from "@/redux-store/services/BikeSystemApi2/VASApi";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Layers, Handshake, ShieldCheck } from "lucide-react";

import { StatCard, StatCardProps } from "../StatCard";
import { YearSelect } from "../SuperDashBoards";
import {
  ChartSkeleton,
  EmptyChartState,
  compactInr,
  inr,
} from "@/mainComponents/DataImport/SalesKpiCharts";
import { useGetCSVStockAssignStatsQuery } from "@/redux-store/services/BikeSystemApi3/csvStockApi";
import {
  selectActiveTab,
  setActiveTab,
} from "@/redux-store/slices/dashboardTabsSlice";
import SalesReportKPIs from "./SalesReportKPIs";
import ChallanReportKPIs from "./ChallanReportKPIs";

// ─── Shared chart shape ──────────────────────────────────────────────────────

/**
 * All three assign dashboards plot the same two things — a monthly count and
 * (where the endpoint returns it) monthly revenue — so the chart pair lives
 * here once. Each is a single series, so identity comes from the card title
 * and neither needs a legend or a second hue.
 */
const countConfig: ChartConfig = {
  count: { label: "Count", color: "var(--chart-1)" },
};

const revenueConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-2)" },
};

interface AssignMonthlyPoint {
  month: string;
  count: number;
  revenue?: number;
}

function AssignCharts({
  monthly,
  countTitle,
  countDescription,
  revenueDescription,
  loading,
  emptyMessage,
}: {
  monthly: AssignMonthlyPoint[];
  countTitle: string;
  countDescription: string;
  /** Omitted when the endpoint returns no monthly revenue (CSV assign). */
  revenueDescription?: string;
  loading: boolean;
  emptyMessage: string;
}) {
  if (loading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  const hasCount = monthly.some((m) => m.count > 0);
  const hasRevenue =
    revenueDescription !== undefined &&
    monthly.some((m) => (m.revenue ?? 0) > 0);

  if (!hasCount && !hasRevenue) {
    return <EmptyChartState message={emptyMessage} />;
  }

  return (
    <div
      className={`grid grid-cols-1 gap-4 ${hasRevenue ? "md:grid-cols-2" : ""}`}
    >
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>{countTitle}</CardTitle>
          <CardDescription>{countDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={countConfig} className='h-[240px] w-full'>
            <BarChart data={monthly} margin={{ left: 0, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={32}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey='count' fill='var(--color-count)' radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {hasRevenue && (
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Monthly Revenue</CardTitle>
            <CardDescription>{revenueDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className='h-[240px] w-full'>
              <AreaChart data={monthly} margin={{ left: 0, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey='month'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={56}
                  tickFormatter={compactInr}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => inr(Number(value))}
                    />
                  }
                />
                <Area
                  dataKey='revenue'
                  type='monotone'
                  fill='var(--color-revenue)'
                  fillOpacity={0.2}
                  stroke='var(--color-revenue)'
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Stock / CSV / VAS Assign sub-tabs — share the same KPI+chart shape ───────

function StockAssignDashboard() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, isLoading } = useGetStockAssignStatsQuery({ year });
  const stats = data?.data;

  const kpis: Omit<StatCardProps, "index">[] = [
    {
      title: "Bikes Assigned",
      value: stats?.totals.totalAssigned ?? "—",
      icon: Handshake,
      loading: isLoading,
      description: `Year ${year}, all branches`,
      action: { label: "Details", href: "/admin/dashboard" },
    },
    {
      title: "Revenue",
      value: stats ? inr(stats.totals.totalRevenue) : "—",
      icon: Layers,
      loading: isLoading,
      description: "Sum of sale price",
      action: { label: "Details", href: "/admin/dashboard" },
    },
  ];

  const monthly: AssignMonthlyPoint[] = (stats?.monthly ?? []).map((m) => ({
    month: m.month,
    count: m.assignedCount,
    revenue: m.revenue,
  }));

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-end'>
        <YearSelect year={year} onChange={setYear} />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {kpis.map((kpi, i) => (
          <StatCard key={kpi.title} {...kpi} index={i} />
        ))}
      </div>
      <AssignCharts
        monthly={monthly}
        loading={isLoading}
        countTitle='Monthly Stock Assignments'
        countDescription={`Bikes assigned per month in ${year}`}
        revenueDescription={`Sale price of assigned stock per month in ${year}`}
        emptyMessage={`No stock assigned in ${year} yet.`}
      />
    </div>
  );
}

function CSVAssignDashboard() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, isLoading } = useGetCSVStockAssignStatsQuery({ year });
  const stats = data?.data;

  const kpis: Omit<StatCardProps, "index">[] = [
    {
      title: "Bikes Assigned",
      value: stats?.totals.totalAssigned ?? "—",
      icon: Handshake,
      loading: isLoading,
      description: "All branches",
      action: { label: "Details", href: "/admin/dashboard" },
    },
    {
      title: "Revenue",
      value: stats ? inr(stats.totals.totalRevenue) : "—",
      icon: Layers,
      loading: isLoading,
      description: "Sum of sale price",
      action: { label: "Details", href: "/admin/dashboard" },
    },
  ];

  // The CSV assign-stats endpoint returns no per-month revenue, only counts,
  // so this dashboard gets the bar chart alone rather than a stubbed area.
  const monthly: AssignMonthlyPoint[] = (stats?.monthly ?? []).map((m) => ({
    month: m.month,
    count: m.assignedCount,
  }));

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-end'>
        <YearSelect year={year} onChange={setYear} />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {kpis.map((kpi, i) => (
          <StatCard key={kpi.title} {...kpi} index={i} />
        ))}
      </div>
      <AssignCharts
        monthly={monthly}
        loading={isLoading}
        countTitle='Monthly CSV Stock Assignments'
        countDescription={`Bikes assigned per month in ${year}`}
        emptyMessage={`No CSV stock assigned in ${year} yet.`}
      />
    </div>
  );
}

function VasAssignDashboard() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, isLoading } = useGetVasAssignStatsQuery({ year });
  const stats = data?.data;

  const kpis: Omit<StatCardProps, "index">[] = [
    {
      title: "VAS Activations",
      value: stats?.totals.totalActivations ?? "—",
      icon: ShieldCheck,
      loading: isLoading,
      description: `Year ${year}, all branches`,
      action: { label: "Details", href: "/admin/dashboard" },
    },
    {
      title: "Revenue",
      value: stats ? inr(stats.totals.totalRevenue) : "—",
      icon: Layers,
      loading: isLoading,
      description: "Sum of purchase price",
      action: { label: "Details", href: "/admin/dashboard" },
    },
  ];

  const monthly: AssignMonthlyPoint[] = (stats?.monthly ?? []).map((m) => ({
    month: m.month,
    count: m.activationCount,
    revenue: m.revenue,
  }));

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-end'>
        <YearSelect year={year} onChange={setYear} />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {kpis.map((kpi, i) => (
          <StatCard key={kpi.title} {...kpi} index={i} />
        ))}
      </div>
      <AssignCharts
        monthly={monthly}
        loading={isLoading}
        countTitle='Monthly VAS Activations'
        countDescription={`VAS activated per month in ${year}`}
        revenueDescription={`Purchase price of activated VAS per month in ${year}`}
        emptyMessage={`No VAS activated in ${year} yet.`}
      />
    </div>
  );
}

const KPI_DASHBOARD_TAB_KEY = "KPIDashboardSecond";

export function ManualAssignDashboard() {
  const dispatch = useAppDispatch();
  const activeTab =
    useAppSelector(selectActiveTab(KPI_DASHBOARD_TAB_KEY)) ?? "ManualAssign";

  return (
    <div className='space-y-8'>
      <Tabs
        value={activeTab}
        onValueChange={(v) =>
          dispatch(setActiveTab({ key: KPI_DASHBOARD_TAB_KEY, value: v }))
        }
        className='space-y-4'
      >
        <TabsList className='inline-flex h-12 w-full md:w-auto bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md rounded-xl p-1 gap-1'>
          <TabsTrigger
            value='ManualAssign'
            className='flex items-center gap-2 px-5 rounded-lg text-sm font-medium text-gray-500 transition-all duration-200 hover:text-blue-700 hover:bg-blue-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md'
          >
            <Handshake className='h-4 w-4' />
            <span className='font-semibold'>ManualAssign</span>
          </TabsTrigger>

          <TabsTrigger
            value='CSVAssign'
            className='flex items-center gap-1.5 px-5 rounded-lg text-sm font-medium text-gray-500 transition-all duration-200 hover:text-gray-900 hover:bg-gray-50 data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md'
          >
            <span className='font-semibold'>CSV Assign</span>
          </TabsTrigger>
          <TabsTrigger
            value='SalesReport'
            className='flex items-center gap-1.5 px-5 rounded-lg text-sm font-medium text-gray-500 transition-all duration-200 hover:text-gray-900 hover:bg-gray-50 data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md'
          >
            <span className='font-semibold'>Sales Report</span>
          </TabsTrigger>
          <TabsTrigger
            value='ChallanReport'
            className='flex items-center gap-1.5 px-5 rounded-lg text-sm font-medium text-gray-500 transition-all duration-200 hover:text-gray-900 hover:bg-gray-50 data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md'
          >
            <span className='font-semibold'>Challan Report</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='ManualAssign' className='space-y-6'>
          <StockAssignDashboard />
          <div className='border-t border-gray-200' />
          <div>
            <div className='flex items-center gap-2 mb-4'>
              <ShieldCheck className='h-4 w-4 text-gray-500' />
              <h3 className='text-sm font-semibold text-gray-700'>
                VAS Assign
              </h3>
            </div>
            <VasAssignDashboard />
          </div>
        </TabsContent>

        <TabsContent value='CSVAssign' className='mt-2'>
          <CSVAssignDashboard />
        </TabsContent>
        <TabsContent value='SalesReport' className='mt-2'>
          <SalesReportKPIs />
        </TabsContent>
        <TabsContent value='ChallanReport' className='mt-2'>
          <ChallanReportKPIs />
        </TabsContent>
      </Tabs>
    </div>
  );
}
