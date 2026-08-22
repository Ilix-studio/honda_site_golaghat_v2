export interface B2BStockItem {
  stockConceptCSVId: string;
  modelName: string;
  engineNumber: string;
  chassisNumber: string;
  costPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface B2BExtraItem {
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface B2BSale {
  _id: string;
  challanNo: string;
  date: string;
  branchId: { _id: string; branchName?: string } | string;
  from: string;
  to: string;
  topHeading: string;
  stockItems: B2BStockItem[];
  extraItems: B2BExtraItem[];
  totalPrice: number;
  tcsAmount?: number;
  payablePrice: number;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockItemInput {
  stockConceptCSVId: string;
  quantity: number;
}

export interface ExtraItemInput {
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface CreateB2BSaleRequest {
  to: string;
  topHeading?: string;
  stockItems: StockItemInput[];
  extraItems?: ExtraItemInput[];
  tcsAmount?: number;
  payablePrice?: number;
}

export interface UpdateB2BSaleRequest {
  id: string;
  data: Partial<CreateB2BSaleRequest>;
}

export interface StockSearchResult {
  _id: string;
  modelName: string;
  engineNumber: string;
  chassisNumber: string;
  costPrice: number;
  status: string;
  location: string;
}

export interface SearchStockForB2BSaleResponse {
  success: boolean;
  data: StockSearchResult[];
}

export interface CreateB2BSaleResponse {
  success: boolean;
  message: string;
  data: B2BSale;
}

export interface GetB2BSaleResponse {
  success: boolean;
  data: B2BSale;
}

export interface B2BSalesListFilters {
  page?: number;
  limit?: number;
  branchId?: string;
}

export interface GetB2BSalesResponse {
  success: boolean;
  data: B2BSale[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface B2BSalesMonthlyTrendPoint {
  month: string;
  challanCount: number;
  totalPrice: number;
  payablePrice: number;
}

export interface B2BSalesTopItem {
  modelName: string;
  totalQuantity: number;
}

export interface B2BSalesBranchBreakdown {
  branchId: string;
  branchName?: string;
  challanCount: number;
  totalPrice: number;
  payablePrice: number;
}

export interface B2BSalesKPIs {
  totalChallans: number;
  /**
   * Vehicles handed over across all active challans — SUM of
   * stockItems.quantity. Not derivable from `topItems`, which the backend
   * caps at the top 10 models.
   */
  totalVehicles: number;
  totalSalesValue: number;
  totalPayableValue: number;
  averageChallanValue: number;
  monthlyTrend: B2BSalesMonthlyTrendPoint[];
  topItems: B2BSalesTopItem[];
  branchBreakdown?: B2BSalesBranchBreakdown[];
}

export interface GetB2BSalesKPIsResponse {
  success: boolean;
  data: B2BSalesKPIs;
}

export interface B2BSalesKPIsFilters {
  branchId?: string;
}
