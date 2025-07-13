// src/redux-store/slices/comparisonSlice.ts - Simplified for existing API
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface ComparisonState {
  selectedBikeIds: string[];
  maxBikes: number;
  viewport: "MOBILE" | "TABLET" | "DESKTOP";
  expandedSections: {
    basicInfo: boolean;
    engine: boolean;
    dimensions: boolean;
    features: boolean;
  };
}

const initialState: ComparisonState = {
  selectedBikeIds: [],
  maxBikes: 4,
  viewport: "DESKTOP",
  expandedSections: {
    basicInfo: true,
    engine: true,
    dimensions: true,
    features: true,
  },
};

const comparisonSlice = createSlice({
  name: "comparison",
  initialState,
  reducers: {
    addBikeToComparison: (state, action: PayloadAction<string>) => {
      if (
        state.selectedBikeIds.length < state.maxBikes &&
        !state.selectedBikeIds.includes(action.payload)
      ) {
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
      action: PayloadAction<{ index: number; newId: string }>
    ) => {
      const { index, newId } = action.payload;
      if (index >= 0 && index < state.selectedBikeIds.length) {
        state.selectedBikeIds[index] = newId;
      } else if (state.selectedBikeIds.length < state.maxBikes) {
        state.selectedBikeIds.push(newId);
      }
    },
    clearComparison: (state) => {
      state.selectedBikeIds = [];
    },
    initializeFromParams: (state, action: PayloadAction<string[]>) => {
      state.selectedBikeIds = action.payload.slice(0, state.maxBikes);
    },
    setViewport: (
      state,
      action: PayloadAction<"MOBILE" | "TABLET" | "DESKTOP">
    ) => {
      state.viewport = action.payload;
      state.maxBikes =
        action.payload === "MOBILE" ? 2 : action.payload === "TABLET" ? 3 : 4;

      if (state.selectedBikeIds.length > state.maxBikes) {
        state.selectedBikeIds = state.selectedBikeIds.slice(0, state.maxBikes);
      }
    },
    toggleSection: (
      state,
      action: PayloadAction<keyof ComparisonState["expandedSections"]>
    ) => {
      state.expandedSections[action.payload] =
        !state.expandedSections[action.payload];
    },
  },
});

export const {
  addBikeToComparison,
  removeBikeFromComparison,
  replaceBikeInComparison,
  clearComparison,
  initializeFromParams,
  setViewport,
  toggleSection,
} = comparisonSlice.actions;

// Selectors
export const selectComparisonBikes = (state: RootState) =>
  state.comparison.selectedBikeIds;
export const selectMaxBikes = (state: RootState) => state.comparison.maxBikes;
export const selectViewport = (state: RootState) => state.comparison.viewport;
export const selectExpandedSections = (state: RootState) =>
  state.comparison.expandedSections;

export default comparisonSlice.reducer;
