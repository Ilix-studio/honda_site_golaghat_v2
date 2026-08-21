import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
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

import {
  ChartSkeleton,
  EmptyChartState,
  YearSelect,
  compactInr,
  inr,
} from "@/mainComponents/DataImport/SalesKpiCharts";

import { useAppSelector } from "@/hooks/redux";
import { selectAuth } from "@/redux-store/slices/authSlice";

import {
  useGetPartsStatsQuery,
  useGetPartsStockStatusQuery,
} from "@/redux-store/services/partsApi";
import {
  useGetServiceJobcardStatsQuery,
  useGetServiceJobcardStatusQuery,
} from "@/redux-store/services/serviceJobcardApi";
import { useGetCounterSaleBatchesQuery } from "@/redux-store/services/counterSaleApi";
import { useGetStockAssignStatsQuery } from "@/redux-store/services/BikeSystemApi2/StockConceptApi";
import { useGetCSVStockAssignStatsQuery } from "@/redux-store/services/BikeSystemApi3/csvStockApi";
import { useGetB2BSalesKPIsQuery } from "@/redux-store/services/BikeSystemApi2/b2bSalesApi";

/**
 * The five domains roll up into three parts of the business, and that grouping
 * is the one thing the x-axis does not already say — so colour carries it, and
 * only it. Three hues for five bars, not five.
 *
 * Validated as a categorical palette against this app's light card surface
 * (#864ad2 / #b68c00 / #00683d): worst all-pairs CVD dE 17.2 protan, 14.1
 * tritan, normal-vision 25.0, and all three clear 3:1 contrast — so the pairs
 * survive colour-vision deficiency without leaning on the direct labels. The
 * app's own --chart-N tokens cannot supply a passing trio here: --chart-3 fails
 * both the lightness band and the chroma floor, and --chart-4/5 fall below the
 * contrast floor. Dark mode is never activated in this app — nothing adds the
 * `.dark` class — so the light surface is the only one these are read against.
 */
const REVENUE_FAMILIES = {
  vehicle: { label: "Vehicle Sales", color: "oklch(0.55 0.2 300)" },
  parts: { label: "Parts", color: "oklch(0.66 0.14 88)" },
  service: { label: "Service", color: "oklch(0.45 0.12 160)" },
} as const;

type RevenueFamily = keyof typeof REVENUE_FAMILIES;

const revenueByDomainConfig: ChartConfig = {
  revenue: { label: "Revenue" },
};

/**
 * Two series on one plot, so the pair has to survive colour-vision deficiency.
 * --chart-1 / --chart-2 is the pair validated against this app's light card
 * surface (worst adjacent CVD dE 14.8 protan, normal-vision 31.6, both above
 * the 8 / 15 floors); chart-3/4/5 individually miss the lightness band here.
 * Dark mode is never activated in this app — nothing adds the `.dark` class —
 * so the light surface is the only one these are read against.
 */
const monthlyActivityConfig: ChartConfig = {
  jobCards: { label: "Job Cards", color: "var(--chart-1)" },
  partsRows: { label: "Parts Rows", color: "var(--chart-2)" },
};

/**
 * Which role owns each upload that feeds the charts above.
 *
 * Each branch borrows the colour of the revenue family it feeds, so the hue
 * that marks Parts in the bar chart is the hue that marks Part-Admin here and
 * the two cards read as one system rather than two colour schemes. The trio is
 * the same validated set — worst all-pairs CVD dE 17.2 protan, 14.1 tritan,
 * normal-vision 25.0, all three clearing 3:1 against the light card.
 *
 * The root is deliberately *not* in that set: Super-Admin uploads nothing, so
 * it is a different kind of node, and it stays neutral. The accent it used to
 * carry (--chart-1) sits at dE 0.5 deutan from the Part-Admin yellow — the two
 * would be indistinguishable to a red-green colourblind reader.
 */
const UPLOAD_OWNERSHIP: {
  role: string;
  scope: string;
  color: string;
  owns: string[];
}[] = [
  {
    role: "Branch-Admin",
    scope: "Sales floor",
    color: REVENUE_FAMILIES.vehicle.color,
    owns: ["Stock Upload", "Challan", "Sales Report", "Quotation"],
  },
  {
    role: "Service-Admin",
    scope: "Workshop",
    color: REVENUE_FAMILIES.service.color,
    owns: ["Job-Card Upload"],
  },
  {
    role: "Part-Admin",
    scope: "Parts counter",
    color: REVENUE_FAMILIES.parts.color,
    owns: ["Parts Upload", "Part Delivery (CPTOS)"],
  },
];

/** Centres of the three grid columns, used to place the connector drops. */
const BRANCH_COLUMN_CENTERS = ["16.666%", "50%", "83.333%"];

export default function SuperOverviewKpiCharts() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const { isAuthenticated } = useAppSelector(selectAuth);
  const skip = { skip: !isAuthenticated };

  const { data: partsStats, isLoading: partsStatsLoading } =
    useGetPartsStatsQuery({ year }, skip);
  const { data: partsStatus } = useGetPartsStockStatusQuery(undefined, skip);
  const { data: serviceStats, isLoading: serviceStatsLoading } =
    useGetServiceJobcardStatsQuery({ year }, skip);
  const { data: serviceStatus } = useGetServiceJobcardStatusQuery(
    undefined,
    skip,
  );
  const { data: counterSale } = useGetCounterSaleBatchesQuery(undefined, skip);
  const { data: stockAssign } = useGetStockAssignStatsQuery({ year }, skip);
  const { data: csvStockAssign } = useGetCSVStockAssignStatsQuery(
    { year },
    skip,
  );
  const { data: b2b } = useGetB2BSalesKPIsQuery(undefined, skip);

  const counterSaleRevenue = useMemo(
    () => (counterSale?.data ?? []).reduce((sum, b) => sum + b.totalInvoice, 0),
    [counterSale],
  );

  const vehicleRevenue =
    (stockAssign?.data.totals.totalRevenue ?? 0) +
    (csvStockAssign?.data.totals.totalRevenue ?? 0);

  /**
   * `fill` rides on the datum rather than on <Bar>, so the tooltip swatch picks
   * up the same family colour as the bar it describes.
   */
  const revenueByDomain = useMemo(() => {
    const rows: { domain: string; family: RevenueFamily; revenue: number }[] = [
      {
        domain: "Vehicle",
        family: "vehicle",
        revenue: Math.round(vehicleRevenue),
      },
      {
        domain: "B2B",
        family: "vehicle",
        revenue: Math.round(b2b?.data.totalPayableValue ?? 0),
      },
      {
        domain: "Parts",
        family: "parts",
        revenue: Math.round(partsStatus?.data.totalRevenue ?? 0),
      },
      {
        domain: "CTOS",
        family: "parts",
        revenue: Math.round(counterSaleRevenue),
      },
      {
        domain: "Service",
        family: "service",
        revenue: Math.round(serviceStatus?.data.totalRevenue ?? 0),
      },
    ];

    return rows.map((row) => ({
      ...row,
      fill: REVENUE_FAMILIES[row.family].color,
    }));
  }, [vehicleRevenue, b2b, partsStatus, counterSaleRevenue, serviceStatus]);

  /**
   * Both stats endpoints return a filled 12-month array, but joining on the
   * month label rather than the index keeps this correct if either ever
   * returns a sparse range.
   */
  const monthlyActivity = useMemo(() => {
    const parts = new Map(
      (partsStats?.data.monthly ?? []).map((m) => [m.month, m.partCount]),
    );
    const service = serviceStats?.data.monthly ?? [];
    const months =
      service.length > 0 ? service.map((m) => m.month) : [...parts.keys()];

    return months.map((month) => ({
      month,
      jobCards: service.find((m) => m.month === month)?.jobCardCount ?? 0,
      partsRows: parts.get(month) ?? 0,
    }));
  }, [partsStats, serviceStats]);

  const hasActivity = monthlyActivity.some(
    (m) => m.jobCards > 0 || m.partsRows > 0,
  );
  const hasRevenue = revenueByDomain.some((d) => d.revenue > 0);
  const isLoading = partsStatsLoading || serviceStatsLoading;

  const yearControl = (
    <div className='flex items-center justify-between flex-wrap gap-3'>
      <span className='text-xs font-medium text-muted-foreground'>
        Activity year
      </span>
      <YearSelect value={year} onChange={setYear} />
    </div>
  );

  if (isLoading) {
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
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Revenue by Domain</CardTitle>
          <CardDescription>
            Current revenue position across all five dashboards, all branches
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasRevenue ? (
            <EmptyChartState message='No revenue recorded yet — upload a report or assign stock to populate this chart.' />
          ) : (
            <ChartContainer
              config={revenueByDomainConfig}
              className='h-[280px] w-full'
            >
              <BarChart
                data={revenueByDomain}
                margin={{ left: 0, right: 12, top: 20 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey='domain'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={56}
                  tickFormatter={compactInr}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => inr(Number(value))}
                    />
                  }
                />
                <Bar dataKey='revenue' radius={4}>
                  {revenueByDomain.map((entry) => (
                    <Cell key={entry.domain} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey='revenue'
                    position='top'
                    offset={8}
                    className='fill-muted-foreground'
                    fontSize={11}
                    formatter={(value: unknown) =>
                      compactInr(Number(value ?? 0))
                    }
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          )}

          {hasRevenue && (
            <div className='flex flex-wrap items-center justify-center gap-4 pt-3'>
              {Object.entries(REVENUE_FAMILIES).map(([key, family]) => (
                <div key={key} className='flex items-center gap-1.5 text-sm'>
                  <span
                    className='h-2 w-2 shrink-0 rounded-[2px]'
                    style={{ backgroundColor: family.color }}
                  />
                  {family.label}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Monthly Activity</CardTitle>
          <CardDescription>
            Job cards and parts rows imported per month in {year}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasActivity ? (
            <EmptyChartState
              message={`Nothing imported in ${year} yet — upload a service job card or parts report to see trends.`}
            />
          ) : (
            <ChartContainer
              config={monthlyActivityConfig}
              className='h-[280px] w-full'
            >
              <AreaChart data={monthlyActivity} margin={{ left: 0, right: 12 }}>
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
                  width={40}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  dataKey='jobCards'
                  type='monotone'
                  fill='var(--color-jobCards)'
                  fillOpacity={0.2}
                  stroke='var(--color-jobCards)'
                  strokeWidth={2}
                />
                <Area
                  dataKey='partsRows'
                  type='monotone'
                  fill='var(--color-partsRows)'
                  fillOpacity={0.2}
                  stroke='var(--color-partsRows)'
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Who Uploads What</CardTitle>
          <CardDescription>
            Every number above traces back to one of these uploads, and to the
            role that owns it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center'>
            <div className='rounded-lg border-2 border-gray-900 px-4 py-2 text-center'>
              <p className='text-sm font-semibold text-gray-900'>Super-Admin</p>
              <p className='text-xs text-muted-foreground'>
                Reads all branches
              </p>
            </div>

            {/*
              Stacked on mobile the trunk is a single line; from sm up the three
              columns sit at 1/6, 1/2 and 5/6 of the width, so the crossbar and
              its drops are placed at those fractions.
            */}
            <div className='h-6 w-px bg-border sm:hidden' aria-hidden='true' />
            <div
              className='relative hidden h-6 w-full sm:block'
              aria-hidden='true'
            >
              {/* Trunk and crossbar are shared, so they stay neutral; only the
                  drop into each column takes that branch's colour. */}
              <div className='absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-border' />
              <div className='absolute left-[16.666%] right-[16.666%] top-3 h-px bg-border' />
              {UPLOAD_OWNERSHIP.map((branch, i) => (
                <div
                  key={branch.role}
                  className='absolute top-3 h-3 w-0.5 -translate-x-1/2'
                  style={{
                    left: BRANCH_COLUMN_CENTERS[i],
                    backgroundColor: branch.color,
                  }}
                />
              ))}
            </div>

            <div className='grid w-full gap-4 sm:grid-cols-3'>
              {UPLOAD_OWNERSHIP.map((branch) => (
                <div
                  key={branch.role}
                  className='rounded-lg border border-l-4 bg-muted/30 p-3'
                  style={{ borderLeftColor: branch.color }}
                >
                  <p className='text-sm font-semibold text-gray-900'>
                    {branch.role}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {branch.scope}
                  </p>
                  <ul className='mt-2 space-y-1.5'>
                    {branch.owns.map((item) => (
                      <li key={item} className='flex items-center gap-2'>
                        <span
                          className='h-0.5 w-3 shrink-0 rounded-full'
                          style={{ backgroundColor: branch.color }}
                          aria-hidden='true'
                        />
                        <span className='rounded-md border bg-background px-2 py-1 text-xs font-medium text-gray-900'>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
