import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_CONFIG } from "./apiConfig";

// Customer baseQuery (new)
export const customerBaseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Get customer Firebase token from Redux state
    const token = (getState() as any).customerAuth.firebaseToken;
    console.log("Customer Firebase Token from Redux state:", token);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      console.warn("No customer Firebase token found in Redux state");
    }

    return headers;
  },
});
