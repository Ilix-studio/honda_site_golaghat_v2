import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

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
import { ChartSkeleton, EmptyChartState, inr } from "@/mainComponents/DataImport/SalesKpiCharts";
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

export default function CounterSaleKpiCharts() {
  const { isAuthenticated } = useAppSelector(selectAuth);
  const { data, isLoading } = useGetCounterSaleBatchesQuery(undefined, {
    skip: !isAuthenticated,
  });

  const batches = useMemo(
    () =>
      [...(data?.data ?? [])].sort(
        (a, b) => new Date(a.importDate).getTime() - new Date(b.importDate).getTime(),
      ),
    [data],
  );

  const totals = useMemo(
    () =>
      batches.reduce(
        (acc, b) => ({
          totalBatches: acc.totalBatches + 1,
          totalRecords: acc.totalRecords + b.totalRecords,
          totalRevenue: acc.totalRevenue + b.totalInvoice,
        }),
        { totalBatches: 0, totalRecords: 0, totalRevenue: 0 },
      ),
    [batches],
  );

  const labels = useMemo(
    () => buildBatchLabels(batches.map((b) => b.importDate)),
    [batches],
  );

  const revenueData = useMemo(
    () =>
      batches.map((b, i) => ({
        label: labels[i],
        totalInvoice: b.totalInvoice,
      })),
    [batches, labels],
  );

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <MetricTile
          index={0}
          label='Batches'
          value={totals.totalBatches.toLocaleString("en-IN")}
          bg='bg-gray-100'
          text='text-gray-900'
          sub='text-gray-500'
        />
        <MetricTile
          index={1}
          label='Records'
          value={totals.totalRecords.toLocaleString("en-IN")}
          bg='bg-blue-50'
          text='text-blue-700'
          sub='text-blue-500'
        />
        <MetricTile
          index={2}
          label='Revenue Collected'
          value={inr(totals.totalRevenue)}
          bg='bg-emerald-50'
          text='text-emerald-700'
          sub='text-emerald-500'
        />
      </div>

      {batches.length === 0 ? (
        <EmptyChartState message='No counter sale reports uploaded yet.' />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Revenue per Batch</CardTitle>
            <CardDescription>
              Total Invoice summed per uploaded counter sale batch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className='h-[260px] w-full'>
              <BarChart data={revenueData} margin={{ left: 0, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey='label'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey='totalInvoice' fill='var(--color-totalInvoice)' radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
