import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_CONFIG } from "./apiConfig";
import { auth } from "@/lib/firebase";

// Helper to wait for auth state to be ready
const waitForAuthState = (): Promise<void> => {
  return new Promise((resolve) => {
    if (auth.currentUser) {
      resolve();
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((_user) => {
      unsubscribe();
      resolve();
    });

    // Timeout after 2 seconds
    setTimeout(() => {
      unsubscribe();
      resolve();
    }, 2000);
  });
};

// Customer baseQuery with proper token handling
export const customerBaseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.BASE_URL,
  prepareHeaders: async (headers, { getState }) => {
    try {
      // Wait for Firebase auth to be ready
      await waitForAuthState();

      const currentUser = auth.currentUser;

      if (currentUser) {
        // Get fresh ID token (force refresh to ensure validity)
        const idToken = await currentUser.getIdToken(true);
        console.log("✅ Using fresh Firebase ID Token");
        headers.set("Authorization", `Bearer ${idToken}`);
        return headers;
      }

      console.warn("⚠️ No Firebase currentUser, trying stored token");

      // Fallback: try stored token from Redux
      const storedToken = (getState() as any).customerAuth?.firebaseToken;

      if (storedToken) {
        console.log("⚠️ Using stored token (may be expired)");
        headers.set("Authorization", `Bearer ${storedToken}`);
      } else {
        console.error("❌ No token available");
      }
    } catch (error) {
      console.error("Error in prepareHeaders:", error);

      // Last resort: use stored token
      const storedToken = (getState() as any).customerAuth?.firebaseToken;
      if (storedToken) {
        headers.set("Authorization", `Bearer ${storedToken}`);
      }
    }

    return headers;
  },
});
