import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ServiceBookingState {
  currentBooking: {
    vehicle?: string;
    serviceType?: string;
    branch?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    location?: "branch" | "home" | "office" | "roadside";
  };
  currentStep: number;
  isCreatingBooking: boolean;
  bookingSuccess: boolean;
  bookingError: string | null;
  lastBookingId?: string;
}

const initialState: ServiceBookingState = {
  currentBooking: {},
  currentStep: 1,
  isCreatingBooking: false,
  bookingSuccess: false,
  bookingError: null,
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
    },

    clearCurrentBooking: (state) => {
      state.currentBooking = {};
      state.currentStep = 1;
      state.bookingSuccess = false;
      state.bookingError = null;
    },

    nextStep: (state) => {
      if (state.currentStep < 3) state.currentStep += 1;
    },

    previousStep: (state) => {
      if (state.currentStep > 1) state.currentStep -= 1;
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

    resetState: () => initialState,
  },
});

export const {
  updateCurrentBooking,
  clearCurrentBooking,
  nextStep,
  previousStep,
  setCreatingBooking,
  setBookingSuccess,
  setBookingError,
  setLastBookingId,
  resetState,
} = serviceBookingSlice.actions;

export default serviceBookingSlice.reducer;
