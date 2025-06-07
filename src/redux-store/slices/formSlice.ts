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
    vin: string;
    mileage: string;
    registrationNumber: string;

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

    // Additional Information
    issues: string;
    dropOff: boolean;
    waitOnsite: boolean;
    termsAccepted: boolean;
  };
  errors: Record<string, string>;
}

// Test ride form state
export interface TestRideFormState {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  isSubmitted: boolean;
  formData: {
    // Personal Information
    firstName: string;
    lastName: string;
    email: string;
    phone: string;

    // Test Ride Details
    bikeModel: string;
    dealership: string;
    date: string | null;
    time: string;

    // License Information
    licenseType: string;
    licenseNumber: string;
    ridingExperience: string;

    // Additional Information
    additionalInfo: string;
    termsAccepted: boolean;
  };
  errors: Record<string, string>;
}

export interface FormState {
  serviceBooking: ServiceFormState;
  testRide: TestRideFormState;
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
  serviceBooking: {
    currentStep: 1,
    totalSteps: 6,
    isSubmitting: false,
    isSubmitted: false,
    formData: {
      bikeModel: "",
      year: "",
      vin: "",
      mileage: "",
      registrationNumber: "",
      serviceType: "",
      additionalServices: [],
      serviceLocation: "",
      date: null,
      time: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      issues: "",
      dropOff: false,
      waitOnsite: false,
      termsAccepted: false,
    },
    errors: {},
  },
  testRide: {
    currentStep: 1,
    totalSteps: 5,
    isSubmitting: false,
    isSubmitted: false,
    formData: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      bikeModel: "",
      dealership: "",
      date: null,
      time: "",
      licenseType: "",
      licenseNumber: "",
      ridingExperience: "",
      additionalInfo: "",
      termsAccepted: false,
    },
    errors: {},
  },
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
    // Service Booking Form Actions
    setServiceBookingStep: (state, action: PayloadAction<number>) => {
      state.serviceBooking.currentStep = action.payload;
    },
    updateServiceBookingData: (
      state,
      action: PayloadAction<Partial<ServiceFormState["formData"]>>
    ) => {
      state.serviceBooking.formData = {
        ...state.serviceBooking.formData,
        ...action.payload,
      };
    },
    setServiceBookingErrors: (
      state,
      action: PayloadAction<Record<string, string>>
    ) => {
      state.serviceBooking.errors = action.payload;
    },
    setServiceBookingSubmitting: (state, action: PayloadAction<boolean>) => {
      state.serviceBooking.isSubmitting = action.payload;
    },
    setServiceBookingSubmitted: (state, action: PayloadAction<boolean>) => {
      state.serviceBooking.isSubmitted = action.payload;
    },
    resetServiceBookingForm: (state) => {
      state.serviceBooking = initialState.serviceBooking;
    },

    // Test Ride Form Actions
    setTestRideStep: (state, action: PayloadAction<number>) => {
      state.testRide.currentStep = action.payload;
    },
    updateTestRideData: (
      state,
      action: PayloadAction<Partial<TestRideFormState["formData"]>>
    ) => {
      state.testRide.formData = {
        ...state.testRide.formData,
        ...action.payload,
      };
    },
    setTestRideErrors: (
      state,
      action: PayloadAction<Record<string, string>>
    ) => {
      state.testRide.errors = action.payload;
    },
    setTestRideSubmitting: (state, action: PayloadAction<boolean>) => {
      state.testRide.isSubmitting = action.payload;
    },
    setTestRideSubmitted: (state, action: PayloadAction<boolean>) => {
      state.testRide.isSubmitted = action.payload;
    },
    resetTestRideForm: (state) => {
      state.testRide = initialState.testRide;
    },

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
  setServiceBookingStep,
  updateServiceBookingData,
  setServiceBookingErrors,
  setServiceBookingSubmitting,
  setServiceBookingSubmitted,
  resetServiceBookingForm,

  // Test Ride
  setTestRideStep,
  updateTestRideData,
  setTestRideErrors,
  setTestRideSubmitting,
  setTestRideSubmitted,
  resetTestRideForm,

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
export const selectServiceBookingForm = (state: RootState) =>
  state.form.serviceBooking;
export const selectTestRideForm = (state: RootState) => state.form.testRide;
export const selectContactForm = (state: RootState) => state.form.contactForm;

export const selectServiceBookingStep = (state: RootState) =>
  state.form.serviceBooking.currentStep;
export const selectServiceBookingData = (state: RootState) =>
  state.form.serviceBooking.formData;
export const selectServiceBookingErrors = (state: RootState) =>
  state.form.serviceBooking.errors;
export const selectServiceBookingSubmitting = (state: RootState) =>
  state.form.serviceBooking.isSubmitting;
export const selectServiceBookingSubmitted = (state: RootState) =>
  state.form.serviceBooking.isSubmitted;

export const selectTestRideStep = (state: RootState) =>
  state.form.testRide.currentStep;
export const selectTestRideData = (state: RootState) =>
  state.form.testRide.formData;
export const selectTestRideErrors = (state: RootState) =>
  state.form.testRide.errors;
export const selectTestRideSubmitting = (state: RootState) =>
  state.form.testRide.isSubmitting;
export const selectTestRideSubmitted = (state: RootState) =>
  state.form.testRide.isSubmitted;

export const selectContactFormData = (state: RootState) =>
  state.form.contactForm.formData;
export const selectContactFormErrors = (state: RootState) =>
  state.form.contactForm.errors;
export const selectContactFormSubmitting = (state: RootState) =>
  state.form.contactForm.isSubmitting;
export const selectContactFormSubmitted = (state: RootState) =>
  state.form.contactForm.isSubmitted;

export default formSlice.reducer;
