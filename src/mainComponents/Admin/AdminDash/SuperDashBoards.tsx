import { useMemo, useState } from "react";
import {
  useGetDatasetsQuery,
  useGetSalesTimeseriesQuery,
} from "@/redux-store/services/dataImportApi";
import { useGetStockAssignStatsQuery } from "@/redux-store/services/BikeSystemApi2/StockConceptApi";
import { useGetVasAssignStatsQuery } from "@/redux-store/services/BikeSystemApi2/VASApi";
import { StatCard, type StatCardProps } from "./StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Package,
  Layers,
  Wrench,
  Handshake,
  ShieldCheck,
  IndianRupee,
  CalendarDays,
  ReceiptText,
} from "lucide-react";
import type { Granularity } from "@/redux-store/services/dataImport.types";
import SalesTrendChart from "@/mainComponents/DataImport/SalesTrendChart";

import DashboardChartPreview from "@/mainComponents/RAG/DashboardChartPreview";
import type { DashboardSpec } from "@/redux-store/services/ragApi.types";
import StockInvestmentDashboard from "./StockInvestmentDashboard";
import JobCardRevenueKpiCharts from "./JobCardRevenueKpiCharts";
import PartsKpiCharts from "@/mainComponents/PartsM/PartsKpiCharts";
import CounterSaleKpiCharts from "@/mainComponents/CounterSaleM/CounterSaleKpiCharts";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  selectActiveTab,
  setActiveTab,
} from "@/redux-store/slices/dashboardTabsSlice";

const SUPER_DASHBOARDS_TAB_KEY = "superDashBoards";

const YEARS = [2026, 2025, 2024];

function YearSelect({
  year,
  onChange,
}: {
  year: number;
  onChange: (year: number) => void;
}) {
  return (
    <div className='flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 h-9 shadow-sm'>
      <CalendarDays className='h-3.5 w-3.5 text-gray-400' />
      <select
        value={String(year)}
        onChange={(e) => onChange(Number(e.target.value))}
        className='text-sm font-medium text-gray-700 bg-transparent outline-none cursor-pointer'
      >
        {YEARS.map((y) => (
          <option key={y} value={String(y)}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Parts sub-tab — reuses the same rich chart set Part-Admin sees ───────────

function PartsDashboard() {
  return <PartsKpiCharts />;
}

// ─── Service sub-tab — job-card/timetrack batch totals + revenue trend ───────

function ServiceDashboard() {
  const [granularity, setGranularity] = useState<Granularity>("month");
  const { data: jobcardBatches, isLoading: jobcardLoading } =
    useGetDatasetsQuery({
      datasetType: "service-jobcard",
      limit: 100,
    });
  const { data: timetrackBatches, isLoading: timetrackLoading } =
    useGetDatasetsQuery({
      datasetType: "service-timetrack",
      limit: 100,
    });
  const { data: salesData, isLoading: salesLoading } =
    useGetSalesTimeseriesQuery({
      granularity,
    });

  const jobcardRows =
    jobcardBatches?.data?.reduce((sum, b) => sum + b.importedRows, 0) ?? 0;
  const timetrackRows =
    timetrackBatches?.data?.reduce((sum, b) => sum + b.importedRows, 0) ?? 0;

  const timeseries = useMemo(
    () => salesData?.data?.timeseries ?? [],
    [salesData],
  );
  const revenueTotals = useMemo(
    () =>
      timeseries.reduce(
        (acc, t) => ({
          partsRevenue: acc.partsRevenue + t.partsRevenue,
          lubesRevenue: acc.lubesRevenue + t.lubesRevenue,
          totalJobCardRevenue: acc.totalJobCardRevenue + t.totalRevenue,
        }),
        { partsRevenue: 0, lubesRevenue: 0, totalJobCardRevenue: 0 },
      ),
    [timeseries],
  );
  const formatCurrency = (v: number) =>
    v >= 100000
      ? `₹${(v / 100000).toFixed(1)}L`
      : `₹${v.toLocaleString("en-IN")}`;

  const kpis: Omit<StatCardProps, "index">[] = [
    {
      title: "Job Card Rows Imported",
      value: jobcardLoading ? "—" : jobcardRows,
      icon: Wrench,
      loading: jobcardLoading,
      description: "Historical revenue import",
      action: { label: "Upload", href: "/admin/data-import/upload" },
    },
    {
      title: "Time Track Rows Imported",
      value: timetrackLoading ? "—" : timetrackRows,
      icon: Layers,
      loading: timetrackLoading,
      description: "Technician time entries",

      action: { label: "Upload", href: "/admin/data-import/upload" },
    },
  ];

  const revenueKpis: Omit<StatCardProps, "index">[] = [
    {
      title: "Parts Revenue",
      value: salesLoading ? "—" : formatCurrency(revenueTotals.partsRevenue),
      icon: Package,
      loading: salesLoading,
      description: `Selected range (${granularity})`,
      action: { label: "View", href: "/admin/data-import" },
    },
    {
      title: "Lubes Revenue",
      value: salesLoading ? "—" : formatCurrency(revenueTotals.lubesRevenue),
      icon: IndianRupee,
      loading: salesLoading,
      description: `Selected range (${granularity})`,
      action: { label: "View", href: "/admin/data-import" },
    },
    {
      title: "Total Job Card Revenue",
      value: salesLoading
        ? "—"
        : formatCurrency(revenueTotals.totalJobCardRevenue),
      icon: Wrench,
      loading: salesLoading,
      description: `Selected range (${granularity})`,
      action: { label: "View", href: "/admin/data-import" },
    },
  ];

  return (
    <div className='space-y-6'>
      <Card size='sm' className='border border-gray-100 rounded-2xl shadow-sm'>
        <CardHeader>
          <CardTitle className='text-base font-semibold text-gray-900'>
            Job Card Revenue — Invoiced
          </CardTitle>
        </CardHeader>
        <CardContent>
          <JobCardRevenueKpiCharts />
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {kpis.map((kpi, i) => (
          <StatCard key={kpi.title} {...kpi} index={i} />
        ))}
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {revenueKpis.map((kpi, i) => (
          <StatCard key={kpi.title} {...kpi} index={i} />
        ))}
      </div>
      <SalesTrendChart
        granularity={granularity}
        onGranularityChange={setGranularity}
        data={timeseries}
        loading={salesLoading}
      />
    </div>
  );
}

// ─── Stock / VAS Assign sub-tabs — share the same KPI+chart shape ─────────────

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
      value: stats
        ? `₹${stats.totals.totalRevenue.toLocaleString("en-IN")}`
        : "—",
      icon: Layers,
      loading: isLoading,
      description: "Sum of sale price",
      action: { label: "Details", href: "/admin/dashboard" },
    },
  ];

  const spec: DashboardSpec | null = stats
    ? {
        title: `Monthly Stock Assignments — ${year}`,
        chartType: "bar",
        data: stats.monthly,
        xKey: "month",
        yKey: "assignedCount",
      }
    : null;

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
      {spec && <DashboardChartPreview spec={spec} />}
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
      value: stats
        ? `₹${stats.totals.totalRevenue.toLocaleString("en-IN")}`
        : "—",
      icon: Layers,
      loading: isLoading,
      description: "Sum of purchase price",
      action: { label: "Details", href: "/admin/dashboard" },
    },
  ];

  const spec: DashboardSpec | null = stats
    ? {
        title: `Monthly VAS Activations — ${year}`,
        chartType: "bar",
        data: stats.monthly,
        xKey: "month",
        yKey: "activationCount",
      }
    : null;

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
      {spec && <DashboardChartPreview spec={spec} />}
    </div>
  );
}

// ─── Dashboards panel — static KPI dashboards, no AI ──────────────────────────

/**
 * Static Super-Admin dashboards: Parts, Vehicle Stock, Service, Stock Assign,
 * VAS Assign, Stock Investment. Rendered as its own top-level tab in
 * AdminDashboard, separate from the AI Assistant.
 */
export function DashboardsPanel() {
  const dispatch = useAppDispatch();
  const activeTab =
    useAppSelector(selectActiveTab(SUPER_DASHBOARDS_TAB_KEY)) ??
    "stock-investment";

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) =>
        dispatch(setActiveTab({ key: SUPER_DASHBOARDS_TAB_KEY, value: v }))
      }
    >
      <TabsList className='inline-flex h-auto w-full flex-wrap gap-1 bg-gray-100 border border-gray-200 rounded-xl p-1'>
        <TabsTrigger
          value='stock-investment'
          className='flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm'
        >
          <IndianRupee className='h-3.5 w-3.5' />
          <span>Stock Investment</span>
        </TabsTrigger>
        <TabsTrigger
          value='parts'
          className='flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm'
        >
          <Package className='h-3.5 w-3.5' />
          <span>Parts</span>
        </TabsTrigger>

        <TabsTrigger
          value='service'
          className='flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm'
        >
          <Wrench className='h-3.5 w-3.5' />
          <span>Service</span>
        </TabsTrigger>
        <TabsTrigger
          value='stock-assign'
          className='flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm'
        >
          <Handshake className='h-3.5 w-3.5' />
          <span>Stock Assign</span>
        </TabsTrigger>
        <TabsTrigger
          value='vas-assign'
          className='flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm'
        >
          <ShieldCheck className='h-3.5 w-3.5' />
          <span>VAS Assign</span>
        </TabsTrigger>
        <TabsTrigger
          value='counter-sale'
          className='flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm'
        >
          <ReceiptText className='h-3.5 w-3.5' />
          <span>Counter Sale</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value='parts' className='pt-4'>
        <PartsDashboard />
      </TabsContent>
      <TabsContent value='service' className='pt-4'>
        <ServiceDashboard />
      </TabsContent>
      <TabsContent value='stock-assign' className='pt-4'>
        <StockAssignDashboard />
      </TabsContent>
      <TabsContent value='vas-assign' className='pt-4'>
        <VasAssignDashboard />
      </TabsContent>
      <TabsContent value='counter-sale' className='pt-4'>
        <CounterSaleKpiCharts />
      </TabsContent>
      <TabsContent value='stock-investment' className='pt-4'>
        <StockInvestmentDashboard />
      </TabsContent>
    </Tabs>
  );
}
