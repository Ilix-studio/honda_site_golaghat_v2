// src/hooks/useGetApproved.ts
import { useCallback } from "react";

import {
  setFormField,
  setFormErrors,
  clearForm,
  setFilters,
  resetFilters,
  setSorting,
  setPagination,
  clearNotifications,
  clearStatusCheck,
  selectGetApprovedForm,
  selectFormValidation,
  selectGetApprovedFilters,
  selectGetApprovedPagination,
  selectGetApprovedSorting,
  selectSubmitLoading,
  selectSubmitError,
  selectSubmitSuccess,
  selectStatusCheck,
} from "../redux-store/slices/getApprovedSlice";
import {
  useSubmitApplicationMutation,
  useCheckApplicationStatusMutation,
  useGetAllApplicationsQuery,
  useGetApplicationByIdQuery,
  useUpdateApplicationStatusMutation,
  useDeleteApplicationMutation,
  useGetApplicationStatsQuery,
  useGetApplicationsByBranchQuery,
} from "../redux-store/services/getApprovedApi";
import { useAppDispatch, useAppSelector } from "./redux";
import {
  CheckStatusRequest,
  GetApplicationsFilters,
  SubmitApplicationRequest,
  UpdateStatusRequest,
} from "@/types/getApproved.types";

// Form validation rules
const validateField = (field: string, value: any): string | null => {
  switch (field) {
    case "firstName":
      if (!value || value.trim().length < 2) {
        return "First name must be at least 2 characters";
      }
      if (value.length > 50) {
        return "First name cannot exceed 50 characters";
      }
      return null;

    case "lastName":
      if (!value || value.trim().length < 2) {
        return "Last name must be at least 2 characters";
      }
      if (value.length > 50) {
        return "Last name cannot exceed 50 characters";
      }
      return null;

    case "email":
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!value) {
        return "Email is required";
      }
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address";
      }
      return null;

    case "phone":
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!value) {
        return "Phone number is required";
      }
      if (!phoneRegex.test(value.replace(/\s/g, ""))) {
        return "Please enter a valid phone number";
      }
      return null;

    case "employmentType":
      if (!value) {
        return "Employment type is required";
      }
      return null;

    case "monthlyIncome":
      const income = parseFloat(value);
      if (!value) {
        return "Monthly income is required";
      }
      if (isNaN(income) || income < 0) {
        return "Please enter a valid monthly income";
      }
      if (income > 10000000) {
        return "Monthly income seems too high";
      }
      return null;

    case "creditScoreRange":
      if (!value) {
        return "Credit score range is required";
      }
      return null;

    case "termsAccepted":
      if (!value) {
        return "You must accept the terms and conditions";
      }
      return null;

    case "privacyPolicyAccepted":
      if (!value) {
        return "You must accept the privacy policy";
      }
      return null;

    default:
      return null;
  }
};

// Hook for form management
export const useGetApprovedForm = () => {
  const dispatch = useAppDispatch();
  const form = useAppSelector(selectGetApprovedForm);
  const validation = useAppSelector(selectFormValidation);
  const submitLoading = useAppSelector(selectSubmitLoading);
  const submitError = useAppSelector(selectSubmitError);
  const submitSuccess = useAppSelector(selectSubmitSuccess);

  const [submitApplication] = useSubmitApplicationMutation();

  // Update form field with validation
  const updateField = useCallback(
    (field: string, value: any) => {
      dispatch(setFormField({ field, value }));

      // Validate field if it's been touched
      if (form.touched[field]) {
        const error = validateField(field, value);
        if (error) {
          dispatch(setFormErrors({ ...form.errors, [field]: error }));
        } else {
          const newErrors = { ...form.errors };
          delete newErrors[field];
          dispatch(setFormErrors(newErrors));
        }
      }
    },
    [dispatch, form.errors, form.touched]
  );

  // Validate all fields
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    Object.keys(form.data).forEach((field) => {
      const error = validateField(field, (form.data as any)[field]);
      if (error) {
        errors[field] = error;
      }
    });

    dispatch(setFormErrors(errors));
    return Object.keys(errors).length === 0;
  }, [dispatch, form.data]);

  // Submit form
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return false;
    }

    try {
      const submitData: SubmitApplicationRequest = {
        firstName: form.data.firstName,
        lastName: form.data.lastName,
        email: form.data.email,
        phone: form.data.phone,
        employmentType: form.data.employmentType as any,
        monthlyIncome: parseFloat(form.data.monthlyIncome),
        creditScoreRange: form.data.creditScoreRange as any,
        branch: form.data.branch || undefined,
        termsAccepted: form.data.termsAccepted,
        privacyPolicyAccepted: form.data.privacyPolicyAccepted,
      };

      const result = await submitApplication(submitData).unwrap();
      return result;
    } catch (error: any) {
      throw error;
    }
  }, [form.data, validateForm, submitApplication]);

  // Clear form
  const resetForm = useCallback(() => {
    dispatch(clearForm());
  }, [dispatch]);

  // Clear notifications
  const clearMessages = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  return {
    form: form.data,
    errors: form.errors,
    touched: form.touched,
    validation,
    loading: submitLoading,
    error: submitError,
    success: submitSuccess,
    updateField,
    validateForm,
    handleSubmit,
    resetForm,
    clearMessages,
  };
};

// Hook for status checking
export const useApplicationStatusCheck = () => {
  const dispatch = useAppDispatch();
  const statusCheck = useAppSelector(selectStatusCheck);

  const [checkStatus] = useCheckApplicationStatusMutation();

  const checkApplicationStatus = useCallback(
    async (data: CheckStatusRequest) => {
      try {
        const result = await checkStatus(data).unwrap();
        return result;
      } catch (error: any) {
        throw error;
      }
    },
    [checkStatus]
  );

  const clearCheck = useCallback(() => {
    dispatch(clearStatusCheck());
  }, [dispatch]);

  return {
    loading: statusCheck.loading,
    error: statusCheck.error,
    result: statusCheck.result,
    checkApplicationStatus,
    clearCheck,
  };
};

// Hook for admin application management
export const useApplicationManagement = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectGetApprovedFilters);
  const pagination = useAppSelector(selectGetApprovedPagination);
  const sorting = useAppSelector(selectGetApprovedSorting);

  // Build query parameters
  const queryParams: GetApplicationsFilters = {
    page: pagination.page,
    limit: pagination.limit,
    sortBy: sorting.sortBy,
    sortOrder: sorting.sortOrder,
    ...(filters.status !== "all" && { status: filters.status }),
    ...(filters.employmentType !== "all" && {
      employmentType: filters.employmentType,
    }),
    ...(filters.creditScoreRange !== "all" && {
      creditScoreRange: filters.creditScoreRange,
    }),
    ...(filters.search && { search: filters.search }),
    ...(filters.branch !== "all" && { branch: filters.branch }),
    ...(filters.dateRange.start && { startDate: filters.dateRange.start }),
    ...(filters.dateRange.end && { endDate: filters.dateRange.end }),
  };

  // API hooks
  const {
    data: applicationsData,
    isLoading: applicationsLoading,
    error: applicationsError,
    refetch: refetchApplications,
  } = useGetAllApplicationsQuery(queryParams);

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useGetApplicationStatsQuery();

  const [updateStatus] = useUpdateApplicationStatusMutation();
  const [deleteApplication] = useDeleteApplicationMutation();

  // Filter management
  const updateFilters = useCallback(
    (newFilters: Partial<typeof filters>) => {
      dispatch(setFilters(newFilters));
      // Reset to first page when filters change
      if (pagination.page !== 1) {
        dispatch(setPagination({ page: 1 }));
      }
    },
    [dispatch, pagination.page]
  );

  const clearFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  // Sorting management
  const updateSorting = useCallback(
    (sortBy: string, sortOrder: "asc" | "desc") => {
      dispatch(setSorting({ sortBy, sortOrder }));
      // Reset to first page when sorting changes
      if (pagination.page !== 1) {
        dispatch(setPagination({ page: 1 }));
      }
    },
    [dispatch, pagination.page]
  );

  // Pagination management
  const updatePagination = useCallback(
    (newPagination: Partial<typeof pagination>) => {
      dispatch(setPagination(newPagination));
    },
    [dispatch]
  );

  // Status update
  const updateApplicationStatus = useCallback(
    async (id: string, statusData: UpdateStatusRequest) => {
      try {
        const result = await updateStatus({ id, data: statusData }).unwrap();
        return result;
      } catch (error: any) {
        throw error;
      }
    },
    [updateStatus]
  );

  // Delete application
  const removeApplication = useCallback(
    async (id: string) => {
      try {
        const result = await deleteApplication(id).unwrap();
        return result;
      } catch (error: any) {
        throw error;
      }
    },
    [deleteApplication]
  );

  // Refresh data
  const refreshData = useCallback(() => {
    refetchApplications();
    refetchStats();
  }, [refetchApplications, refetchStats]);

  return {
    // Data
    applications: applicationsData?.data || [],
    applicationsCount: applicationsData?.count || 0,
    totalApplications: applicationsData?.total || 0,
    totalPages: applicationsData?.totalPages || 0,
    currentPage: applicationsData?.currentPage || 1,
    stats: statsData?.data || null,

    // Loading states
    applicationsLoading,
    statsLoading,

    // Error states
    applicationsError,
    statsError,

    // Current state
    filters,
    pagination,
    sorting,

    // Actions
    updateFilters,
    clearFilters,
    updateSorting,
    updatePagination,
    updateApplicationStatus,
    removeApplication,
    refreshData,
  };
};

// Hook for single application management
export const useApplicationDetails = (applicationId: string) => {
  const {
    data: applicationData,
    isLoading,
    error,
    refetch,
  } = useGetApplicationByIdQuery(applicationId, {
    skip: !applicationId,
  });

  const [updateStatus] = useUpdateApplicationStatusMutation();

  const updateApplicationStatus = useCallback(
    async (statusData: UpdateStatusRequest) => {
      try {
        const result = await updateStatus({
          id: applicationId,
          data: statusData,
        }).unwrap();
        return result;
      } catch (error: any) {
        throw error;
      }
    },
    [updateStatus, applicationId]
  );

  return {
    application: applicationData?.data || null,
    loading: isLoading,
    error,
    updateApplicationStatus,
    refetch,
  };
};

// Hook for branch-specific applications
export const useBranchApplications = (branchId: string) => {
  const dispatch = useAppDispatch();
  const pagination = useAppSelector(selectGetApprovedPagination);

  const {
    data: applicationsData,
    isLoading,
    error,
    refetch,
  } = useGetApplicationsByBranchQuery(
    {
      branchId,
      filters: {
        page: pagination.page,
        limit: pagination.limit,
      },
    },
    {
      skip: !branchId,
    }
  );

  const updatePagination = useCallback(
    (newPagination: Partial<typeof pagination>) => {
      dispatch(setPagination(newPagination));
    },
    [dispatch]
  );

  return {
    applications: applicationsData?.data || [],
    count: applicationsData?.count || 0,
    total: applicationsData?.total || 0,
    totalPages: applicationsData?.totalPages || 0,
    currentPage: applicationsData?.currentPage || 1,
    loading: isLoading,
    error,
    pagination,
    updatePagination,
    refetch,
  };
};

// Hook for application analytics
export const useApplicationAnalytics = () => {
  const {
    data: statsData,
    isLoading,
    error,
    refetch,
  } = useGetApplicationStatsQuery();

  const stats = statsData?.data;

  // Calculate additional metrics
  const approvalRate = stats
    ? (
        ((stats.statusBreakdown.approved || 0) / stats.totalApplications) *
        100
      ).toFixed(1)
    : "0";

  const preApprovalRate = stats
    ? (
        (((stats.statusBreakdown.preApproved || 0) +
          (stats.statusBreakdown.approved || 0)) /
          stats.totalApplications) *
        100
      ).toFixed(1)
    : "0";

  const pendingApplications = stats?.statusBreakdown.pending || 0;
  const underReviewApplications = stats?.statusBreakdown.underReview || 0;

  return {
    stats,
    loading: isLoading,
    error,
    refetch,
    // Computed metrics
    approvalRate: parseFloat(approvalRate),
    preApprovalRate: parseFloat(preApprovalRate),
    pendingApplications,
    underReviewApplications,
    needsAttention: pendingApplications + underReviewApplications,
  };
};
