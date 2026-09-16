import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./apiConfig";
import { clearAuthState } from "@/redux-store/authHelpers";
import type { RootState } from "@/redux-store/store";

/**
 * Admin/staff base query.
 *
 * There is no refresh-token mechanism: the backend issues a single 200-day
 * access token at login and nothing renews it. This wrapper therefore does
 * only one job — notice that the session has actually run out and log the
 * user out cleanly, instead of leaving them on a dashboard where every
 * request silently 401s.
 *
 * It deliberately does *not* log out on every 401. A 401 from an endpoint
 * whose own authorization rules rejected the request (for example the
 * admin-or-customer routes) must not destroy a session whose token is still
 * valid.
 *
 * Two things therefore trigger logout, and nothing else:
 *   1. the JWT's own `exp` claim has passed, or
 *   2. the server replied with `code: "SESSION_INVALID"` — the token is
 *      unusable or the account behind it no longer exists (deleted user, or a
 *      token that predates a database reset). Those requests will 401 forever,
 *      so staying "logged in" just leaves the user on a dashboard where
 *      everything silently fails.
 *
 * The code is matched instead of the message so the server can reword its
 * errors freely. See server3/src/utils/errorResponse.ts.
 */

const debugLog = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.debug("[auth]", ...args);
};

const requestLabel = (args: string | FetchArgs) =>
  typeof args === "string" ? args : args.url;

/** Decode a JWT's `exp` claim (ms since epoch) without verifying the signature — client-side expiry check only; the server still validates every token. */
function getTokenExpiryMs(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** True only when we can read `exp` and it is in the past. An undecodable token is left alone — the server is the authority. */
function isTokenExpired(token: string | null | undefined): boolean {
  if (!token) return false;
  const expiryMs = getTokenExpiryMs(token);
  return expiryMs !== null && expiryMs <= Date.now();
}

const sessionExpiredError: FetchBaseQueryError = {
  status: 401,
  data: { success: false, message: "Session expired, please log in again" },
};

/**
 * True when the server explicitly marked this session unusable, rather than
 * merely refusing this particular request.
 */
function isSessionInvalid(error: FetchBaseQueryError | undefined): boolean {
  if (!error || error.status !== 401) return false;
  const data = error.data as { code?: string } | undefined;
  return data?.code === "SESSION_INVALID";
}

export const baseQueryWithAuthGuard: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const authState = (api.getState() as RootState).auth;

  // Pre-flight: the 200 days are up. Log out here rather than firing a request
  // that is guaranteed to fail.
  if (authState?.isAuthenticated && isTokenExpired(authState.token)) {
    debugLog(`access token expired — logging out before ${requestLabel(args)}`);
    void clearAuthState(api.dispatch).catch(() => {
      /* teardown is best-effort; the in-memory logout already dispatched */
    });
    return { error: sessionExpiredError };
  }

  const result = await baseQuery(args, api, extraOptions);

  // Post-flight: covers the token expiring mid-request, a token the server
  // rejects that our own clock already considers expired, and an account that
  // no longer exists behind a still-valid token.
  if (result.error?.status === 401) {
    const currentAuth = (api.getState() as RootState).auth;
    if (!currentAuth?.isAuthenticated) {
      // Already logged out — nothing to tear down.
    } else if (isSessionInvalid(result.error)) {
      debugLog(
        `401 SESSION_INVALID on ${requestLabel(args)} — account gone or token unusable, logging out`,
      );
      void clearAuthState(api.dispatch).catch(() => {});
    } else if (isTokenExpired(currentAuth.token)) {
      debugLog(`401 on ${requestLabel(args)} with an expired token — logging out`);
      void clearAuthState(api.dispatch).catch(() => {});
    } else {
      debugLog(`401 on ${requestLabel(args)} — token still valid, session kept`);
    }
  }

  return result;
};
