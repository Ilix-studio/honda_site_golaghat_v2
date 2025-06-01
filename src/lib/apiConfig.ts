import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const API_CONFIG = {
  BASE_URL: "",
};

export const baseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Get token from Redux state
    const token = (getState() as any).auth.token;
    // Debug logging
    console.log("Token from Redux state:", token);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      console.warn("No token found in Redux state");
    }

    return headers;
  },
});
// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  // Network error
  if (error.status === "FETCH_ERROR") {
    return "Network error. Please check your connection and try again.";
  }

  // Server error with message
  if (error.data?.message) {
    return error.data.message;
  }

  // Default error message
  return "An unexpected error occurred. Please try again later.";
};
