// ============= INTERFACES =============
export interface Customer {
  _id: string;
  phoneNumber: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  village?: string;
  postOffice?: string;
  policeStation?: string;
  district?: string;
  state?: string;
  firebaseUid?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth Requests
export interface RegisterCustomerRequest {
  phoneNumber: string;
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  idToken: string;
}

export interface CustomerLoginRequest {
  idToken: string;
}

export interface ResendOTPRequest {
  phoneNumber: string;
}

// Profile Requests
export interface CreateProfileRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  village: string;
  postOffice: string;
  policeStation: string;
  district: string;
  state: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  village?: string;
  postOffice?: string;
  policeStation?: string;
  district?: string;
  state?: string;
}

// Admin Requests
export interface GetAllCustomersRequest {
  page?: number;
  limit?: number;
  search?: string;
  isVerified?: boolean;
  district?: string;
  state?: string;
}

export interface SearchCustomersRequest {
  query: string;
  field?: "phoneNumber" | "firstName" | "email";
  page?: number;
  limit?: number;
}

// Response Interfaces
export interface CustomerAuthResponse {
  success: boolean;
  message: string;
  data: {
    customerId?: string;
    phoneNumber?: string;
    isVerified?: boolean;
    needsProfile?: boolean;
    customer?: Customer;
    token?: string;
  };
}

export interface CustomersListResponse {
  success: boolean;
  count: number;
  total: number;
  pages: number;
  currentPage: number;
  data: Customer[];
}

export interface CustomerStatsResponse {
  success: boolean;
  data: {
    totalCustomers: number;
    verifiedCustomers: number;
    unverifiedCustomers: number;
    stateStats: Array<{
      _id: string;
      count: number;
    }>;
    districtStats: Array<{
      _id: string;
      count: number;
    }>;
    monthlyStats: Array<{
      _id: {
        year: number;
        month: number;
      };
      count: number;
    }>;
  };
}
