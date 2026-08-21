import { useMemo, useState } from "react";
import {

  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
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
  inr,
} from "@/mainComponents/DataImport/SalesKpiCharts";
import { useGetCounterSaleBatchesQuery } from "@/redux-store/services/counterSaleApi";
import { useAppSelector } from "@/hooks/redux";
import { selectAuth } from "@/redux-store/slices/authSlice";

const revenueConfig: ChartConfig = {
  totalInvoice: { label: "Revenue", color: "var(--chart-1)" },
};

/** Short "23 Jul" labels, disambiguated with "#2" etc. when a date repeats. */
function buildBatchLabels(dates: string[]): string[] {
  const seen = new Map<string, number>();
  const base = dates.map((d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
  );
  const counts = new Map<string, number>();
  base.forEach((b) => counts.set(b, (counts.get(b) ?? 0) + 1));

  return base.map((b) => {
    if ((counts.get(b) ?? 0) <= 1) return b;
    const n = (seen.get(b) ?? 0) + 1;
    seen.set(b, n);
    return `${b} #${n}`;
  });
}

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
  const { isAuthenticated } = useAppSelector(selectAuth);
  const { data, isLoading } = useGetCounterSaleBatchesQuery(undefined, {
    skip: !isAuthenticated,
  });

  /**
   * The endpoint returns every batch it has, so the year filter is applied
   * here — on import date, which is the only date a batch carries.
   */
  const batches = useMemo(
    () =>
      (data?.data ?? [])
        .filter((b) => new Date(b.importDate).getFullYear() === year)
        .sort(
          (a, b) =>
            new Date(a.importDate).getTime() - new Date(b.importDate).getTime(),
        ),
    [data, year],
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

  const labels = useMemo(
    () => buildBatchLabels(batches.map((b) => b.importDate)),
    [batches],
  );

  /**
   * Per-batch takings and the running total they add up to. Both are rupees
   * on the same scale, but one is a rate and the other a position — they get
   * separate charts rather than a second axis on one. The running total
   * restarts at each year, since that is the window on screen.
   */
  const revenueData = useMemo(() => {
    let running = 0;
    return batches.map((b, i) => {
      running += b.totalInvoice;
      return {
        label: labels[i],
        totalInvoice: b.totalInvoice,
        cumulativeInvoice: running,
      };
    });
  }, [batches, labels]);

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
      ) : batches.length === 0 ? (
        <EmptyChartState
          message={`No counter sale reports uploaded in ${year} yet.`}
        />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-1 gap-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Revenue per Batch</CardTitle>
              <CardDescription>
                Total Invoice summed per counter sale batch uploaded in {year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={revenueConfig}
                className='h-[260px] w-full'
              >
                <BarChart data={revenueData} margin={{ left: 0, right: 12 }}>
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
                  <Bar
                    dataKey='totalInvoice'
                    fill='var(--color-totalInvoice)'
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
