import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../hooks/redux";
import { useGetStockAssignStatsQuery } from "@/redux-store/services/BikeSystemApi2/StockConceptApi";
import { useGetVasAssignStatsQuery } from "@/redux-store/services/BikeSystemApi2/VASApi";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Layers, Handshake, ShieldCheck } from "lucide-react";

import DashboardChartPreview from "@/mainComponents/RAG/DashboardChartPreview";
import type { DashboardSpec } from "@/redux-store/services/ragApi.types";
import { StatCard, StatCardProps } from "../StatCard";
import { YearSelect } from "../SuperDashBoards";
import { useGetStockBatchReportsQuery } from "@/redux-store/services/BikeSystemApi3/csvStockApi";
import {
  selectActiveTab,
  setActiveTab,
} from "@/redux-store/slices/dashboardTabsSlice";

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

function CSVAssignDashboard() {
  const { data, isLoading } = useGetStockBatchReportsQuery({
    page: 1,
    limit: 1000,
  });

  const branchName = "Admin manual csv assign";

  const batches = data?.data?.filter((batch) => {
    const batchBranch =
      (batch as { branchName?: string; branch?: string }).branchName ??
      (batch as { branchName?: string; branch?: string }).branch;

    return batchBranch === branchName;
  });

  const totalAssigned = data?.data.reduce(
    (total, batch) => total + batch.assignedCount,
    0,
  );
  const totalRevenue = batches?.reduce((total, batch) => {
    const salePrice = Number(
      (batch as { salePrice?: number; revenue?: number }).salePrice ??
        (batch as { salePrice?: number; revenue?: number }).revenue ??
        0,
    );

    return total + salePrice;
  }, 0);

  const kpis: Omit<StatCardProps, "index">[] = [
    {
      title: "Bikes Assigned",
      value: totalAssigned ?? "—",
      icon: Handshake,
      loading: isLoading,
      description: "All branches",
      action: { label: "Details", href: "/admin/dashboard" },
    },
    {
      title: "Revenue",
      value:
        totalRevenue !== undefined
          ? `₹${totalRevenue.toLocaleString("en-IN")}`
          : "—",
      icon: Layers,
      loading: isLoading,
      description: "Sum of sale price",
      action: { label: "Details", href: "/admin/dashboard" },
    },
  ];
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {kpis.map((kpi, i) => (
          <StatCard key={kpi.title} {...kpi} index={i} />
        ))}
      </div>
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
          {/* FIXED: Removed text-white from children so inactive state isn't invisible */}
          <TabsTrigger
            value='ManualAssign'
            className='flex items-center gap-2 px-5 rounded-lg text-sm font-medium text-gray-500 transition-all duration-200 hover:text-blue-700 hover:bg-blue-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md'
          >
            <Handshake className='h-4 w-4' />
            <span className='font-semibold'>ManualAssign</span>
          </TabsTrigger>

          {/* FIXED: Removed text-white from children, changed h3 to span, fixed typo shadow-md2 */}
          <TabsTrigger
            value='CSVAssign'
            className='flex items-center gap-1.5 px-5 rounded-lg text-sm font-medium text-gray-500 transition-all duration-200 hover:text-gray-900 hover:bg-gray-50 data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md'
          >
            <span className='font-semibold'>CSV Assign</span>
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
      </Tabs>
    </div>
  );
}
