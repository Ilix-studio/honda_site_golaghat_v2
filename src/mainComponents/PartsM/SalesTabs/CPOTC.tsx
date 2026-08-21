import { useMemo } from "react";
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
} from "@/mainComponents/DataImport/SalesKpiCharts";
import { useGetAllCounterSalesQuery } from "@/redux-store/services/counterSaleApi";
import { useAppSelector } from "@/hooks/redux";
import { selectAuth } from "@/redux-store/slices/authSlice";

/**
 * The list endpoint pages at 20 by default and applies no server-side cap, so
 * one wide page backs both charts. If a branch ever exceeds this, the header
 * says so rather than quietly charting a subset.
 */
const ROW_LIMIT = 1000;
const TOP_ACCOUNTS = 8;

// One measure — revenue — so both charts wear one colour. --chart-1 is what
// CounterSaleKpiCharts already uses for revenue; keeping it means the same
// quantity reads the same everywhere in the app.
const revenueConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
};

const monthKey = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

const monthLabel = (key: string) => {
  const [year, month] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
};

export default function CPOTC() {
  const { isAuthenticated } = useAppSelector(selectAuth);
  const { data, isLoading } = useGetAllCounterSalesQuery(
    { page: 1, limit: ROW_LIMIT },
    { skip: !isAuthenticated },
  );

  const rows = useMemo(() => data?.data ?? [], [data]);
  const totalRows = data?.pagination?.total ?? rows.length;
  const isTruncated = totalRows > rows.length;

  const totals = useMemo(() => {
    const revenue = rows.reduce((sum, r) => sum + (r.totalInvoice ?? 0), 0);
    return {
      orders: rows.length,
      revenue,
      average: rows.length > 0 ? revenue / rows.length : 0,
    };
  }, [rows]);

  /** Revenue bucketed by Channel Partner Purchase Order Date, oldest first. */
  const trend = useMemo(() => {
    const byMonth = new Map<string, { revenue: number; orders: number }>();

    rows.forEach((row) => {
      if (!row.purchaseOrderDate) return;
      const date = new Date(row.purchaseOrderDate);
      if (Number.isNaN(date.getTime())) return;

      const key = monthKey(date);
      const bucket = byMonth.get(key) ?? { revenue: 0, orders: 0 };
      bucket.revenue += row.totalInvoice ?? 0;
      bucket.orders += 1;
      byMonth.set(key, bucket);
    });

    return [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, bucket]) => ({
        label: monthLabel(key),
        revenue: bucket.revenue,
        orders: bucket.orders,
      }));
  }, [rows]);

  /** Rows a date could not be read from are excluded from the trend, not zeroed. */
  const undatedRows = useMemo(
    () =>
      rows.filter(
        (r) => !r.purchaseOrderDate || Number.isNaN(new Date(r.purchaseOrderDate).getTime()),
      ).length,
    [rows],
  );

  const topAccounts = useMemo(() => {
    const byAccount = new Map<string, number>();

    rows.forEach((row) => {
      const name = row.accountName?.trim() || "Unnamed account";
      byAccount.set(name, (byAccount.get(name) ?? 0) + (row.totalInvoice ?? 0));
    });

    return [...byAccount.entries()]
      .map(([account, revenue]) => ({ account, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, TOP_ACCOUNTS);
  }, [rows]);

  const accountCount = useMemo(
    () =>
      new Set(rows.map((r) => r.accountName?.trim() || "Unnamed account")).size,
    [rows],
  );

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyChartState message='No counter sale orders yet. Upload a counter sale report to see CPOTC trends here.' />
    );
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <MetricTile
          index={0}
          label='CPOTC Orders'
          value={totals.orders.toLocaleString("en-IN")}
          bg='bg-gray-100'
          text='text-gray-900'
          sub='text-gray-500'
        />
        <MetricTile
          index={1}
          label='Total Revenue'
          value={inr(totals.revenue)}
          bg='bg-emerald-50'
          text='text-emerald-700'
          sub='text-emerald-500'
        />
        <MetricTile
          index={2}
          label='Average Order'
          value={inr(totals.average)}
          bg='bg-blue-50'
          text='text-blue-700'
          sub='text-blue-500'
        />
      </div>

      {isTruncated && (
        <p className='text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2'>
          Showing the most recent {rows.length.toLocaleString("en-IN")} of{" "}
          {totalRows.toLocaleString("en-IN")} orders — charts below cover that
          subset.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Revenue over time</CardTitle>
          <CardDescription>
            Total Invoice per month, by Channel Partner Purchase Order Date
            {undatedRows > 0 &&
              ` · ${undatedRows.toLocaleString("en-IN")} order(s) without a readable date excluded`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trend.length === 0 ? (
            <EmptyChartState message='No orders carry a readable purchase order date yet.' />
          ) : (
            <ChartContainer config={revenueConfig} className='h-[280px] w-full'>
              <AreaChart data={trend} margin={{ left: 4, right: 12, top: 8 }}>
                <defs>
                  <linearGradient id='cpotcRevenue' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor='var(--color-revenue)'
                      stopOpacity={0.35}
                    />
                    <stop
                      offset='95%'
                      stopColor='var(--color-revenue)'
                      stopOpacity={0.04}
                    />
                  </linearGradient>
                </defs>
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
                  dataKey='revenue'
                  type='monotone'
                  stroke='var(--color-revenue)'
                  strokeWidth={2}
                  fill='url(#cpotcRevenue)'
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>
            Top channel partners by revenue
          </CardTitle>
          <CardDescription>
            {accountCount > TOP_ACCOUNTS
              ? `Highest ${TOP_ACCOUNTS} of ${accountCount} accounts, by summed Total Invoice`
              : `All ${accountCount} account(s), by summed Total Invoice`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={revenueConfig}
            className='h-[320px] w-full'
          >
            <BarChart
              data={topAccounts}
              layout='vertical'
              margin={{ left: 4, right: 64 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis type='number' dataKey='revenue' hide />
              <YAxis
                type='category'
                dataKey='account'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={140}
                tickFormatter={(value: string) =>
                  value.length > 18 ? `${value.slice(0, 17)}…` : value
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
              <Bar dataKey='revenue' fill='var(--color-revenue)' radius={4}>
                {/* Direct labels: the value stays readable without relying on
                    the bar's colour, which also covers the dark-surface case. */}
                <LabelList
                  dataKey='revenue'
                  position='right'
                  offset={8}
                  className='fill-muted-foreground'
                  fontSize={11}
                  formatter={(value) => compactInr(Number(value ?? 0))}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
