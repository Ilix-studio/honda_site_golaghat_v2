export interface IStockConceptCSV {
  _id: string;
  stockId: string;
  modelName: string;
  engineNumber: string;
  chassisNumber: string;
  color: string;
  csvImportBatch: string;
  csvImportDate: string;
  csvFileName: string;
  csvData: Record<string, unknown>;
  schemaVersion: number;
  detectedColumns: string[];
  stockStatus: {
    status: "Available" | "Sold" | "Reserved" | "Service";
    location: string;
    branchId: string | { _id: string; branchName: string };
    updatedBy: string;
  };
  salesInfo?: {
    soldTo?: string;
    soldDate?: string;
    salePrice?: number;
    invoiceNumber?: string;
    paymentStatus?: "Paid" | "Partial" | "Pending";
    customerVehicleId?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CSVBatch {
  batchId: string;
  fileName: string;
  importDate: string;
  totalStocks: number;
  availableStocks: number;
  soldStocks: number;
  models: string[];
  locations: string[];
}

export interface CSVImportResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
    totalRows: number;
    successCount: number;
    failureCount: number;
    batchId: string;
    detectedColumns: string[];
    errors: Array<{
      row: number;
      data: Record<string, unknown>;
      error: string;
    }>;
    created: string[];
  };
}

export interface GetCSVStocksResponse {
  success: boolean;
  data: IStockConceptCSV[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface GetCSVBatchesResponse {
  success: boolean;
  data: CSVBatch[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface GetStockByIdResponse {
  success: boolean;
  data: IStockConceptCSV;
}

export interface UpdateStatusRequest {
  status?: IStockConceptCSV["stockStatus"]["status"];
  location?: string;
}

export interface AssignStockRequest {
  stockType: "manual" | "csv";
  customerId: string;
  salePrice: number;
  invoiceNumber: string;
  paymentStatus?: "Paid" | "Partial" | "Pending";
  registrationDate?: string;
  numberPlate?: string;
  registeredOwnerName?: string;
  insurance?: boolean;
  isPaid?: boolean;
  isFinance?: boolean;
}

export interface CSVStockFilters {
  page?: number;
  limit?: number;
  batchId?: string;
  status?: IStockConceptCSV["stockStatus"]["status"];
  location?: string;
}

export interface BatchStockFilters {
  page?: number;
  limit?: number;
  status?: IStockConceptCSV["stockStatus"]["status"];
}
