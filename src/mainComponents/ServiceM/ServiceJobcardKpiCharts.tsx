import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
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

const revenueByDateConfig: ChartConfig = {
  revenueAfter: { label: "Revenue", color: "var(--chart-1)" },
};

const revenueDeltaConfig: ChartConfig = {
  revenueDelta: { label: "Revenue Change", color: "var(--chart-2)" },
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
  const { data: statusData, isLoading: statusLoading } =
    useGetServiceJobcardStatusQuery();

  const monthly = statsData?.data.monthly ?? [];
  const totals = statsData?.data.totals;
  const status = statusData?.data;

  const yoyConfig: ChartConfig = useMemo(
    () => ({
      current: { label: `${year}`, color: "var(--chart-1)" },
      previous: { label: `${year - 1}`, color: "var(--chart-3)" },
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

  const byDate = useMemo(
    () =>
      (status?.byDate ?? []).map((d) => ({
        ...d,
        label: new Date(d.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
      })),
    [status],
  );

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
                {year} vs {year - 1} — monthly import shape
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
            <CardTitle className='text-base'>Job Card Created Date</CardTitle>
            <CardDescription>
              Current job-card revenue after each upload
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <ChartSkeleton />
            ) : byDate.length === 0 ? (
              <EmptyChartState message='No service job card uploads yet.' />
            ) : (
              <ChartContainer
                config={revenueByDateConfig}
                className='h-[240px] w-full'
              >
                <AreaChart data={byDate} margin={{ left: 0, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey='label'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    dataKey='revenueAfter'
                    type='monotone'
                    fill='var(--color-revenueAfter)'
                    fillOpacity={0.2}
                    stroke='var(--color-revenueAfter)'
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>
              Revenue Change per Upload
            </CardTitle>
            <CardDescription>
              How much revenue moved with each upload — green = increase, red =
              decrease
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <ChartSkeleton />
            ) : byDate.length === 0 ? (
              <EmptyChartState message='No service job card uploads yet.' />
            ) : (
              <ChartContainer
                config={revenueDeltaConfig}
                className='h-[240px] w-full'
              >
                <BarChart data={byDate} margin={{ left: 0, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey='label'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey='revenueDelta' radius={4}>
                    {byDate.map((d) => (
                      <Cell
                        key={d.batchId}
                        fill={
                          d.revenueDelta >= 0
                            ? "var(--chart-1)"
                            : "var(--chart-4)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServiceJobcardKpiCharts;
