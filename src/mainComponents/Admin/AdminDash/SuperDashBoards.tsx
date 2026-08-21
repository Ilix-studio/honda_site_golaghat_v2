import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  Package,
  Wrench,
  CalendarDays,
  ReceiptText,
  Bike,
} from "lucide-react";

import StockInvestmentDashboard from "./StockInvestmentDashboard";
import SuperOverviewKpiCharts from "./SuperOverviewKpiCharts";

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
  PA: "bg-amber-100 text-amber-800",
  SA: "bg-green-100 text-green-700",
};

function TabRoleTag({ role }: { role: OwnerRole }) {
  return (
    <span
      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${OWNER_ROLE_STYLE[role]}`}
    >
      {role}
    </span>
  );
}

function TabOwnershipLegend() {
  return (
    <div className='mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600'>
      <span className='font-medium text-gray-900'>Data owned by:</span>
      {(Object.keys(OWNER_ROLE_LABEL) as OwnerRole[]).map((role) => (
        <span key={role} className='flex items-center gap-1.5'>
          <TabRoleTag role={role} />
          <span>{OWNER_ROLE_LABEL[role]}</span>
        </span>
      ))}
    </div>
  );
}

// ─── Tab definitions ─────────────────────────────────────────────────────────

/**
 * One source of truth for the tab strip, so every trigger stays on the same
 * shape and the Overview tab can't drift from the five it summarises.
 * `owner` is omitted on Overview — it reads across all three roles' uploads.
 */
const DASHBOARD_TABS: {
  value: string;
  label: string;
  icon: React.ElementType;
  owner?: OwnerRole;
}[] = [
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "stock-investment", label: "Vehicle", icon: Bike, owner: "BA" },
  { value: "parts", label: "Parts", icon: Package, owner: "PA" },
  { value: "counter-sale", label: "CTOS", icon: ReceiptText, owner: "PA" },
  { value: "service", label: "Service", icon: Wrench, owner: "SA" },
];

const TRIGGER_CLASS =
  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-all hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm";

// ─── Dashboards panel — static KPI dashboards, no AI ──────────────────────────

/**
 * Static Super-Admin dashboards: a cross-domain Overview plus the per-domain
 * tabs (Vehicle, B2B, Parts, Counter Sale, Service). Rendered as its own
 * top-level tab in AdminDashboard, separate from the AI Assistant.
 */
export function DashboardsPanel() {
  const dispatch = useAppDispatch();
  const activeTab =
    useAppSelector(selectActiveTab(SUPER_DASHBOARDS_TAB_KEY)) ?? "overview";

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) =>
        dispatch(setActiveTab({ key: SUPER_DASHBOARDS_TAB_KEY, value: v }))
      }
    >
      <TabOwnershipLegend />

      <TabsList className='inline-flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl border border-gray-300 bg-gray-100 p-1'>
        {DASHBOARD_TABS.map(({ value, label, icon: Icon, owner }) => (
          <TabsTrigger key={value} value={value} className={TRIGGER_CLASS}>
            <Icon className='h-3.5 w-3.5 shrink-0' />
            <span>{label}</span>
            {owner && <TabRoleTag role={owner} />}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value='overview' className='pt-4'>
        <SuperOverviewKpiCharts />
      </TabsContent>

      <TabsContent value='stock-investment' className='pt-4'>
        <StockInvestmentDashboard />
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
