import { useState } from "react";
import {
  useGenerateKpiMutation,
  useGetKpiMetricsQuery,
} from "@/redux-store/services/ragApi";
import type { KpiDashboard, KpiTile } from "@/redux-store/services/ragApi.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Send,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
} from "lucide-react";
import DashboardChartPreview from "./DashboardChartPreview";

const EXAMPLE_PROMPTS = [
  "Service revenue and job cards this year, broken down by month",
  "Compare bike sales across branches for the last 6 months",
  "How is VAS performing this quarter vs last quarter?",
  "Show me pending parts revenue and invoices closed this month",
];

function formatValue(value: number, unit: KpiTile["unit"]): string {
  if (unit === "currency") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return new Intl.NumberFormat("en-IN").format(value);
}

/**
 * A single KPI tile. The delta row only renders when the planner asked for a
 * period comparison, and a null changePct (previous period was zero) shows as
 * "new" rather than as a misleading infinite percentage.
 */
function KpiTileCard({ tile }: { tile: KpiTile }) {
  const hasDelta = tile.previousValue !== undefined;
  const up = (tile.changePct ?? 0) > 0;
  const flat = tile.changePct === 0;

  return (
    <Card className='border border-gray-200 shadow-sm'>
      <CardContent className='p-4 space-y-1'>
        <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
          {tile.label}
        </p>
        <p className='text-2xl font-semibold text-gray-900'>
          {formatValue(tile.value, tile.unit)}
        </p>
        {hasDelta && (
          <div className='flex items-center gap-1 text-xs'>
            {tile.changePct === null ? (
              <span className='text-blue-600 font-medium'>New this period</span>
            ) : (
              <>
                {flat ? (
                  <Minus className='w-3.5 h-3.5 text-gray-400' />
                ) : up ? (
                  <TrendingUp className='w-3.5 h-3.5 text-emerald-600' />
                ) : (
                  <TrendingDown className='w-3.5 h-3.5 text-red-600' />
                )}
                <span
                  className={
                    flat
                      ? "text-gray-500"
                      : up
                        ? "text-emerald-600 font-medium"
                        : "text-red-600 font-medium"
                  }
                >
                  {Math.abs(tile.changePct!).toFixed(1)}%
                </span>
                <span className='text-gray-400'>
                  vs {formatValue(tile.previousValue!, tile.unit)} prior
                </span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface KpiDashboardPanelProps {
  /** Restricts the dashboard to one branch — omit for all branches. */
  branchId?: string;
}

/**
 * Prompt-driven KPI dashboard for Super-Admin. The prompt only chooses which
 * pre-defined metrics to show and over what window; every figure rendered here
 * is a live database aggregate computed server-side from the metric registry,
 * never a number produced by the model.
 */
export default function KpiDashboardPanel({ branchId }: KpiDashboardPanelProps) {
  const [generateKpi, { isLoading }] = useGenerateKpiMutation();
  const { data: metrics } = useGetKpiMetricsQuery();
  const [prompt, setPrompt] = useState("");
  const [dashboard, setDashboard] = useState<KpiDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (text: string) => {
    if (!text.trim()) return;
    setError(null);
    try {
      const res = await generateKpi({ prompt: text.trim(), branchId }).unwrap();
      setDashboard(res.data);
    } catch (err) {
      setDashboard(null);
      // RTK Query rejects with FetchBaseQueryError | SerializedError; the
      // backend's message lives on `.data.message` for the former.
      const message =
        typeof err === "object" && err !== null && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      setError(message || "Could not build that dashboard.");
    }
  };

  return (
    <div className='space-y-6'>
      <Card className='border border-gray-200 shadow-sm'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <LayoutDashboard className='w-5 h-5 text-blue-600' />
            KPI Builder
          </CardTitle>
          <p className='text-sm text-gray-500'>
            Describe the KPIs you want. Every figure is computed live from the
            database — the assistant only chooses which metrics to show.
          </p>
        </CardHeader>
        <CardContent className='space-y-4'>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(prompt);
            }}
            className='flex gap-2'
          >
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g. Service revenue vs last year, by month'
              className='flex-1'
            />
            <Button
              type='submit'
              disabled={isLoading || !prompt.trim()}
              className='bg-blue-600 hover:bg-blue-700'
            >
              {isLoading ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Send className='w-4 h-4' />
              )}
            </Button>
          </form>

          {!dashboard && !error && (
            <div className='flex flex-wrap gap-2'>
              {EXAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  type='button'
                  onClick={() => {
                    setPrompt(p);
                    run(p);
                  }}
                  className='rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 hover:bg-gray-100'
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className='flex items-start gap-2 text-red-600 text-sm'>
              <AlertCircle className='w-4 h-4 mt-0.5 shrink-0' />
              {error}
            </div>
          )}

          {metrics?.data?.length ? (
            <p className='text-xs text-gray-400'>
              {metrics.data.length} metrics available:{" "}
              {metrics.data.map((m) => m.label).join(", ")}.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {isLoading && (
        <div className='rounded-xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-500 flex items-center justify-center gap-2'>
          <Loader2 className='w-4 h-4 animate-spin' />
          Computing KPIs…
        </div>
      )}

      {dashboard && !isLoading && (
        <div className='space-y-4'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>
              {dashboard.title}
            </h3>
            <p className='text-sm text-gray-500'>{dashboard.period.label}</p>
          </div>

          {dashboard.warnings.length > 0 && (
            <div className='rounded-lg bg-amber-50 border border-amber-100 p-3 text-xs text-amber-800 space-y-1'>
              {dashboard.warnings.map((w, i) => (
                <div key={i} className='flex items-start gap-1.5'>
                  <Info className='w-3.5 h-3.5 mt-0.5 shrink-0' />
                  {w}
                </div>
              ))}
            </div>
          )}

          {dashboard.tiles.length > 0 && (
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
              {dashboard.tiles.map((t) => (
                <KpiTileCard key={t.metricId} tile={t} />
              ))}
            </div>
          )}

          {dashboard.charts.length > 0 && (
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
              {dashboard.charts.map((spec, i) => (
                <DashboardChartPreview key={`${spec.title}-${i}`} spec={spec} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
