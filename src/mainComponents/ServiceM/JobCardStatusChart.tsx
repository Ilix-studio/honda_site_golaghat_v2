import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

import { useGetJobCardStatusStatsQuery } from "@/redux-store/services/ServiceM/jobCardApi";
import { JOB_CARD_STATUS_LABELS } from "@/types/jobCard.types";

const statusConfig: ChartConfig = {
  count: { label: "Job Cards", color: "var(--chart-2)" },
};

const JobCardStatusChart = () => {
  const { data, isLoading } = useGetJobCardStatusStatsQuery();
  const stats = data?.data;

  const chartData = (stats?.byStatus ?? [])
    .filter((s) => s.count > 0)
    .map((s) => ({ label: JOB_CARD_STATUS_LABELS[s.status], count: s.count }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Job Card Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='h-[240px] w-full animate-pulse rounded-xl bg-gray-100' />
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Job Card Status</CardTitle>
          <CardDescription>Current lifecycle breakdown, branch-wide</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>No job cards yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Job Card Status</CardTitle>
        <CardDescription>Current lifecycle breakdown, branch-wide</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-3 gap-3'>
          <MetricTile
            index={0}
            label='Open'
            value={stats.openCount}
            bg='bg-blue-50'
            text='text-blue-700'
            sub='text-blue-500'
          />
          <MetricTile
            index={1}
            label='Closed'
            value={stats.closedCount}
            bg='bg-emerald-50'
            text='text-emerald-700'
            sub='text-emerald-500'
          />
          <MetricTile
            index={2}
            label='Cancelled'
            value={stats.cancelledCount}
            bg='bg-red-50'
            text='text-red-700'
            sub='text-red-500'
          />
        </div>

        <ChartContainer config={statusConfig} className='h-[240px] w-full'>
          <BarChart data={chartData} layout='vertical' margin={{ left: 12, right: 12 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type='number' hide allowDecimals={false} />
            <YAxis
              dataKey='label'
              type='category'
              tickLine={false}
              axisLine={false}
              width={130}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey='count' fill='var(--color-count)' radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default JobCardStatusChart;
