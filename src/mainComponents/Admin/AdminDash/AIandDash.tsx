import { useMemo, useState } from "react";
import { useGetPartsStatsQuery } from "@/redux-store/services/partsApi";
import {
  useGetDatasetsQuery,
  useGetSalesTimeseriesQuery,
} from "@/redux-store/services/dataImportApi";
import { useGetStockAssignStatsQuery } from "@/redux-store/services/BikeSystemApi2/StockConceptApi";
import { useGetVasAssignStatsQuery } from "@/redux-store/services/BikeSystemApi2/VASApi";
import { StatCard, type StatCardProps } from "./StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  AlertTriangle,
  Layers,
  Bike,
  Wrench,
  Handshake,
  ShieldCheck,
  LayoutDashboard,
  Sparkles,
  PinIcon,
} from "lucide-react";
import type { Granularity } from "@/redux-store/services/dataImport.types";
import SalesTrendChart from "@/mainComponents/DataImport/SalesTrendChart";
import RagAssistant from "@/mainComponents/RAG/RagAssistant";
import DashboardChartPreview from "@/mainComponents/RAG/DashboardChartPreview";
import type { DashboardSpec } from "@/redux-store/services/ragApi.types";

const YEARS = [2026, 2025, 2024];

// Every RAG source with a structured-stats -> dashboardSpec mapping. Charts
// generated from AI questions outside this list simply won't carry a chart
// (Vehicle Stock / Service data isn't RAG-indexed yet, see plan notes).
const AI_SOURCE_TYPES = [
  "parts",
  "jobcard-live",
  "jobcard-revenue-import",
  "accident-report",
  "stock-assign",
  "vas-assign",
];

// ─── Parts sub-tab (unchanged behavior, moved out of the top-level body) ──────

function PartsDashboard() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, isLoading } = useGetPartsStatsQuery({ year });
  const stats = data?.data;

  const kpis: Omit<StatCardProps, "index">[] = [
    {
      title: "Total Parts",
      value: stats?.totals.totalParts ?? "—",
      icon: Package,
      loading: isLoading,
      description: "All branches",
      accent: "#2563eb",
      action: { label: "Details", href: "/admin/dashboard" },
    },
    {
      title: "Upload Batches",
      value: stats?.totals.totalBatches ?? "—",
      icon: Layers,
      loading: isLoading,
      description: "Report uploads",
      accent: "#7c3aed",
      action: { label: "Details", href: "/admin/dashboard" },
    },
    {
      title: "Needs Review",
      value: stats?.totals.reviewParts ?? "—",
      icon: AlertTriangle,
      loading: isLoading,
      description: "Flagged PDF rows",
      accent: "#d97706",
      action: { label: "Details", href: "/admin/dashboard" },
    },
  ];

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-end gap-3'>
        <select
          value={String(year)}
          onChange={(e) => setYear(Number(e.target.value))}
          className='h-9 rounded-md border border-gray-200 bg-white px-3 text-sm'
        >
          {YEARS.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {kpis.map((kpi, i) => (
          <StatCard key={kpi.title} {...kpi} index={i} />
        ))}
      </div>

      <Card className='border border-gray-200 shadow-sm'>
        <CardHeader>
          <CardTitle>Monthly Parts Imported — {year}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='h-56 flex items-center justify-center'>
              <p className='text-sm text-gray-400 animate-pulse'>
                Loading chart...
              </p>
            </div>
          ) : (
            <ResponsiveContainer width='100%' height={240}>
              <BarChart
                data={stats?.monthly}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis
                  dataKey='month'
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  allowDecimals={false}
                />
                <Tooltip />
                <Bar dataKey='partCount' fill='#2563eb' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Vehicle Stock sub-tab — batch-level totals, no per-row fetch needed ──────

function VehicleStockDashboard() {
  const { data, isLoading } = useGetDatasetsQuery({
    datasetType: "vehicle-stock",
    limit: 100,
  });

  const totals = useMemo(
    () =>
      (data?.data ?? []).reduce(
        (acc, b) => ({
          imported: acc.imported + b.importedRows,
          review: acc.review + b.reviewRows,
        }),
        { imported: 0, review: 0 },
      ),
    [data],
  );
  const batchCount = data?.data?.length ?? 0;

  const kpis: Omit<StatCardProps, "index">[] = [
    {
      title: "Vehicles Imported",
      value: isLoading ? "—" : totals.imported,
      icon: Bike,
      loading: isLoading,
      description: "All branches",
      accent: "#2563eb",
      action: { label: "Upload", href: "/admin/data-import/upload" },
    },
    {
      title: "Upload Batches",
      value: isLoading ? "—" : batchCount,
      icon: Layers,
      loading: isLoading,
      description: "Stock file uploads",
      accent: "#7c3aed",
      action: { label: "Upload", href: "/admin/data-import/upload" },
    },
    {
      title: "Needs Review",
      value: isLoading ? "—" : totals.review,
      icon: AlertTriangle,
      loading: isLoading,
      description: "Flagged rows",
      accent: "#d97706",
      action: { label: "Upload", href: "/admin/data-import/upload" },
    },
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
      {kpis.map((kpi, i) => (
        <StatCard key={kpi.title} {...kpi} index={i} />
      ))}
    </div>
  );
}

// ─── Service sub-tab — job-card/timetrack batch totals + revenue trend ───────

function ServiceDashboard() {
  const [granularity, setGranularity] = useState<Granularity>("month");
  const { data: jobcardBatches, isLoading: jobcardLoading } = useGetDatasetsQuery({
    datasetType: "service-jobcard",
    limit: 100,
  });
  const { data: timetrackBatches, isLoading: timetrackLoading } = useGetDatasetsQuery({
    datasetType: "service-timetrack",
    limit: 100,
  });
  const { data: salesData, isLoading: salesLoading } = useGetSalesTimeseriesQuery({
    granularity,
  });

  const jobcardRows =
    jobcardBatches?.data?.reduce((sum, b) => sum + b.importedRows, 0) ?? 0;
  const timetrackRows =
    timetrackBatches?.data?.reduce((sum, b) => sum + b.importedRows, 0) ?? 0;

  const kpis: Omit<StatCardProps, "index">[] = [
    {
      title: "Job Card Rows Imported",
      value: jobcardLoading ? "—" : jobcardRows,
      icon: Wrench,
      loading: jobcardLoading,
      description: "Historical revenue import",
      accent: "#2563eb",
      action: { label: "Upload", href: "/admin/data-import/upload" },
    },
    {
      title: "Time Track Rows Imported",
      value: timetrackLoading ? "—" : timetrackRows,
      icon: Layers,
      loading: timetrackLoading,
      description: "Technician time entries",
      accent: "#7c3aed",
      action: { label: "Upload", href: "/admin/data-import/upload" },
    },
  ];

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {kpis.map((kpi, i) => (
          <StatCard key={kpi.title} {...kpi} index={i} />
        ))}
      </div>
      <SalesTrendChart
        granularity={granularity}
        onGranularityChange={setGranularity}
        data={salesData?.data?.timeseries ?? []}
        loading={salesLoading}
      />
    </div>
  );
}

// ─── Stock / VAS Assign sub-tabs — share the same KPI+chart shape ─────────────

function StockAssignDashboard() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, isLoading } = useGetStockAssignStatsQuery({ year });
  const stats = data?.data;

  const kpis: Omit<StatCardProps, "index">[] = [
    {
      title: "Bikes Assigned",
      value: stats?.totals.totalAssigned ?? "—",
      icon: Handshake,
      loading: isLoading,
      description: `Year ${year}, all branches`,
      accent: "#2563eb",
      action: { label: "Details", href: "/admin/dashboard" },
    },
    {
      title: "Revenue",
      value: stats ? `₹${stats.totals.totalRevenue.toLocaleString("en-IN")}` : "—",
      icon: Layers,
      loading: isLoading,
      description: "Sum of sale price",
      accent: "#7c3aed",
      action: { label: "Details", href: "/admin/dashboard" },
    },
  ];

  const spec: DashboardSpec | null = stats
    ? {
        title: `Monthly Stock Assignments — ${year}`,
        chartType: "bar",
        data: stats.monthly,
        xKey: "month",
        yKey: "assignedCount",
      }
    : null;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-end gap-3'>
        <select
          value={String(year)}
          onChange={(e) => setYear(Number(e.target.value))}
          className='h-9 rounded-md border border-gray-200 bg-white px-3 text-sm'
        >
          {YEARS.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {kpis.map((kpi, i) => (
          <StatCard key={kpi.title} {...kpi} index={i} />
        ))}
      </div>
      {spec && <DashboardChartPreview spec={spec} />}
    </div>
  );
}

function VasAssignDashboard() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, isLoading } = useGetVasAssignStatsQuery({ year });
  const stats = data?.data;

  const kpis: Omit<StatCardProps, "index">[] = [
    {
      title: "VAS Activations",
      value: stats?.totals.totalActivations ?? "—",
      icon: ShieldCheck,
      loading: isLoading,
      description: `Year ${year}, all branches`,
      accent: "#2563eb",
      action: { label: "Details", href: "/admin/dashboard" },
    },
    {
      title: "Revenue",
      value: stats ? `₹${stats.totals.totalRevenue.toLocaleString("en-IN")}` : "—",
      icon: Layers,
      loading: isLoading,
      description: "Sum of purchase price",
      accent: "#7c3aed",
      action: { label: "Details", href: "/admin/dashboard" },
    },
  ];

  const spec: DashboardSpec | null = stats
    ? {
        title: `Monthly VAS Activations — ${year}`,
        chartType: "bar",
        data: stats.monthly,
        xKey: "month",
        yKey: "activationCount",
      }
    : null;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-end gap-3'>
        <select
          value={String(year)}
          onChange={(e) => setYear(Number(e.target.value))}
          className='h-9 rounded-md border border-gray-200 bg-white px-3 text-sm'
        >
          {YEARS.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {kpis.map((kpi, i) => (
          <StatCard key={kpi.title} {...kpi} index={i} />
        ))}
      </div>
      {spec && <DashboardChartPreview spec={spec} />}
    </div>
  );
}

// ─── Top-level: Dashboards / AI Assistant / Preview ───────────────────────────

interface PinnedDashboard {
  spec: DashboardSpec;
  question: string;
  pinnedAt: number;
}

/**
 * Super-Admin dashboards + AI panel. Restructured from a Parts-only view
 * into three top-level tabs: static Dashboards (Parts, Vehicle Stock,
 * Service, Stock Assign, VAS Assign), the AI Assistant chat (now able to
 * carry a chart in its answer), and a Preview tab for charts pinned from
 * chat. Pins are ephemeral (component state only) — no backend persistence.
 */
export default function AIQueries() {
  const [pinned, setPinned] = useState<PinnedDashboard[]>([]);

  const handlePin = (spec: DashboardSpec, question: string) => {
    setPinned((prev) => [...prev, { spec, question, pinnedAt: Date.now() }]);
  };

  return (
    <Tabs defaultValue='dashboards'>
      <TabsList>
        <TabsTrigger value='dashboards'>
          <LayoutDashboard className='h-4 w-4' />
          <span>Dashboards</span>
        </TabsTrigger>
        <TabsTrigger value='ai-assistant'>
          <Sparkles className='h-4 w-4' />
          <span>AI Assistant</span>
        </TabsTrigger>
        <TabsTrigger value='preview'>
          <PinIcon className='h-4 w-4' />
          <span>Preview{pinned.length > 0 ? ` (${pinned.length})` : ""}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value='dashboards' className='pt-4'>
        <Tabs defaultValue='parts'>
          <TabsList>
            <TabsTrigger value='parts'>Parts</TabsTrigger>
            <TabsTrigger value='vehicle-stock'>Vehicle Stock</TabsTrigger>
            <TabsTrigger value='service'>Service</TabsTrigger>
            <TabsTrigger value='stock-assign'>Stock Assign</TabsTrigger>
            <TabsTrigger value='vas-assign'>VAS Assign</TabsTrigger>
          </TabsList>
          <TabsContent value='parts' className='pt-4'>
            <PartsDashboard />
          </TabsContent>
          <TabsContent value='vehicle-stock' className='pt-4'>
            <VehicleStockDashboard />
          </TabsContent>
          <TabsContent value='service' className='pt-4'>
            <ServiceDashboard />
          </TabsContent>
          <TabsContent value='stock-assign' className='pt-4'>
            <StockAssignDashboard />
          </TabsContent>
          <TabsContent value='vas-assign' className='pt-4'>
            <VasAssignDashboard />
          </TabsContent>
        </Tabs>
      </TabsContent>

      <TabsContent value='ai-assistant' className='pt-4'>
        <RagAssistant
          title='Dealership AI Assistant'
          subtitle='Ask questions about parts, job cards, stock/VAS assignments, and accident reports — answers are grounded in live data and can include a chart.'
          sourceTypes={AI_SOURCE_TYPES}
          placeholder='e.g. How many bikes were assigned to customers this year?'
          onPinDashboard={handlePin}
        />
      </TabsContent>

      <TabsContent value='preview' className='pt-4'>
        {pinned.length === 0 ? (
          <div className='rounded-xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-500'>
            Ask the AI a stats question and pin the result to see it here.
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {pinned.map((p) => (
              <div key={p.pinnedAt} className='space-y-1'>
                <p className='text-xs text-gray-400'>
                  "{p.question}" — pinned {new Date(p.pinnedAt).toLocaleTimeString()}
                </p>
                <DashboardChartPreview spec={p.spec} />
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
