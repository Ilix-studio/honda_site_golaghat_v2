// Purpose: Manages form states across the application
// Handles: Form values, validation states, and submission status

// src/redux-store/slices/formSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

// Service booking form state
export interface ServiceFormState {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  isSubmitted: boolean;
  formData: {
    // Vehicle Information
    bikeModel: string;
    year: string;

    // Service Selection
    serviceType: string;
    additionalServices: string[];

    // Schedule
    serviceLocation: string;
    date: string | null;
    time: string;

    // Customer Information
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  errors: Record<string, string>;
}

export interface FormState {
  contactForm: {
    isSubmitting: boolean;
    isSubmitted: boolean;
    formData: {
      name: string;
      email: string;
      subject: string;
      message: string;
      branch: string;
    };
    errors: Record<string, string>;
  };
}

const initialState: FormState = {
  contactForm: {
    isSubmitting: false,
    isSubmitted: false,
    formData: {
      name: "",
      email: "",
      subject: "",
      message: "",
      branch: "golaghat",
    },
    errors: {},
  },
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    // Contact Form Actions
    updateContactFormData: (
      state,
      action: PayloadAction<Partial<FormState["contactForm"]["formData"]>>
    ) => {
      state.contactForm.formData = {
        ...state.contactForm.formData,
        ...action.payload,
      };
    },
    setContactFormErrors: (
      state,
      action: PayloadAction<Record<string, string>>
    ) => {
      state.contactForm.errors = action.payload;
    },
    setContactFormSubmitting: (state, action: PayloadAction<boolean>) => {
      state.contactForm.isSubmitting = action.payload;
    },
    setContactFormSubmitted: (state, action: PayloadAction<boolean>) => {
      state.contactForm.isSubmitted = action.payload;
    },
    resetContactForm: (state) => {
      state.contactForm = initialState.contactForm;
    },

    // Generic form reset
    resetAllForms: () => {
      return initialState;
    },
  },
});

export const {
  // Service Booking

  // Contact Form
  updateContactFormData,
  setContactFormErrors,
  setContactFormSubmitting,
  setContactFormSubmitted,
  resetContactForm,

  // Generic
  resetAllForms,
} = formSlice.actions;

// Selectors

export const selectContactFormData = (state: RootState) =>
  state.form.contactForm.formData;
export const selectContactFormErrors = (state: RootState) =>
  state.form.contactForm.errors;
export const selectContactFormSubmitting = (state: RootState) =>
  state.form.contactForm.isSubmitting;
export const selectContactFormSubmitted = (state: RootState) =>
  state.form.contactForm.isSubmitted;

export default formSlice.reducer;
