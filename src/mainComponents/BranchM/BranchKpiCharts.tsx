import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { IndianRupee, Package, Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { MetricTile } from "@/mainComponents/Admin/AdminDash/StatCard";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  selectActiveTab,
  setActiveTab,
} from "@/redux-store/slices/dashboardTabsSlice";
import SalesKpiCharts, {
  ChartSkeleton,
  EmptyChartState,
  inr,
  YearSelect,
} from "@/mainComponents/DataImport/SalesKpiCharts";

import { useGetSalesTimeseriesQuery } from "@/redux-store/services/dataImportApi";
import { useGetPartsStockStatusQuery } from "@/redux-store/services/partsApi";
import { useGetStockAssignStatsQuery } from "@/redux-store/services/BikeSystemApi2/StockConceptApi";
import { useGetVasAssignStatsQuery } from "@/redux-store/services/BikeSystemApi2/VASApi";
import type { Granularity } from "@/redux-store/services/dataImport.types";

// ─── Sales & Revenue ──────────────────────────────────────────────────────

const SalesTab = () => {
  const [granularity, setGranularity] = useState<Granularity>("month");
  const { data, isLoading } = useGetSalesTimeseriesQuery({ granularity });

  return (
    <SalesKpiCharts
      granularity={granularity}
      onGranularityChange={setGranularity}
      timeseries={data?.data.timeseries ?? []}
      byModel={data?.data.byModel ?? []}
      loading={isLoading}
      emptyMessage='No sales data yet — import a service-jobcard report from Data Import to see revenue trends.'
    />
  );
};

// ─── Stock & Inventory ────────────────────────────────────────────────────

const stockAssignConfig: ChartConfig = {
  assignedCount: { label: "Vehicles Assigned", color: "var(--chart-2)" },
};

const partsRevenueConfig: ChartConfig = {
  revenueAfter: { label: "Revenue", color: "var(--chart-1)" },
};

const StockTab = () => {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const { data: assignData, isLoading: assignLoading } =
    useGetStockAssignStatsQuery({ year });
  const { data: partsData, isLoading: partsLoading } =
    useGetPartsStockStatusQuery();

  const monthly = assignData?.data.monthly ?? [];
  const totals = assignData?.data.totals;
  const parts = partsData?.data;

  const partsByDate = useMemo(
    () =>
      (parts?.byDate ?? []).map((d) => ({
        ...d,
        label: new Date(d.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
      })),
    [parts],
  );

  const yearControl = (
    <div className='flex items-center justify-between flex-wrap gap-3'>
      <span className='text-xs font-medium text-muted-foreground'>
        Assignment year
      </span>
      <YearSelect value={year} onChange={setYear} />
    </div>
  );

  if (assignLoading || partsLoading) {
    return (
      <div className='space-y-4'>
        {yearControl}
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {yearControl}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <MetricTile
          index={0}
          label={`Vehicles Assigned (${year})`}
          value={(totals?.totalAssigned ?? 0).toLocaleString("en-IN")}
          bg='bg-red-50'
          text='text-red-700'
          sub='text-red-500'
        />
        <MetricTile
          index={1}
          label='Assignment Revenue'
          value={inr(totals?.totalRevenue ?? 0)}
          bg='bg-blue-50'
          text='text-blue-700'
          sub='text-blue-500'
        />
        <MetricTile
          index={2}
          label='Parts Revenue'
          value={inr(parts?.totalRevenue ?? 0)}
          bg='bg-amber-50'
          text='text-amber-700'
          sub='text-amber-500'
        />
        <MetricTile
          index={3}
          label='Average Unit Price'
          value={inr(parts?.avgUnitPrice ?? 0)}
          bg='bg-emerald-50'
          text='text-emerald-700'
          sub='text-emerald-500'
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Vehicle Assignments</CardTitle>
          <CardDescription>
            Vehicles assigned to customers, per month in {year}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totals && totals.totalAssigned === 0 && (
            <p className='mb-2 text-xs text-muted-foreground'>
              No vehicle assignments recorded in {year}.
            </p>
          )}
          <ChartContainer config={stockAssignConfig} className='h-[260px] w-full'>
            <BarChart data={monthly} margin={{ left: 0, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey='assignedCount' fill='var(--color-assignedCount)' radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Parts Revenue by Upload Date</CardTitle>
          <CardDescription>Current stock revenue after each parts-stock upload</CardDescription>
        </CardHeader>
        <CardContent>
          {partsByDate.length === 0 ? (
            <EmptyChartState message='No parts stock imported yet — upload a parts report to see this trend.' />
          ) : (
            <ChartContainer config={partsRevenueConfig} className='h-[220px] w-full'>
              <AreaChart data={partsByDate} margin={{ left: 0, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey='label' tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey='revenueAfter'
                  type='monotone'
                  fill='var(--color-revenueAfter)'
                  fillOpacity={0.2}
                  stroke='var(--color-revenueAfter)'
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ─── VAS Performance ──────────────────────────────────────────────────────

const vasConfig: ChartConfig = {
  activationCount: { label: "VAS Activations", color: "var(--chart-4)" },
};

const VasTab = () => {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const { data, isLoading } = useGetVasAssignStatsQuery({ year });

  const monthly = data?.data.monthly ?? [];
  const totals = data?.data.totals;

  const yearControl = (
    <div className='flex items-center justify-between flex-wrap gap-3'>
      <span className='text-xs font-medium text-muted-foreground'>
        Activation year
      </span>
      <YearSelect value={year} onChange={setYear} />
    </div>
  );

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {yearControl}
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {yearControl}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <MetricTile
          index={0}
          label={`VAS Activations (${year})`}
          value={(totals?.totalActivations ?? 0).toLocaleString("en-IN")}
          bg='bg-red-50'
          text='text-red-700'
          sub='text-red-500'
        />
        <MetricTile
          index={1}
          label='VAS Revenue'
          value={inr(totals?.totalRevenue ?? 0)}
          bg='bg-blue-50'
          text='text-blue-700'
          sub='text-blue-500'
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>VAS Activations</CardTitle>
          <CardDescription>
            Value-added services activated, per month in {year}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totals && totals.totalActivations === 0 && (
            <p className='mb-2 text-xs text-muted-foreground'>
              No VAS activations recorded in {year}.
            </p>
          )}
          <ChartContainer config={vasConfig} className='h-[260px] w-full'>
            <BarChart data={monthly} margin={{ left: 0, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey='activationCount' fill='var(--color-activationCount)' radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Root component ───────────────────────────────────────────────────────

const BRANCH_KPI_CHARTS_TAB_KEY = "branchKpiCharts";

const BranchKpiCharts = () => {
  const dispatch = useAppDispatch();
  const activeTab =
    useAppSelector(selectActiveTab(BRANCH_KPI_CHARTS_TAB_KEY)) ?? "sales";

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) =>
        dispatch(setActiveTab({ key: BRANCH_KPI_CHARTS_TAB_KEY, value: v }))
      }
      className='w-full'
    >
      <TabsList className='inline-flex h-11 bg-gray-100 rounded-xl p-1 gap-1'>
        <TabsTrigger value='sales' className='flex items-center gap-2 px-4 rounded-lg text-sm'>
          <IndianRupee className='h-3.5 w-3.5' />
          Sales &amp; Revenue
        </TabsTrigger>
        <TabsTrigger value='stock' className='flex items-center gap-2 px-4 rounded-lg text-sm'>
          <Package className='h-3.5 w-3.5' />
          Stock &amp; Inventory
        </TabsTrigger>
        <TabsTrigger value='vas' className='flex items-center gap-2 px-4 rounded-lg text-sm'>
          <Sparkles className='h-3.5 w-3.5' />
          VAS Performance
        </TabsTrigger>
      </TabsList>

      <TabsContent value='sales' className='mt-4'>
        <SalesTab />
      </TabsContent>
      <TabsContent value='stock' className='mt-4'>
        <StockTab />
      </TabsContent>
      <TabsContent value='vas' className='mt-4'>
        <VasTab />
      </TabsContent>
    </Tabs>
  );
};

export default BranchKpiCharts;
