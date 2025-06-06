// Purpose: Manages UI and navigation state
// Handles: Navigation state, loading indicators, global UI settings

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface UiState {
  isMobileMenuOpen: boolean;
  isFilterSidebarOpen: boolean;
  theme: "light" | "dark";
  notifications: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    message: string;
    timestamp: number;
  }>;
}

const initialState: UiState = {
  isMobileMenuOpen: false,
  isFilterSidebarOpen: false,
  theme: "light",
  notifications: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
    },
    toggleFilterSidebar: (state) => {
      state.isFilterSidebarOpen = !state.isFilterSidebarOpen;
    },
    setFilterSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isFilterSidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
    },
    addNotification: (
      state,
      action: PayloadAction<
        Omit<UiState["notifications"][0], "id" | "timestamp">
      >
    ) => {
      const notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  toggleMobileMenu,
  setMobileMenuOpen,
  toggleFilterSidebar,
  setFilterSidebarOpen,
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions;

export const selectIsMobileMenuOpen = (state: RootState) =>
  state.ui.isMobileMenuOpen;
export const selectIsFilterSidebarOpen = (state: RootState) =>
  state.ui.isFilterSidebarOpen;
export const selectTheme = (state: RootState) => state.ui.theme;
export const selectNotifications = (state: RootState) => state.ui.notifications;

export default uiSlice.reducer;
