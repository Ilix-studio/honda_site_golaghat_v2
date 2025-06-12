// Updated Redux slice with proper bike enquiry types
// src/redux-store/slices/getApprovedSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

// Enhanced bike enquiry types
export interface BikeEnquiry {
  bikeId?: string;
  bikeModel?: string;
  category?:
    | "sport"
    | "adventure"
    | "cruiser"
    | "touring"
    | "naked"
    | "electric";
  priceRange?: {
    min: number;
    max: number;
  };
  preferredFeatures?: string[];
  intendedUse?:
    | "daily-commute"
    | "long-touring"
    | "sport-riding"
    | "off-road"
    | "leisure"
    | "business";
  previousBikeExperience?:
    | "first-time"
    | "beginner"
    | "intermediate"
    | "experienced";
  urgency?: "immediate" | "within-month" | "within-3months" | "exploring";
  additionalRequirements?: string;
  tradeInBike?: {
    hasTradeIn: boolean;
    currentBikeModel?: string;
    currentBikeYear?: number;
    estimatedValue?: number;
    condition?: "excellent" | "good" | "fair" | "poor";
  };
}

// Enhanced GetApproved application type
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
  enquiryType: "general-financing" | "specific-bike" | "trade-in" | "upgrade";
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
  bikeEnquiry?: BikeEnquiry;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  fullName?: string;
  applicationAge?: number;
}

// Enhanced form data interface
export interface GetApprovedFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  employmentType:
    | "salaried"
    | "self-employed"
    | "business-owner"
    | "retired"
    | "student"
    | "";
  monthlyIncome: string;
  creditScoreRange: "excellent" | "good" | "fair" | "poor" | "";
  branch: string;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;

  // Bike enquiry fields
  bikeId: string;
  bikeModel: string;
  category:
    | "sport"
    | "adventure"
    | "cruiser"
    | "touring"
    | "naked"
    | "electric"
    | "";
  priceRangeMin: string;
  priceRangeMax: string;
  preferredFeatures: string[];
  intendedUse:
    | "daily-commute"
    | "long-touring"
    | "sport-riding"
    | "off-road"
    | "leisure"
    | "business"
    | "";
  previousBikeExperience:
    | "first-time"
    | "beginner"
    | "intermediate"
    | "experienced"
    | "";
  urgency: "immediate" | "within-month" | "within-3months" | "exploring";
  additionalRequirements: string;

  // Trade-in fields
  hasTradeIn: boolean;
  currentBikeModel: string;
  currentBikeYear: string;
  estimatedValue: string;
  tradeInCondition: "excellent" | "good" | "fair" | "poor" | "";
}

// Enhanced filters interface
export interface GetApprovedFilters {
  status: string;
  employmentType: string;
  creditScoreRange: string;
  enquiryType: string;
  category: string;
  urgency: string;
  hasTradeIn: string;
  search: string;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  branch: string;
}

// Enhanced stats interface
export interface GetApprovedStats {
  totalApplications: number;
  recentApplications: number;
  averageMonthlyIncome: number;
  statusBreakdown: Record<string, number>;
  employmentTypeBreakdown: Record<string, number>;
  creditScoreBreakdown: Record<string, number>;
  enquiryTypeBreakdown: Record<string, number>;
  categoryInterest: Record<string, number>;
  urgencyBreakdown: Record<string, number>;
  tradeInStats: {
    _id: string;
    count: number;
    avgEstimatedValue: number;
  }[];
}

export interface GetApprovedState {
  // Applications data
  applications: GetApprovedApplication[];
  currentApplication: GetApprovedApplication | null;

  // Loading states
  loading: boolean;
  submitLoading: boolean;
  statusLoading: boolean;

  // Error states
  error: string | null;
  submitError: string | null;
  statusError: string | null;

  // Success states
  submitSuccess: boolean;
  statusUpdateSuccess: boolean;

  // Filters and search
  filters: GetApprovedFilters;

  // Sorting and pagination
  sortBy: string;
  sortOrder: "asc" | "desc";
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Statistics
  stats: GetApprovedStats | null;

  // Enhanced form state for bike enquiry
  form: {
    data: GetApprovedFormData;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    currentStep: number;
    totalSteps: number;
  };

  // Status check
  statusCheck: {
    loading: boolean;
    error: string | null;
    result: {
      applicationId: string;
      status: string;
      enquiryType?: string;
      preApprovalAmount?: number;
      preApprovalValidUntil?: string;
      submittedAt: string;
      branch?: {
        name: string;
        address: string;
      };
    } | null;
  };

  // Bike recommendations
  recommendations: {
    loading: boolean;
    error: string | null;
    bikes: any[];
    maxRecommendedPrice: number;
    criteriaUsed: any;
  };
}

const initialFormData: GetApprovedFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  employmentType: "",
  monthlyIncome: "",
  creditScoreRange: "",
  branch: "",
  termsAccepted: false,
  privacyPolicyAccepted: false,
  bikeId: "",
  bikeModel: "",
  category: "",
  priceRangeMin: "",
  priceRangeMax: "",
  preferredFeatures: [],
  intendedUse: "",
  previousBikeExperience: "",
  urgency: "exploring",
  additionalRequirements: "",
  hasTradeIn: false,
  currentBikeModel: "",
  currentBikeYear: "",
  estimatedValue: "",
  tradeInCondition: "",
};

const initialState: GetApprovedState = {
  applications: [],
  currentApplication: null,
  loading: false,
  submitLoading: false,
  statusLoading: false,
  error: null,
  submitError: null,
  statusError: null,
  submitSuccess: false,
  statusUpdateSuccess: false,
  filters: {
    status: "all",
    employmentType: "all",
    creditScoreRange: "all",
    enquiryType: "all",
    category: "all",
    urgency: "all",
    hasTradeIn: "all",
    search: "",
    dateRange: {
      start: null,
      end: null,
    },
    branch: "all",
  },
  sortBy: "createdAt",
  sortOrder: "desc",
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  stats: null,
  form: {
    data: initialFormData,
    errors: {},
    touched: {},
    currentStep: 1,
    totalSteps: 4,
  },
  statusCheck: {
    loading: false,
    error: null,
    result: null,
  },
  recommendations: {
    loading: false,
    error: null,
    bikes: [],
    maxRecommendedPrice: 0,
    criteriaUsed: {},
  },
};

const getApprovedSlice = createSlice({
  name: "getApproved",
  initialState,
  reducers: {
    // Applications management
    setApplications: (
      state,
      action: PayloadAction<GetApprovedApplication[]>
    ) => {
      state.applications = action.payload;
    },
    setCurrentApplication: (
      state,
      action: PayloadAction<GetApprovedApplication | null>
    ) => {
      state.currentApplication = action.payload;
    },
    updateApplicationInList: (
      state,
      action: PayloadAction<GetApprovedApplication>
    ) => {
      const index = state.applications.findIndex(
        (app) => app._id === action.payload._id
      );
      if (index !== -1) {
        state.applications[index] = action.payload;
      }
    },
    removeApplicationFromList: (state, action: PayloadAction<string>) => {
      state.applications = state.applications.filter(
        (app) => app._id !== action.payload
      );
    },

    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSubmitLoading: (state, action: PayloadAction<boolean>) => {
      state.submitLoading = action.payload;
    },
    setStatusLoading: (state, action: PayloadAction<boolean>) => {
      state.statusLoading = action.payload;
    },

    // Error states
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSubmitError: (state, action: PayloadAction<string | null>) => {
      state.submitError = action.payload;
    },
    setStatusError: (state, action: PayloadAction<string | null>) => {
      state.statusError = action.payload;
    },

    // Success states
    setSubmitSuccess: (state, action: PayloadAction<boolean>) => {
      state.submitSuccess = action.payload;
    },
    setStatusUpdateSuccess: (state, action: PayloadAction<boolean>) => {
      state.statusUpdateSuccess = action.payload;
    },

    // Filters and search
    setFilters: (state, action: PayloadAction<Partial<GetApprovedFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination = initialState.pagination;
    },

    // Sorting
    setSorting: (
      state,
      action: PayloadAction<{ sortBy: string; sortOrder: "asc" | "desc" }>
    ) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },

    // Pagination
    setPagination: (
      state,
      action: PayloadAction<Partial<GetApprovedState["pagination"]>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    // Statistics
    setStats: (state, action: PayloadAction<GetApprovedStats | null>) => {
      state.stats = action.payload;
    },

    // Enhanced form management
    setFormData: (
      state,
      action: PayloadAction<Partial<GetApprovedFormData>>
    ) => {
      state.form.data = { ...state.form.data, ...action.payload };
    },
    setFormField: (
      state,
      action: PayloadAction<{ field: string; value: any }>
    ) => {
      const { field, value } = action.payload;
      if (field in state.form.data) {
        (state.form.data as any)[field] = value;
      }

      // Mark field as touched
      state.form.touched[field] = true;

      // Clear field error when user starts typing
      if (state.form.errors[field]) {
        delete state.form.errors[field];
      }
    },
    setFormErrors: (state, action: PayloadAction<Record<string, string>>) => {
      state.form.errors = action.payload;
    },
    setFormTouched: (state, action: PayloadAction<Record<string, boolean>>) => {
      state.form.touched = action.payload;
    },
    setFormStep: (state, action: PayloadAction<number>) => {
      state.form.currentStep = action.payload;
    },
    clearForm: (state) => {
      state.form = initialState.form;
      state.submitError = null;
      state.submitSuccess = false;
    },

    // Bike enquiry specific actions
    toggleFeature: (state, action: PayloadAction<string>) => {
      const feature = action.payload;
      const features = state.form.data.preferredFeatures;
      if (features.includes(feature)) {
        state.form.data.preferredFeatures = features.filter(
          (f) => f !== feature
        );
      } else {
        state.form.data.preferredFeatures = [...features, feature];
      }
    },
    setSelectedBike: (
      state,
      action: PayloadAction<{
        id: string;
        model: string;
        category: string;
        price: number;
      }>
    ) => {
      const { id, model, category, price } = action.payload;
      state.form.data.bikeId = id;
      state.form.data.bikeModel = model;
      state.form.data.category = category as never;
      state.form.data.priceRangeMin = price.toString();
      state.form.data.priceRangeMax = price.toString();
    },

    // Status check
    setStatusCheckLoading: (state, action: PayloadAction<boolean>) => {
      state.statusCheck.loading = action.payload;
    },
    setStatusCheckError: (state, action: PayloadAction<string | null>) => {
      state.statusCheck.error = action.payload;
    },
    setStatusCheckResult: (
      state,
      action: PayloadAction<GetApprovedState["statusCheck"]["result"]>
    ) => {
      state.statusCheck.result = action.payload;
    },
    clearStatusCheck: (state) => {
      state.statusCheck = initialState.statusCheck;
    },

    // Recommendations
    setRecommendationsLoading: (state, action: PayloadAction<boolean>) => {
      state.recommendations.loading = action.payload;
    },
    setRecommendationsError: (state, action: PayloadAction<string | null>) => {
      state.recommendations.error = action.payload;
    },
    setRecommendations: (
      state,
      action: PayloadAction<{ bikes: any[]; maxPrice: number; criteria: any }>
    ) => {
      state.recommendations.bikes = action.payload.bikes;
      state.recommendations.maxRecommendedPrice = action.payload.maxPrice;
      state.recommendations.criteriaUsed = action.payload.criteria;
    },
    clearRecommendations: (state) => {
      state.recommendations = initialState.recommendations;
    },

    // Clear all notifications/success states
    clearNotifications: (state) => {
      state.submitSuccess = false;
      state.statusUpdateSuccess = false;
      state.submitError = null;
      state.statusError = null;
      state.error = null;
    },
  },
});

export const {
  // Applications
  setApplications,
  setCurrentApplication,
  updateApplicationInList,
  removeApplicationFromList,

  // Loading states
  setLoading,
  setSubmitLoading,
  setStatusLoading,

  // Error states
  setError,
  setSubmitError,
  setStatusError,

  // Success states
  setSubmitSuccess,
  setStatusUpdateSuccess,

  // Filters and search
  setFilters,
  resetFilters,

  // Sorting
  setSorting,

  // Pagination
  setPagination,

  // Statistics
  setStats,

  // Form management
  setFormData,
  setFormField,
  setFormErrors,
  setFormTouched,
  setFormStep,
  clearForm,

  // Bike enquiry specific
  toggleFeature,
  setSelectedBike,

  // Status check
  setStatusCheckLoading,
  setStatusCheckError,
  setStatusCheckResult,
  clearStatusCheck,

  // Recommendations
  setRecommendationsLoading,
  setRecommendationsError,
  setRecommendations,
  clearRecommendations,

  // Clear notifications
  clearNotifications,
} = getApprovedSlice.actions;

// Enhanced selectors with proper typing
export const selectGetApprovedApplications = (
  state: RootState
): GetApprovedApplication[] => state.getApproved.applications;
export const selectCurrentApplication = (
  state: RootState
): GetApprovedApplication | null => state.getApproved.currentApplication;
export const selectGetApprovedLoading = (state: RootState): boolean =>
  state.getApproved.loading;
export const selectSubmitLoading = (state: RootState): boolean =>
  state.getApproved.submitLoading;
export const selectStatusLoading = (state: RootState): boolean =>
  state.getApproved.statusLoading;
export const selectGetApprovedError = (state: RootState): string | null =>
  state.getApproved.error;
export const selectSubmitError = (state: RootState): string | null =>
  state.getApproved.submitError;
export const selectStatusError = (state: RootState): string | null =>
  state.getApproved.statusError;
export const selectSubmitSuccess = (state: RootState): boolean =>
  state.getApproved.submitSuccess;
export const selectStatusUpdateSuccess = (state: RootState): boolean =>
  state.getApproved.statusUpdateSuccess;
export const selectGetApprovedFilters = (
  state: RootState
): GetApprovedFilters => state.getApproved.filters;
export const selectGetApprovedSorting = (state: RootState) => ({
  sortBy: state.getApproved.sortBy,
  sortOrder: state.getApproved.sortOrder,
});
export const selectGetApprovedPagination = (state: RootState) =>
  state.getApproved.pagination;
export const selectGetApprovedStats = (
  state: RootState
): GetApprovedStats | null => state.getApproved.stats;
export const selectGetApprovedForm = (state: RootState) =>
  state.getApproved.form;
export const selectStatusCheck = (state: RootState) =>
  state.getApproved.statusCheck;
export const selectRecommendations = (state: RootState) =>
  state.getApproved.recommendations;

// Enhanced computed selectors
export const selectFormValidation = (state: RootState) => {
  const { data, errors } = state.getApproved.form;

  const hasErrors = Object.keys(errors).length > 0;
  const isPersonalInfoComplete =
    data.firstName &&
    data.lastName &&
    data.email &&
    data.phone &&
    data.employmentType &&
    data.monthlyIncome &&
    data.creditScoreRange;
  const isTermsAccepted = data.termsAccepted && data.privacyPolicyAccepted;
  const isComplete = isPersonalInfoComplete && isTermsAccepted;

  return {
    isValid: !hasErrors && isComplete,
    isComplete,
    hasErrors,
    isPersonalInfoComplete: !!isPersonalInfoComplete,
    isTermsAccepted,
  };
};

export const selectBikeEnquiryData = (state: RootState) => {
  const { data } = state.getApproved.form;

  return {
    bikeId: data.bikeId,
    bikeModel: data.bikeModel,
    category: data.category,
    priceRange:
      data.priceRangeMin && data.priceRangeMax
        ? {
            min: parseFloat(data.priceRangeMin),
            max: parseFloat(data.priceRangeMax),
          }
        : undefined,
    preferredFeatures: data.preferredFeatures,
    intendedUse: data.intendedUse,
    previousBikeExperience: data.previousBikeExperience,
    urgency: data.urgency,
    additionalRequirements: data.additionalRequirements,
    tradeInBike: data.hasTradeIn
      ? {
          hasTradeIn: true,
          currentBikeModel: data.currentBikeModel,
          currentBikeYear: data.currentBikeYear
            ? parseInt(data.currentBikeYear)
            : undefined,
          estimatedValue: data.estimatedValue
            ? parseFloat(data.estimatedValue)
            : undefined,
          condition: data.tradeInCondition,
        }
      : { hasTradeIn: false },
  };
};

export default getApprovedSlice.reducer;
