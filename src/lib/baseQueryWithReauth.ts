import { Mutex } from "async-mutex";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./apiConfig";
import { tokenRefreshed } from "@/redux-store/slices/authSlice";
import { clearAuthState } from "@/redux-store/authHelpers";
import type { RootState } from "@/redux-store/store";

interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: { token: string };
}

const mutex = new Mutex();

// How long before actual expiry to proactively refresh — avoids the
// guaranteed 401 (and its console noise) for a request that's about to
// fire right as the token expires.
const PROACTIVE_REFRESH_WINDOW_MS = 20_000;

const debugLog = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.debug("[reauth]", ...args);
};

const requestLabel = (args: string | FetchArgs) =>
  typeof args === "string" ? args : args.url;

/** Decode a JWT's `exp` claim (ms since epoch) without verifying the signature — only used client-side to decide when to proactively refresh. */
function getTokenExpiryMs(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Calls POST /auth/refresh and dispatches the result. Caller is
 * responsible for holding the mutex — shared by both the proactive
 * (pre-expiry) and reactive (post-401) refresh paths so the rotation logic
 * only lives in one place.
 */
async function performRefresh(
  api: Parameters<BaseQueryFn>[1],
  extraOptions: Parameters<BaseQueryFn>[2],
): Promise<boolean> {
  debugLog("attempting refresh via POST /auth/refresh");
  const refreshResult = await baseQuery(
    { url: "/auth/refresh", method: "POST" },
    api,
    extraOptions,
  );

  if (refreshResult.data) {
    const newToken = (refreshResult.data as RefreshTokenResponse).data.token;
    debugLog("refresh succeeded");
    api.dispatch(tokenRefreshed(newToken));
    return true;
  }

  debugLog(
    "refresh call itself failed — clearing auth state (user will be logged out)",
    refreshResult.error,
  );
  clearAuthState(api.dispatch);
  return false;
}

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();

  const authState = (api.getState() as RootState).auth;
  if (authState?.isAuthenticated && authState.token) {
    const expiryMs = getTokenExpiryMs(authState.token);
    if (expiryMs !== null && expiryMs - Date.now() < PROACTIVE_REFRESH_WINDOW_MS) {
      if (!mutex.isLocked()) {
        const release = await mutex.acquire();
        try {
          debugLog("token nearing expiry — proactively refreshing before request");
          await performRefresh(api, extraOptions);
        } finally {
          release();
        }
      } else {
        await mutex.waitForUnlock();
      }
    }
  }

  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const isAuthenticated = (api.getState() as RootState).auth?.isAuthenticated;
    debugLog(
      `401 on ${requestLabel(args)} — isAuthenticated=${isAuthenticated}`,
      result.error,
    );

    if (!isAuthenticated) {
      debugLog(
        "not authenticated at request time — skipping refresh, request was likely fired before auth state settled",
      );
      return result;
    }

    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshed = await performRefresh(api, extraOptions);
        if (refreshed) {
          debugLog("retrying original request after refresh");
          result = await baseQuery(args, api, extraOptions);
          if (result.error) {
            debugLog(
              `retry of ${requestLabel(args)} still failed after refresh`,
              result.error,
            );
          }
        }
      } finally {
        release();
      }
    } else {
      debugLog("refresh already in flight — waiting for it, then retrying");
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};
