// src/redux-store/slices/getApprovedSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { GetApprovedApplication } from "@/types/getApproved.types";

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
  filters: {
    status: string;
    employmentType: string;
    creditScoreRange: string;
    search: string;
    dateRange: {
      start: string | null;
      end: string | null;
    };
    branch: string;
  };

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
  stats: {
    totalApplications: number;
    recentApplications: number;
    averageMonthlyIncome: number;
    statusBreakdown: Record<string, number>;
    employmentTypeBreakdown: Record<string, number>;
    creditScoreBreakdown: Record<string, number>;
  } | null;

  // Form state for submission
  form: {
    data: {
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
    };
    errors: Record<string, string>;
    touched: Record<string, boolean>;
  };

  // Status check
  statusCheck: {
    loading: boolean;
    error: string | null;
    result: {
      applicationId: string;
      status: string;
      preApprovalAmount?: number;
      preApprovalValidUntil?: string;
      submittedAt: string;
      branch?: {
        name: string;
        address: string;
      };
    } | null;
  };
}

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
    data: {
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
    },
    errors: {},
    touched: {},
  },
  statusCheck: {
    loading: false,
    error: null,
    result: null,
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
    setFilters: (
      state,
      action: PayloadAction<Partial<GetApprovedState["filters"]>>
    ) => {
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
    setStats: (state, action: PayloadAction<GetApprovedState["stats"]>) => {
      state.stats = action.payload;
    },

    // Form management
    setFormData: (
      state,
      action: PayloadAction<Partial<GetApprovedState["form"]["data"]>>
    ) => {
      state.form.data = { ...state.form.data, ...action.payload };
    },
    setFormField: (
      state,
      action: PayloadAction<{ field: string; value: any }>
    ) => {
      const { field, value } = action.payload;
      (state.form.data as any)[field] = value;

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
    clearForm: (state) => {
      state.form = initialState.form;
      state.submitError = null;
      state.submitSuccess = false;
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
  clearForm,

  // Status check
  setStatusCheckLoading,
  setStatusCheckError,
  setStatusCheckResult,
  clearStatusCheck,

  // Clear notifications
  clearNotifications,
} = getApprovedSlice.actions;

// Selectors
export const selectGetApprovedApplications = (state: RootState) =>
  state.getApproved.applications;
export const selectCurrentApplication = (state: RootState) =>
  state.getApproved.currentApplication;
export const selectGetApprovedLoading = (state: RootState) =>
  state.getApproved.loading;
export const selectSubmitLoading = (state: RootState) =>
  state.getApproved.submitLoading;
export const selectStatusLoading = (state: RootState) =>
  state.getApproved.statusLoading;
export const selectGetApprovedError = (state: RootState) =>
  state.getApproved.error;
export const selectSubmitError = (state: RootState) =>
  state.getApproved.submitError;
export const selectStatusError = (state: RootState) =>
  state.getApproved.statusError;
export const selectSubmitSuccess = (state: RootState) =>
  state.getApproved.submitSuccess;
export const selectStatusUpdateSuccess = (state: RootState) =>
  state.getApproved.statusUpdateSuccess;
export const selectGetApprovedFilters = (state: RootState) =>
  state.getApproved.filters;
export const selectGetApprovedSorting = (state: RootState) => ({
  sortBy: state.getApproved.sortBy,
  sortOrder: state.getApproved.sortOrder,
});
export const selectGetApprovedPagination = (state: RootState) =>
  state.getApproved.pagination;
export const selectGetApprovedStats = (state: RootState) =>
  state.getApproved.stats;
export const selectGetApprovedForm = (state: RootState) =>
  state.getApproved.form;
export const selectStatusCheck = (state: RootState) =>
  state.getApproved.statusCheck;

// Computed selectors
export const selectFilteredApplicationsCount = (state: RootState) => {
  const { applications, filters } = state.getApproved;

  return applications.filter((app) => {
    if (filters.status !== "all" && app.status !== filters.status) return false;
    if (
      filters.employmentType !== "all" &&
      app.employmentType !== filters.employmentType
    )
      return false;
    if (
      filters.creditScoreRange !== "all" &&
      app.creditScoreRange !== filters.creditScoreRange
    )
      return false;
    if (
      filters.search &&
      !app.fullName?.toLowerCase().includes(filters.search.toLowerCase()) &&
      !app.email.toLowerCase().includes(filters.search.toLowerCase()) &&
      !app.applicationId.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;

    return true;
  }).length;
};

export const selectFormValidation = (state: RootState) => {
  const { data, errors } = state.getApproved.form;

  const hasErrors = Object.keys(errors).length > 0;
  const isComplete =
    data.firstName &&
    data.lastName &&
    data.email &&
    data.phone &&
    data.employmentType &&
    data.monthlyIncome &&
    data.creditScoreRange &&
    data.termsAccepted &&
    data.privacyPolicyAccepted;

  return {
    isValid: !hasErrors && isComplete,
    isComplete,
    hasErrors,
  };
};

export default getApprovedSlice.reducer;
