import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface ComparisonState {
  selectedBikeIds: string[];
  maxBikes: number;
  viewport: "MOBILE" | "TABLET" | "DESKTOP";
}

const initialState: ComparisonState = {
  selectedBikeIds: [],
  maxBikes: 4,
  viewport: "DESKTOP",
};

const comparisonSlice = createSlice({
  name: "comparison",
  initialState,
  reducers: {
    addBikeToComparison: (state, action: PayloadAction<string>) => {
      if (state.selectedBikeIds.length < state.maxBikes) {
        state.selectedBikeIds.push(action.payload);
      }
    },
    removeBikeFromComparison: (state, action: PayloadAction<string>) => {
      state.selectedBikeIds = state.selectedBikeIds.filter(
        (id) => id !== action.payload
      );
    },
    replaceBikeInComparison: (
      state,
      action: PayloadAction<{ oldId: string; newId: string }>
    ) => {
      const index = state.selectedBikeIds.indexOf(action.payload.oldId);
      if (index !== -1) {
        state.selectedBikeIds[index] = action.payload.newId;
      }
    },
    setViewport: (
      state,
      action: PayloadAction<"MOBILE" | "TABLET" | "DESKTOP">
    ) => {
      state.viewport = action.payload;
      // Adjust max bikes based on viewport
      state.maxBikes =
        action.payload === "MOBILE" ? 2 : action.payload === "TABLET" ? 3 : 4;
      // Trim selected bikes if necessary
      if (state.selectedBikeIds.length > state.maxBikes) {
        state.selectedBikeIds = state.selectedBikeIds.slice(0, state.maxBikes);
      }
    },
    clearComparison: (state) => {
      state.selectedBikeIds = [];
    },
  },
});

export const {
  addBikeToComparison,
  removeBikeFromComparison,
  replaceBikeInComparison,
  setViewport,
  clearComparison,
} = comparisonSlice.actions;

export const selectComparisonBikes = (state: RootState) =>
  state.comparison.selectedBikeIds;
export const selectMaxBikes = (state: RootState) => state.comparison.maxBikes;
export const selectViewport = (state: RootState) => state.comparison.viewport;

export default comparisonSlice.reducer;
