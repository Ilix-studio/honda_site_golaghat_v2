// Enhanced form hooks with better type safety
// src/hooks/useGetApprovedForm.ts

import { useCallback } from "react";

import {
  setFormField,
  setFormErrors,
  setFormStep,
  clearForm,
  toggleFeature,
  setSelectedBike,
  clearNotifications,
  selectGetApprovedForm,
  selectFormValidation,
  selectBikeEnquiryData,
  selectSubmitLoading,
  selectSubmitError,
  selectSubmitSuccess,
  // Status check imports
  setStatusCheckLoading,
  setStatusCheckError,
  setStatusCheckResult,
  clearStatusCheck,
  selectStatusCheck,
  GetApprovedFormData,
} from "../redux-store/slices/getApprovedSlice";
import { useAppDispatch, useAppSelector } from "./redux";

// Type-safe field update helper
type FormFieldKey = keyof GetApprovedFormData;
type FormFieldValue<K extends FormFieldKey> = GetApprovedFormData[K];

// Enhanced validation rules with better typing
const validateField = (
  field: string,
  value: any,
  formData: GetApprovedFormData
): string | null => {
  switch (field) {
    case "firstName":
      if (!value || typeof value !== "string" || value.trim().length < 2) {
        return "First name must be at least 2 characters";
      }
      if (value.length > 50) {
        return "First name cannot exceed 50 characters";
      }
      return null;

    case "lastName":
      if (!value || typeof value !== "string" || value.trim().length < 2) {
        return "Last name must be at least 2 characters";
      }
      if (value.length > 50) {
        return "Last name cannot exceed 50 characters";
      }
      return null;

    case "email":
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!value || typeof value !== "string") {
        return "Email is required";
      }
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address";
      }
      return null;

    case "phone":
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!value || typeof value !== "string") {
        return "Phone number is required";
      }
      if (!phoneRegex.test(value.replace(/\s/g, ""))) {
        return "Please enter a valid phone number";
      }
      return null;

    case "employmentType":
      if (!value || value === "") {
        return "Employment type is required";
      }
      return null;

    case "monthlyIncome":
      if (!value || value === "") {
        return "Monthly income is required";
      }
      const income = parseFloat(value);
      if (isNaN(income) || income < 0) {
        return "Please enter a valid monthly income";
      }
      if (income > 10000000) {
        return "Monthly income seems too high";
      }
      return null;

    case "creditScoreRange":
      if (!value || value === "") {
        return "Credit score range is required";
      }
      return null;

    case "bikeModel":
      // Only validate if we're doing a bike-specific enquiry
      if (!formData.bikeId && (!value || value.trim() === "")) {
        return "Please select a bike or enter model name";
      }
      return null;

    case "intendedUse":
      if (!value || value === "") {
        return "Please specify intended use";
      }
      return null;

    case "previousBikeExperience":
      if (!value || value === "") {
        return "Please specify your riding experience";
      }
      return null;

    case "priceRangeMin":
      if (value && formData.priceRangeMax) {
        const min = parseFloat(value);
        const max = parseFloat(formData.priceRangeMax);
        if (!isNaN(min) && !isNaN(max) && min > max) {
          return "Minimum price cannot be greater than maximum price";
        }
      }
      return null;

    case "priceRangeMax":
      if (value && formData.priceRangeMin) {
        const min = parseFloat(formData.priceRangeMin);
        const max = parseFloat(value);
        if (!isNaN(min) && !isNaN(max) && max < min) {
          return "Maximum price cannot be less than minimum price";
        }
      }
      return null;

    case "currentBikeModel":
      if (formData.hasTradeIn && (!value || value.trim() === "")) {
        return "Current bike model is required for trade-in";
      }
      return null;

    case "currentBikeYear":
      if (formData.hasTradeIn && (!value || value === "")) {
        return "Current bike year is required for trade-in";
      }
      return null;

    case "estimatedValue":
      if (formData.hasTradeIn && (!value || value === "")) {
        return "Estimated value is required for trade-in";
      }
      if (value) {
        const val = parseFloat(value);
        if (isNaN(val) || val < 0) {
          return "Please enter a valid estimated value";
        }
      }
      return null;

    case "tradeInCondition":
      if (formData.hasTradeIn && (!value || value === "")) {
        return "Bike condition is required for trade-in";
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

// Step validation functions
const validateStep = (
  step: number,
  formData: GetApprovedFormData
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (step === 1) {
    // Personal Information
    const personalFields: FormFieldKey[] = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "employmentType",
      "monthlyIncome",
      "creditScoreRange",
    ];

    personalFields.forEach((field) => {
      const error = validateField(field, formData[field], formData);
      if (error) errors[field] = error;
    });
  }

  if (step === 2) {
    // Bike Preferences
    const bikeFields: FormFieldKey[] = [
      "bikeModel",
      "intendedUse",
      "previousBikeExperience",
      "priceRangeMin",
      "priceRangeMax",
    ];

    bikeFields.forEach((field) => {
      const error = validateField(field, formData[field], formData);
      if (error) errors[field] = error;
    });

    // Special validation for bike selection
    if (!formData.bikeId && !formData.bikeModel) {
      errors.bikeSelection = "Please select a bike or enter model name";
    }
  }

  if (step === 3) {
    // Trade-in Information (only if trade-in is selected)
    if (formData.hasTradeIn) {
      const tradeInFields: FormFieldKey[] = [
        "currentBikeModel",
        "currentBikeYear",
        "estimatedValue",
        "tradeInCondition",
      ];

      tradeInFields.forEach((field) => {
        const error = validateField(field, formData[field], formData);
        if (error) errors[field] = error;
      });
    }
  }

  if (step === 4) {
    // Terms and Conditions
    const termsFields: FormFieldKey[] = [
      "termsAccepted",
      "privacyPolicyAccepted",
    ];

    termsFields.forEach((field) => {
      const error = validateField(field, formData[field], formData);
      if (error) errors[field] = error;
    });
  }

  return errors;
};

// Main hook for bike enquiry form
export const useGetApprovedBikeForm = () => {
  const dispatch = useAppDispatch();
  const form = useAppSelector(selectGetApprovedForm);
  const validation = useAppSelector(selectFormValidation);
  const bikeEnquiryData = useAppSelector(selectBikeEnquiryData);
  const submitLoading = useAppSelector(selectSubmitLoading);
  const submitError = useAppSelector(selectSubmitError);
  const submitSuccess = useAppSelector(selectSubmitSuccess);

  // Type-safe field update function
  const updateField = useCallback(
    <K extends FormFieldKey>(field: K, value: FormFieldValue<K>) => {
      dispatch(setFormField({ field, value }));

      // Validate field if it's been touched
      if (form.touched[field]) {
        const error = validateField(field, value, form.data);
        if (error) {
          dispatch(setFormErrors({ ...form.errors, [field]: error }));
        } else {
          const newErrors = { ...form.errors };
          delete newErrors[field];
          dispatch(setFormErrors(newErrors));
        }
      }
    },
    [dispatch, form.errors, form.touched, form.data]
  );

  // Generic field update for dynamic usage
  const updateFieldGeneric = useCallback(
    (field: string, value: any) => {
      dispatch(setFormField({ field, value }));

      // Validate field if it's been touched
      if (form.touched[field]) {
        const error = validateField(field, value, form.data);
        if (error) {
          dispatch(setFormErrors({ ...form.errors, [field]: error }));
        } else {
          const newErrors = { ...form.errors };
          delete newErrors[field];
          dispatch(setFormErrors(newErrors));
        }
      }
    },
    [dispatch, form.errors, form.touched, form.data]
  );

  // Validate current step
  const validateCurrentStep = useCallback(() => {
    const errors = validateStep(form.currentStep, form.data);
    dispatch(setFormErrors(errors));
    return Object.keys(errors).length === 0;
  }, [dispatch, form.currentStep, form.data]);

  // Validate all form data
  const validateForm = useCallback(() => {
    let allErrors: Record<string, string> = {};

    // Validate all steps
    for (let step = 1; step <= form.totalSteps; step++) {
      const stepErrors = validateStep(step, form.data);
      allErrors = { ...allErrors, ...stepErrors };
    }

    dispatch(setFormErrors(allErrors));
    return Object.keys(allErrors).length === 0;
  }, [dispatch, form.data, form.totalSteps]);

  // Step navigation
  const nextStep = useCallback(() => {
    if (validateCurrentStep() && form.currentStep < form.totalSteps) {
      dispatch(setFormStep(form.currentStep + 1));
      return true;
    }
    return false;
  }, [dispatch, form.currentStep, form.totalSteps, validateCurrentStep]);

  const prevStep = useCallback(() => {
    if (form.currentStep > 1) {
      dispatch(setFormStep(form.currentStep - 1));
      return true;
    }
    return false;
  }, [dispatch, form.currentStep]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= form.totalSteps) {
        dispatch(setFormStep(step));
      }
    },
    [dispatch, form.totalSteps]
  );

  // Feature toggle for bike preferences
  const handleToggleFeature = useCallback(
    (feature: string) => {
      dispatch(toggleFeature(feature));
    },
    [dispatch]
  );

  // Bike selection helper
  const handleSelectBike = useCallback(
    (bike: {
      _id: string;
      modelName: string;
      category: string;
      price: number;
    }) => {
      dispatch(
        setSelectedBike({
          id: bike._id,
          model: bike.modelName,
          category: bike.category,
          price: bike.price,
        })
      );
    },
    [dispatch]
  );

  // Submit form
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return false;
    }

    try {
      // Prepare submission data
      const submissionData = {
        // Personal information
        firstName: form.data.firstName,
        lastName: form.data.lastName,
        email: form.data.email,
        phone: form.data.phone,
        employmentType: form.data.employmentType,
        monthlyIncome: parseFloat(form.data.monthlyIncome),
        creditScoreRange: form.data.creditScoreRange,
        branch: form.data.branch || undefined,
        termsAccepted: form.data.termsAccepted,
        privacyPolicyAccepted: form.data.privacyPolicyAccepted,

        // Bike enquiry
        bikeEnquiry: bikeEnquiryData,

        // Determine enquiry type
        enquiryType: form.data.bikeId
          ? "specific-bike"
          : form.data.hasTradeIn
          ? "trade-in"
          : "general-financing",
      };

      // Call API (you'll need to implement this with your API service)
      const response = await fetch("/api/getapproved/with-bike", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (result.success) {
        return result;
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (error: any) {
      throw error;
    }
  }, [form.data, bikeEnquiryData, validateForm]);

  // Clear form
  const resetForm = useCallback(() => {
    dispatch(clearForm());
  }, [dispatch]);

  // Clear notifications
  const clearMessages = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  return {
    // Form state
    form: form.data,
    errors: form.errors,
    touched: form.touched,
    currentStep: form.currentStep,
    totalSteps: form.totalSteps,
    validation,
    bikeEnquiryData,

    // Loading and status
    loading: submitLoading,
    error: submitError,
    success: submitSuccess,

    // Actions
    updateField,
    updateFieldGeneric,
    validateCurrentStep,
    validateForm,
    nextStep,
    prevStep,
    goToStep,
    handleToggleFeature,
    handleSelectBike,
    handleSubmit,
    resetForm,
    clearMessages,

    // Computed values
    isStepValid: (step: number) => {
      const errors = validateStep(step, form.data);
      return Object.keys(errors).length === 0;
    },
    canProceedToNextStep: () => {
      const errors = validateStep(form.currentStep, form.data);
      return Object.keys(errors).length === 0;
    },
    completionPercentage: () => {
      return Math.round((form.currentStep / form.totalSteps) * 100);
    },
  };
};

// Hook for simpler non-bike enquiry forms
export const useGetApprovedSimpleForm = () => {
  const dispatch = useAppDispatch();
  const form = useAppSelector(selectGetApprovedForm);
  const validation = useAppSelector(selectFormValidation);
  const submitLoading = useAppSelector(selectSubmitLoading);
  const submitError = useAppSelector(selectSubmitError);
  const submitSuccess = useAppSelector(selectSubmitSuccess);

  const updateField = useCallback(
    (field: string, value: any) => {
      dispatch(setFormField({ field, value }));
    },
    [dispatch]
  );

  const handleSubmit = useCallback(async () => {
    // Validate only personal info and terms for simple form
    const errors = {
      ...validateStep(1, form.data),
      ...validateStep(4, form.data),
    };

    dispatch(setFormErrors(errors));

    if (Object.keys(errors).length > 0) {
      return false;
    }

    try {
      const submissionData = {
        firstName: form.data.firstName,
        lastName: form.data.lastName,
        email: form.data.email,
        phone: form.data.phone,
        employmentType: form.data.employmentType,
        monthlyIncome: parseFloat(form.data.monthlyIncome),
        creditScoreRange: form.data.creditScoreRange,
        branch: form.data.branch || undefined,
        termsAccepted: form.data.termsAccepted,
        privacyPolicyAccepted: form.data.privacyPolicyAccepted,
        enquiryType: "general-financing",
      };

      const response = await fetch("/api/getapproved", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (result.success) {
        return result;
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (error: any) {
      throw error;
    }
  }, [dispatch, form.data]);

  const resetForm = useCallback(() => {
    dispatch(clearForm());
  }, [dispatch]);

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
    handleSubmit,
    resetForm,
    clearMessages,
  };
};

// Hook for application status checking
export const useApplicationStatusCheck = () => {
  const dispatch = useAppDispatch();
  const statusCheck = useAppSelector(selectStatusCheck);

  const checkApplicationStatus = useCallback(
    async (data: { email: string; applicationId: string }) => {
      try {
        // Set loading state
        dispatch(setStatusCheckLoading(true));
        dispatch(setStatusCheckError(null));

        const response = await fetch("/api/getapproved/check-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          dispatch(setStatusCheckResult(result.data));
          return result;
        } else {
          const errorMessage =
            result.message || "Failed to check application status";
          dispatch(setStatusCheckError(errorMessage));
          throw new Error(errorMessage);
        }
      } catch (error: any) {
        const errorMessage = error.message || "Network error occurred";
        dispatch(setStatusCheckError(errorMessage));
        throw error;
      } finally {
        dispatch(setStatusCheckLoading(false));
      }
    },
    [dispatch]
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

export default useGetApprovedBikeForm;
