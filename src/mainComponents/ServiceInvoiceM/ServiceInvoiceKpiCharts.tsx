import { useState } from "react";
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

import { useGetServiceInvoiceStatsQuery } from "@/redux-store/services/serviceInvoiceApi";

const revenueTrendConfig: ChartConfig = {
  partsRevenue: { label: "Parts & Lubes", color: "var(--chart-1)" },
  labourRevenue: { label: "Labour", color: "var(--chart-2)" },
  accessoriesRevenue: { label: "Accessories", color: "var(--chart-3)" },
};

const invoiceTrendConfig: ChartConfig = {
  invoiceCount: { label: "Invoices", color: "var(--chart-1)" },
};

const technicianConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
};

interface Props {
  branchId?: string;
}

/**
 * Service KPIs sourced from imported invoice PDFs.
 *
 * Replaces the old ServiceJobcardKpiCharts, which read the retired XLSX
 * job-card import. The headline difference is that revenue can now be split
 * into parts / lubes / accessories / labour, because the invoice itemises
 * every billed line — the XLSX export only carried pre-summed columns.
 */
export default function ServiceInvoiceKpiCharts({ branchId }: Props) {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, isLoading, isError } = useGetServiceInvoiceStatsQuery({
    year,
    branchId,
  });

  const stats = data?.data;
  const totals = stats?.totals;
  const hasData = (totals?.totalInvoices ?? 0) > 0;

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div>
          <h3 className='text-lg font-semibold'>Service invoices</h3>
          <p className='text-sm text-muted-foreground'>
            Revenue, parts consumption and technician output from imported
            invoices.
          </p>
        </div>
        <YearSelect value={year} onChange={setYear} />
      </div>

      {/* Headline tiles */}
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        <MetricTile
          index={0}
          label='Invoices'
          value={isLoading ? "…" : (totals?.totalInvoices ?? 0).toLocaleString("en-IN")}
          bg='bg-blue-50'
          text='text-blue-700'
          sub='text-blue-500'
        />
        <MetricTile
          index={1}
          label='Total Revenue'
          value={isLoading ? "…" : inr(Math.round(totals?.totalRevenue ?? 0))}
          bg='bg-emerald-50'
          text='text-emerald-700'
          sub='text-emerald-500'
        />
        <MetricTile
          index={2}
          label='Parts Sold'
          value={isLoading ? "…" : (totals?.partsSold ?? 0).toLocaleString("en-IN")}
          bg='bg-gray-100'
          text='text-gray-800'
          sub='text-gray-500'
          note='Billed lines matched to parts stock'
        />
        <MetricTile
          index={3}
          label='Awaiting Stock'
          value={
            isLoading
              ? "…"
              : (totals?.partsPendingStock ?? 0).toLocaleString("en-IN")
          }
          bg='bg-sky-50'
          text='text-sky-700'
          sub='text-sky-500'
          note='Billed parts not uploaded yet'
        />
      </div>

      {(totals?.partsPendingStock ?? 0) > 0 && (
        <div className='rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900'>
          {totals?.partsPendingStock} billed part(s) worth{" "}
          {inr(Math.round(totals?.pendingRevenue ?? 0))} are waiting on a
          parts-stock upload. Uploading the stock file that contains them will
          mark them sold automatically.
        </div>
      )}

      {(totals?.needsReview ?? 0) > 0 && (
        <div className='rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900'>
          {totals?.needsReview} invoice(s) need review — usually a part awaiting
          stock, or totals that didn't reconcile.
        </div>
      )}

      {isError && (
        <EmptyChartState message='Could not load service invoice stats.' />
      )}

      {/* Revenue mix over the year */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue mix</CardTitle>
          <CardDescription>
            Parts &amp; lubes vs labour vs accessories, by month closed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ChartSkeleton />
          ) : !hasData ? (
            <EmptyChartState message='No invoices imported for this year yet.' />
          ) : (
            <ChartContainer config={revenueTrendConfig} className='h-[260px] w-full'>
              <AreaChart data={stats?.monthly} margin={{ left: 8, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey='month' tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  type='monotone'
                  dataKey='partsRevenue'
                  stackId='1'
                  stroke='var(--color-partsRevenue)'
                  fill='var(--color-partsRevenue)'
                  fillOpacity={0.3}
                />
                <Area
                  type='monotone'
                  dataKey='labourRevenue'
                  stackId='1'
                  stroke='var(--color-labourRevenue)'
                  fill='var(--color-labourRevenue)'
                  fillOpacity={0.3}
                />
                <Area
                  type='monotone'
                  dataKey='accessoriesRevenue'
                  stackId='1'
                  stroke='var(--color-accessoriesRevenue)'
                  fill='var(--color-accessoriesRevenue)'
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <div className='grid gap-4 lg:grid-cols-2'>
        {/* Invoice volume */}
        <Card>
          <CardHeader>
            <CardTitle>Invoices per month</CardTitle>
            <CardDescription>Job cards closed and invoiced</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton />
            ) : !hasData ? (
              <EmptyChartState message='Nothing to show yet.' />
            ) : (
              <ChartContainer
                config={invoiceTrendConfig}
                className='h-[220px] w-full'
              >
                <BarChart data={stats?.monthly} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey='month' tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey='invoiceCount'
                    fill='var(--color-invoiceCount)'
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Technicians */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by technician</CardTitle>
            <CardDescription>Top technicians by invoiced value</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton />
            ) : !stats?.byTechnician?.length ? (
              <EmptyChartState message='No technician data on these invoices.' />
            ) : (
              <ChartContainer
                config={technicianConfig}
                className='h-[220px] w-full'
              >
                <BarChart
                  data={stats.byTechnician.slice(0, 8)}
                  layout='vertical'
                  margin={{ left: 8, right: 8 }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis type='number' hide />
                  <YAxis
                    type='category'
                    dataKey='technician'
                    tickLine={false}
                    axisLine={false}
                    width={110}
                    tick={{ fontSize: 11 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey='revenue' fill='var(--color-revenue)' radius={4} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
