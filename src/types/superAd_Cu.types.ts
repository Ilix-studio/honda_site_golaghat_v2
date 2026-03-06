// ===================== TYPES & INTERFACES =====================
// Service Types
type ServiceType = "Regular" | "Overdue" | "Due Soon" | "Up to Date";
type NextServiceType =
  | "firstService"
  | "secondService"
  | "thirdService"
  | "paidServiceOne"
  | "paidServiceTwo"
  | "paidServiceThree"
  | "paidServiceFour"
  | "paidServiceFive";

// Customer Vehicle Interface
export interface ICustomerVehicle {
  _id: string;
  modelName: string;

  // Reference to StockConcept for vehicle details
  stockConcept?: string; // ObjectId as string

  // Vehicle ownership details
  registrationDate?: Date;
  insurance: boolean;
  isPaid: boolean;
  isFinance: boolean;
  color?: string;
  purchaseDate?: Date;
  customerPhoneNumber: string; // ObjectId as string - Reference to BaseCustomer
  numberPlate?: string;
  registeredOwnerName?: string;
  motorcyclePhoto?: string;

  // RTO Information
  rtoInfo?: {
    rtoCode: string;
    rtoName: string;
    rtoAddress: string;
    state: string;
  };

  // Service tracking
  serviceStatus: {
    lastServiceDate?: Date;
    nextServiceDue?: Date;
    serviceType: ServiceType;
    kilometers: number;
    serviceHistory: number;
  };

  // Service package assignment
  servicePackage: {
    packageId: string; // ObjectId as string - Reference to ServiceAddons
    activatedDate?: Date;
    currentServiceLevel: number;
    nextServiceType: NextServiceType;
    completedServices: NextServiceType[];
  };

  // Value added services
  activeValueAddedServices: Array<{
    serviceId: string; // ObjectId as string - Reference to ValueAddedService
    activatedDate: Date;
    expiryDate: Date;
    activatedBy: string; // ObjectId as string - Reference to admin user
    purchasePrice: number;
    coverageYears: number;
    isActive: boolean;
    activeBadges: string[];
  }>;

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response Types
export interface CustomerVehicleResponse {
  success: boolean;
  data: ICustomerVehicle;
  message?: string;
}

export interface PopulatedCustomerVehicleResponse {
  success: boolean;
  data: IPopulatedCustomerVehicle;
  message?: string;
}

export interface CustomerVehicleListResponse {
  success: boolean;
  data: ICustomerVehicle[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
}

export interface PopulatedCustomerVehicleListResponse {
  success: boolean;
  data: IPopulatedCustomerVehicle[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
}

export interface CreateCustomerVehicleRequest {
  modelName: string;
  stockConcept?: string;
  registrationDate?: Date;
  insurance: boolean;
  isPaid: boolean;
  isFinance: boolean;
  color?: string;
  purchaseDate?: Date;
  customerPhoneNumber: string;
  numberPlate?: string;
  registeredOwnerName?: string;
  motorcyclePhoto?: string;
  rtoInfo?: {
    rtoCode: string;
    rtoName: string;
    rtoAddress: string;
    state: string;
  };
  servicePackage: {
    packageId: string;
    currentServiceLevel?: number;
    nextServiceType?: NextServiceType;
  };
}

export interface UpdateCustomerVehicleRequest
  extends Partial<CreateCustomerVehicleRequest> {
  isActive?: boolean;
}

export interface UpdateServiceStatusRequest {
  lastServiceDate?: Date;
  nextServiceDue?: Date;
  serviceType?: ServiceType;
  kilometers?: number;
  serviceHistory?: number;
}

export interface UpdateServicePackageRequest {
  packageId?: string;
  currentServiceLevel?: number;
  nextServiceType?: NextServiceType;
  completedServices?: NextServiceType[];
}

export interface AddValueAddedServiceRequest {
  serviceId: string;
  activatedBy: string;
  purchasePrice: number;
  coverageYears: number;
  activeBadges?: string[];
}

export interface UpdateValueAddedServiceRequest {
  serviceIndex: number;
  isActive?: boolean;
  activeBadges?: string[];
}

export interface CustomerVehicleFilters {
  page?: number;
  limit?: number;
  customerId?: string;
  modelName?: string;
  serviceType?: ServiceType;
  nextServiceType?: NextServiceType;
  rtoCode?: string;
  color?: string;
  insurance?: boolean;
  isPaid?: boolean;
  isFinance?: boolean;
  isActive?: boolean;
  hasVAS?: boolean; // Has active value-added services
  search?: string;
  registrationFrom?: string; // ISO date string
  registrationTo?: string; // ISO date string
  purchaseFrom?: string; // ISO date string
  purchaseTo?: string; // ISO date string
  serviceDueFrom?: string; // ISO date string
  serviceDueTo?: string; // ISO date string
}

export interface CustomerVehicleStatsResponse {
  success: boolean;
  data: {
    totalVehicles: number;
    activeVehicles: number;
    insuredVehicles: number;
    paidVehicles: number;
    financeVehicles: number;
    vehiclesWithVAS: number;
    serviceStats: {
      upToDate: number;
      dueSoon: number;
      overdue: number;
      regular: number;
    };
    servicePackageStats: Array<{
      packageId: string;
      packageName: string;
      vehicleCount: number;
    }>;
    rtoStats: Array<{
      rtoCode: string;
      rtoName: string;
      vehicleCount: number;
    }>;
    modelStats: Array<{
      modelName: string;
      vehicleCount: number;
    }>;
    recentRegistrations: Array<{
      date: string;
      count: number;
    }>;
  };
  message?: string;
}

export interface ServiceHistoryResponse {
  success: boolean;
  data: Array<{
    _id: string;
    vehicleId: string;
    serviceType: NextServiceType;
    serviceDate: Date;
    kilometers: number;
    serviceNotes?: string;
    cost?: number;
    technician?: string;
    branchId: string;
    branchName: string;
  }>;
  message?: string;
}

export interface VehicleTransferRequest {
  fromCustomerId: string;
  toCustomerId: string;
  transferDate: Date;
  transferReason: string;
  updatedBy: string;
}

export interface BulkUpdateVehiclesRequest {
  vehicleIds: string[];
  updates: {
    serviceType?: ServiceType;
    insurance?: boolean;
    isPaid?: boolean;
    isActive?: boolean;
  };
}

export interface VehiclesByPhoneResponse {
  success: boolean;
  customerFound: boolean;
  customer?: {
    _id: string;
    phoneNumber: string;
    isVerified: boolean;
  };
  count: number;
  data: IPopulatedCustomerVehicle[];
  message?: string;
}

export interface IPopulatedStockConcept {
  _id: string;
  stockId: string;
  modelName: string;
  category?: string; // StockConcept has this, CSV may not
  engineCC?: number;
  color: string;
  variant?: string;
  yearOfManufacture?: number;
  engineNumber?: string;
  chassisNumber?: string;
  priceInfo?: {
    exShowroomPrice: number;
    roadTax: number;
    onRoadPrice: number;
  };
}

export interface IPopulatedVAS {
  _id: string;
  serviceId:
    | {
        _id: string;
        serviceName: string;
        coverageYears: number;
        priceStructure: { basePrice: number };
        benefits: string[];
        isActive: boolean;
      }
    | string; // string when not populated
  activatedDate: string;
  expiryDate: string;
  purchasePrice: number;
  coverageYears: number;
  isActive: boolean;
}

export interface IPopulatedCustomerVehicle
  extends Omit<
    ICustomerVehicle,
    "stockConcept" | "activeValueAddedServices" | "stockConceptcsv"
  > {
  stockConcept?: IPopulatedStockConcept;
  activeValueAddedServices: IPopulatedVAS[];
}
