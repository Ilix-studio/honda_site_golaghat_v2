import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  XAxis,
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { MetricTile } from "./StatCard";
import {
  ChartSkeleton,
  EmptyChartState,
  inr,
  YearSelect,
} from "@/mainComponents/DataImport/SalesKpiCharts";

import { useGetRevenueStatsQuery } from "@/redux-store/services/ServiceM/jobCardApi";

const revenueTrendConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
};

const revenueVsTaxConfig: ChartConfig = {
  subtotal: { label: "Subtotal", color: "var(--chart-1)" },
  taxTotal: { label: "Tax", color: "var(--chart-4)" },
};

const invoiceTrendConfig: ChartConfig = {
  invoiceCount: { label: "Invoices", color: "var(--chart-5)" },
};

const revenueSplitConfig: ChartConfig = {
  subtotal: { label: "Subtotal", color: "var(--chart-1)" },
  taxTotal: { label: "Tax", color: "var(--chart-4)" },
};

const taxPercentConfig: ChartConfig = {
  value: { label: "Tax %", color: "var(--chart-2)" },
};

/**
 * Job Card Revenue KPI block, sourced from the live JobCardInvoice pipeline
 * (getRevenueStats — distinct from the historical service-jobcard bulk
 * import shown elsewhere on this tab). Mirrors PartsKpiCharts.tsx's shadcn
 * chart set (Area/Bar/Line/Pie/Radar/RadialBar) for visual consistency.
 */
export default function JobCardRevenueKpiCharts() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const { data, isLoading } = useGetRevenueStatsQuery({ year });
  const { data: prevData } = useGetRevenueStatsQuery({ year: year - 1 });

  const monthly = data?.data.monthly ?? [];
  const totals = data?.data.totals;

  const yoyConfig: ChartConfig = useMemo(
    () => ({
      current: { label: `${year}`, color: "var(--chart-1)" },
      previous: { label: `${year - 1}`, color: "var(--chart-3)" },
    }),
    [year]
  );

  const yoyData = useMemo(() => {
    const prevMonthly = prevData?.data.monthly ?? [];
    return monthly.map((m, i) => ({
      month: m.month,
      current: m.revenue,
      previous: prevMonthly[i]?.revenue ?? 0,
    }));
  }, [monthly, prevData]);

  const revenueSplitData = useMemo(() => {
    if (!totals || totals.totalRevenue === 0) return [];
    return [
      {
        key: "subtotal",
        label: "Subtotal",
        value: totals.totalRevenue - totals.totalTax,
        fill: "var(--color-subtotal)",
      },
      {
        key: "taxTotal",
        label: "Tax",
        value: totals.totalTax,
        fill: "var(--color-taxTotal)",
      },
    ];
  }, [totals]);

  const taxPercent =
    totals && totals.totalRevenue > 0
      ? Math.round((totals.totalTax / totals.totalRevenue) * 1000) / 10
      : 0;
  const radialData = [
    { key: "tax", value: taxPercent, fill: "var(--color-value)" },
  ];

  const yearControl = (
    <div className='flex items-center justify-between flex-wrap gap-3'>
      <span className='text-xs font-medium text-muted-foreground'>
        Invoice year
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
          label='Job Card Revenue'
          value={inr(totals?.totalRevenue ?? 0)}
          bg='bg-emerald-50'
          text='text-emerald-700'
          sub='text-emerald-500'
        />
        <MetricTile
          index={1}
          label='Invoices'
          value={(totals?.totalInvoices ?? 0).toLocaleString("en-IN")}
          bg='bg-blue-50'
          text='text-blue-700'
          sub='text-blue-500'
        />
        <MetricTile
          index={2}
          label='Avg Invoice Value'
          value={inr(totals?.avgInvoiceValue ?? 0)}
          bg='bg-amber-50'
          text='text-amber-700'
          sub='text-amber-500'
        />
      </div>

      {monthly.length === 0 ? (
        <EmptyChartState message={`No invoiced job cards in ${year} yet.`} />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Revenue Trend</CardTitle>
              <CardDescription>Invoiced revenue by month in {year}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={revenueTrendConfig}
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
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    dataKey='revenue'
                    type='monotone'
                    fill='var(--color-revenue)'
                    fillOpacity={0.2}
                    stroke='var(--color-revenue)'
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Subtotal vs Tax</CardTitle>
              <CardDescription>Invoice composition, per month</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={revenueVsTaxConfig}
                className='h-[260px] w-full'
              >
                <BarChart data={monthly} margin={{ left: 0, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey='month'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey='subtotal'
                    stackId='revenue'
                    fill='var(--color-subtotal)'
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey='taxTotal'
                    stackId='revenue'
                    fill='var(--color-taxTotal)'
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Invoice Count Trend</CardTitle>
              <CardDescription>Invoices raised per month</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={invoiceTrendConfig}
                className='h-[220px] w-full'
              >
                <LineChart data={monthly} margin={{ left: 0, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey='month'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    dataKey='invoiceCount'
                    type='monotone'
                    stroke='var(--color-invoiceCount)'
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Revenue, Year over Year</CardTitle>
              <CardDescription>
                {year} vs {year - 1} — monthly revenue shape
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={yoyConfig}
                className='mx-auto h-[300px] w-full max-w-[420px]'
              >
                <RadarChart data={yoyData}>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <PolarGrid />
                  <PolarAngleAxis dataKey='month' tick={{ fontSize: 11 }} />
                  <Radar
                    dataKey='current'
                    fill='var(--color-current)'
                    fillOpacity={0.4}
                    stroke='var(--color-current)'
                  />
                  <Radar
                    dataKey='previous'
                    fill='var(--color-previous)'
                    fillOpacity={0.2}
                    stroke='var(--color-previous)'
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </RadarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Revenue Composition</CardTitle>
            <CardDescription>Subtotal vs tax, {year} total</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton />
            ) : revenueSplitData.length === 0 ? (
              <EmptyChartState message='No invoiced revenue yet.' />
            ) : (
              <ChartContainer
                config={revenueSplitConfig}
                className='mx-auto h-[220px] w-full max-w-[280px]'
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={revenueSplitData}
                    dataKey='value'
                    nameKey='label'
                    innerRadius={50}
                  >
                    {revenueSplitData.map((entry) => (
                      <Cell key={entry.key} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey='label' />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Tax % of Revenue</CardTitle>
            <CardDescription>Share of invoiced revenue that is tax</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <div className='relative mx-auto h-[200px] w-[200px]'>
                <ChartContainer
                  config={taxPercentConfig}
                  className='h-full w-full'
                >
                  <RadialBarChart
                    data={radialData}
                    startAngle={90}
                    endAngle={90 - (360 * taxPercent) / 100}
                    innerRadius={70}
                    outerRadius={100}
                  >
                    <RadialBar dataKey='value' background cornerRadius={10} />
                  </RadialBarChart>
                </ChartContainer>
                <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
                  <span className='text-3xl font-black text-gray-900'>
                    {taxPercent}%
                  </span>
                  <span className='text-xs text-muted-foreground'>Tax</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
