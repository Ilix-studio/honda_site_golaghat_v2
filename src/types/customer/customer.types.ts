// Export types to avoid TypeScript errors
export interface CustomerLoginRequest {
  idToken: string;
  phoneNumber: string;
}

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

export interface Customer {
  id: string;
  phoneNumber: string;
  firebaseUid: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isVerified: boolean;
}

export interface CustomerAuthResponse {
  success: boolean;
  message: string;
  data: {
    customer: Customer;
    token?: string;
  };
}
