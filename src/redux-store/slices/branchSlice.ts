// src/redux-store/slices/branchSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface Staff {
  name: string;
  position: string;
}

export interface Branch {
  _id: string;
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  staff: Staff[];
}

export interface BranchState {
  branches: Branch[];
  selectedBranch: Branch | null;
  loading: boolean;
  error: string | null;
}

const initialState: BranchState = {
  branches: [],
  selectedBranch: null,
  loading: false,
  error: null,
};

const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {
    setBranches: (state, action: PayloadAction<Branch[]>) => {
      state.branches = action.payload;
    },
    setSelectedBranch: (state, action: PayloadAction<Branch | null>) => {
      state.selectedBranch = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setBranches, setSelectedBranch, setLoading, setError } =
  branchSlice.actions;

export const selectBranches = (state: RootState) => state.branch.branches;
export const selectSelectedBranch = (state: RootState) =>
  state.branch.selectedBranch;
export const selectBranchLoading = (state: RootState) => state.branch.loading;
export const selectBranchError = (state: RootState) => state.branch.error;

export default branchSlice.reducer;
