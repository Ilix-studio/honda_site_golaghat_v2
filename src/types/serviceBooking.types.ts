// Types
export interface ServiceBooking {
  _id: string;
  customer: string;
  vehicle: string;
  serviceType: string;
  usedServices: string[];
  branch: string;
  appointmentDate: string;
  appointmentTime: string;
  location: "branch" | "home" | "office" | "roadside";
  specialRequests?: string;
  serviceOptions: {
    isDropOff: boolean;
    willWaitOnsite: boolean;
  };
  bookingId: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  priority?: "normal" | "urgent";
  estimatedCost?: number;
  actualCost?: number;
  estimatedDuration?: string;
  assignedTechnician?: string;
  serviceNotes?: string;
  internalNotes?: string;
  termsAccepted: boolean;
  termsAcceptedAt?: string;
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
  specialRequests?: string;
  isDropOff?: boolean;
  willWaitOnsite?: boolean;
  termsAccepted: boolean;
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
