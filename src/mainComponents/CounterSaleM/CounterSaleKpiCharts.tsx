import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { IndianRupee, Layers, Package } from "lucide-react";

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
import {
  StatCard,
  StatCardProps,
} from "@/mainComponents/Admin/AdminDash/StatCard";
import {
  ChartSkeleton,
  EmptyChartState,
  YearSelect,
  compactInr,
  formatDay,
  inr,
} from "@/mainComponents/DataImport/SalesKpiCharts";
import { useGetCounterSaleBatchesQuery } from "@/redux-store/services/counterSaleApi";
import { useAppSelector } from "@/hooks/redux";
import { selectAuth } from "@/redux-store/slices/authSlice";

const revenueConfig: ChartConfig = {
  totalInvoice: { label: "Revenue", color: "var(--chart-1)" },
};

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

const pad = (n: number) => String(n).padStart(2, "0");

/** Local yyyy-mm-dd, so a batch uploaded in the evening stays on its own day. */
const localDay = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export default function CounterSaleKpiCharts({
  /**
   * The batches endpoint is branch-scoped by role, but the "Details" link is
   * not — a Part-Admin mount has to send its own prefix rather than /admin.
   */
  detailsHref = "/admin/counter-sale",
}: {
  detailsHref?: string;
} = {}) {
  const [year, setYear] = useState(() => new Date().getFullYear());
  /** 0 = whole year, 1–12 = a single month. */
  const [month, setMonth] = useState(0);
  const { isAuthenticated } = useAppSelector(selectAuth);
  const { data, isLoading } = useGetCounterSaleBatchesQuery(undefined, {
    skip: !isAuthenticated,
  });

  /**
   * The endpoint returns every batch it has, so the year / month filter is
   * applied here — on import date, which is the only date a batch carries.
   */
  const batches = useMemo(
    () =>
      (data?.data ?? [])
        .filter((b) => {
          const d = new Date(b.importDate);
          return (
            d.getFullYear() === year && (!month || d.getMonth() + 1 === month)
          );
        })
        .sort(
          (a, b) =>
            new Date(a.importDate).getTime() - new Date(b.importDate).getTime(),
        ),
    [data, year, month],
  );

  const totals = useMemo(
    () =>
      batches.reduce(
        (acc, b) => ({
          totalBatches: acc.totalBatches + 1,
          totalRecords: acc.totalRecords + b.totalRecords,
          totalRevenue: acc.totalRevenue + b.totalInvoice,
          reviewCount: acc.reviewCount + b.reviewCount,
        }),
        {
          totalBatches: 0,
          totalRecords: 0,
          totalRevenue: 0,
          reviewCount: 0,
        },
      ),
    [batches],
  );

  /**
   * Revenue per batch on a date axis: each batch lands on its upload day (two
   * batches on one day add up) and every other day in the window is a zero, so
   * the area has a shape instead of a few isolated points. A whole current
   * year stops at today rather than flat-lining through the future.
   */
  const revenueData = useMemo(() => {
    const byDay = new Map<string, number>();
    batches.forEach((b) => {
      const day = localDay(new Date(b.importDate));
      byDay.set(day, (byDay.get(day) ?? 0) + b.totalInvoice);
    });

    const start = new Date(year, month ? month - 1 : 0, 1);
    const today = new Date();
    const end = month
      ? new Date(year, month, 0)
      : new Date(
          Math.min(
            new Date(year, 11, 31).getTime(),
            Math.max(
              new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
              ).getTime(),
              start.getTime(),
            ),
          ),
        );

    const out: { date: string; totalInvoice: number }[] = [];
    for (
      const d = new Date(start);
      d.getTime() <= end.getTime();
      d.setDate(d.getDate() + 1)
    ) {
      const date = localDay(d);
      out.push({ date, totalInvoice: byDay.get(date) ?? 0 });
    }
    return out;
  }, [batches, year, month]);

  const kpis: Omit<StatCardProps, "index">[] = [
    {
      title: "Upload Batches",
      value: isLoading ? "—" : totals.totalBatches.toLocaleString("en-IN"),
      icon: Layers,
      loading: isLoading,
      description: `Year ${year}`,
      action: { label: "Details", href: detailsHref },
    },
    {
      title: "Parts Rows",
      value: isLoading ? "—" : totals.totalRecords.toLocaleString("en-IN"),
      icon: Package,
      loading: isLoading,
      description: "Rows accepted across batches",
      action: { label: "Details", href: detailsHref },
    },
    {
      title: "Total Revenue",
      value: isLoading ? "—" : inr(totals.totalRevenue),
      icon: IndianRupee,
      loading: isLoading,
      description: "Sum of Total Invoice",
      action: { label: "Details", href: detailsHref },
    },
  ];

  const monthControl = (
    <div className='space-y-2 pt-3'>
      <span className='text-xs font-medium text-muted-foreground'>
        Upload period
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

  return (
    <div className='space-y-6'>
      <h4 className='text-black font-semibold'>Parts Sold</h4>
      <div className='flex items-center justify-end'>
        <YearSelect value={year} onChange={setYear} />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
        {kpis.map((kpi, i) => (
          <StatCard key={kpi.title} {...kpi} index={i} />
        ))}
      </div>

      {isLoading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-1 gap-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Revenue per Batch</CardTitle>
              <CardDescription>
                Total Invoice summed per counter sale batch, by upload date —{" "}
                {month ? `${MONTH_NAMES[month - 1]} ${year}` : `all of ${year}`}
              </CardDescription>
              {monthControl}
            </CardHeader>
            <CardContent>
              {batches.length === 0 ? (
                <EmptyChartState
                  message={`No CPOTC Orders sale reports uploaded in ${
                    month ? `${MONTH_NAMES[month - 1]} ` : ""
                  }${year} yet.`}
                />
              ) : (
                <ChartContainer
                  config={revenueConfig}
                  className='h-[260px] w-full'
                >
                  <AreaChart data={revenueData} margin={{ left: 0, right: 12 }}>
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
                      width={56}
                      tickFormatter={compactInr}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={formatDay}
                          formatter={(value) => inr(Number(value))}
                        />
                      }
                    />
                    <Area
                      type='monotone'
                      fillOpacity={0.25}
                      strokeWidth={2}
                      dataKey='totalInvoice'
                      fill='var(--color-totalInvoice)'
                      stroke='var(--color-totalInvoice)'
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
