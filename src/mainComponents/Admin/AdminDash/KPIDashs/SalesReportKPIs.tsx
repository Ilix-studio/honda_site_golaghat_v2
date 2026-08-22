import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { FileSpreadsheet, IndianRupee } from "lucide-react";

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

import { useGetSalesReportKpisQuery } from "@/redux-store/services/salesReportApi";

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
const countConfig: ChartConfig = {
  count: { label: "Records", color: "var(--chart-1)" },
};

const paymentConfig: ChartConfig = {
  totalPayment: { label: "Payment", color: "var(--chart-2)" },
};

const SalesReportKPIs = () => {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const { data, isLoading } = useGetSalesReportKpisQuery({ year });
  const stats = data?.data;

  const monthly = stats?.monthly ?? [];
  const hasCount = monthly.some((m) => m.count > 0);
  const hasPayment = monthly.some((m) => m.totalPayment > 0);

  const kpis: Omit<StatCardProps, "index">[] = [
    {
      title: "Records Imported",
      value: stats?.totals.totalRecords ?? "—",
      icon: FileSpreadsheet,
      loading: isLoading,
      description: `Year ${year}, all branches`,
      action: { label: "Details", href: "/admin/sales-report" },
    },
    {
      title: "Total Payment",
      value: stats ? inr(stats.totals.totalPayment) : "—",
      icon: IndianRupee,
      loading: isLoading,
      description: "Sum of imported payment",
      action: { label: "Details", href: "/admin/sales-report" },
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
      ) : !hasCount && !hasPayment ? (
        <EmptyChartState
          message={`No sales report rows imported in ${year} yet — upload a sales report to populate these charts.`}
        />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Monthly Records</CardTitle>
              <CardDescription>
                Sales report rows accepted per month in {year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={countConfig} className='h-[240px] w-full'>
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
                  <Bar dataKey='count' fill='var(--color-count)' radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Monthly Payment</CardTitle>
              <CardDescription>
                Payment value on imported rows per month in {year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={paymentConfig}
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
                    dataKey='totalPayment'
                    type='monotone'
                    fill='var(--color-totalPayment)'
                    fillOpacity={0.2}
                    stroke='var(--color-totalPayment)'
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

export default SalesReportKPIs;
