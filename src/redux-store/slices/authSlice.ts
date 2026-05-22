import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface UserBranch {
  _id: string;
  branchName: string;
  address: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  role: string;
  applicationId?: string;
  branch?: UserBranch;
  position?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  error: null,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      state.loading = false;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { loginSuccess, logout, setLoading, setError } = authSlice.actions;

// Selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectIsAdmin = (state: RootState) =>
  state.auth.isAuthenticated && state.auth.user?.role === "Super-Admin";
export const selectIsBranchAdmin = (state: RootState) =>
  state.auth.isAuthenticated && state.auth.user?.role === "Branch-Admin";
export const selectIsServiceAdmin = (state: RootState) =>
  state.auth.isAuthenticated && state.auth.user?.role === "Service-Admin";
export const selectIsStaff = (state: RootState) =>
  state.auth.isAuthenticated && state.auth.user?.role === "Staff";
export const selectUserRole = (state: RootState) => state.auth.user?.role;
export const selectUserBranch = (state: RootState) => state.auth.user?.branch;

export default authSlice.reducer;
