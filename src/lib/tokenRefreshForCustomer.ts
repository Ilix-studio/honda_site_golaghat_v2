import { auth } from "@/lib/firebase";
import { updateFirebaseToken } from "@/redux-store/slices/customer/customerAuthSlice";
import { store } from "@/redux-store/store";

/**
 * Refresh Firebase ID token and update Redux store
 */
export const refreshFirebaseToken = async (): Promise<string | null> => {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.warn("No authenticated user to refresh token");
      return null;
    }

    // Force token refresh
    const freshToken = await currentUser.getIdToken(true);

    // Update Redux store
    store.dispatch(updateFirebaseToken(freshToken));

    console.log("Firebase token refreshed successfully");
    return freshToken;
  } catch (error) {
    console.error("Error refreshing Firebase token:", error);
    return null;
  }
};

/**
 * Setup automatic token refresh every 50 minutes (tokens expire in 60 minutes)
 */
export const setupTokenRefresh = () => {
  // Refresh immediately on setup
  refreshFirebaseToken();

  // Then refresh every 50 minutes
  setInterval(() => {
    refreshFirebaseToken();
  }, 50 * 60 * 1000); // 50 minutes in milliseconds
};

/**
 * Get current valid token (refreshes if needed)
 */
export const getCurrentToken = async (): Promise<string | null> => {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return null;
    }

    // getIdToken() automatically refreshes if expired
    return await currentUser.getIdToken();
  } catch (error) {
    console.error("Error getting current token:", error);
    return null;
  }
};
