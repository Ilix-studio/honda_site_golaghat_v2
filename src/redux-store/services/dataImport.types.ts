export type DatasetType =
  | "parts-stock"
  | "vehicle-stock"
  | "service-jobcard"
  | "service-timetrack"
  | "invoice";

export type SourceFormat = "xlsx" | "csv" | "pdf";

export type Granularity = "day" | "week" | "month" | "year";

// ─── Config ──────────────────────────────────────────────────────────────────

export interface CanonicalFieldDTO {
  key: string;
  label: string;
  required: boolean;
}

export interface DatasetOptionDTO {
  datasetType: DatasetType;
  label: string;
  fields: CanonicalFieldDTO[];
  sourceFormats: SourceFormat[];
}

export interface DataImportConfigResponse {
  success: boolean;
  data: {
    role: string;
    datasets: DatasetOptionDTO[];
  };
}

// ─── Preview / Commit ───────────────────────────────────────────────────────

export interface MatchedFieldDTO {
  canonicalKey: string;
  label: string;
  sourceColumn: string;
}

export interface PreviewResponse {
  success: boolean;
  data: {
    format: SourceFormat;
    columns: string[];
    sheetNames?: string[];
    sheetUsed?: string;
    sampleRows: Record<string, any>[];
    totalRows: number;
    matchedFields: MatchedFieldDTO[];
    unmatchedColumns: string[];
    missingRequired: string[];
    isValid: boolean;
  };
}

export interface AutoRegistrationSummary {
  vehicleMatchedServiceUpdated: number;
  customerCreatedVehicleCreated: number;
  customerMatchedVehicleCreated: number;
  conflicts: number;
  skipped: number;
  freeServicesDisabled: number;
}

export interface CommitResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
    totalRows: number;
    importedRows: number;
    duplicateRows: number;
    reviewRows: number;
    batchId: string;
    sourceFormat: SourceFormat;
    detectedColumns: string[];
    errors: { row: number; data: Record<string, any>; error: string }[];
    autoRegistration?: AutoRegistrationSummary;
  };
}

// ─── Datasets / Rows ────────────────────────────────────────────────────────

export interface ImportedDatasetDTO {
  _id: string;
  batchId: string;
  datasetType: DatasetType;
  fileName: string;
  sourceFormat: SourceFormat;
  sheetUsed?: string;
  availableSheets?: string[];
  detectedColumns: string[];
  matchedFields: MatchedFieldDTO[];
  unmatchedColumns: string[];
  missingRequired: string[];
  totalRows: number;
  importedRows: number;
  duplicateRows: number;
  reviewRows: number;
  status: "completed" | "completed_with_errors" | "failed";
  branchId: { _id: string; branchName?: string } | string | null;
  uploadedBy: string;
  uploadedByRole: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ImportedRowDTO {
  _id: string;
  rowId: string;
  dataset: string;
  batchId: string;
  datasetType: DatasetType;
  rowData: Record<string, any>;
  normalized: Record<string, any>;
  sourceFormat: SourceFormat;
  needsReview: boolean;
  branchId: string;
  createdAt: string;
}

export interface DataImportPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface DatasetsListResponse {
  success: boolean;
  data: ImportedDatasetDTO[];
  pagination: DataImportPagination;
}

export interface DatasetRowsResponse {
  success: boolean;
  data: ImportedRowDTO[];
  pagination: DataImportPagination;
}

export interface DeleteDatasetResponse {
  success: boolean;
  message: string;
}

export interface DatasetsFilters {
  datasetType?: DatasetType;
  branchId?: string;
  page?: number;
  limit?: number;
}

export interface DatasetRowsFilters {
  batchId: string;
  page?: number;
  limit?: number;
}

// ─── Sales timeseries ───────────────────────────────────────────────────────

export interface SalesTimeseriesPoint {
  bucket: string;
  bucketStart: string;
  totalRevenue: number;
  labourRevenue: number;
  partsRevenue: number;
  lubesRevenue: number;
  accessoriesRevenue: number;
  jobCardCount: number;
}

export interface SalesByModel {
  modelName: string;
  totalRevenue: number;
  jobCardCount: number;
}

export interface SalesByBranch {
  branchId: string;
  branchName?: string;
  totalRevenue: number;
  jobCardCount: number;
}

export interface SalesByTechnician {
  technicianName: string;
  totalRevenue: number;
  jobCardCount: number;
}

export interface SalesTimeseriesResponse {
  success: boolean;
  data: {
    granularity: Granularity;
    from: string | null;
    to: string | null;
    timeseries: SalesTimeseriesPoint[];
    byModel: SalesByModel[];
    byBranch: SalesByBranch[];
    byTechnician: SalesByTechnician[];
  };
}

export interface SalesTimeseriesFilters {
  granularity: Granularity;
  from?: string;
  to?: string;
  branchId?: string;
}

// ─── Parts-stock sold/not-sold status ──────────────────────────────────────

export interface PartsStockStatusResponse {
  success: boolean;
  data: {
    totalItems: number;
    totalStockValue: number;
    soldCount: number;
    notSoldCount: number;
    soldPercent: number;
  };
}
