// src/redux-store/slices/customerAuthSlice.ts
import { RootState } from "@/redux-store/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Customer user interface
export interface CustomerUser {
  _id: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isVerified: boolean;
  firebaseUid?: string;
}

// Customer auth state
export interface CustomerAuthState {
  customer: CustomerUser | null;
  firebaseToken: string | null; // Firebase ID token
  isAuthenticated: boolean;
  needsProfile: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: CustomerAuthState = {
  customer: null,
  firebaseToken: null,
  isAuthenticated: false,
  needsProfile: false,
  loading: false,
  error: null,
};

const customerAuthSlice = createSlice({
  name: "customerAuth",
  initialState,
  reducers: {
    // Registration flow
    registrationStarted: (state) => {
      state.loading = true;
      state.error = null;
    },

    otpVerified: (
      state,
      action: PayloadAction<{
        customer: CustomerUser;
        firebaseToken: string;
        needsProfile: boolean;
      }>
    ) => {
      state.customer = action.payload.customer;
      state.firebaseToken = action.payload.firebaseToken;
      state.isAuthenticated = true;
      state.needsProfile = action.payload.needsProfile;
      state.loading = false;
      state.error = null;
    },

    // Login success
    customerLoginSuccess: (
      state,
      action: PayloadAction<{
        customer: CustomerUser;
        firebaseToken: string;
      }>
    ) => {
      state.customer = action.payload.customer;
      state.firebaseToken = action.payload.firebaseToken;
      state.isAuthenticated = true;
      state.needsProfile = false;
      state.loading = false;
      state.error = null;
    },

    // Profile completion
    profileCompleted: (state, action: PayloadAction<CustomerUser>) => {
      state.customer = action.payload;
      state.needsProfile = false;
    },

    // Update customer data
    customerUpdated: (state, action: PayloadAction<CustomerUser>) => {
      state.customer = action.payload;
    },

    // Update Firebase token (for token refresh)
    tokenUpdated: (state, action: PayloadAction<string>) => {
      state.firebaseToken = action.payload;
    },

    // Logout
    customerLogout: (state) => {
      state.customer = null;
      state.firebaseToken = null;
      state.isAuthenticated = false;
      state.needsProfile = false;
      state.loading = false;
      state.error = null;
    },

    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Error handling
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  registrationStarted,
  otpVerified,
  customerLoginSuccess,
  profileCompleted,
  customerUpdated,
  tokenUpdated,
  customerLogout,
  setLoading,
  setError,
  clearError,
} = customerAuthSlice.actions;

// Selectors
export const selectCustomerAuth = (state: RootState) => state.customerAuth;
export const selectIsCustomerAuthenticated = (state: RootState) =>
  state.customerAuth.isAuthenticated;
export const selectCustomer = (state: RootState) => state.customerAuth.customer;
export const selectCustomerToken = (state: RootState) =>
  state.customerAuth.firebaseToken;
export const selectNeedsProfile = (state: RootState) =>
  state.customerAuth.needsProfile;

export default customerAuthSlice.reducer;
