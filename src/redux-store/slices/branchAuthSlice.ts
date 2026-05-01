// redux-store/slices/branchAuthSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface BranchUser {
  id: string;
  applicationId: string;
  branchName: string;
  branchId: string;
  role: "Branch-Admin";
}

export interface BranchAuthState {
  user: BranchUser | null;
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
  loading: boolean;
}

const initialState: BranchAuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  error: null,
  loading: false,
};

const branchAuthSlice = createSlice({
  name: "branchAuth",
  initialState,
  reducers: {
    branchLoginSuccess: (
      state,
      action: PayloadAction<{ user: BranchUser; token: string }>,
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      state.loading = false;
    },
    branchLogout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
    },
    setBranchLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setBranchError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  branchLoginSuccess,
  branchLogout,
  setBranchLoading,
  setBranchError,
} = branchAuthSlice.actions;

// Selectors
export const selectBranchAuth = (state: RootState) => state.branchAuth;
export const selectIsBranchAdmin = (state: RootState) =>
  state.branchAuth.isAuthenticated && state.branchAuth.user !== null;

export default branchAuthSlice.reducer;
