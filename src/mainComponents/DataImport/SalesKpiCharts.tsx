import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { MetricTile } from "@/mainComponents/Admin/AdminDash/StatCard";

import type {
  Granularity,
  SalesByModel,
  SalesTimeseriesPoint,
} from "@/redux-store/services/dataImport.types";

export const GRANULARITIES: { value: Granularity; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

export const inr = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export const GranularityToggle = ({
  value,
  onChange,
}: {
  value: Granularity;
  onChange: (g: Granularity) => void;
}) => (
  <div className='inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1'>
    {GRANULARITIES.map((g) => (
      <button
        key={g.value}
        type='button'
        onClick={() => onChange(g.value)}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
          value === g.value
            ? "bg-gray-900 text-white shadow-sm"
            : "text-gray-500 hover:text-gray-900"
        }`}
      >
        {g.label}
      </button>
    ))}
  </div>
);

export const YEAR_OPTIONS = Array.from(
  { length: 4 },
  (_, i) => new Date().getFullYear() - i
);

export const YearSelect = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (year: number) => void;
}) => (
  <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
    <SelectTrigger className='w-[100px] h-9'>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {YEAR_OPTIONS.map((y) => (
        <SelectItem key={y} value={String(y)}>
          {y}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export const ChartSkeleton = () => (
  <div className='h-[260px] w-full animate-pulse rounded-xl bg-gray-100' />
);

export const EmptyChartState = ({ message }: { message: string }) => (
  <div className='flex h-[260px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 text-center'>
    <BarChart3 className='h-8 w-8 text-gray-300' />
    <p className='max-w-xs text-sm text-muted-foreground'>{message}</p>
  </div>
);

const revenueTrendConfig: ChartConfig = {
  totalRevenue: { label: "Total Revenue", color: "var(--chart-1)" },
};

const revenueMixConfig: ChartConfig = {
  labourRevenue: { label: "Labour", color: "var(--chart-1)" },
  partsRevenue: { label: "Parts", color: "var(--chart-2)" },
  lubesRevenue: { label: "Lubes", color: "var(--chart-3)" },
  accessoriesRevenue: { label: "Accessories", color: "var(--chart-4)" },
};

export const topModelsConfig: ChartConfig = {
  totalRevenue: { label: "Revenue", color: "var(--chart-5)" },
};

/** Horizontal top-N bar chart for revenue-by-X breakdowns (models, technicians, ...). */
export function RevenueByBarChart<
  T extends { totalRevenue: number; jobCardCount: number },
>({
  title,
  description,
  data,
  categoryKey,
  color = "var(--chart-5)",
}: {
  title: string;
  description: string;
  data: T[];
  categoryKey: keyof T & string;
  color?: string;
}) {
  const config: ChartConfig = {
    totalRevenue: { label: "Revenue", color },
  };
  // Recharts' generic dataKey inference doesn't thread through this
  // component's own generic T — widen to a plain record for the chart.
  const chartData = data as unknown as Record<string, unknown>[];

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className='text-sm text-muted-foreground'>No data yet.</p>
        ) : (
          <ChartContainer config={config} className='h-[220px] w-full'>
            <BarChart data={chartData} layout='vertical' margin={{ left: 12, right: 12 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type='number' hide />
              <YAxis
                dataKey={categoryKey as string}
                type='category'
                tickLine={false}
                axisLine={false}
                width={110}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey='totalRevenue' fill='var(--color-totalRevenue)' radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export interface SalesKpiChartsProps {
  granularity: Granularity;
  onGranularityChange: (g: Granularity) => void;
  timeseries: SalesTimeseriesPoint[];
  byModel?: SalesByModel[];
  loading?: boolean;
  emptyMessage?: string;
}

/**
 * Shared sales/revenue KPI block (granularity toggle + totals + revenue
 * trend + revenue mix + top models) built on the shadcn chart primitive.
 * Consumers can render additional breakdown charts (e.g. by technician)
 * below it using <RevenueByBarChart />.
 */
const SalesKpiCharts = ({
  granularity,
  onGranularityChange,
  timeseries,
  byModel = [],
  loading,
  emptyMessage = "No sales data yet — import a service-jobcard report to see revenue trends.",
}: SalesKpiChartsProps) => {
  const topModels = useMemo(
    () => [...byModel].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5),
    [byModel]
  );

  const totals = useMemo(
    () =>
      timeseries.reduce(
        (acc, point) => ({
          revenue: acc.revenue + point.totalRevenue,
          jobCards: acc.jobCards + point.jobCardCount,
        }),
        { revenue: 0, jobCards: 0 }
      ),
    [timeseries]
  );

  const granularityControl = (
    <div className='flex items-center justify-between flex-wrap gap-3'>
      <span className='text-xs font-medium text-muted-foreground'>View by</span>
      <GranularityToggle value={granularity} onChange={onGranularityChange} />
    </div>
  );

  if (loading) {
    return (
      <div className='space-y-4'>
        {granularityControl}
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  if (timeseries.length === 0) {
    return (
      <div className='space-y-4'>
        {granularityControl}
        <EmptyChartState message={emptyMessage} />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {granularityControl}

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <MetricTile
          index={0}
          label='Total Revenue'
          value={inr(totals.revenue)}
          bg='bg-red-50'
          text='text-red-700'
          sub='text-red-500'
        />
        <MetricTile
          index={1}
          label='Job Cards Closed'
          value={totals.jobCards.toLocaleString("en-IN")}
          bg='bg-blue-50'
          text='text-blue-700'
          sub='text-blue-500'
        />
        <MetricTile
          index={2}
          label='Avg Revenue / Job Card'
          value={inr(
            totals.jobCards > 0 ? Math.round(totals.revenue / totals.jobCards) : 0
          )}
          bg='bg-emerald-50'
          text='text-emerald-700'
          sub='text-emerald-500'
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Revenue Trend</CardTitle>
          <CardDescription>Total revenue by {granularity}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueTrendConfig} className='h-[260px] w-full'>
            <AreaChart data={timeseries} margin={{ left: 0, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey='bucket' tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey='totalRevenue'
                type='monotone'
                fill='var(--color-totalRevenue)'
                fillOpacity={0.2}
                stroke='var(--color-totalRevenue)'
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Revenue Mix</CardTitle>
          <CardDescription>
            Labour, parts, lubes &amp; accessories by {granularity}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueMixConfig} className='h-[280px] w-full'>
            <BarChart data={timeseries} margin={{ left: 0, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey='bucket' tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey='labourRevenue' stackId='mix' fill='var(--color-labourRevenue)' radius={[0, 0, 0, 0]} />
              <Bar dataKey='partsRevenue' stackId='mix' fill='var(--color-partsRevenue)' radius={[0, 0, 0, 0]} />
              <Bar dataKey='lubesRevenue' stackId='mix' fill='var(--color-lubesRevenue)' radius={[0, 0, 0, 0]} />
              <Bar dataKey='accessoriesRevenue' stackId='mix' fill='var(--color-accessoriesRevenue)' radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {topModels.length > 0 && (
        <RevenueByBarChart
          title='Top Models by Revenue'
          description='Best performing models this period'
          data={topModels}
          categoryKey='modelName'
          color='var(--chart-5)'
        />
      )}
    </div>
  );
};

export default SalesKpiCharts;
