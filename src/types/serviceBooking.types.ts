// Types
export interface ServiceBooking {
  _id: string;
  customer: string;
  modelName: string;
  serviceType: string;
  usedServices: string[];
  branch: string;
  appointmentDate: string;
  appointmentTime: string;
  location: "branch" | "home" | "office" | "roadside";
  bookingId: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  priority?: "normal" | "urgent";
  estimatedCost?: number;
  actualCost?: number;
  estimatedDuration?: string;
  assignedTechnician?: string;
  serviceNotes?: string;
  internalNotes?: string;
  adminNotificationSent: boolean;
  notificationSentAt?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  completedAt?: string;
}

export interface CreateBookingRequest {
  vehicle: string;
  serviceType: string;
  branch: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
}

export interface CreateBookingResponse {
  success: boolean;
  message: string;
  data: {
    bookingId: string;
    appointmentDateTime: string;
    branch: any;
    estimatedCost?: number;
    serviceType: string;
    status: string;
    customer: any;
    customerProfile: any;
  };
}

export interface BookingsResponse {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: ServiceBooking[];
}

export interface AvailabilityResponse {
  success: boolean;
  data: {
    date: string;
    availableSlots: string[];
    totalAvailable: number;
  };
}

export interface ServiceStatsResponse {
  success: boolean;
  data: {
    totalServicesUsed: number;
    availableServicesCount: number;
    usedServicesCount: number;
    usedServiceTypes: string[];
    availableServices: string[];
    breakdown: {
      freeServicesUsed: number;
      paidServicesUsed: number;
    };
  };
}
// Response type for vehicle info endpoint
export interface CustomerVehicleInfoResponse {
  success: boolean;
  data: {
    vehicleId: string;
    modelName: string;
  };
}
