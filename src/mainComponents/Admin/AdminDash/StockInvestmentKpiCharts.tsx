import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";

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
 * shadcn Area/Bar chart set for visual consistency across the Super-Admin
 * dashboard.
 */
export default function StockInvestmentKpiCharts() {
  const [granularity, setGranularity] = useState<InvestmentGranularity>("day");
  const { data, isLoading } = useGetStockInvestmentTimeseriesQuery({
    granularity,
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
          note={`${soldInStock.toLocaleString("en-IN")} from stock + ${soldWithoutStock.toLocaleString("en-IN")} sold without a stock record`}
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
          label='Sales Report Rows'
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
        of Total Sold. The remaining half of Total Sold — sales-report rows
        matching no stock vehicle — sits outside the stock collection
        altogether, so it is deliberately not part of Vehicles Added. Vehicles
        via Challan is already inside Total Sold. The all-time tiles ignore the
        date range. Total Revenue sums CSV-Assign, Manual-Assign, Sales Report
        and Challans.
      </p>

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
              <CardDescription>
                Count of CSV stock rows imported
              </CardDescription>
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
        </>
      )}
    </div>
  );
}
