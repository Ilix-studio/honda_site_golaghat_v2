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
import { MetricTile } from "@/mainComponents/Admin/AdminDash/StatCard";
import {
  ChartSkeleton,
  EmptyChartState,
  inr,
  YearSelect,
} from "@/mainComponents/DataImport/SalesKpiCharts";

import { useGetPartsStatsQuery } from "@/redux-store/services/partsApi";
import { useGetPartsStockStatusQuery } from "@/redux-store/services/dataImportApi";

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

const stockStatusConfig: ChartConfig = {
  sold: { label: "Sold", color: "var(--chart-1)" },
  available: { label: "Available", color: "var(--chart-3)" },
};

const soldPercentConfig: ChartConfig = {
  value: { label: "Sold %", color: "var(--chart-2)" },
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

  const stockPieData = useMemo(() => {
    if (!stockStatus || stockStatus.totalItems === 0) return [];
    return [
      {
        key: "sold",
        label: "Sold",
        value: stockStatus.soldCount,
        fill: "var(--color-sold)",
      },
      {
        key: "available",
        label: "Available",
        value: stockStatus.notSoldCount,
        fill: "var(--color-available)",
      },
    ];
  }, [stockStatus]);

  const soldPercent = stockStatus?.soldPercent ?? 0;
  const radialData = [{ key: "sold", value: soldPercent, fill: "var(--color-value)" }];

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

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
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
          label='Total Stock Value'
          value={inr(stockStatus?.totalStockValue ?? 0)}
          bg='bg-emerald-50'
          text='text-emerald-700'
          sub='text-emerald-500'
        />
        <MetricTile
          index={4}
          label='Sold % (all imports)'
          value={`${soldPercent}%`}
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
            <CardTitle className='text-base'>Stock Status</CardTitle>
            <CardDescription>Sold vs. available, across all uploaded parts-stock data</CardDescription>
          </CardHeader>
          <CardContent>
            {stockStatusLoading ? (
              <ChartSkeleton />
            ) : stockPieData.length === 0 ? (
              <EmptyChartState message='No parts-stock data imported yet.' />
            ) : (
              <ChartContainer
                config={stockStatusConfig}
                className='mx-auto h-[220px] w-full max-w-[280px]'
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie data={stockPieData} dataKey='value' nameKey='label' innerRadius={50}>
                    {stockPieData.map((entry) => (
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
            <CardTitle className='text-base'>Sold %</CardTitle>
            <CardDescription>Share of parts stock with recorded sale value</CardDescription>
          </CardHeader>
          <CardContent>
            {stockStatusLoading ? (
              <ChartSkeleton />
            ) : !stockStatus || stockStatus.totalItems === 0 ? (
              <EmptyChartState message='No parts-stock data imported yet.' />
            ) : (
              <div className='relative mx-auto h-[200px] w-[200px]'>
                <ChartContainer config={soldPercentConfig} className='h-full w-full'>
                  <RadialBarChart
                    data={radialData}
                    startAngle={90}
                    endAngle={90 - (360 * soldPercent) / 100}
                    innerRadius={70}
                    outerRadius={100}
                  >
                    <RadialBar dataKey='value' background cornerRadius={10} />
                  </RadialBarChart>
                </ChartContainer>
                <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
                  <span className='text-3xl font-black text-gray-900'>{soldPercent}%</span>
                  <span className='text-xs text-muted-foreground'>Sold</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PartsKpiCharts;
