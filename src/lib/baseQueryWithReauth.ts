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

const debugLog = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.debug("[reauth]", ...args);
};

const requestLabel = (args: string | FetchArgs) =>
  typeof args === "string" ? args : args.url;

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
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
        debugLog("attempting refresh via POST /auth/refresh");
        const refreshResult = await baseQuery(
          { url: "/auth/refresh", method: "POST" },
          api,
          extraOptions,
        );

        if (refreshResult.data) {
          const newToken = (refreshResult.data as RefreshTokenResponse).data.token;
          debugLog("refresh succeeded — retrying original request");
          api.dispatch(tokenRefreshed(newToken));
          result = await baseQuery(args, api, extraOptions);
          if (result.error) {
            debugLog(
              `retry of ${requestLabel(args)} still failed after refresh`,
              result.error,
            );
          }
        } else {
          debugLog(
            "refresh call itself failed — clearing auth state (user will be logged out)",
            refreshResult.error,
          );
          clearAuthState(api.dispatch);
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
