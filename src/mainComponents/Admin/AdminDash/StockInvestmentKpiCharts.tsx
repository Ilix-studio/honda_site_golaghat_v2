import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import { MetricTile } from "./StatCard";
import {
  ChartSkeleton,
  EmptyChartState,
  GranularityToggle,
  inr,
} from "@/mainComponents/DataImport/SalesKpiCharts";

import {
  useGetStockBatchReportsQuery,
  useGetStockInvestmentTimeseriesQuery,
} from "@/redux-store/services/BikeSystemApi3/csvStockApi";
import type { InvestmentGranularity } from "@/types/customer/stockcsv.types";

const investmentTrendConfig: ChartConfig = {
  totalCostPrice: { label: "Investment", color: "var(--chart-1)" },
};

const vehicleCountConfig: ChartConfig = {
  vehicleCount: { label: "Vehicles Added", color: "var(--chart-2)" },
};

const cumulativeConfig: ChartConfig = {
  cumulative: { label: "Cumulative Investment", color: "var(--chart-3)" },
};

const investmentVsRevenueConfig: ChartConfig = {
  amount: { label: "Amount", color: "var(--chart-1)" },
};

const recoveryPercentConfig: ChartConfig = {
  value: { label: "Recovered %", color: "var(--chart-2)" },
};

const BATCH_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

/**
 * Daily (or weekly/monthly) Stock Investment KPI block: how much cost price
 * has gone into incoming CSV stock, and how it's tracking against sales +
 * VAS + parts revenue from the same batches. Mirrors PartsKpiCharts.tsx's
 * shadcn chart set (Area/Bar/Line/Pie/Radar/RadialBar) for visual consistency
 * across the Super-Admin dashboard.
 */
export default function StockInvestmentKpiCharts() {
  const [granularity, setGranularity] = useState<InvestmentGranularity>("day");
  const { data, isLoading } = useGetStockInvestmentTimeseriesQuery({
    granularity,
  });
  const { data: batchData, isLoading: batchLoading } =
    useGetStockBatchReportsQuery({ page: 1, limit: 10 });

  const timeseries = useMemo(() => data?.data.timeseries ?? [], [data]);
  const totals = data?.data.totals;
  const batches = useMemo(() => batchData?.data ?? [], [batchData]);

  const cumulativeData = useMemo(() => {
    let running = 0;
    return timeseries.map((t) => {
      running += t.totalCostPrice;
      return { bucket: t.bucket, cumulative: running };
    });
  }, [timeseries]);

  const batchTotals = useMemo(
    () =>
      batches.reduce(
        (acc, b) => ({
          investment: acc.investment + b.totalCostPrice,
          salesRevenue: acc.salesRevenue + b.salesRevenue,
          vasRevenue: acc.vasRevenue + b.vasRevenue,
          partsRevenue: acc.partsRevenue + b.partsRevenue,
          totalRevenue: acc.totalRevenue + b.totalRevenue,
        }),
        {
          investment: 0,
          salesRevenue: 0,
          vasRevenue: 0,
          partsRevenue: 0,
          totalRevenue: 0,
        }
      ),
    [batches]
  );

  const investmentVsRevenueData = [
    { metric: "Investment", amount: batchTotals.investment },
    { metric: "Sales Revenue", amount: batchTotals.salesRevenue },
    { metric: "VAS Revenue", amount: batchTotals.vasRevenue },
    { metric: "Parts Revenue", amount: batchTotals.partsRevenue },
  ];

  const topBatchPie = useMemo(() => {
    return [...batches]
      .sort((a, b) => b.totalCostPrice - a.totalCostPrice)
      .slice(0, 5)
      .map((b, i) => ({
        key: b.batchId,
        label: b.fileName,
        value: b.totalCostPrice,
        fill: BATCH_COLORS[i % BATCH_COLORS.length],
      }));
  }, [batches]);

  const batchPieConfig: ChartConfig = useMemo(
    () =>
      Object.fromEntries(
        topBatchPie.map((d) => [d.key, { label: d.label, color: d.fill }])
      ),
    [topBatchPie]
  );

  const recoveryPercent =
    batchTotals.investment > 0
      ? Math.min(
          100,
          Math.round((batchTotals.totalRevenue / batchTotals.investment) * 100)
        )
      : 0;
  const radialData = [
    { key: "recovery", value: recoveryPercent, fill: "var(--color-value)" },
  ];

  const granularityControl = (
    <div className='flex items-center justify-between flex-wrap gap-3'>
      <span className='text-xs font-medium text-muted-foreground'>View by</span>
      <GranularityToggle value={granularity} onChange={setGranularity} />
    </div>
  );

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {granularityControl}
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {granularityControl}

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <MetricTile
          index={0}
          label='Total Investment'
          value={inr(totals?.totalCostPrice ?? 0)}
          bg='bg-red-50'
          text='text-red-700'
          sub='text-red-500'
        />
        <MetricTile
          index={1}
          label='Vehicles Added'
          value={(totals?.vehicleCount ?? 0).toLocaleString("en-IN")}
          bg='bg-blue-50'
          text='text-blue-700'
          sub='text-blue-500'
        />
        <MetricTile
          index={2}
          label='Investment Recovered'
          value={`${recoveryPercent}%`}
          bg='bg-emerald-50'
          text='text-emerald-700'
          sub='text-emerald-500'
        />
      </div>

      {timeseries.length === 0 ? (
        <EmptyChartState message='No CSV stock imported in this range yet.' />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Investment Trend</CardTitle>
              <CardDescription>
                Cost price of incoming stock, by {granularity}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={investmentTrendConfig}
                className='h-[240px] w-full'
              >
                <AreaChart data={timeseries} margin={{ left: 0, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey='bucket'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    dataKey='totalCostPrice'
                    type='monotone'
                    fill='var(--color-totalCostPrice)'
                    fillOpacity={0.2}
                    stroke='var(--color-totalCostPrice)'
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Vehicles Added per {granularity}
              </CardTitle>
              <CardDescription>Count of CSV stock rows imported</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={vehicleCountConfig}
                className='h-[240px] w-full'
              >
                <BarChart data={timeseries} margin={{ left: 0, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey='bucket'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey='vehicleCount'
                    fill='var(--color-vehicleCount)'
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Cumulative Investment</CardTitle>
              <CardDescription>
                Running total over the selected range
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={cumulativeConfig}
                className='h-[220px] w-full'
              >
                <LineChart data={cumulativeData} margin={{ left: 0, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey='bucket'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    dataKey='cumulative'
                    type='monotone'
                    stroke='var(--color-cumulative)'
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Investment by Upload Batch</CardTitle>
            <CardDescription>Top 5 batches by cost price (this page)</CardDescription>
          </CardHeader>
          <CardContent>
            {batchLoading ? (
              <ChartSkeleton />
            ) : topBatchPie.length === 0 ? (
              <EmptyChartState message='No stock-inventory uploads yet.' />
            ) : (
              <ChartContainer
                config={batchPieConfig}
                className='mx-auto h-[220px] w-full max-w-[280px]'
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={topBatchPie}
                    dataKey='value'
                    nameKey='label'
                    innerRadius={50}
                  >
                    {topBatchPie.map((entry) => (
                      <Cell key={entry.key} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey='label' />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>
              Investment vs Revenue Streams
            </CardTitle>
            <CardDescription>
              Cost price vs sales/VAS/parts revenue (this page)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {batchLoading ? (
              <ChartSkeleton />
            ) : (
              <ChartContainer
                config={investmentVsRevenueConfig}
                className='mx-auto h-[260px] w-full max-w-[360px]'
              >
                <RadarChart data={investmentVsRevenueData}>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <PolarGrid />
                  <PolarAngleAxis dataKey='metric' tick={{ fontSize: 11 }} />
                  <Radar
                    dataKey='amount'
                    fill='var(--color-amount)'
                    fillOpacity={0.4}
                    stroke='var(--color-amount)'
                  />
                </RadarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Investment Recovered</CardTitle>
          <CardDescription>
            Share of investment recovered via sales + VAS + parts revenue
            (this page)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {batchLoading ? (
            <ChartSkeleton />
          ) : (
            <div className='relative mx-auto h-[200px] w-[200px]'>
              <ChartContainer
                config={recoveryPercentConfig}
                className='h-full w-full'
              >
                <RadialBarChart
                  data={radialData}
                  startAngle={90}
                  endAngle={90 - (360 * recoveryPercent) / 100}
                  innerRadius={70}
                  outerRadius={100}
                >
                  <RadialBar dataKey='value' background cornerRadius={10} />
                </RadialBarChart>
              </ChartContainer>
              <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
                <span className='text-3xl font-black text-gray-900'>
                  {recoveryPercent}%
                </span>
                <span className='text-xs text-muted-foreground'>Recovered</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
