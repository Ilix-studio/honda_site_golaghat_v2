import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Package,
  Wrench,
  Handshake,
  CalendarDays,
  ReceiptText,
  Vegan,
} from "lucide-react";

import StockInvestmentDashboard from "./StockInvestmentDashboard";

import PartsKpiCharts from "@/mainComponents/PartsM/PartsKpiCharts";
import ServiceJobcardKpiCharts from "@/mainComponents/ServiceM/ServiceJobcardKpiCharts";
import CounterSaleKpiCharts from "@/mainComponents/CounterSaleM/CounterSaleKpiCharts";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  selectActiveTab,
  setActiveTab,
} from "@/redux-store/slices/dashboardTabsSlice";
import { ManualAssignDashboard } from "./KPIDashs/AssignSystem";

const SUPER_DASHBOARDS_TAB_KEY = "superDashBoards";

const YEARS = [2026, 2025, 2024];

export function YearSelect({
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

// ─── Tab ownership tags — which admin role's uploads feed each tab ───────────

type OwnerRole = "BA" | "PA" | "SA";

const OWNER_ROLE_LABEL: Record<OwnerRole, string> = {
  BA: "Branch Admin",
  PA: "Parts Admin",
  SA: "Service Admin",
};

const OWNER_ROLE_STYLE: Record<OwnerRole, string> = {
  BA: "bg-purple-100 text-purple-700",
  PA: "bg-amber-100 text-red-700",
  SA: "bg-green-100 text-green-700",
};

function TabRoleTag({ role }: { role: OwnerRole }) {
  return (
    <span
      className={`text-[13px] text-center w-18 flex-1 ... font-semibold px-1.5 py-0.5 rounded-2xl leading-none ${OWNER_ROLE_STYLE[role]}`}
    >
      {role}
    </span>
  );
}

function TabOwnershipLegend() {
  return (
    <div className='flex items-center flex-wrap gap-x-4 gap-y-1 mb-2 text-xs text-gray-700'>
      <span className='font-medium text-gray-900'>Data owned by:</span>
      {(Object.keys(OWNER_ROLE_LABEL) as OwnerRole[]).map((role) => (
        <span key={role} className='flex items-center gap-4'>
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

      <TabsList className='inline-flex h-auto w-full flex-wrap gap-1 bg-gray-200 border border-gray-400 rounded-xl p-1'>
        <TabsTrigger
          value='stock-investment'
          className=' justify-start   px-4  py-2 rounded-lg text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm'
        >
          <div className='flex flex-row '>
            <Vegan className='h-2.0 w-2.0  flex-none ...' />
            <span className='w-18 flex-none ...'>Vehicle</span>
            <TabRoleTag role='BA' />
          </div>
        </TabsTrigger>
        <TabsTrigger
          value='manual-assign'
          className='flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm'
        >
          <div className='flex flex-row  gap-1.5 '>
            <Handshake className='h-3.5 w-3.5 flex-none ...' />
            <span className='w-18 flex-none ...'>B2B</span>
            <TabRoleTag role='BA' />
          </div>
        </TabsTrigger>
        <TabsTrigger
          value='parts'
          className='flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm'
        >
          <div className='flex flex-row '>
            <Package className='h-3.5 w-3.5 flex-none ...' />
            <span className='w-18 flex-none ...'>Parts</span>
            <TabRoleTag role='PA' />
          </div>
        </TabsTrigger>

        <TabsTrigger
          value='counter-sale'
          className='flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm'
        >
          <div className='flex flex-row '>
            <ReceiptText className='h-3.5 w-3.5 flex-none ...' />
            <span className='w-18 flex-none ...'>CTOS</span>
            <TabRoleTag role='PA' />
          </div>
        </TabsTrigger>
        <TabsTrigger
          value='service'
          className='flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm'
        >
          <div className='flex flex-row '>
            <Wrench className='h-3.5 w-3.5 flex-none ...' />
            <span className='w-18 flex-none ...'>Service</span>
            <TabRoleTag role='SA' />
          </div>
        </TabsTrigger>
      </TabsList>

      <TabsContent value='stock-investment' className='pt-4'>
        <StockInvestmentDashboard />
      </TabsContent>
      <TabsContent value='manual-assign' className='pt-4'>
        <ManualAssignDashboard />
      </TabsContent>

      <TabsContent value='parts' className='pt-4'>
        <PartsDashboard />
      </TabsContent>

      <TabsContent value='counter-sale' className='pt-4'>
        <CounterSaleKpiCharts />
      </TabsContent>
      <TabsContent value='service' className='pt-4'>
        <ServiceDashboard />
      </TabsContent>
    </Tabs>
  );
}
