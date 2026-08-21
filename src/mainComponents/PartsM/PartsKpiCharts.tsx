import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";

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

const importVsReviewConfig: ChartConfig = {
  partCount: { label: "Imported", color: "var(--chart-1)" },
  reviewCount: { label: "Needs Review", color: "var(--chart-2)" },
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
];

const PartsKpiCharts = () => {
  const [year, setYear] = useState(() => new Date().getFullYear());

  const { data: statsData, isLoading: statsLoading } = useGetPartsStatsQuery({
    year,
  });
  const { data: stockStatusData } = useGetPartsStockStatusQuery();

  const monthly = statsData?.data.monthly ?? [];
  const totals = statsData?.data.totals;
  const stockStatus = stockStatusData?.data;

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
      <h4 className='text-black  font-semibold'>Parts Added</h4>
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
