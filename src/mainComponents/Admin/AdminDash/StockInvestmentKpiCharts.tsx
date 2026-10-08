import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { MetricTile } from "./StatCard";
import {
  ChartSkeleton,
  EmptyChartState,
  GranularityToggle,
  compactInr,
  formatDay,
  inr,
} from "@/mainComponents/DataImport/SalesKpiCharts";

import {
  useGetCSVStockAssignStatsQuery,
  useGetStockInvestmentTimeseriesQuery,
} from "@/redux-store/services/BikeSystemApi3/csvStockApi";
import {
  useGetStockAssignStatsQuery,
  useGetStockStatusSummaryQuery,
} from "@/redux-store/services/BikeSystemApi2/StockConceptApi";
import { useGetSalesReportKpisQuery } from "@/redux-store/services/salesReportApi";
import { useGetB2BSalesKPIsQuery } from "@/redux-store/services/BikeSystemApi2/b2bSalesApi";
import type { InvestmentGranularity } from "@/types/customer/stockcsv.types";

/**
 * Buckets are yyyy-mm-dd for "day"; weekly/monthly buckets use other shapes,
 * so anything that isn't a plain date is shown as-is.
 */
const formatBucket = (value: unknown) =>
  /^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? formatDay(value) : String(value);

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const pad = (n: number) => String(n).padStart(2, "0");

const investmentTrendConfig: ChartConfig = {
  totalCostPrice: { label: "Investment", color: "var(--chart-1)" },
};

const vehicleCountConfig: ChartConfig = {
  vehicleCount: { label: "Vehicles Added", color: "var(--chart-2)" },
};

/**
 * Daily (or weekly/monthly) Stock Investment KPI block: how much cost price
 * has gone into incoming CSV stock, and how it's tracking against sales +
 * VAS + parts revenue from the same batches. Mirrors PartsKpiCharts.tsx's
 * shadcn chart set for visual consistency across the Super-Admin
 * dashboard.
 */
export default function StockInvestmentKpiCharts() {
  const [granularity, setGranularity] = useState<InvestmentGranularity>("day");
  /** 0 = trailing 30 days (the server default), 1–12 = that month of this year. */
  const [month, setMonth] = useState(0);
  const year = new Date().getFullYear();
  const monthRange = month
    ? {
        from: `${year}-${pad(month)}-01`,
        // `to` is inclusive server-side, so end it on the month's last instant.
        to: `${year}-${pad(month)}-${pad(new Date(year, month, 0).getDate())}T23:59:59.999Z`,
      }
    : {};
  const { data, isLoading } = useGetStockInvestmentTimeseriesQuery({
    granularity,
    ...monthRange,
  });
  const { data: stockAssignStats } = useGetStockAssignStatsQuery({});
  const { data: csvStockAssignStats } = useGetCSVStockAssignStatsQuery({
    year: new Date().getFullYear(),
  });

  const { data: salesReportKpis } = useGetSalesReportKpisQuery();
  const { data: b2b } = useGetB2BSalesKPIsQuery();
  const { data: statusSummary } = useGetStockStatusSummaryQuery();

  const timeseries = useMemo(() => data?.data.timeseries ?? [], [data]);
  const totals = data?.data.totals;

  /**
   * The endpoint only returns days that have stock, so one import day would be
   * a single point and draw no area at all. For the day view, fill the window
   * (the selected month, or the server's trailing 30 days; bucketed in UTC)
   * with zeros so quiet days read as a dip and the area has a shape.
   */
  const series = useMemo(() => {
    if (granularity !== "day" || timeseries.length === 0) return timeseries;
    const DAY = 86_400_000;
    const key = (t: number) => new Date(t).toISOString().slice(0, 10);
    const todayMs = Date.parse(key(Date.now()));
    const dataMs = timeseries.map((t) => Date.parse(t.bucket));
    const windowStart = month
      ? Date.UTC(year, month - 1, 1)
      : todayMs - 29 * DAY;
    const windowEnd = month ? Date.UTC(year, month, 0) : todayMs;
    const byBucket = new Map(timeseries.map((t) => [t.bucket, t]));
    const first = Math.min(windowStart, ...dataMs);
    const last = Math.max(windowEnd, ...dataMs);
    const filled: typeof timeseries = [];
    for (let t = first; t <= last; t += DAY) {
      const b = key(t);
      filled.push(
        byBucket.get(b) ?? {
          bucket: b,
          bucketStart: b,
          totalCostPrice: 0,
          vehicleCount: 0,
        },
      );
    }
    return filled;
  }, [timeseries, granularity, month, year]);

  const manualStockAssignRevenue =
    stockAssignStats?.data.totals.totalRevenue ?? 0;
  const csvStockAssignRevenue =
    csvStockAssignStats?.data.totals.totalRevenue ?? 0;
  const salesReportRevenue = salesReportKpis?.data.totals.totalPayment ?? 0;
  const challanRevenue = b2b?.data.totalPayableValue ?? 0;

  const totalRevenue =
    manualStockAssignRevenue +
    csvStockAssignRevenue +
    salesReportRevenue +
    challanRevenue;

  // Vehicles whose stock row is flagged "Sold". Challan sales are already in
  // here — creating a challan flips the stock row — so the challan tile below
  // is a breakdown of this number, never something to add to it.
  const soldInStock = statusSummary?.data.combined.sold ?? 0;

  // Sales-report rows whose vehicle exists in no stock collection. Nothing was
  // flipped to "Sold" because there was no row to flip, so these are real
  // sales that the stock counts alone can never show. Disjoint from
  // `soldInStock` by construction (they matched no stock row), which is what
  // makes adding them safe: a row that DID match is reflected in soldInStock
  // instead and is excluded here.
  const soldWithoutStock = salesReportKpis?.data.totals.salesWithoutStock ?? 0;

  const totalSold = soldInStock + soldWithoutStock;

  // Sold vehicles whose stock row was found but never flipped — still counted
  // as available stock, so "Not Sold" is overstated by this much.
  const staleStockRows =
    salesReportKpis?.data.totals.matchedStockNotFlipped ?? 0;

  const granularityControl = (
    <div className='flex items-center justify-between flex-wrap gap-3'>
      <span className='text-xs font-medium text-muted-foreground'>View by</span>
      <GranularityToggle value={granularity} onChange={setGranularity} />
    </div>
  );

  const monthControl = (
    <div className='space-y-2 pt-3'>
      <span className='text-xs font-medium text-muted-foreground'>
        Sales period
      </span>
      <div className='flex flex-wrap gap-2' role='group' aria-label='Month'>
        {["All", ...MONTH_LABELS].map((label, m) => (
          <button
            key={label}
            type='button'
            aria-pressed={month === m}
            onClick={() => setMonth(m)}
            className={`h-8 px-3 rounded-lg text-xs font-medium border transition-colors ${
              month === m
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
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

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
        <MetricTile
          index={0}
          label='Total Stock Investment'
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
          label='Total Revenue'
          value={inr(totalRevenue)}
          bg='bg-green-50'
          text='text-green-700'
          sub='text-green-500'
        />
        <MetricTile
          index={3}
          label='Total Sold'
          value={totalSold.toLocaleString("en-IN")}
          note={`${soldInStock.toLocaleString("en-IN")} from stock + ${soldWithoutStock.toLocaleString("en-IN")} sold from sales record`}
          bg='bg-emerald-50'
          text='text-emerald-700'
          sub='text-emerald-500'
        />
        <MetricTile
          index={4}
          label='Not Sold'
          value={(statusSummary?.data.combined.notSold ?? 0).toLocaleString(
            "en-IN",
          )}
          note={
            staleStockRows > 0
              ? `Includes ${staleStockRows.toLocaleString("en-IN")} sold vehicle(s) whose stock row was never flipped — needs review`
              : "Stock still on hand"
          }
          bg='bg-amber-50'
          text='text-amber-700'
          sub='text-amber-500'
        />
        <MetricTile
          index={5}
          label='Vehicles via Challan'
          value={(b2b?.data.totalVehicles ?? 0).toLocaleString("en-IN")}
          note='Part of Total Sold, not additional to it'
          bg='bg-purple-50'
          text='text-purple-700'
          sub='text-purple-500'
        />
        <MetricTile
          index={6}
          label='Sales Report Vehicles'
          value={(
            salesReportKpis?.data.totals.totalRecords ?? 0
          ).toLocaleString("en-IN")}
          note={`${soldWithoutStock.toLocaleString("en-IN")} not in stock, ${(
            (salesReportKpis?.data.totals.totalRecords ?? 0) - soldWithoutStock
          ).toLocaleString("en-IN")} matched a stock vehicle`}
          bg='bg-gray-100'
          text='text-gray-800'
          sub='text-gray-500'
        />
      </div>

      <p className='text-xs text-muted-foreground'>
        Total Stock Investment and Vehicles Added cover the selected{" "}
        {granularity} range (trailing 30 days by default) and count purchased
        stock only — auto-registered service vehicles are excluded. Vehicles
        Added therefore splits exactly into Not Sold plus the "from stock" half
        of Total Sold.
      </p>

      {timeseries.length === 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Investment Trend</CardTitle>
              {monthControl}
            </CardHeader>
            <CardContent>
              <EmptyChartState message='No CSV stock imported in this range yet.' />
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Investment Trend</CardTitle>
              <CardDescription>
                Cost price of incoming stock, by {granularity} —{" "}
                {month
                  ? `${MONTH_LABELS[month - 1]} ${year}`
                  : "trailing 30 days"}
              </CardDescription>
              {monthControl}
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={investmentTrendConfig}
                className='h-[240px] w-full'
              >
                <AreaChart data={series} margin={{ left: 0, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey='bucket'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={formatBucket}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={56}
                    tickFormatter={compactInr}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={formatBucket}
                        formatter={(value) => inr(Number(value))}
                      />
                    }
                  />
                  <Area
                    dataKey='totalCostPrice'
                    type='monotone'
                    fill='var(--color-totalCostPrice)'
                    fillOpacity={0.2}
                    stroke='var(--color-totalCostPrice)'
                    strokeWidth={2}
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
              <CardDescription>
                Count of CSV stock rows imported
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={vehicleCountConfig}
                className='h-[240px] w-full'
              >
                <AreaChart data={series} margin={{ left: 0, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey='bucket'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={formatBucket}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={32}
                    allowDecimals={false}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent labelFormatter={formatBucket} />
                    }
                  />
                  <Area
                    dataKey='vehicleCount'
                    type='monotone'
                    fill='var(--color-vehicleCount)'
                    fillOpacity={0.2}
                    stroke='var(--color-vehicleCount)'
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
