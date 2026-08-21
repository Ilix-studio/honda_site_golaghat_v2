import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
  useGetPartsStatsQuery,
  useGetPartsStockStatusQuery,
} from "@/redux-store/services/partsApi";

const importedTrendConfig: ChartConfig = {
  partCount: { label: "Parts Imported", color: "var(--chart-1)" },
};

/**
 * Two series share one plot here, so the pair has to stay separable for
 * colour-vision-deficient readers. --chart-4 (amber #ffb900) used to hold the
 * second slot and sits at 1.68:1 against a white card — below the 3:1 floor,
 * and effectively invisible. --chart-2 clears every check against this surface.
 */
const importVsReviewConfig: ChartConfig = {
  partCount: { label: "Imported", color: "var(--chart-1)" },
  reviewCount: { label: "Needs Review", color: "var(--chart-2)" },
};

const revenueByDateConfig: ChartConfig = {
  revenueAfter: { label: "Revenue", color: "var(--chart-1)" },
};

/**
 * Revenue change is polarity, not identity, so it wants a diverging pair —
 * two hues either side of zero rather than two arbitrary categorical slots.
 * These are the hues the card's own caption promises; the previous
 * chart-1/chart-4 pairing rendered orange/amber while claiming green/red.
 */
const REVENUE_UP = "#059669";
const REVENUE_DOWN = "#dc2626";

const revenueDeltaConfig: ChartConfig = {
  revenueDelta: { label: "Revenue Change", color: REVENUE_UP },
};

/** What each chart on this tab plots, and which field it reads. */
const CHART_DOCS: { title: string; body: string }[] = [
  {
    title: "Parts Imported",
    body: "Rows accepted per month for the selected import year, from the parts report uploads. Duplicate rows rejected at upload never appear here.",
  },
  {
    title: "Imported vs. Needs Review",
    body: "The same monthly rows split by confidence. 'Needs Review' counts rows whose numeric or date cells could not be parsed — PDF uploads are the usual source, since their extraction is best-effort.",
  },
  {
    title: "Revenue by Upload Date",
    body: "Stock revenue as it stood after each parts-stock upload — a running position, not per-upload takings.",
  },
  {
    title: "Revenue Change per Upload",
    body: "The difference each upload made to that position. Bars above zero are increases (green), below zero decreases (red); the direction carries the sign as well as the colour.",
  },
];

const PartsKpiCharts = () => {
  const [year, setYear] = useState(() => new Date().getFullYear());

  const { data: statsData, isLoading: statsLoading } = useGetPartsStatsQuery({
    year,
  });
  const { data: stockStatusData, isLoading: stockStatusLoading } =
    useGetPartsStockStatusQuery();

  const monthly = statsData?.data.monthly ?? [];
  const totals = statsData?.data.totals;
  const stockStatus = stockStatusData?.data;

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

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        <MetricTile
          index={0}
          label='Total Parts'
          value={(totals?.totalParts ?? 0).toLocaleString("en-IN")}
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
          label='Total Revenue '
          value={inr(Math.round(stockStatus?.totalRevenue ?? 0))}
          bg='bg-emerald-50'
          text='text-emerald-700'
          sub='text-emerald-500'
        />
      </div>

      {monthly.length === 0 ? (
        <EmptyChartState
          message={`No parts imported in ${year} yet — upload a parts report to see trends.`}
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Parts Imported</CardTitle>
              <CardDescription>
                Rows imported per month in {year}
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
                    dataKey='partCount'
                    type='monotone'
                    fill='var(--color-partCount)'
                    fillOpacity={0.2}
                    stroke='var(--color-partCount)'
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Imported vs. Needs Review
              </CardTitle>
              <CardDescription>
                Low-confidence PDF rows flagged for review, per month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={importVsReviewConfig}
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
                    dataKey='partCount'
                    fill='var(--color-partCount)'
                    radius={4}
                  />
                  <Bar
                    dataKey='reviewCount'
                    fill='var(--color-reviewCount)'
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Revenue by Upload Date</CardTitle>
            <CardDescription>Current stock revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {stockStatusLoading ? (
              <ChartSkeleton />
            ) : byDate.length === 0 ? (
              <EmptyChartState message='No parts-stock uploads yet.' />
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
                    strokeWidth={2}
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
            {stockStatusLoading ? (
              <ChartSkeleton />
            ) : byDate.length === 0 ? (
              <EmptyChartState message='No parts-stock uploads yet.' />
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
                        fill={d.revenueDelta >= 0 ? REVENUE_UP : REVENUE_DOWN}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Documentation</CardTitle>
          <CardDescription>
            What each chart above plots, and where the numbers come from
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className='space-y-3'>
            {CHART_DOCS.map((doc) => (
              <div key={doc.title}>
                <dt className='text-sm font-semibold text-gray-900'>
                  {doc.title}
                </dt>
                <dd className='text-sm text-muted-foreground mt-0.5'>
                  {doc.body}
                </dd>
              </div>
            ))}
            <div className='pt-3 border-t border-gray-100'>
              <dt className='text-sm font-semibold text-gray-900'>
                Import year
              </dt>
              <dd className='text-sm text-muted-foreground mt-0.5'>
                The year selector at the top filters the two monthly charts
                only. The revenue charts track parts-stock uploads and always
                show the full history.
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartsKpiCharts;
