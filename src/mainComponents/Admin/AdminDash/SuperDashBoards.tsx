import { useState } from "react";

import { useGetStockAssignStatsQuery } from "@/redux-store/services/BikeSystemApi2/StockConceptApi";
import { useGetVasAssignStatsQuery } from "@/redux-store/services/BikeSystemApi2/VASApi";
import { StatCard, type StatCardProps } from "./StatCard";

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

import DashboardChartPreview from "@/mainComponents/RAG/DashboardChartPreview";
import type { DashboardSpec } from "@/redux-store/services/ragApi.types";
import StockInvestmentDashboard from "./StockInvestmentDashboard";

import PartsKpiCharts from "@/mainComponents/PartsM/PartsKpiCharts";
import ServiceJobcardKpiCharts from "@/mainComponents/ServiceM/ServiceJobcardKpiCharts";
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

// ─── Service sub-tab — job-card revenue (dedicated KPI set) + timetrack batch total ───

function ServiceDashboard() {
  return (
    <div className='space-y-6'>
      {/* <Card size='sm' className='border border-gray-100 rounded-2xl shadow-sm'>
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
      </div> */}

      <ServiceJobcardKpiCharts />
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

// ─── Manual Assign sub-tab — combines Stock Assign + VAS Assign ───────────────

function ManualAssignDashboard() {
  return (
    <div className='space-y-8'>
      <div>
        <div className='flex items-center gap-2 mb-4'>
          <Handshake className='h-4 w-4 text-gray-500' />
          <h3 className='text-sm font-semibold text-gray-700'>Stock Assign</h3>
        </div>
        <StockAssignDashboard />
      </div>

      <div className='border-t border-gray-200' />

      <div>
        <div className='flex items-center gap-2 mb-4'>
          <ShieldCheck className='h-4 w-4 text-gray-500' />
          <h3 className='text-sm font-semibold text-gray-700'>VAS Assign</h3>
        </div>
        <VasAssignDashboard />
      </div>
    </div>
  );
}

// ─── Tab ownership tags — which admin role's uploads feed each tab ───────────

type OwnerRole = "BA" | "PA" | "SA";

const OWNER_ROLE_LABEL: Record<OwnerRole, string> = {
  BA: "Branch Admin",
  PA: "Parts Admin",
  SA: "Service Admin",
};

const OWNER_ROLE_STYLE: Record<OwnerRole, string> = {
  BA: "bg-purple-100 text-purple-700",
  PA: "bg-amber-100 text-amber-700",
  SA: "bg-green-100 text-green-700",
};

function TabRoleTag({ role }: { role: OwnerRole }) {
  return (
    <span
      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none ${OWNER_ROLE_STYLE[role]}`}
    >
      {role}
    </span>
  );
}

function TabOwnershipLegend() {
  return (
    <div className='flex items-center flex-wrap gap-x-4 gap-y-1 mb-2 text-xs text-gray-500'>
      <span className='font-medium text-gray-400'>Data owned by:</span>
      {(Object.keys(OWNER_ROLE_LABEL) as OwnerRole[]).map((role) => (
        <span key={role} className='flex items-center gap-1'>
          <TabRoleTag role={role} />
          <span>{OWNER_ROLE_LABEL[role]}</span>
        </span>
      ))}
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
      <TabOwnershipLegend />

      <TabsList className='inline-flex h-auto w-full flex-wrap gap-1 bg-gray-100 border border-gray-200 rounded-xl p-1'>
        <TabsTrigger
          value='stock-investment'
          className='flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm'
        >
          <span className='flex items-center gap-1.5'>
            <IndianRupee className='h-3.5 w-3.5' />
            <span>Stock Investment</span>
          </span>
          <TabRoleTag role='BA' />
        </TabsTrigger>
        <TabsTrigger
          value='parts'
          className='flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm'
        >
          <span className='flex items-center gap-1.5'>
            <Package className='h-3.5 w-3.5' />
            <span>Parts</span>
          </span>
          <TabRoleTag role='PA' />
        </TabsTrigger>

        <TabsTrigger
          value='service'
          className='flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm'
        >
          <span className='flex items-center gap-1.5'>
            <Wrench className='h-3.5 w-3.5' />
            <span>Service</span>
          </span>
          <TabRoleTag role='SA' />
        </TabsTrigger>

        <TabsTrigger
          value='counter-sale'
          className='flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm'
        >
          <span className='flex items-center gap-1.5'>
            <ReceiptText className='h-3.5 w-3.5' />
            <span>Counter Sale</span>
          </span>
          <TabRoleTag role='PA' />
        </TabsTrigger>
        <TabsTrigger
          value='manual-assign'
          className='flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm'
        >
          <span className='flex items-center gap-1.5'>
            <Handshake className='h-3.5 w-3.5' />
            <span>Manual Assign</span>
          </span>
          <TabRoleTag role='BA' />
        </TabsTrigger>
      </TabsList>

      <TabsContent value='stock-investment' className='pt-4'>
        <StockInvestmentDashboard />
      </TabsContent>

      <TabsContent value='parts' className='pt-4'>
        <PartsDashboard />
      </TabsContent>
      <TabsContent value='service' className='pt-4'>
        <ServiceDashboard />
      </TabsContent>
      <TabsContent value='counter-sale' className='pt-4'>
        <CounterSaleKpiCharts />
      </TabsContent>
      <TabsContent value='manual-assign' className='pt-4'>
        <ManualAssignDashboard />
      </TabsContent>
    </Tabs>
  );
}
