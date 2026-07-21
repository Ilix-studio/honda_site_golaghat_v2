import { Mutex } from "async-mutex";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./apiConfig";
import { tokenRefreshed } from "@/redux-store/slices/authSlice";
import { clearAuthState } from "@/redux-store/authHelpers";

const mutex = new Mutex();

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const isAuthenticated = (api.getState() as any).auth?.isAuthenticated;

    if (!isAuthenticated) {
      return result;
    }

    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = await baseQuery(
          { url: "/auth/refresh", method: "POST" },
          api,
          extraOptions,
        );

        if (refreshResult.data) {
          const newToken = (refreshResult.data as any).data.token;
          api.dispatch(tokenRefreshed(newToken));
          result = await baseQuery(args, api, extraOptions);
        } else {
          clearAuthState(api.dispatch);
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};
