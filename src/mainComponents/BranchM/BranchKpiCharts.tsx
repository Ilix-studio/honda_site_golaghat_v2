import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Package, Sparkles } from "lucide-react";

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
  inr,
  YearSelect,
} from "@/mainComponents/DataImport/SalesKpiCharts";

import { useGetServiceJobcardSalesTimeseriesQuery } from "@/redux-store/services/serviceJobcardApi";

import { useGetCombinedVasAssignStatsQuery } from "@/redux-store/services/BikeSystemApi2/VASApi";
import type { Granularity } from "@/redux-store/services/dataImport.types";
import { StockTab } from "./Tabs/StockTab";

// ─── Sales & Revenue ──────────────────────────────────────────────────────

export const SalesTab = () => {
  const [granularity, setGranularity] = useState<Granularity>("month");
  const { data, isLoading } = useGetServiceJobcardSalesTimeseriesQuery({
    granularity,
  });

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

// ─── VAS Performance ──────────────────────────────────────────────────────

const vasConfig: ChartConfig = {
  activationCount: { label: "VAS Activations", color: "var(--chart-4)" },
};

const VasTab = () => {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const { data, isLoading } = useGetCombinedVasAssignStatsQuery({ year });

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
            Value-added services activated across manual and CSV stock, per
            month in {year}
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
              <Bar
                dataKey='activationCount'
                fill='var(--color-activationCount)'
                radius={4}
              />
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
    useAppSelector(selectActiveTab(BRANCH_KPI_CHARTS_TAB_KEY)) ?? "stock";

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) =>
        dispatch(setActiveTab({ key: BRANCH_KPI_CHARTS_TAB_KEY, value: v }))
      }
    >
      <TabsList className='inline-flex h-11 bg-gray-300 rounded-xl p-1 gap-1'>
        <TabsTrigger
          value='stock'
          className='flex items-center gap-2 px-4 rounded-lg text-sm'
        >
          <Package className='h-3.5 w-3.5' />
          Stock Vehicles
        </TabsTrigger>
        <TabsTrigger
          value='vas'
          className='flex items-center gap-2 px-4 rounded-lg text-sm'
        >
          <Sparkles className='h-3.5 w-3.5' />
          VAS Performance
        </TabsTrigger>
      </TabsList>

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
