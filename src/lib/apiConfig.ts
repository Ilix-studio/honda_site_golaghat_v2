import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URLS = {
  development: "http://localhost:8080/api",
  production: "https://tsangpool-be-34098913955.europe-west1.run.app/api",
} as const;

const resolveBaseUrl = (): string => {
  // 1. Explicit override via env var (highest priority)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 2. Fall back to mode-based default
  const mode = import.meta.env.MODE as keyof typeof API_BASE_URLS;
  return API_BASE_URLS[mode] ?? API_BASE_URLS.production;
};

export const API_CONFIG = {
  BASE_URL: resolveBaseUrl(),
};

export const baseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth.token;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const handleApiError = (error: any): string => {
  if (error.status === "FETCH_ERROR") {
    return "Network error. Please check your connection and try again.";
  }

  if (error.data?.message) {
    return error.data.message;
  }

  return "An unexpected error occurred. Please try again later.";
};
