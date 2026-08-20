import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { MetricTile } from "@/mainComponents/Admin/AdminDash/StatCard";
import {
  ChartSkeleton,
  compactInr,
  EmptyChartState,
  inr,
  YearSelect,
} from "@/mainComponents/DataImport/SalesKpiCharts";
import { useGetSalesReportKpisQuery } from "@/redux-store/services/salesReportApi";
import { useAppSelector } from "@/hooks/redux";
import { selectAuth } from "@/redux-store/slices/authSlice";

/**
 * Both charts plot the same measure — payment taken — so they share one colour.
 * --chart-1 is the app's revenue hue (CounterSaleKpiCharts, PartsKpiCharts,
 * CPOTC all use it), which keeps the same quantity reading the same everywhere.
 */
const paymentConfig: ChartConfig = {
  totalPayment: { label: "Payment", color: "var(--chart-1)" },
};

/** Rows the importer could not match to stock are worth surfacing, not hiding. */
const OUTCOME_LABEL: Record<string, string> = {
  matched_status_flipped: "Matched to stock",
  matched_already_sold: "Already sold",
  unmatched: "Unmatched",
  customer_conflict: "Customer conflict",
};

const SoldDataKpis = () => {
  const { isAuthenticated } = useAppSelector(selectAuth);
  const [year, setYear] = useState(() => new Date().getFullYear());

  const { data, isLoading } = useGetSalesReportKpisQuery(
    { year },
    { skip: !isAuthenticated },
  );

  const kpis = data?.data;
  const totals = kpis?.totals;
  const monthly = useMemo(() => kpis?.monthly ?? [], [kpis]);

  /** Highest-paying purchase types first, so the bar chart reads top-down. */
  const byPurchaseType = useMemo(
    () =>
      [...(kpis?.byPurchaseType ?? [])]
        .map((row) => ({
          ...row,
          purchaseType: row.purchaseType?.trim() || "Unspecified",
        }))
        .sort((a, b) => b.totalPayment - a.totalPayment),
    [kpis],
  );

  const averageSale = useMemo(() => {
    if (!totals || totals.totalRecords === 0) return 0;
    return totals.totalPayment / totals.totalRecords;
  }, [totals]);

  const hasMonthlyData = monthly.some((m) => m.count > 0 || m.totalPayment > 0);

  const yearControl = (
    <div className='flex items-center justify-between flex-wrap gap-3'>
      <span className='text-xs font-medium text-muted-foreground'>
        Sales year
      </span>
      <YearSelect value={year} onChange={setYear} />
    </div>
  );

  if (isLoading) {
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

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <MetricTile
          index={0}
          label='Vehicles Sold'
          value={(totals?.totalRecords ?? 0).toLocaleString("en-IN")}
          bg='bg-gray-100'
          text='text-gray-900'
          sub='text-gray-500'
        />
        <MetricTile
          index={1}
          label='Total Payment'
          value={inr(totals?.totalPayment ?? 0)}
          bg='bg-emerald-50'
          text='text-emerald-700'
          sub='text-emerald-500'
        />
        <MetricTile
          index={2}
          label='Average Sale'
          value={inr(Math.round(averageSale))}
          bg='bg-blue-50'
          text='text-blue-700'
          sub='text-blue-500'
        />
      </div>

      {(kpis?.byOutcome?.length ?? 0) > 0 && (
        <div className='flex flex-wrap gap-2'>
          {kpis!.byOutcome.map((row) => (
            <span
              key={row.outcome}
              className='text-xs bg-gray-100 text-gray-700 rounded-lg px-2.5 py-1'
            >
              {OUTCOME_LABEL[row.outcome] ?? row.outcome}:{" "}
              <span className='font-semibold'>
                {row.count.toLocaleString("en-IN")}
              </span>
            </span>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Sales payment by month</CardTitle>
          <CardDescription>
            Payment taken per month across imported sold-vehicle reports in{" "}
            {year}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasMonthlyData ? (
            <EmptyChartState
              message={`No sold vehicles imported for ${year} yet — upload a sales report to see trends.`}
            />
          ) : (
            <ChartContainer config={paymentConfig} className='h-[280px] w-full'>
              <AreaChart data={monthly} margin={{ left: 4, right: 12, top: 8 }}>
                <defs>
                  <linearGradient id='soldPayment' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor='var(--color-totalPayment)'
                      stopOpacity={0.35}
                    />
                    <stop
                      offset='95%'
                      stopColor='var(--color-totalPayment)'
                      stopOpacity={0.04}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey='month'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={62}
                  tickFormatter={compactInr}
                />
                <ChartTooltip
                  cursor
                  content={
                    <ChartTooltipContent
                      formatter={(value) => inr(Number(value))}
                    />
                  }
                />
                <Area
                  dataKey='totalPayment'
                  type='monotone'
                  stroke='var(--color-totalPayment)'
                  strokeWidth={2}
                  fill='url(#soldPayment)'
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Payment by purchase type</CardTitle>
          <CardDescription>
            How {year}&apos;s sold-vehicle payment splits across purchase types
          </CardDescription>
        </CardHeader>
        <CardContent>
          {byPurchaseType.length === 0 ? (
            <EmptyChartState message='No purchase types recorded on the imported rows yet.' />
          ) : (
            <ChartContainer config={paymentConfig} className='h-[300px] w-full'>
              <BarChart
                data={byPurchaseType}
                layout='vertical'
                margin={{ left: 4, right: 64 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis type='number' dataKey='totalPayment' hide />
                <YAxis
                  type='category'
                  dataKey='purchaseType'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={130}
                  tickFormatter={(value: string) =>
                    value.length > 16 ? `${value.slice(0, 15)}…` : value
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => inr(Number(value))}
                    />
                  }
                />
                <Bar
                  dataKey='totalPayment'
                  fill='var(--color-totalPayment)'
                  radius={4}
                >
                  {/* Direct labels keep the value readable without depending on
                      the bar's fill colour. */}
                  <LabelList
                    dataKey='totalPayment'
                    position='right'
                    offset={8}
                    className='fill-muted-foreground'
                    fontSize={11}
                    formatter={(value) => compactInr(Number(value ?? 0))}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SoldDataKpis;
