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
import { MetricTile } from "@/mainComponents/Admin/AdminDash/StatCard";
import {
  ChartSkeleton,
  EmptyChartState,
  inr,
  YearSelect,
} from "@/mainComponents/DataImport/SalesKpiCharts";

import {
  useGetServiceJobcardStatsQuery,
  useGetServiceJobcardStatusQuery,
} from "@/redux-store/services/serviceJobcardApi";

const importedTrendConfig: ChartConfig = {
  jobCardCount: { label: "Job Cards Imported", color: "var(--chart-1)" },
};

const ServiceJobcardKpiCharts = () => {
  const [year, setYear] = useState(() => new Date().getFullYear());

  const { data: statsData, isLoading: statsLoading } =
    useGetServiceJobcardStatsQuery({
      year,
    });
  const { data: prevStatsData } = useGetServiceJobcardStatsQuery({
    year: year - 1,
  });
  const { data: statusData } = useGetServiceJobcardStatusQuery();

  const monthly = statsData?.data.monthly ?? [];
  const totals = statsData?.data.totals;
  const status = statusData?.data;

  const yoyConfig: ChartConfig = useMemo(
    () => ({
      current: { label: `${year}`, color: "var(--chart-1)" },
      previous: { label: `${year - 1}`, color: "var(--chart-2)" },
    }),
    [year],
  );

  const yoyData = useMemo(() => {
    const prevMonthly = prevStatsData?.data.monthly ?? [];
    return monthly.map((m, i) => ({
      month: m.month,
      current: m.jobCardCount,
      previous: prevMonthly[i]?.jobCardCount ?? 0,
    }));
  }, [monthly, prevStatsData]);

  const latestChange = status?.latestChange ?? null;

  const yearControl = (
    <div className='flex items-center justify-between flex-wrap gap-3'>
      <span className='text-xs font-medium text-muted-foreground'>
        Import year
      </span>
      <YearSelect value={year} onChange={setYear} />
    </div>
  );

  if (statsLoading) {
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

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <MetricTile
          index={0}
          label='Total Job Cards'
          value={(totals?.totalJobCards ?? 0).toLocaleString("en-IN")}
          bg='bg-blue-50'
          text='text-blue-700'
          sub='text-blue-500'
        />

        <MetricTile
          index={2}
          label='Upload Batches'
          value={(totals?.totalBatches ?? 0).toLocaleString("en-IN")}
          bg='bg-gray-100'
          text='text-gray-800'
          sub='text-gray-500'
        />
        <MetricTile
          index={3}
          label='Total Revenue'
          value={inr(Math.round(status?.totalRevenue ?? 0))}
          bg='bg-emerald-50'
          text='text-emerald-700'
          sub='text-emerald-500'
        />

        <MetricTile
          index={5}
          label='Latest Upload Revenue Add'
          value={
            latestChange
              ? `${latestChange.revenueDelta >= 0 ? "+" : "-"}${inr(
                  Math.round(Math.abs(latestChange.revenueDelta)),
                )}`
              : "—"
          }
          bg='bg-red-50'
          text='text-red-700'
          sub='text-red-500'
        />
      </div>

      {monthly.length === 0 ? (
        <EmptyChartState
          message={`No job cards imported in ${year} yet — upload a service job card report to see trends.`}
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Job Cards Created Date
              </CardTitle>
              <CardDescription>
                Job cards closed per month in {year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={importedTrendConfig}
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
                    dataKey='jobCardCount'
                    type='monotone'
                    fill='var(--color-jobCardCount)'
                    fillOpacity={0.2}
                    stroke='var(--color-jobCardCount)'
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Import Volume, Year over Year
              </CardTitle>
              <CardDescription>
                {year} vs {year - 1} — job cards imported per month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={yoyConfig} className='h-[280px] w-full'>
                <BarChart data={yoyData} margin={{ left: 0, right: 12 }}>
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
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey='current'
                    fill='var(--color-current)'
                    radius={4}
                  />
                  <Bar
                    dataKey='previous'
                    fill='var(--color-previous)'
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ServiceJobcardKpiCharts;
