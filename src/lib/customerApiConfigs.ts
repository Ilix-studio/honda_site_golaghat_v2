import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_CONFIG } from "./apiConfig";
import { auth } from "./firebase";

// Customer baseQuery with fresh token
export const customerBaseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.BASE_URL,
  prepareHeaders: async (headers, { getState }) => {
    try {
      // Get fresh ID token from Firebase Auth current user
      const currentUser = auth.currentUser;

      if (currentUser) {
        // Get fresh ID token (automatically refreshes if expired)
        const idToken = await currentUser.getIdToken(true); // true forces refresh
        console.log("Using fresh Firebase ID Token");
        headers.set("Authorization", `Bearer ${idToken}`);
      } else {
        console.warn("No authenticated Firebase user found");

        // Fallback to stored token (not recommended but for backward compatibility)
        const token = (getState() as any).customerAuth.firebaseToken;
        if (token) {
          console.log("Using stored token as fallback");
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
    } catch (error) {
      console.error("Error getting Firebase token:", error);

      // Fallback to stored token
      const token = (getState() as any).customerAuth.firebaseToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    return headers;
  },
});
