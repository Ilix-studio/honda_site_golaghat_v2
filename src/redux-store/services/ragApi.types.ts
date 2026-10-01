export interface RagCitation {
  sourceType: string;
  sourceId: string;
  displayName: string;
  snippet: string;
}

export interface DashboardSpec {
  title: string;
  chartType: "bar" | "line" | "pie";
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
}

export interface RagQueryResult {
  answer: string;
  citations: RagCitation[];
  usedPath: "structured" | "semantic" | "ambiguous";
  model: string;
  dashboardSpec?: DashboardSpec;
}

export interface RagQueryResponse {
  success: boolean;
  data: RagQueryResult;
}

export interface RagQueryArgs {
  question: string;
  branchId?: string;
  sourceTypes?: string[];
}

export interface RagSourcesResponse {
  success: boolean;
  data: { sourceType: string; displayName: string }[];
}

export interface RagReindexResponse {
  success: boolean;
  data: { sourceType: string; indexed: number }[];
}

export interface RagReindexArgs {
  sourceType?: string;
  branchId?: string;
  since?: string;
}

// ─── Prompt-driven KPI dashboards (Super-Admin) ──────────────────────────────

export type KpiUnit = "count" | "currency";
export type KpiDimension = "month" | "branch" | "status";

export interface KpiTile {
  metricId: string;
  label: string;
  unit: KpiUnit;
  value: number;
  previousValue?: number;
  /** null when the previous period was zero (no meaningful percentage). */
  changePct?: number | null;
}

export interface KpiDashboard {
  title: string;
  period: { from: string; to: string; label: string };
  tiles: KpiTile[];
  /** Same shape as RAG chat charts, so both render through DashboardChartPreview. */
  charts: DashboardSpec[];
  model: string;
  warnings: string[];
}

export interface KpiResponse {
  success: boolean;
  data: KpiDashboard;
}

export interface KpiArgs {
  prompt: string;
  branchId?: string;
}

export interface KpiMetric {
  id: string;
  label: string;
  description: string;
  unit: KpiUnit;
  dimensions: KpiDimension[];
}

export interface KpiMetricsResponse {
  success: boolean;
  data: KpiMetric[];
}
