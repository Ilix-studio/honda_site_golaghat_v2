import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
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

const ChallanReportKPIs = () => {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const { data, isLoading } = useGetB2BSalesKPIsQuery();
  const kpiData = data?.data;

  /**
   * The KPI endpoint takes only `branchId` — it returns every month it has, as
   * sparse `YYYY-MM` keys across all years. So the year filter is applied here
   * and the gaps are filled with zeros: a month with no challan is a real zero,
   * and leaving it out would let the area chart slope straight through it.
   */
  const monthly = useMemo(() => {
    const prefix = `${year}-`;
    const byMonth = new Map(
      (kpiData?.monthlyTrend ?? [])
        .filter((m) => m.month.startsWith(prefix))
        .map((m) => [Number(m.month.slice(prefix.length)), m]),
    );

    return MONTH_LABELS.map((label, i) => {
      const found = byMonth.get(i + 1);
      return {
        month: label,
        challanCount: found?.challanCount ?? 0,
        payablePrice: found?.payablePrice ?? 0,
      };
    });
  }, [kpiData, year]);

  const hasCount = monthly.some((m) => m.challanCount > 0);
  const hasPayable = monthly.some((m) => m.payablePrice > 0);

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
      ) : !hasCount && !hasPayable ? (
        <EmptyChartState
          message={`No challans raised in ${year} yet — create a B2B sale to populate these charts.`}
        />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Monthly Challans</CardTitle>
              <CardDescription>
                Challans raised per month in {year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={challanCountConfig}
                className='h-[240px] w-full'
              >
                <BarChart data={monthly} margin={{ left: 0, right: 12 }}>
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
                    width={32}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey='challanCount'
                    fill='var(--color-challanCount)'
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Monthly Payable Value</CardTitle>
              <CardDescription>
                Post-TCS value of challans raised per month in {year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={payableConfig}
                className='h-[240px] w-full'
              >
                <AreaChart data={monthly} margin={{ left: 0, right: 12 }}>
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
                    width={56}
                    tickFormatter={compactInr}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
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
