import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Bike, IndianRupee, Receipt } from "lucide-react";

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

import { useGetB2BSalesKPIsQuery } from "@/redux-store/services/BikeSystemApi2/b2bSalesApi";

import { StatCard, StatCardProps } from "../StatCard";
import { YearSelect } from "../SuperDashBoards";
import {
  ChartSkeleton,
  EmptyChartState,
  compactInr,
  formatDay,
  inr,
} from "@/mainComponents/DataImport/SalesKpiCharts";

/**
 * Each chart carries a single series, so the card title is what identifies it —
 * no legend, and no second hue to keep apart. --chart-1/--chart-2 are the pair
 * the sibling assign dashboards already use for the same count/value split.
 */
const challanCountConfig: ChartConfig = {
  challanCount: { label: "Challans", color: "var(--chart-1)" },
};

const payableConfig: ChartConfig = {
  payablePrice: { label: "Payable", color: "var(--chart-2)" },
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

const ChallanReportKPIs = () => {
  const [year, setYear] = useState(() => new Date().getFullYear());
  /** 0 = whole year, 1–12 = a single month. */
  const [month, setMonth] = useState(0);
  const { data, isLoading } = useGetB2BSalesKPIsQuery();
  const kpiData = data?.data;

  /**
   * The KPI endpoint takes only `branchId` — it returns every challan date it
   * has, across all years, and only dates that have a challan. So the year /
   * month filter is applied here and every day in the window is filled with
   * zeros: a day with no challan is a real zero, and without the fill a few
   * scattered dates would draw almost nothing. A whole current year stops at
   * today rather than flat-lining through the future.
   */
  const daily = useMemo(() => {
    const DAY = 86_400_000;
    const key = (t: number) => new Date(t).toISOString().slice(0, 10);
    const todayMs = Date.parse(key(Date.now()));
    const start = Date.UTC(year, month ? month - 1 : 0, 1);
    const end = month
      ? Date.UTC(year, month, 0)
      : Math.min(Date.UTC(year, 11, 31), Math.max(todayMs, start));
    const byDate = new Map((kpiData?.dailyTrend ?? []).map((d) => [d.date, d]));
    const out = [];
    for (let t = start; t <= end; t += DAY) {
      const date = key(t);
      out.push(
        byDate.get(date) ?? {
          date,
          challanCount: 0,
          totalPrice: 0,
          payablePrice: 0,
        },
      );
    }
    return out;
  }, [kpiData, year, month]);

  /**
   * The totals below are all-time — the endpoint has no year parameter, so the
   * cards deliberately say so rather than implying they follow the selector.
   */
  const kpis: Omit<StatCardProps, "index">[] = [
    {
      title: "Challans Issued",
      value: kpiData?.totalChallans ?? "—",
      icon: Receipt,
      loading: isLoading,
      description: "All time, all branches",
      action: { label: "Details", href: "/admin/b2b-sales" },
    },
    {
      title: "Vehicles Handed Over",
      value: kpiData?.totalVehicles ?? "—",
      icon: Bike,
      loading: isLoading,
      description: "Units across all active challans",
      action: { label: "Details", href: "/admin/b2b-sales" },
    },
    {
      title: "Payable Value",
      value: kpiData ? inr(kpiData.totalPayableValue) : "—",
      icon: IndianRupee,
      loading: isLoading,
      description: "Post-TCS, all time",
      action: { label: "Details", href: "/admin/b2b-sales" },
    },
  ];

  const monthControl = (
    <div className='space-y-2 pt-3'>
      <span className='text-xs font-medium text-muted-foreground'>
        Challan period
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

  const periodLabel = month ? `${MONTH_NAMES[month - 1]} ${year}` : `${year}`;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-end'>
        <YearSelect year={year} onChange={setYear} />
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
      ) : !(kpiData?.dailyTrend ?? []).some((d) =>
          d.date.startsWith(`${year}-`),
        ) ? (
        <EmptyChartState
          message={`No challans raised in ${year} yet — create a B2B sale to populate these charts.`}
        />
      ) : (
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Daily Challans</CardTitle>
              <CardDescription>
                Challans raised per day in {periodLabel}
              </CardDescription>
              {monthControl}
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={challanCountConfig}
                className='h-[240px] w-full'
              >
                <AreaChart data={daily} margin={{ left: 0, right: 12 }}>
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
                    width={32}
                    allowDecimals={false}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent labelFormatter={formatDay} />}
                  />
                  <Area
                    dataKey='challanCount'
                    type='monotone'
                    fill='var(--color-challanCount)'
                    fillOpacity={0.2}
                    stroke='var(--color-challanCount)'
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Daily Payable Value</CardTitle>
              <CardDescription>
                Post-TCS value of challans raised per day in {periodLabel}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={payableConfig}
                className='h-[240px] w-full'
              >
                <AreaChart data={daily} margin={{ left: 0, right: 12 }}>
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
                    dataKey='payablePrice'
                    type='monotone'
                    fill='var(--color-payablePrice)'
                    fillOpacity={0.2}
                    stroke='var(--color-payablePrice)'
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ChallanReportKPIs;
