import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, IndianRupee, Package, Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

import { useGetSalesTimeseriesQuery } from "@/redux-store/services/dataImportApi";
import { useGetPartsStockStatusQuery } from "@/redux-store/services/dataImportApi";
import { useGetStockAssignStatsQuery } from "@/redux-store/services/BikeSystemApi2/StockConceptApi";
import { useGetVasAssignStatsQuery } from "@/redux-store/services/BikeSystemApi2/VASApi";
import type { Granularity } from "@/redux-store/services/dataImport.types";

const inr = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const GRANULARITIES: { value: Granularity; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

const GranularityToggle = ({
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

const YEAR_OPTIONS = Array.from(
  { length: 4 },
  (_, i) => new Date().getFullYear() - i
);

const YearSelect = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (year: number) => void;
}) => (
  <Select
    value={String(value)}
    onValueChange={(v) => onChange(Number(v))}
  >
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

const ChartSkeleton = () => (
  <div className='h-[260px] w-full animate-pulse rounded-xl bg-gray-100' />
);

const EmptyChartState = ({ message }: { message: string }) => (
  <div className='flex h-[260px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 text-center'>
    <BarChart3 className='h-8 w-8 text-gray-300' />
    <p className='max-w-xs text-sm text-muted-foreground'>{message}</p>
  </div>
);

// ─── Sales & Revenue ──────────────────────────────────────────────────────

const revenueTrendConfig: ChartConfig = {
  totalRevenue: { label: "Total Revenue", color: "var(--chart-1)" },
};

const revenueMixConfig: ChartConfig = {
  labourRevenue: { label: "Labour", color: "var(--chart-1)" },
  partsRevenue: { label: "Parts", color: "var(--chart-2)" },
  lubesRevenue: { label: "Lubes", color: "var(--chart-3)" },
  accessoriesRevenue: { label: "Accessories", color: "var(--chart-4)" },
};

const topModelsConfig: ChartConfig = {
  totalRevenue: { label: "Revenue", color: "var(--chart-5)" },
};

const SalesTab = () => {
  const [granularity, setGranularity] = useState<Granularity>("month");
  const { data, isLoading } = useGetSalesTimeseriesQuery({ granularity });

  const timeseries = data?.data.timeseries ?? [];
  const topModels = useMemo(
    () =>
      [...(data?.data.byModel ?? [])]
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5),
    [data]
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
      <span className='text-xs font-medium text-muted-foreground'>
        View by
      </span>
      <GranularityToggle value={granularity} onChange={setGranularity} />
    </div>
  );

  if (isLoading) {
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
        <EmptyChartState message='No sales data yet — import a service-jobcard report from Data Import to see revenue trends.' />
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
          <CardDescription>
            Total revenue by {granularity}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueTrendConfig} className='h-[260px] w-full'>
            <AreaChart data={timeseries} margin={{ left: 0, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='bucket'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
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
              <XAxis
                dataKey='bucket'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
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
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Top Models by Revenue</CardTitle>
            <CardDescription>Best performing models this period</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={topModelsConfig} className='h-[220px] w-full'>
              <BarChart
                data={topModels}
                layout='vertical'
                margin={{ left: 12, right: 12 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis type='number' hide />
                <YAxis
                  dataKey='modelName'
                  type='category'
                  tickLine={false}
                  axisLine={false}
                  width={110}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey='totalRevenue'
                  fill='var(--color-totalRevenue)'
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ─── Stock & Inventory ────────────────────────────────────────────────────

const stockAssignConfig: ChartConfig = {
  assignedCount: { label: "Vehicles Assigned", color: "var(--chart-2)" },
};

const partsStatusConfig: ChartConfig = {
  sold: { label: "Sold", color: "var(--chart-1)" },
  available: { label: "Available", color: "var(--chart-3)" },
};

const StockTab = () => {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const { data: assignData, isLoading: assignLoading } =
    useGetStockAssignStatsQuery({ year });
  const { data: partsData, isLoading: partsLoading } =
    useGetPartsStockStatusQuery();

  const monthly = assignData?.data.monthly ?? [];
  const totals = assignData?.data.totals;
  const parts = partsData?.data;

  const partsPieData = useMemo(() => {
    if (!parts || parts.totalItems === 0) return [];
    return [
      { key: "sold", label: "Sold", value: parts.soldCount, fill: "var(--color-sold)" },
      { key: "available", label: "Available", value: parts.notSoldCount, fill: "var(--color-available)" },
    ];
  }, [parts]);

  const yearControl = (
    <div className='flex items-center justify-between flex-wrap gap-3'>
      <span className='text-xs font-medium text-muted-foreground'>
        Assignment year
      </span>
      <YearSelect value={year} onChange={setYear} />
    </div>
  );

  if (assignLoading || partsLoading) {
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
          label={`Vehicles Assigned (${year})`}
          value={(totals?.totalAssigned ?? 0).toLocaleString("en-IN")}
          bg='bg-red-50'
          text='text-red-700'
          sub='text-red-500'
        />
        <MetricTile
          index={1}
          label='Assignment Revenue'
          value={inr(totals?.totalRevenue ?? 0)}
          bg='bg-blue-50'
          text='text-blue-700'
          sub='text-blue-500'
        />
        <MetricTile
          index={2}
          label='Parts Stock Value'
          value={inr(parts?.totalStockValue ?? 0)}
          bg='bg-amber-50'
          text='text-amber-700'
          sub='text-amber-500'
        />
        <MetricTile
          index={3}
          label='Parts Sold %'
          value={`${Math.round(parts?.soldPercent ?? 0)}%`}
          bg='bg-emerald-50'
          text='text-emerald-700'
          sub='text-emerald-500'
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Vehicle Assignments</CardTitle>
          <CardDescription>
            Vehicles assigned to customers, per month in {year}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totals && totals.totalAssigned === 0 && (
            <p className='mb-2 text-xs text-muted-foreground'>
              No vehicle assignments recorded in {year}.
            </p>
          )}
          <ChartContainer config={stockAssignConfig} className='h-[260px] w-full'>
            <BarChart data={monthly} margin={{ left: 0, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey='assignedCount' fill='var(--color-assignedCount)' radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Parts Stock Status</CardTitle>
          <CardDescription>Sold vs. available parts, by value</CardDescription>
        </CardHeader>
        <CardContent>
          {partsPieData.length === 0 ? (
            <EmptyChartState message='No parts stock imported yet — upload a parts report to see this breakdown.' />
          ) : (
            <ChartContainer
              config={partsStatusConfig}
              className='mx-auto h-[220px] w-full max-w-[280px]'
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={partsPieData} dataKey='value' nameKey='label' innerRadius={50}>
                  {partsPieData.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey='label' />} />
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ─── VAS Performance ──────────────────────────────────────────────────────

const vasConfig: ChartConfig = {
  activationCount: { label: "VAS Activations", color: "var(--chart-4)" },
};

const VasTab = () => {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const { data, isLoading } = useGetVasAssignStatsQuery({ year });

  const monthly = data?.data.monthly ?? [];
  const totals = data?.data.totals;

  const yearControl = (
    <div className='flex items-center justify-between flex-wrap gap-3'>
      <span className='text-xs font-medium text-muted-foreground'>
        Activation year
      </span>
      <YearSelect value={year} onChange={setYear} />
    </div>
  );

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {yearControl}
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {yearControl}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <MetricTile
          index={0}
          label={`VAS Activations (${year})`}
          value={(totals?.totalActivations ?? 0).toLocaleString("en-IN")}
          bg='bg-red-50'
          text='text-red-700'
          sub='text-red-500'
        />
        <MetricTile
          index={1}
          label='VAS Revenue'
          value={inr(totals?.totalRevenue ?? 0)}
          bg='bg-blue-50'
          text='text-blue-700'
          sub='text-blue-500'
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>VAS Activations</CardTitle>
          <CardDescription>
            Value-added services activated, per month in {year}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totals && totals.totalActivations === 0 && (
            <p className='mb-2 text-xs text-muted-foreground'>
              No VAS activations recorded in {year}.
            </p>
          )}
          <ChartContainer config={vasConfig} className='h-[260px] w-full'>
            <BarChart data={monthly} margin={{ left: 0, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey='activationCount' fill='var(--color-activationCount)' radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Root component ───────────────────────────────────────────────────────

const BranchKpiCharts = () => {
  return (
    <Tabs defaultValue='sales' className='w-full'>
      <TabsList className='inline-flex h-11 bg-gray-100 rounded-xl p-1 gap-1'>
        <TabsTrigger value='sales' className='flex items-center gap-2 px-4 rounded-lg text-sm'>
          <IndianRupee className='h-3.5 w-3.5' />
          Sales &amp; Revenue
        </TabsTrigger>
        <TabsTrigger value='stock' className='flex items-center gap-2 px-4 rounded-lg text-sm'>
          <Package className='h-3.5 w-3.5' />
          Stock &amp; Inventory
        </TabsTrigger>
        <TabsTrigger value='vas' className='flex items-center gap-2 px-4 rounded-lg text-sm'>
          <Sparkles className='h-3.5 w-3.5' />
          VAS Performance
        </TabsTrigger>
      </TabsList>

      <TabsContent value='sales' className='mt-4'>
        <SalesTab />
      </TabsContent>
      <TabsContent value='stock' className='mt-4'>
        <StockTab />
      </TabsContent>
      <TabsContent value='vas' className='mt-4'>
        <VasTab />
      </TabsContent>
    </Tabs>
  );
};

export default BranchKpiCharts;
