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
