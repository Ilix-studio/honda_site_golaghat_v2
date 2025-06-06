// Purpose: Manages all motorcycle data
// Handles: Fetching, caching, and accessing motorcycle data
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

// Define bike types
export interface Bike {
  id: string;
  modelName: string;
  category: string;
  price: number;
  engine: string;
  power: number;
  weight: number;
  transmission: string;
  features: string[];
  colors: string[];
  images: string[];
  year: number;
  isNew?: boolean;
  inStock: boolean;
  quantity: number;
  branch: string;
}

export interface BikesState {
  bikes: Bike[];
  loading: boolean;
  error: string | null;
  filters: {
    category: string;
    minPrice: number;
    maxPrice: number;
    inStock?: boolean;
    branch?: string;
    search?: string;
  };
  sortBy: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: BikesState = {
  bikes: [],
  loading: false,
  error: null,
  filters: {
    category: "all",
    minPrice: 0,
    maxPrice: 2000000,
  },
  sortBy: "newest",
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

const bikesSlice = createSlice({
  name: "bikes",
  initialState,
  reducers: {
    setBikes: (state, action: PayloadAction<Bike[]>) => {
      state.bikes = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<BikesState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<BikesState["pagination"]>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.sortBy = initialState.sortBy;
    },
  },
});

export const {
  setBikes,
  setLoading,
  setError,
  setFilters,
  setSortBy,
  setPagination,
  resetFilters,
} = bikesSlice.actions;

// Selectors
export const selectBikes = (state: RootState) => state.bikes.bikes;
export const selectBikesLoading = (state: RootState) => state.bikes.loading;
export const selectBikesError = (state: RootState) => state.bikes.error;
export const selectBikesFilters = (state: RootState) => state.bikes.filters;
export const selectBikesSortBy = (state: RootState) => state.bikes.sortBy;
export const selectBikesPagination = (state: RootState) =>
  state.bikes.pagination;

export default bikesSlice.reducer;
