import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ServiceBookingState {
  currentBooking: {
    vehicle?: string;
    serviceType?: string;
    branch?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    location?: "branch" | "home" | "office" | "roadside";
    specialRequests?: string;
    isDropOff?: boolean;
    willWaitOnsite?: boolean;
    termsAccepted?: boolean;
  };

  availableServices: string[];
  usedServices: string[];
  currentStep: number;
  isFormValid: boolean;

  isCreatingBooking: boolean;
  bookingSuccess: boolean;
  bookingError: string | null;
  lastBookingId?: string;

  filters: {
    status?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };

  selectedBooking?: string;
}

const initialState: ServiceBookingState = {
  currentBooking: {},
  availableServices: [],
  usedServices: [],
  currentStep: 1,
  isFormValid: false,
  isCreatingBooking: false,
  bookingSuccess: false,
  bookingError: null,
  filters: {
    page: 1,
    limit: 10,
    sortBy: "appointmentDate",
    sortOrder: "desc",
  },
};

const serviceBookingSlice = createSlice({
  name: "serviceBooking",
  initialState,
  reducers: {
    updateCurrentBooking: (
      state,
      action: PayloadAction<Partial<ServiceBookingState["currentBooking"]>>
    ) => {
      state.currentBooking = { ...state.currentBooking, ...action.payload };
      state.isFormValid = validateBookingForm(state.currentBooking);
    },

    clearCurrentBooking: (state) => {
      state.currentBooking = {};
      state.currentStep = 1;
      state.isFormValid = false;
      state.bookingSuccess = false;
      state.bookingError = null;
    },

    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },

    nextStep: (state) => {
      if (state.currentStep < 6) state.currentStep += 1;
    },

    previousStep: (state) => {
      if (state.currentStep > 1) state.currentStep -= 1;
    },

    setAvailableServices: (state, action: PayloadAction<string[]>) => {
      state.availableServices = action.payload;
    },

    setUsedServices: (state, action: PayloadAction<string[]>) => {
      state.usedServices = action.payload;
    },

    addUsedService: (state, action: PayloadAction<string>) => {
      if (!state.usedServices.includes(action.payload)) {
        state.usedServices.push(action.payload);
      }
    },

    setCreatingBooking: (state, action: PayloadAction<boolean>) => {
      state.isCreatingBooking = action.payload;
    },

    setBookingSuccess: (state, action: PayloadAction<boolean>) => {
      state.bookingSuccess = action.payload;
      if (action.payload) state.bookingError = null;
    },

    setBookingError: (state, action: PayloadAction<string | null>) => {
      state.bookingError = action.payload;
      if (action.payload) state.bookingSuccess = false;
    },

    setLastBookingId: (state, action: PayloadAction<string>) => {
      state.lastBookingId = action.payload;
    },

    updateFilters: (
      state,
      action: PayloadAction<Partial<ServiceBookingState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    resetFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 10,
        sortBy: "appointmentDate",
        sortOrder: "desc",
      };
    },

    setSelectedBooking: (state, action: PayloadAction<string | undefined>) => {
      state.selectedBooking = action.payload;
    },

    resetState: () => initialState,
  },
});

const validateBookingForm = (
  booking: ServiceBookingState["currentBooking"]
): boolean => {
  return !!(
    booking.vehicle &&
    booking.serviceType &&
    booking.branch &&
    booking.appointmentDate &&
    booking.appointmentTime &&
    booking.location &&
    booking.termsAccepted
  );
};

export const {
  updateCurrentBooking,
  clearCurrentBooking,
  setCurrentStep,
  nextStep,
  previousStep,
  setAvailableServices,
  setUsedServices,
  addUsedService,
  setCreatingBooking,
  setBookingSuccess,
  setBookingError,
  setLastBookingId,
  updateFilters,
  resetFilters,
  setSelectedBooking,
  resetState,
} = serviceBookingSlice.actions;

export default serviceBookingSlice.reducer;
