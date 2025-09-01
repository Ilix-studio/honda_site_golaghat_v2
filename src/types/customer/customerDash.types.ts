export interface Vehicle {
  _id: string;
  customer: string;
  numberPlate: string;
  motorcyclemodelName: string;
  registeredOwnerName: string;
  rtoInfo: {
    rtoCode: string;
    rtoLocation: string;
  };
  serviceStatus: {
    serviceType: string;
    kilometers: number;
    lastServiceDate: Date;
    nextServiceDue: Date;
    serviceHistory: number;
    isServiceDue: boolean;
  };
  fitnessUpTo: Date;
  isActive: boolean;
  isFitnessExpired?: boolean;
  activeBadges?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardOverview {
  totalVehicles: number;
  serviceDue: number;
  fitnessExpiring: number;
  fitnessExpired: number;
  totalActiveServices: number;
}

export interface CustomerDashboardResponse {
  success: boolean;
  data: {
    overview: DashboardOverview;
    vehicles: Vehicle[];
    hasMoreVehicles: boolean;
  };
}

export interface CustomerVehiclesResponse {
  success: boolean;
  count: number;
  total: number;
  pages: number;
  currentPage: number;
  data: Vehicle[];
}

export interface VehicleResponse {
  success: boolean;
  data: Vehicle;
}

export interface ServiceHistoryResponse {
  success: boolean;
  data: {
    vehicle: {
      _id: string;
      numberPlate: string;
      motorcyclemodelName: string;
    };
    currentStatus: Vehicle["serviceStatus"];
    history: Array<{
      date: Date;
      type: string;
      kilometers: number;
      description: string;
      cost: number;
      nextServiceDue: Date;
    }>;
    totalServices: number;
    averageServiceCost: number;
  };
}

export interface VehicleStatsResponse {
  success: boolean;
  data: {
    totalVehicles: number;
    serviceDue: number;
    fitnessExpiring: number;
    fitnessExpired: number;
  };
}

export interface CreateVehicleRequest {
  customer: string;
  numberPlate: string;
  motorcyclemodelName: string;
  registeredOwnerName: string;
  rtoInfo: {
    rtoCode: string;
    rtoLocation: string;
  };
  serviceStatus: {
    serviceType: string;
    kilometers: number;
    lastServiceDate: Date;
    nextServiceDue: Date;
    serviceHistory: number;
  };
  fitnessUpTo: Date;
}

export interface UpdateVehicleRequest {
  numberPlate?: string;
  motorcyclemodelName?: string;
  registeredOwnerName?: string;
  rtoInfo?: {
    rtoCode?: string;
    rtoLocation?: string;
  };
  serviceStatus?: {
    serviceType?: string;
    kilometers?: number;
    lastServiceDate?: Date;
    nextServiceDue?: Date;
    serviceHistory?: number;
  };
  fitnessUpTo?: Date;
}

export interface GetAllVehiclesFilters {
  page?: number;
  limit?: number;
  serviceType?: string;
  rtoCode?: string;
  customerId?: string;
}

export interface UpdateServiceStatusRequest {
  serviceType: string;
  kilometers: number;
  lastServiceDate: Date;
  nextServiceDue: Date;
}

export interface AssignVehicleRequest {
  customerId: string;
  ownerName?: string;
}

export interface TransferOwnershipRequest {
  newCustomerId: string;
  newOwnerName?: string;
}
