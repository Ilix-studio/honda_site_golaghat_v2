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
import {
  ChartSkeleton,
  EmptyChartState,
  inr,
} from "@/mainComponents/DataImport/SalesKpiCharts";
import { useGetSalesReportKpisQuery } from "@/redux-store/services/salesReportApi";
import { useAppSelector } from "@/hooks/redux";
import { selectAuth } from "@/redux-store/slices/authSlice";

const monthlyConfig: ChartConfig = {
  totalPayment: { label: "Total Payment", color: "var(--chart-1)" },
};

/**
 * Sales Report KPIs — Super-Admin only. Cross-branch monthly trend,
 * purchase-type breakdown, and match-outcome breakdown (matched vs
 * unmatched vs conflict), mirroring CounterSaleKpiCharts.tsx's composition.
 */
export default function SalesReportKpiCharts() {
  const { isAuthenticated } = useAppSelector(selectAuth);
  const year = new Date().getFullYear();
  const { data, isLoading } = useGetSalesReportKpisQuery(
    { year },
    { skip: !isAuthenticated },
  );

  const monthlyData = useMemo(
    () => (data?.data.monthly ?? []).map((m) => ({ month: m.month, totalPayment: m.totalPayment })),
    [data],
  );

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <ChartSkeleton />
      </div>
    );
  }

  const totals = data?.data.totals ?? { totalRecords: 0, totalPayment: 0 };
  const byOutcome = data?.data.byOutcome ?? [];
  const byPurchaseType = data?.data.byPurchaseType ?? [];

  const matchedCount =
    byOutcome.find((o) => o.outcome === "matched_status_flipped")?.count ?? 0;
  const unmatchedCount =
    byOutcome.find((o) => o.outcome === "unmatched")?.count ?? 0;
  const conflictCount =
    byOutcome.find((o) => o.outcome === "customer_conflict")?.count ?? 0;

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <MetricTile
          index={0}
          label='Total Records'
          value={totals.totalRecords.toLocaleString("en-IN")}
          bg='bg-gray-100'
          text='text-gray-900'
          sub='text-gray-500'
        />
        <MetricTile
          index={1}
          label='Total Payment'
          value={inr(totals.totalPayment)}
          bg='bg-emerald-50'
          text='text-emerald-700'
          sub='text-emerald-500'
        />
        <MetricTile
          index={2}
          label='Matched / Unmatched / Conflict'
          value={`${matchedCount} / ${unmatchedCount} / ${conflictCount}`}
          bg='bg-blue-50'
          text='text-blue-700'
          sub='text-blue-500'
        />
      </div>

      {totals.totalRecords === 0 ? (
        <EmptyChartState message='No sales reports uploaded yet.' />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Total Payment by Month</CardTitle>
              <CardDescription>Sum of Total Payment across all branches, {year}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={monthlyConfig} className='h-[260px] w-full'>
                <BarChart data={monthlyData} margin={{ left: 0, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey='month' tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey='totalPayment' fill='var(--color-totalPayment)' radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {byPurchaseType.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>By Purchase Type</CardTitle>
                <CardDescription>Record count and total payment per purchase type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {byPurchaseType.map((p) => (
                    <div
                      key={p.purchaseType}
                      className='flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm'
                    >
                      <span className='font-medium text-gray-800'>{p.purchaseType}</span>
                      <span className='text-gray-500'>
                        {p.count} record(s) · {inr(p.totalPayment)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
