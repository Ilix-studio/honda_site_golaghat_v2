// Frontend TypeScript interfaces that match the backend ServiceBooking model

export interface ServiceBookingFormData {
  // Vehicle Information
  bikeModel: string;
  year: string; // Form input as string, will be converted to number
  vin?: string;
  mileage: string; // Form input as string, will be converted to number
  registrationNumber?: string;

  // Service Details
  serviceType: string;
  additionalServices: string[];

  // Schedule Information
  serviceLocation: string; // Branch/Service location ID
  date: Date | undefined; // React Hook Form date
  time: string;

  // Customer Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Additional Information
  issues?: string; // Maps to specialRequests in backend
  dropOff: boolean; // Maps to isDropOff in backend
  waitOnsite: boolean; // Maps to willWaitOnsite in backend

  // Terms
  termsAccepted: boolean;
}

export interface ServiceBookingResponse {
  id: string;
  bookingId: string; // Auto-generated reference (e.g., SB-20241201-0001)

  // Vehicle Information
  bikeModel: string;
  year: number;
  vin?: string;
  mileage: number;
  registrationNumber?: string;

  // Service Details
  serviceType: ServiceType;
  additionalServices: AdditionalService[];

  // Schedule Information
  serviceLocation: {
    _id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  appointmentDate: string; // ISO date string
  appointmentTime: string;

  // Customer Information
  customerName: {
    firstName: string;
    lastName: string;
  };
  contactInfo: {
    email: string;
    phone: string;
  };

  // Additional Information
  specialRequests?: string;
  serviceOptions: {
    isDropOff: boolean;
    willWaitOnsite: boolean;
  };

  // System Fields
  status: BookingStatus;
  priority: "normal" | "urgent";
  estimatedCost?: number;
  actualCost?: number;
  estimatedDuration?: string;

  // Staff and notes
  assignedTechnician?: string;
  serviceNotes?: string;

  // Branch
  branch: {
    _id: string;
    name: string;
  };

  // Timestamps
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  completedAt?: string;

  // Virtual fields
  customerFullName: string;
  appointmentDateTime: string;
  daysUntilAppointment: number;
}

export type ServiceType =
  | "regular"
  | "major"
  | "tires"
  | "diagnostic"
  | "repair"
  | "warranty"
  | "recall"
  | "inspection";

export type AdditionalService =
  | "wash"
  | "brake"
  | "chain"
  | "battery"
  | "suspension"
  | "oil-change"
  | "filter-replacement"
  | "tune-up";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled";

// API Request/Response interfaces
export interface CreateBookingRequest {
  bikeModel: string;
  year: number;
  vin?: string;
  mileage: number;
  registrationNumber?: string;
  serviceType: ServiceType;
  additionalServices: AdditionalService[];
  serviceLocation: string;
  appointmentDate: string; // ISO date string
  appointmentTime: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
  isDropOff: boolean;
  willWaitOnsite: boolean;
  termsAccepted: boolean;
}

export interface CreateBookingResponse {
  success: boolean;
  message: string;
  data: {
    bookingId: string;
    appointmentDateTime: string;
    serviceLocation: {
      name: string;
      address: string;
    };
    estimatedCost?: number;
    serviceType: ServiceType;
  };
}

export interface GetBookingsResponse {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: ServiceBookingResponse[];
}

export interface BookingStatusUpdateRequest {
  status: BookingStatus;
  assignedTechnician?: string;
  serviceNotes?: string;
  estimatedCost?: number;
  actualCost?: number;
}

export interface CancelBookingRequest {
  reason?: string;
  email?: string; // Required for public cancellation
}

export interface TimeSlotAvailabilityResponse {
  success: boolean;
  data: {
    date: string;
    availableSlots: string[];
    bookedSlots: string[];
    totalAvailable: number;
  };
}

export interface BookingStatsResponse {
  success: boolean;
  data: {
    totalBookings: number;
    statusDistribution: Array<{
      _id: BookingStatus;
      count: number;
    }>;
    serviceTypeDistribution: Array<{
      _id: ServiceType;
      count: number;
    }>;
    revenue: {
      totalRevenue: number;
      averageBookingValue: number;
      completedBookings: number;
    };
    monthlyTrend: Array<{
      _id: {
        year: number;
        month: number;
      };
      count: number;
      revenue: number;
    }>;
  };
}

// Form validation schema data (for mock data)
export const serviceTypes = [
  {
    id: "regular",
    name: "Regular Maintenance",
    description: "Oil change, filter replacement, and basic inspection",
    estimatedTime: "1-2 hours",
    price: "₹2,500-₹4,000",
  },
  {
    id: "major",
    name: "Major Service",
    description:
      "Comprehensive service including valve clearance check, cooling system flush",
    estimatedTime: "3-5 hours",
    price: "₹6,000-₹12,000",
  },
  {
    id: "tires",
    name: "Tire Replacement",
    description: "Removal and installation of new tires, including balancing",
    estimatedTime: "1-2 hours",
    price: "₹4,000-₹8,000 (plus tire cost)",
  },
  {
    id: "diagnostic",
    name: "Diagnostic Check",
    description:
      "Computer diagnostic to identify issues with electronic systems",
    estimatedTime: "1 hour",
    price: "₹1,500-₹2,500",
  },
  {
    id: "repair",
    name: "Repair Service",
    description: "General repairs for specific issues with your motorcycle",
    estimatedTime: "Varies",
    price: "Varies based on issue",
  },
] as const;

export const additionalServices = [
  { id: "wash", name: "Motorcycle Wash & Detail", price: "₹500" },
  { id: "brake", name: "Brake Fluid Change", price: "₹800" },
  { id: "chain", name: "Chain Adjustment & Lubrication", price: "₹450" },
  {
    id: "battery",
    name: "Battery Check & Replacement",
    price: "₹250 (check) / ₹2,500+ (replacement)",
  },
  { id: "suspension", name: "Suspension Check & Adjustment", price: "₹750" },
  { id: "oil-change", name: "Engine Oil Change", price: "₹1,200" },
  { id: "filter-replacement", name: "Air Filter Replacement", price: "₹600" },
  { id: "tune-up", name: "Engine Tune-up", price: "₹2,000" },
] as const;

export const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
] as const;

// Helper functions for form data transformation
export const transformFormDataToRequest = (
  formData: ServiceBookingFormData
): CreateBookingRequest => {
  return {
    bikeModel: formData.bikeModel,
    year: parseInt(formData.year),
    vin: formData.vin || undefined,
    mileage: parseInt(formData.mileage),
    registrationNumber: formData.registrationNumber || undefined,
    serviceType: formData.serviceType as ServiceType,
    additionalServices: formData.additionalServices as AdditionalService[],
    serviceLocation: formData.serviceLocation,
    appointmentDate: formData.date?.toISOString() || "",
    appointmentTime: formData.time,
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    specialRequests: formData.issues || undefined,
    isDropOff: formData.dropOff,
    willWaitOnsite: formData.waitOnsite,
    termsAccepted: formData.termsAccepted,
  };
};

// Status display helpers
export const getStatusColor = (status: BookingStatus): string => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "confirmed":
      return "bg-blue-100 text-blue-800";
    case "in-progress":
      return "bg-orange-100 text-orange-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getStatusLabel = (status: BookingStatus): string => {
  switch (status) {
    case "pending":
      return "Pending Confirmation";
    case "confirmed":
      return "Confirmed";
    case "in-progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
};

export const getPriorityColor = (priority: "normal" | "urgent"): string => {
  return priority === "urgent"
    ? "bg-red-100 text-red-800"
    : "bg-gray-100 text-gray-800";
};
