import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage

export interface SetupProgressState {
  profile: boolean;
  vehicle: boolean;
  selectVAS: boolean;
  generateTags: boolean;
  lastUpdated: string;
}

const initialState: SetupProgressState = {
  profile: false,
  vehicle: false,
  selectVAS: false,
  generateTags: false,
  lastUpdated: "",
};

const setupProgressSlice = createSlice({
  name: "setupProgress",
  initialState,
  reducers: {
    setProfileCompleted: (state, action: PayloadAction<boolean>) => {
      state.profile = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    setVehicleCompleted: (state, action: PayloadAction<boolean>) => {
      state.vehicle = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    setSelectVASCompleted: (state, action: PayloadAction<boolean>) => {
      state.selectVAS = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    setGenerateTagsCompleted: (state, action: PayloadAction<boolean>) => {
      state.generateTags = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    resetSetupProgress: (state) => {
      state.profile = false;
      state.vehicle = false;
      state.selectVAS = false;
      state.generateTags = false;
      state.lastUpdated = "";
    },
    // Batch update for when loading from API
    updateSetupProgress: (
      state,
      action: PayloadAction<Partial<SetupProgressState>>
    ) => {
      Object.assign(state, action.payload);
      state.lastUpdated = new Date().toISOString();
    },
  },
});

export const {
  setProfileCompleted,
  setVehicleCompleted,
  setSelectVASCompleted,
  setGenerateTagsCompleted,
  resetSetupProgress,
  updateSetupProgress,
} = setupProgressSlice.actions;

// Selectors
export const selectSetupProgress = (state: {
  setupProgress: SetupProgressState;
}) => state.setupProgress;

export const selectCompletedTasks = (state: {
  setupProgress: SetupProgressState;
}) => {
  const progress = state.setupProgress;
  return Object.values(progress).filter(
    (value, index, array) =>
      index < array.length - 1 && typeof value === "boolean" && value
  ).length;
};

export const selectTotalTasks = () => 4; // profile, vehicle, selectVAS, generateTags

export const selectCompletionPercentage = (state: {
  setupProgress: SetupProgressState;
}) => {
  const completed = selectCompletedTasks(state);
  const total = selectTotalTasks();
  return Math.round((completed / total) * 100);
};

export default setupProgressSlice.reducer;

// Persist configuration
const persistConfig = {
  key: "setupProgress",
  storage,
  whitelist: ["profile", "vehicle", "selectVAS", "generateTags", "lastUpdated"], // Only persist these fields
};

// Export persisted reducer
export const persistedSetupProgressReducer = persistReducer(
  persistConfig,
  setupProgressSlice.reducer
);
