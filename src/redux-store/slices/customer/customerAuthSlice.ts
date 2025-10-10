import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Customer {
  id: string;
  phoneNumber: string;
  firebaseUid: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  village?: string;
  postOffice?: string;
  policeStation?: string;
  district?: string;
  state?: string;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerAuthState {
  customer: Customer | null;
  firebaseToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: CustomerAuthState = {
  customer: null,
  firebaseToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const customerAuthSlice = createSlice({
  name: "customerAuth",
  initialState,
  reducers: {
    // Start registration process
    registrationStarted: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    // Successful login/registration
    loginSuccess: (
      state,
      action: PayloadAction<{
        customer: Customer;
        firebaseToken: string;
      }>
    ) => {
      state.customer = action.payload.customer;
      state.firebaseToken = action.payload.firebaseToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },

    updateFirebaseToken: (state, action: PayloadAction<string>) => {
      state.firebaseToken = action.payload;

      // Update localStorage
      const persistedAuth = localStorage.getItem("customerAuth");
      if (persistedAuth) {
        const parsedAuth = JSON.parse(persistedAuth);
        parsedAuth.firebaseToken = action.payload;
        localStorage.setItem("customerAuth", JSON.stringify(parsedAuth));
      }
    },

    // Update customer profile
    profileUpdated: (state, action: PayloadAction<Customer>) => {
      state.customer = action.payload;
    },

    // Logout
    logout: (state) => {
      state.customer = null;
      state.firebaseToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },

    // Set error
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Set loading
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  registrationStarted,
  loginSuccess,
  updateFirebaseToken,
  profileUpdated,
  logout,
  setError,
  clearError,
  setLoading,
} = customerAuthSlice.actions;

// Selectors
export const selectCustomerAuth = (state: {
  customerAuth: CustomerAuthState;
}) => state.customerAuth;
export const selectCustomer = (state: { customerAuth: CustomerAuthState }) =>
  state.customerAuth.customer;
export const selectIsAuthenticated = (state: {
  customerAuth: CustomerAuthState;
}) => state.customerAuth.isAuthenticated;

export default customerAuthSlice.reducer;
