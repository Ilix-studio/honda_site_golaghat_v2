// src/redux-store/services/adminApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../lib/apiConfig";
import { User, loginSuccess, logout } from "../slices/authSlice";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    token: string;
  };
}

export const adminAuthApi = createApi({
  reducerPath: "adminAuthApi",
  baseQuery,
  endpoints: (builder) => ({
    loginAdmin: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/admin/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) {
            const userData: User = {
              id: data.data.id,
              name: data.data.name,
              email: data.data.email,
            };
            dispatch(loginSuccess({ user: userData, token: data.data.token }));
          }
        } catch (error) {
          // Handle error if needed
          console.error("Login failed:", error);
        }
      },
    }),

    logoutAdmin: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/admin/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch (error) {
          console.error("Logout failed:", error);
        }
      },
    }),
  }),
});

export const { useLoginAdminMutation, useLogoutAdminMutation } = adminAuthApi;
