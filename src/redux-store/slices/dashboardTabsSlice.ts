import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface DashboardTabsState {
  activeTabs: Record<string, string>;
}

const initialState: DashboardTabsState = {
  activeTabs: {},
};

const dashboardTabsSlice = createSlice({
  name: "dashboardTabs",
  initialState,
  reducers: {
    setActiveTab: (
      state,
      action: PayloadAction<{ key: string; value: string }>,
    ) => {
      state.activeTabs[action.payload.key] = action.payload.value;
    },
  },
});

export const { setActiveTab } = dashboardTabsSlice.actions;

export const selectActiveTab =
  (key: string) =>
  (state: RootState): string | undefined =>
    state.dashboardTabs.activeTabs[key];

export default dashboardTabsSlice.reducer;
