// ─── Stock & Inventory ────────────────────────────────────────────────────
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

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

import { useGetStockAssignStatsQuery } from "@/redux-store/services/BikeSystemApi2/StockConceptApi";

import {
  ChartSkeleton,
  inr,
  YearSelect,
} from "@/mainComponents/DataImport/SalesKpiCharts";
import {
  selectActiveTab,
  setActiveTab,
} from "@/redux-store/slices/dashboardTabsSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useGetCSVStockAssignStatsQuery } from "@/redux-store/services/BikeSystemApi3/csvStockApi";

const stockAssignConfig: ChartConfig = {
  assignedCount: { label: "Vehicles Assigned", color: "var(--chart-2)" },
};

const BRANCH_KPI_CHARTS_Stock_TAB = "branchKpiCharts-StockTab";

export const StockTab = () => {
  const dispatch = useAppDispatch();
  const activeTab =
    useAppSelector(selectActiveTab(BRANCH_KPI_CHARTS_Stock_TAB)) ?? "Manual";
  const [year, setYear] = useState(() => new Date().getFullYear());

  const { data: assignData, isLoading: assignLoading } =
    useGetStockAssignStatsQuery({ year });

  const { data: assignDataCSV, isLoading: assignCSVLoading } =
    useGetCSVStockAssignStatsQuery({ year });

  const monthly = assignData?.data.monthly ?? [];
  const totals = assignData?.data.totals;

  const totalsCSV = assignDataCSV?.data.totals;
  const monthlyCSV = assignDataCSV?.data.monthly ?? [];

  const yearControl = (
    <div className='flex items-center justify-between flex-wrap gap-3'>
      <span className='text-xs font-medium text-muted-foreground'>
        Assignment year
      </span>
      <YearSelect value={year} onChange={setYear} />
    </div>
  );

  if (assignLoading) {
    return (
      <div className='space-y-4'>
        {yearControl}
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }
  if (assignCSVLoading) {
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
      <Tabs
        value={activeTab}
        onValueChange={(v) =>
          dispatch(setActiveTab({ key: BRANCH_KPI_CHARTS_Stock_TAB, value: v }))
        }
      >
        <TabsList className='w-full'>
          <TabsTrigger value='Manual' className='w-full'>
            Manual Assignment
          </TabsTrigger>
          <TabsTrigger value='Auto' className='w-full'>
            CSV Assignment
          </TabsTrigger>
        </TabsList>
        <TabsContent value='Manual' className='space-y-4'>
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
              <ChartContainer
                config={stockAssignConfig}
                className='h-[260px] w-full'
              >
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
                    dataKey='assignedCount'
                    fill='var(--color-assignedCount)'
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value='Auto' className='space-y-4'>
          {yearControl}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <MetricTile
              index={0}
              label={`Vehicles Assigned (${year})`}
              value={(totalsCSV?.totalAssigned ?? 0).toLocaleString("en-IN")}
              bg='bg-red-50'
              text='text-red-700'
              sub='text-red-500'
            />
            <MetricTile
              index={1}
              label='Assignment Revenue'
              value={inr(totalsCSV?.totalRevenue ?? 0)}
              bg='bg-blue-50'
              text='text-blue-700'
              sub='text-blue-500'
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
              {totalsCSV && totalsCSV.totalAssigned === 0 && (
                <p className='mb-2 text-xs text-muted-foreground'>
                  No vehicle assignments recorded in {year}.
                </p>
              )}
              <ChartContainer
                config={stockAssignConfig}
                className='h-[260px] w-full'
              >
                <BarChart data={monthlyCSV} margin={{ left: 0, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey='month'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey='assignedCount'
                    fill='var(--color-assignedCount)'
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
