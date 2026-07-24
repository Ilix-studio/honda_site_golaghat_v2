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
import ChangesMarkdown from "@/mainComponents/shared/ChangesMarkdown";

import {
  useGetPartsStatsQuery,
  useGetPartsStockStatusQuery,
} from "@/redux-store/services/partsApi";

const importedTrendConfig: ChartConfig = {
  partCount: { label: "Parts Imported", color: "var(--chart-1)" },
};

const importVsReviewConfig: ChartConfig = {
  partCount: { label: "Imported", color: "var(--chart-1)" },
  reviewCount: { label: "Needs Review", color: "var(--chart-4)" },
};

const reviewRateConfig: ChartConfig = {
  reviewRate: { label: "Review Rate %", color: "var(--chart-5)" },
};

const revenueByDateConfig: ChartConfig = {
  revenueAfter: { label: "Revenue", color: "var(--chart-1)" },
};

const revenueDeltaConfig: ChartConfig = {
  revenueDelta: { label: "Revenue Change", color: "var(--chart-2)" },
};

const PartsKpiCharts = () => {
  const [year, setYear] = useState(() => new Date().getFullYear());

  const { data: statsData, isLoading: statsLoading } = useGetPartsStatsQuery({
    year,
  });
  const { data: prevStatsData } = useGetPartsStatsQuery({ year: year - 1 });
  const { data: stockStatusData, isLoading: stockStatusLoading } =
    useGetPartsStockStatusQuery();

  const monthly = statsData?.data.monthly ?? [];
  const totals = statsData?.data.totals;
  const stockStatus = stockStatusData?.data;

  const yoyConfig: ChartConfig = useMemo(
    () => ({
      current: { label: `${year}`, color: "var(--chart-1)" },
      previous: { label: `${year - 1}`, color: "var(--chart-3)" },
    }),
    [year]
  );

  const reviewRateData = useMemo(
    () =>
      monthly.map((m) => ({
        month: m.month,
        reviewRate:
          m.partCount > 0
            ? Math.round((m.reviewCount / m.partCount) * 1000) / 10
            : 0,
      })),
    [monthly]
  );

  const yoyData = useMemo(() => {
    const prevMonthly = prevStatsData?.data.monthly ?? [];
    return monthly.map((m, i) => ({
      month: m.month,
      current: m.partCount,
      previous: prevMonthly[i]?.partCount ?? 0,
    }));
  }, [monthly, prevStatsData]);

  const byDate = useMemo(
    () =>
      (stockStatus?.byDate ?? []).map((d) => ({
        ...d,
        label: new Date(d.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
      })),
    [stockStatus],
  );

  const latestChange = stockStatus?.latestChange ?? null;

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

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4'>
        <MetricTile
          index={0}
          label='Total Parts'
          value={(totals?.totalParts ?? 0).toLocaleString("en-IN")}
          bg='bg-blue-50'
          text='text-blue-700'
          sub='text-blue-500'
        />
        <MetricTile
          index={1}
          label='Needs Review'
          value={(totals?.reviewParts ?? 0).toLocaleString("en-IN")}
          bg='bg-amber-50'
          text='text-amber-700'
          sub='text-amber-500'
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
          label='Total Revenue (current stock)'
          value={inr(stockStatus?.totalRevenue ?? 0)}
          bg='bg-emerald-50'
          text='text-emerald-700'
          sub='text-emerald-500'
        />
        <MetricTile
          index={4}
          label='Average Unit Price'
          value={inr(stockStatus?.avgUnitPrice ?? 0)}
          bg='bg-indigo-50'
          text='text-indigo-700'
          sub='text-indigo-500'
        />
        <MetricTile
          index={5}
          label='Latest Upload Revenue Change'
          value={
            latestChange
              ? `${latestChange.revenueDelta >= 0 ? "+" : "-"}${inr(
                  Math.abs(latestChange.revenueDelta),
                )}`
              : "—"
          }
          bg='bg-red-50'
          text='text-red-700'
          sub='text-red-500'
        />
      </div>

      {monthly.length === 0 ? (
        <EmptyChartState message={`No parts imported in ${year} yet — upload a parts report to see trends.`} />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Parts Imported Trend</CardTitle>
              <CardDescription>Rows imported per month in {year}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={importedTrendConfig} className='h-[240px] w-full'>
                <AreaChart data={monthly} margin={{ left: 0, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey='month' tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    dataKey='partCount'
                    type='monotone'
                    fill='var(--color-partCount)'
                    fillOpacity={0.2}
                    stroke='var(--color-partCount)'
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Imported vs. Needs Review</CardTitle>
              <CardDescription>Low-confidence PDF rows flagged for review, per month</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={importVsReviewConfig} className='h-[260px] w-full'>
                <BarChart data={monthly} margin={{ left: 0, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey='month' tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey='partCount' fill='var(--color-partCount)' radius={4} />
                  <Bar dataKey='reviewCount' fill='var(--color-reviewCount)' radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Review Rate Trend</CardTitle>
              <CardDescription>% of rows needing review, per month</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={reviewRateConfig} className='h-[220px] w-full'>
                <LineChart data={reviewRateData} margin={{ left: 0, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey='month' tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    dataKey='reviewRate'
                    type='monotone'
                    stroke='var(--color-reviewRate)'
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Import Volume, Year over Year</CardTitle>
              <CardDescription>
                {year} vs {year - 1} — monthly import shape
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={yoyConfig} className='mx-auto h-[300px] w-full max-w-[420px]'>
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
            <CardTitle className='text-base'>Revenue by Upload Date</CardTitle>
            <CardDescription>
              Current stock revenue (Unit Price × Quantity) after each
              parts-stock upload
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stockStatusLoading ? (
              <ChartSkeleton />
            ) : byDate.length === 0 ? (
              <EmptyChartState message='No parts-stock uploads yet.' />
            ) : (
              <ChartContainer config={revenueByDateConfig} className='h-[240px] w-full'>
                <AreaChart data={byDate} margin={{ left: 0, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey='label' tickLine={false} axisLine={false} tickMargin={8} />
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
            <CardTitle className='text-base'>Revenue Change per Upload</CardTitle>
            <CardDescription>
              How much revenue moved with each upload — green = increase, red
              = decrease
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stockStatusLoading ? (
              <ChartSkeleton />
            ) : byDate.length === 0 ? (
              <EmptyChartState message='No parts-stock uploads yet.' />
            ) : (
              <ChartContainer config={revenueDeltaConfig} className='h-[240px] w-full'>
                <BarChart data={byDate} margin={{ left: 0, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey='label' tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey='revenueDelta' radius={4}>
                    {byDate.map((d) => (
                      <Cell
                        key={d.batchId}
                        fill={d.revenueDelta >= 0 ? "var(--chart-1)" : "var(--chart-4)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {latestChange && (
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Latest Changes</CardTitle>
            <CardDescription>
              {latestChange.fileName} —{" "}
              {new Date(latestChange.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangesMarkdown markdown={latestChange.changesMarkdown} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PartsKpiCharts;
