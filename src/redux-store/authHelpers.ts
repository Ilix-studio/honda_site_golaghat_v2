import type { AppDispatch } from "./store";
import { logout } from "./slices/authSlice";

// Dynamic imports here (rather than static ones) are deliberate: this module is
// reached from apiSlice.ts (via baseQueryWithReauth), so a static import of
// apiSlice.ts or store.ts would create a circular import that store.ts's own
// bootstrap (combineReducers referencing apiSlice.reducer) trips over.
export const clearAuthState = async (dispatch: AppDispatch) => {
  dispatch(logout());
  const { apiSlice } = await import("./services/apiSlice");
  dispatch(apiSlice.util.resetApiState());
  const { persistor } = await import("./store");
  persistor.purge();
};
