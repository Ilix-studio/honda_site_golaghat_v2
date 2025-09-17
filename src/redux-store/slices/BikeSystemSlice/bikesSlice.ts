import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

// Bike variant interface matching backend
export interface BikeVariant {
  name: string;
  features: string[];
  priceAdjustment: number;
  isAvailable: boolean;
}

// Price breakdown interface matching backend
export interface PriceBreakdown {
  exShowroomPrice: number;
  rtoCharges: number;
  insuranceComprehensive: number;
  onRoadPrice?: number;
}

// Key specifications interface
export interface KeySpecifications {
  engine?: string;
  power?: string;
  transmission?: string;
  year?: number;
  fuelNorms?: string;
  isE20Efficiency?: boolean;
}

// Main Bike interface matching backend model
export interface Bike {
  _id: string;
  modelName: string;
  mainCategory: "bike" | "scooter";
  category:
    | "sport"
    | "adventure"
    | "cruiser"
    | "touring"
    | "naked"
    | "electric"
    | "commuter"
    | "automatic"
    | "gearless";
  year: number;
  variants: BikeVariant[];
  priceBreakdown: PriceBreakdown;
  engineSize: string;
  power: number;
  transmission: string;
  fuelNorms: "BS4" | "BS6" | "BS6 Phase 2" | "Electric";
  isE20Efficiency: boolean;
  features: string[];
  colors: string[];
  stockAvailable: number;
  isNewModel?: boolean;
  isActive: boolean;
  keySpecifications: KeySpecifications;
  images?: BikeImage[];
  createdAt: string;
  updatedAt: string;
}

// Bike image interface (from BikeImageModel)
export interface BikeImage {
  _id: string;
  bikeId: string;
  src: string;
  alt: string;
  cloudinaryPublicId: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Filters interface matching backend capabilities
export interface BikeFilters {
  page?: number;
  limit?: number;
  category?: string;
  mainCategory?: "bike" | "scooter";
  year?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  fuelNorms?: "BS4" | "BS6" | "BS6 Phase 2" | "Electric";
  isE20Efficiency?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Pagination interface
export interface Pagination {
  current: number;
  pages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// API Response interfaces
export interface GetBikesResponse {
  success: boolean;
  data: {
    bikes: Bike[];
    pagination: Pagination;
  };
}

export interface GetBikeResponse {
  success: boolean;
  data: Bike;
}

// Form data for creating/updating bikes
export interface BikeFormData {
  modelName: string;
  mainCategory: "bike" | "scooter";
  category: string;
  year: number;
  variants: BikeVariant[];
  priceBreakdown: {
    exShowroomPrice: number;
    rtoCharges: number;
    insuranceComprehensive: number;
  };
  engineSize: string;
  power: number;
  transmission: string;
  fuelNorms: "BS4" | "BS6" | "BS6 Phase 2" | "Electric";
  isE20Efficiency: boolean;
  features: string[];
  colors: string[];
  stockAvailable: number;
  isNewModel: boolean;
}

// Bikes state interface
export interface BikesState {
  // Data
  bikes: Bike[];
  currentBike: Bike | null;

  // Loading states
  loading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;

  // Error states
  error: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;

  // Success states
  createSuccess: boolean;
  updateSuccess: boolean;
  deleteSuccess: boolean;

  // Filters and search
  filters: BikeFilters;
  searchQuery: string;

  // Pagination
  pagination: Pagination | null;

  // UI states
  selectedBikes: string[]; // For bulk operations
  sortBy: string;
  sortOrder: "asc" | "desc";
  viewMode: "grid" | "list";

  // Categories and metadata
  categories: string[];
  fuelNormOptions: string[];
  availableYears: number[];
  priceRange: {
    min: number;
    max: number;
  };
}

const initialState: BikesState = {
  bikes: [],
  currentBike: null,
  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
  filters: {
    page: 1,
    limit: 10,
  },
  searchQuery: "",
  pagination: null,
  selectedBikes: [],
  sortBy: "createdAt",
  sortOrder: "desc",
  viewMode: "grid",
  categories: [
    "sport",
    "adventure",
    "cruiser",
    "touring",
    "naked",
    "electric",
    "commuter",
    "automatic",
    "gearless",
  ],
  fuelNormOptions: ["BS4", "BS6", "BS6 Phase 2", "Electric"],
  availableYears: [],
  priceRange: {
    min: 0,
    max: 1000000,
  },
};

const bikesSlice = createSlice({
  name: "bikes",
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCreateLoading: (state, action: PayloadAction<boolean>) => {
      state.createLoading = action.payload;
    },
    setUpdateLoading: (state, action: PayloadAction<boolean>) => {
      state.updateLoading = action.payload;
    },
    setDeleteLoading: (state, action: PayloadAction<boolean>) => {
      state.deleteLoading = action.payload;
    },

    // Error states
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCreateError: (state, action: PayloadAction<string | null>) => {
      state.createError = action.payload;
    },
    setUpdateError: (state, action: PayloadAction<string | null>) => {
      state.updateError = action.payload;
    },
    setDeleteError: (state, action: PayloadAction<string | null>) => {
      state.deleteError = action.payload;
    },

    // Success states
    setCreateSuccess: (state, action: PayloadAction<boolean>) => {
      state.createSuccess = action.payload;
    },
    setUpdateSuccess: (state, action: PayloadAction<boolean>) => {
      state.updateSuccess = action.payload;
    },
    setDeleteSuccess: (state, action: PayloadAction<boolean>) => {
      state.deleteSuccess = action.payload;
    },

    // Data management
    setBikes: (state, action: PayloadAction<Bike[]>) => {
      state.bikes = action.payload;
    },
    addBike: (state, action: PayloadAction<Bike>) => {
      state.bikes.unshift(action.payload);
    },
    updateBikeInList: (state, action: PayloadAction<Bike>) => {
      const index = state.bikes.findIndex(
        (bike) => bike._id === action.payload._id
      );
      if (index !== -1) {
        state.bikes[index] = action.payload;
      }
    },
    removeBikeFromList: (state, action: PayloadAction<string>) => {
      state.bikes = state.bikes.filter((bike) => bike._id !== action.payload);
    },
    setCurrentBike: (state, action: PayloadAction<Bike | null>) => {
      state.currentBike = action.payload;
    },

    // Filters and search
    setFilters: (state, action: PayloadAction<Partial<BikeFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { page: 1, limit: 10 };
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    // Pagination
    setPagination: (state, action: PayloadAction<Pagination>) => {
      state.pagination = action.payload;
    },

    // UI states
    setSelectedBikes: (state, action: PayloadAction<string[]>) => {
      state.selectedBikes = action.payload;
    },
    toggleBikeSelection: (state, action: PayloadAction<string>) => {
      const bikeId = action.payload;
      if (state.selectedBikes.includes(bikeId)) {
        state.selectedBikes = state.selectedBikes.filter((id) => id !== bikeId);
      } else {
        state.selectedBikes.push(bikeId);
      }
    },
    clearSelection: (state) => {
      state.selectedBikes = [];
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<"asc" | "desc">) => {
      state.sortOrder = action.payload;
    },
    setViewMode: (state, action: PayloadAction<"grid" | "list">) => {
      state.viewMode = action.payload;
    },

    // Metadata
    setAvailableYears: (state, action: PayloadAction<number[]>) => {
      state.availableYears = action.payload;
    },
    setPriceRange: (
      state,
      action: PayloadAction<{ min: number; max: number }>
    ) => {
      state.priceRange = action.payload;
    },

    // Reset states
    resetCreateState: (state) => {
      state.createLoading = false;
      state.createError = null;
      state.createSuccess = false;
    },
    resetUpdateState: (state) => {
      state.updateLoading = false;
      state.updateError = null;
      state.updateSuccess = false;
    },
    resetDeleteState: (state) => {
      state.deleteLoading = false;
      state.deleteError = null;
      state.deleteSuccess = false;
    },
    resetAllStates: (state) => {
      state.loading = false;
      state.createLoading = false;
      state.updateLoading = false;
      state.deleteLoading = false;
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
    },
  },
});

export const {
  setLoading,
  setCreateLoading,
  setUpdateLoading,
  setDeleteLoading,
  setError,
  setCreateError,
  setUpdateError,
  setDeleteError,
  setCreateSuccess,
  setUpdateSuccess,
  setDeleteSuccess,
  setBikes,
  addBike,
  updateBikeInList,
  removeBikeFromList,
  setCurrentBike,
  setFilters,
  clearFilters,
  setSearchQuery,
  setPagination,
  setSelectedBikes,
  toggleBikeSelection,
  clearSelection,
  setSortBy,
  setSortOrder,
  setViewMode,
  setAvailableYears,
  setPriceRange,
  resetCreateState,
  resetUpdateState,
  resetDeleteState,
  resetAllStates,
} = bikesSlice.actions;

// Selectors
export const selectBikes = (state: RootState) => state.bikes.bikes;
export const selectCurrentBike = (state: RootState) => state.bikes.currentBike;
export const selectBikesLoading = (state: RootState) => state.bikes.loading;
export const selectBikesError = (state: RootState) => state.bikes.error;
export const selectBikesFilters = (state: RootState) => state.bikes.filters;
export const selectBikesPagination = (state: RootState) =>
  state.bikes.pagination;
export const selectSelectedBikes = (state: RootState) =>
  state.bikes.selectedBikes;
export const selectBikesViewMode = (state: RootState) => state.bikes.viewMode;

// Computed selectors
export const selectFilteredBikes = (state: RootState) => {
  const { bikes, searchQuery } = state.bikes;
  if (!searchQuery) return bikes;

  return bikes.filter(
    (bike) =>
      bike.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bike.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bike.features.some((feature) =>
        feature.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );
};

export const selectBikeById = (state: RootState, bikeId: string) =>
  state.bikes.bikes.find((bike) => bike._id === bikeId);

export const selectBikesByCategory = (state: RootState, category: string) =>
  state.bikes.bikes.filter((bike) => bike.category === category);

export const selectBikesByMainCategory = (
  state: RootState,
  mainCategory: "bike" | "scooter"
) => state.bikes.bikes.filter((bike) => bike.mainCategory === mainCategory);

export const selectInStockBikes = (state: RootState) =>
  state.bikes.bikes.filter((bike) => bike.stockAvailable > 0);

export default bikesSlice.reducer;
