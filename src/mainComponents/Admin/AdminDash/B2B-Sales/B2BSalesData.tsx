import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts";

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { MetricTile } from "@/mainComponents/Admin/AdminDash/StatCard";
import {
  ChartSkeleton,
  EmptyChartState,
  inr,
} from "@/mainComponents/DataImport/SalesKpiCharts";
import { useAppSelector } from "@/hooks/redux";
import { selectAuth } from "@/redux-store/slices/authSlice";
import { useGetB2BSalesKPIsQuery } from "@/redux-store/services/BikeSystemApi2/b2bSalesApi";
import type {
  B2BSalesBranchBreakdown,
  B2BSalesTopItem,
} from "@/types/b2bSales/b2bSales.types";

// The app's own --chart-1.."5" tokens only clear the dataviz accessibility
// gate (lightness band + chroma floor + CVD/normal-vision separation, all
// modes) at 2 slots — chart-3/4/5 individually fail the light-mode lightness
// band. Two-series charts below (Area, and any single-hue chart) stay on the
// app's tokens for visual consistency with every other dashboard chart.
// Pie/Radial need more than 2 *identity* colors (branch/model slices), which
// the app's tokens can't safely supply past 2 — those two charts use this
// separately-validated 4-hue order instead (references/palette.md, first 4
// slots — the subset that clears the all-pairs gate in both modes).
const CATEGORICAL_HEX = ["#2a78d6", "#008300", "#e87ba4", "#eda100"];
const OTHER_HEX = "#898781";

const truncate = (label: string, max = 14) =>
  label.length > max ? `${label.slice(0, max - 1)}…` : label;

const monthLabel = (month: string) =>
  new Date(`${month}-01`).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });

const trendConfig: ChartConfig = {
  totalPrice: { label: "Total Price", color: "var(--chart-1)" },
  payablePrice: { label: "Payable Price", color: "var(--chart-2)" },
};

const volumeConfig: ChartConfig = {
  challanCount: { label: "Challans", color: "var(--chart-2)" },
};

const topItemsConfig: ChartConfig = {
  totalQuantity: { label: "Quantity Sold", color: "var(--chart-1)" },
};

/**
 * Top N by value, remainder folded into a single "Other" slice. `fill` is
 * set directly on each datum (recharts' documented replacement for the
 * deprecated <Cell> component — Pie/RadialBar read a per-datum `fill` field
 * natively) rather than wrapping children in <Cell>.
 */
function topNWithOther<T>(
  items: T[],
  n: number,
  getName: (item: T) => string,
  getValue: (item: T) => number,
): { name: string; value: number; fill: string }[] {
  const sorted = [...items].sort((a, b) => getValue(b) - getValue(a));
  const withFill = (name: string, value: number, index: number) => ({
    name,
    value,
    fill: CATEGORICAL_HEX[index % CATEGORICAL_HEX.length],
  });
  if (sorted.length <= n) {
    return sorted.map((item, i) => withFill(getName(item), getValue(item), i));
  }
  const top = sorted
    .slice(0, n)
    .map((item, i) => withFill(getName(item), getValue(item), i));
  const otherValue = sorted
    .slice(n)
    .reduce((sum, item) => sum + getValue(item), 0);
  return [...top, { name: "Other", value: otherValue, fill: OTHER_HEX }];
}

const B2BSalesData = () => {
  const { isAuthenticated } = useAppSelector(selectAuth);
  const { data, isLoading } = useGetB2BSalesKPIsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const kpis = data?.data;

  const trendData = useMemo(
    () =>
      (kpis?.monthlyTrend ?? []).map((point) => ({
        label: monthLabel(point.month),
        totalPrice: point.totalPrice,
        payablePrice: point.payablePrice,
        challanCount: point.challanCount,
      })),
    [kpis],
  );

  const topItemsData = useMemo(
    () =>
      (kpis?.topItems ?? []).slice(0, 6).map((item: B2BSalesTopItem) => ({
        model: truncate(item.modelName),
        totalQuantity: item.totalQuantity,
      })),
    [kpis],
  );

  const branchRevenueShare = useMemo(() => {
    const branches: B2BSalesBranchBreakdown[] = kpis?.branchBreakdown ?? [];
    if (branches.length > 0) {
      return topNWithOther(
        branches,
        4,
        (b) => b.branchName ?? "Branch",
        (b) => b.totalPrice,
      );
    }
    // No cross-branch breakdown (KPIs already scoped to one branch) — fall
    // back to top items' quantity share so the chart still shows something.
    return topNWithOther(
      kpis?.topItems ?? [],
      4,
      (t) => t.modelName,
      (t) => t.totalQuantity,
    );
  }, [kpis]);

  const branchPayableRanking = useMemo(() => {
    const branches: B2BSalesBranchBreakdown[] = kpis?.branchBreakdown ?? [];
    if (branches.length > 0) {
      return topNWithOther(
        branches,
        4,
        (b) => b.branchName ?? "Branch",
        (b) => b.payablePrice,
      );
    }
    return topNWithOther(
      kpis?.topItems ?? [],
      4,
      (t) => t.modelName,
      (t) => t.totalQuantity,
    );
  }, [kpis]);

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 sm:grid-cols-4 gap-4'>
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  const hasChallans = (kpis?.totalChallans ?? 0) > 0;

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 sm:grid-cols-4 gap-4'>
        <MetricTile
          index={0}
          label='Total Challans'
          value={(kpis?.totalChallans ?? 0).toLocaleString("en-IN")}
          bg='bg-gray-100'
          text='text-gray-900'
          sub='text-gray-500'
        />
        <MetricTile
          index={1}
          label='Total Sales Value'
          value={inr(kpis?.totalSalesValue ?? 0)}
          bg='bg-blue-50'
          text='text-blue-700'
          sub='text-blue-500'
        />
        <MetricTile
          index={2}
          label='Total Final Value'
          value={inr(kpis?.totalPayableValue ?? 0)}
          bg='bg-emerald-50'
          text='text-emerald-700'
          sub='text-emerald-500'
        />
        <MetricTile
          index={3}
          label='Average Challan Value'
          value={inr(kpis?.averageChallanValue ?? 0)}
          bg='bg-amber-50'
          text='text-amber-700'
          sub='text-amber-500'
        />
      </div>

      {!hasChallans ? (
        <EmptyChartState message='No B2B sales challans yet — charts will appear once a branch creates one.' />
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Area — revenue trend */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Monthly Revenue Trend</CardTitle>
              <CardDescription>
                Total Price vs Payable Price, by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trendConfig} className='h-[260px] w-full'>
                <AreaChart data={trendData} margin={{ left: 0, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey='label'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={40}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    dataKey='totalPrice'
                    type='monotone'
                    fill='var(--color-totalPrice)'
                    fillOpacity={0.18}
                    stroke='var(--color-totalPrice)'
                    strokeWidth={2}
                  />
                  <Area
                    dataKey='payablePrice'
                    type='monotone'
                    fill='var(--color-payablePrice)'
                    fillOpacity={0.18}
                    stroke='var(--color-payablePrice)'
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Line — challan volume */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Monthly Challan Volume
              </CardTitle>
              <CardDescription>
                Number of challans created, by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={volumeConfig}
                className='h-[260px] w-full'
              >
                <LineChart data={trendData} margin={{ left: 0, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey='label'
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
                  <Line
                    dataKey='challanCount'
                    type='monotone'
                    stroke='var(--color-challanCount)'
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Bar — top items by quantity */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Top Models by Quantity
              </CardTitle>
              <CardDescription>
                Units sold across all challans, top 6
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={topItemsConfig}
                className='h-[260px] w-full'
              >
                <BarChart data={topItemsData} margin={{ left: 0, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey='model'
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
                  <Bar
                    dataKey='totalQuantity'
                    fill='var(--color-totalQuantity)'
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Radar — top items quantity profile */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Top Models — Quantity Profile
              </CardTitle>
              <CardDescription>Same top-6 models, radar view</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={topItemsConfig}
                className='h-[260px] w-full'
              >
                <RadarChart data={topItemsData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey='model' tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Radar
                    dataKey='totalQuantity'
                    fill='var(--color-totalQuantity)'
                    fillOpacity={0.35}
                    stroke='var(--color-totalQuantity)'
                    strokeWidth={2}
                  />
                </RadarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Pie — revenue share by branch (or top items, when unscoped data has no breakdown) */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                {kpis?.branchBreakdown?.length
                  ? "Revenue Share by Branch"
                  : "Revenue Share by Model"}
              </CardTitle>
              <CardDescription>
                Top 4, remainder folded into "Other"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className='h-[260px] w-full'>
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend
                    content={<ChartLegendContent nameKey='name' />}
                  />
                  <Pie
                    data={branchRevenueShare}
                    dataKey='value'
                    nameKey='name'
                    innerRadius={50}
                    outerRadius={90}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Radial — payable value ranking by branch (or top items fallback) */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                {kpis?.branchBreakdown?.length
                  ? "Payable Value by Branch"
                  : "Quantity by Model"}
              </CardTitle>
              <CardDescription>
                Top 4, remainder folded into "Other"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className='h-[260px] w-full'>
                <RadialBarChart
                  data={branchPayableRanking}
                  innerRadius='20%'
                  outerRadius='90%'
                  startAngle={90}
                  endAngle={-270}
                >
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend
                    content={<ChartLegendContent nameKey='name' />}
                  />
                  <RadialBar dataKey='value' background cornerRadius={4} />
                </RadialBarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default B2BSalesData;
