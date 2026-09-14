import type { AppDispatch } from "./store";
import { logout } from "./slices/authSlice";
import { logout as customerLogout } from "./slices/customer/customerAuthSlice";

// Dynamic imports here (rather than static ones) are deliberate: this module is
// reached from apiSlice.ts (via baseQueryWithAuthGuard), so a static import of
// apiSlice.ts or store.ts would create a circular import that store.ts's own
// bootstrap (combineReducers referencing apiSlice.reducer) trips over.

/**
 * Tears down every trace of a session. Callers must `await` this before
 * navigating — the persisted state lives in IndexedDB and is written
 * asynchronously, so navigating early is what used to leave a token behind and
 * make the next role's login land on the previous role's dashboard.
 *
 * Both auth slices are cleared, not just `auth`: they share one persisted blob
 * (`persist:root`, whitelisted in store.ts), so clearing only one leaves the
 * other's token on disk.
 */
export const clearAuthState = async (dispatch: AppDispatch) => {
  // Clear in-memory state first so anything the persistor writes from here on
  // is already the logged-out shape.
  dispatch(logout());
  dispatch(customerLogout());

  const { apiSlice } = await import("./services/apiSlice");
  dispatch(apiSlice.util.resetApiState());

  // Firebase keeps its own IndexedDB session (firebaseLocalStorageDb) and
  // customerApiConfigs mints a fresh ID token from `auth.currentUser` on every
  // request — without this, a "logged out" customer silently re-authenticates.
  // Guarded so a failure here can't abort the rest of the teardown.
  try {
    const { signOut } = await import("firebase/auth");
    const { auth } = await import("@/lib/firebase");
    await signOut(auth);
  } catch (error) {
    console.error("Firebase sign-out failed during logout:", error);
  }

  // Keys written outside the root persistor, so purge() never reaches them.
  try {
    localStorage.removeItem("customerAuth");
    localStorage.removeItem("setupProgress");
  } catch {
    // Private-mode / disabled storage — nothing to clean up.
  }

  const { persistor } = await import("./store");
  // flush() lands the cleared state, then purge() removes the blob outright.
  // Awaiting both is the point: purge() used to race the persistor's own write
  // tick, so whether the token survived logout was nondeterministic.
  await persistor.flush();
  await persistor.purge();
};
