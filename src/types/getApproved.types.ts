// Define GetApproved application types
export interface GetApprovedApplication {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  employmentType:
    | "salaried"
    | "self-employed"
    | "business-owner"
    | "retired"
    | "student";
  monthlyIncome: number;
  creditScoreRange: "excellent" | "good" | "fair" | "poor";
  applicationId: string;
  status: "pending" | "under-review" | "pre-approved" | "approved" | "rejected";
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  reviewedAt?: string;
  reviewNotes?: string;
  preApprovalAmount?: number;
  preApprovalValidUntil?: string;
  branch?: {
    _id: string;
    name: string;
    address: string;
  };
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  fullName?: string;
  applicationAge?: number;
}

// Request interfaces
export interface SubmitApplicationRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  employmentType:
    | "salaried"
    | "self-employed"
    | "business-owner"
    | "retired"
    | "student";
  monthlyIncome: number;
  creditScoreRange: "excellent" | "good" | "fair" | "poor";
  branch?: string;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
}

export interface GetApplicationsFilters {
  page?: number;
  limit?: number;
  status?: string;
  employmentType?: string;
  creditScoreRange?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
  branch?: string;
}

export interface UpdateStatusRequest {
  status: "pending" | "under-review" | "pre-approved" | "approved" | "rejected";
  reviewNotes?: string;
  preApprovalAmount?: number;
  preApprovalValidDays?: number;
}

export interface CheckStatusRequest {
  email: string;
  applicationId: string;
}

// Response interfaces
export interface SubmitApplicationResponse {
  success: boolean;
  data: {
    applicationId: string;
    status: string;
    message: string;
  };
}

export interface GetApplicationsResponse {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: GetApprovedApplication[];
}

export interface GetApplicationByIdResponse {
  success: boolean;
  data: GetApprovedApplication;
}

export interface UpdateStatusResponse {
  success: boolean;
  data: GetApprovedApplication;
  message: string;
}

export interface DeleteApplicationResponse {
  success: boolean;
  message: string;
}

export interface GetStatsResponse {
  success: boolean;
  data: {
    totalApplications: number;
    recentApplications: number;
    averageMonthlyIncome: number;
    statusBreakdown: Record<string, number>;
    employmentTypeBreakdown: Record<string, number>;
    creditScoreBreakdown: Record<string, number>;
  };
}

export interface CheckStatusResponse {
  success: boolean;
  data: {
    applicationId: string;
    status: string;
    preApprovalAmount?: number;
    preApprovalValidUntil?: string;
    submittedAt: string;
    branch?: {
      name: string;
      address: string;
    };
  };
}
// In getApproved_types.ts — add this interface
export interface GetApplicationsWithBikesFilters {
  page?: number;
  limit?: number;
  status?: string;
  enquiryType?: string;
  category?: string;
  urgency?: string;
  hasTradeIn?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetStatsResponseWithBikes {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: GetApprovedApplicationWithBikes[];
}

// Extend existing GetApprovedApplication with populated bike
export interface GetApprovedApplicationWithBikes
  extends GetApprovedApplication {
  enquiryType: "general-financing" | "specific-bike" | "trade-in" | "upgrade";
  bikeEnquiry?: {
    bikeId?: {
      _id: string;
      modelName: string;
      category: string;
      price: number;
      images: string[];
      year: number;
    };
    bikeModel?: string;
    category?: string;
    priceRange?: { min: number; max: number };
    preferredFeatures?: string[];
    intendedUse?: string;
    previousBikeExperience?: string;
    urgency?: string;
    additionalRequirements?: string;
    tradeInBike?: {
      hasTradeIn: boolean;
      currentBikeModel?: string;
      currentBikeYear?: number;
      estimatedValue?: number;
      condition?: string;
    };
  };
}
