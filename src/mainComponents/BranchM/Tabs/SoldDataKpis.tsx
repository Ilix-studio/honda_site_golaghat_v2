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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MetricTile } from "@/mainComponents/Admin/AdminDash/StatCard";
import {
  ChartSkeleton,
  compactInr,
  EmptyChartState,
  formatDay,
  inr,
  YearSelect,
} from "@/mainComponents/DataImport/SalesKpiCharts";
import {
  useGetAllSalesReportsQuery,
  useGetSalesReportKpisQuery,
} from "@/redux-store/services/salesReportApi";
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

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Five hues from the shared chart palette; extra purchase types wrap around. */
const TYPE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const pad = (n: number) => String(n).padStart(2, "0");

/** The sales listing's `to` is exclusive, so December rolls into next January. */
const monthRange = (year: number, month: number) => ({
  from: `${year}-${pad(month)}-01`,
  to: month === 12 ? `${year + 1}-01-01` : `${year}-${pad(month + 1)}-01`,
});

const SoldDataKpis = () => {
  const { isAuthenticated } = useAppSelector(selectAuth);
  const [year, setYear] = useState(() => new Date().getFullYear());
  /** 0 = whole year, 1–12 = a single month (also reveals that month's sales). */
  const [month, setMonth] = useState(0);

  const { data, isLoading } = useGetSalesReportKpisQuery(
    { year },
    { skip: !isAuthenticated },
  );

  const kpis = data?.data;
  const totals = kpis?.totals;
  const monthly = useMemo(() => kpis?.monthly ?? [], [kpis]);

  /**
   * Pivot the (date × purchase type) rows into one row per date with a column
   * per type, so each type becomes a stacked area. A selected month is
   * narrowed here and gets a zero for every day, so a quiet day reads as a dip
   * rather than the area sloping across it.
   */
  const { typeSeries, typeKeys, typeConfig } = useMemo(() => {
    const prefix = month ? `${year}-${pad(month)}-` : `${year}-`;
    const rows = (kpis?.dailyByPurchaseType ?? []).filter((r) =>
      r.date.startsWith(prefix),
    );

    const totalsByType = new Map<string, number>();
    rows.forEach((r) =>
      totalsByType.set(
        r.purchaseType,
        (totalsByType.get(r.purchaseType) ?? 0) + r.totalPayment,
      ),
    );
    // Highest-paying type first so it sits at the base of the stack.
    const types = [...totalsByType.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t);

    const config: ChartConfig = {};
    const keys = types.map((t, i) => {
      const key = `t${i}`;
      config[key] = { label: t, color: TYPE_COLORS[i % TYPE_COLORS.length] };
      return key;
    });

    const byDate = new Map<string, Record<string, number | string>>();
    if (month) {
      const days = new Date(year, month, 0).getDate();
      for (let d = 1; d <= days; d++) {
        const date = `${year}-${pad(month)}-${pad(d)}`;
        byDate.set(
          date,
          Object.fromEntries([["date", date], ...keys.map((k) => [k, 0])]),
        );
      }
    }
    rows.forEach((r) => {
      const key = keys[types.indexOf(r.purchaseType)];
      const row =
        byDate.get(r.date) ??
        Object.fromEntries([["date", r.date], ...keys.map((k) => [k, 0])]);
      row[key] = r.totalPayment;
      byDate.set(r.date, row);
    });

    return {
      typeSeries: [...byDate.values()].sort((a, b) =>
        String(a.date).localeCompare(String(b.date)),
      ),
      typeKeys: keys,
      typeConfig: config,
    };
  }, [kpis, year, month]);

  const range = month ? monthRange(year, month) : null;
  const { data: salesData, isFetching: salesLoading } =
    useGetAllSalesReportsQuery(
      { from: range?.from, to: range?.to, limit: 200 },
      { skip: !isAuthenticated || !range },
    );
  const sales = salesData?.data ?? [];

  const averageSale = useMemo(() => {
    if (!totals || totals.totalRecords === 0) return 0;
    return totals.totalPayment / totals.totalRecords;
  }, [totals]);

  const hasMonthlyData = monthly.some((m) => m.count > 0 || m.totalPayment > 0);

  const yearControl = (
    <div className='flex items-center justify-between flex-wrap gap-3'>
      <span className='text-xs font-medium text-muted-foreground'>Year</span>
      <YearSelect value={year} onChange={setYear} />
    </div>
  );

  const monthControl = (
    <div className='space-y-2 pt-3'>
      <span className='text-xs font-medium text-muted-foreground'>
        Sales period
      </span>
      <div className='flex flex-wrap gap-2' role='group' aria-label='Month'>
        {["All", ...MONTH_NAMES.map((n) => n.slice(0, 3))].map((label, m) => (
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
            Payment taken per sale date, split by purchase type —{" "}
            {month ? `${MONTH_NAMES[month - 1]} ${year}` : `all of ${year}`}
          </CardDescription>
          {monthControl}
        </CardHeader>
        <CardContent>
          {typeKeys.length === 0 ? (
            <EmptyChartState message='No sales with a sale date in this period yet.' />
          ) : (
            <ChartContainer config={typeConfig} className='h-[300px] w-full'>
              <AreaChart
                data={typeSeries}
                margin={{ left: 4, right: 12, top: 8 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey='date'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={formatDay}
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
                      labelFormatter={formatDay}
                      formatter={(value) => inr(Number(value))}
                    />
                  }
                />
                {/* A lone "Unspecified" series says nothing, so the legend only shows once real types exist. */}
                {!(
                  typeKeys.length === 1 &&
                  typeConfig.t0?.label === "Unspecified"
                ) && <ChartLegend content={<ChartLegendContent />} />}
                {typeKeys.map((key) => (
                  <Area
                    key={key}
                    dataKey={key}
                    type='monotone'
                    stackId='payment'
                    stroke={`var(--color-${key})`}
                    strokeWidth={2}
                    fill={`var(--color-${key})`}
                    fillOpacity={0.25}
                  />
                ))}
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {month > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>
              Sales in {MONTH_NAMES[month - 1]} {year}
            </CardTitle>
            <CardDescription>
              {salesLoading
                ? "Loading…"
                : `${(salesData?.pagination.total ?? 0).toLocaleString("en-IN")} sale(s)${
                    (salesData?.pagination.total ?? 0) > sales.length
                      ? ` — showing the latest ${sales.length}`
                      : ""
                  }`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!salesLoading && sales.length === 0 ? (
              <EmptyChartState message='No sales recorded in this month.' />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className='text-right'>Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell>
                        {row.saleDate
                          ? formatDay(row.saleDate.slice(0, 10))
                          : "—"}
                      </TableCell>
                      <TableCell>{row.modelName}</TableCell>
                      <TableCell>
                        {`${row.customerFirstName} ${row.customerLastName}`.trim()}
                      </TableCell>
                      <TableCell className='text-right'>
                        {inr(row.totalPayment)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SoldDataKpis;
