import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../lib/apiConfig";
import { User, loginSuccess } from "../slices/authSlice";

export interface LoginBranchManagerRequest {
  applicationId: string;
  password: string;
}

export interface LoginBranchManagerResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    applicationId: string;
    branch: {
      name: string;
      location: string;
    };
    role: string; // Add role to response
    token: string;
  };
}

export interface CreateBranchManagerRequest {
  branch: string;
}

export interface CreateBranchManagerResponse {
  success: boolean;
  message: string;
  data: {
    applicationId: string;
    password: string;
    branch: string;
  };
}

export const branchManagerApi = createApi({
  reducerPath: "branchManagerApi",
  baseQuery,
  tagTypes: ["BranchManager"],
  endpoints: (builder) => ({
    loginBranchManager: builder.mutation<
      LoginBranchManagerResponse,
      LoginBranchManagerRequest
    >({
      query: (credentials) => ({
        url: "/adminLogin/branchM-login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) {
            const userData: User = {
              id: data.data.id,
              name: data.data.applicationId, // Use applicationId as name
              email: data.data.branch.name, // Use branch name as email placeholder
              role: data.data.role || "Branch-Admin", // Set role for branch manager
            };
            dispatch(loginSuccess({ user: userData, token: data.data.token }));
          }
        } catch (error) {
          console.error("Branch manager login failed:", error);
        }
      },
    }),
    logoutBranchManager: builder.mutation<
      { success: boolean; message: string },
      void
    >({
      query: () => ({
        url: "/adminLogin/branchM-logout",
        method: "POST",
      }),
    }),
    createBranchManager: builder.mutation<
      CreateBranchManagerResponse,
      CreateBranchManagerRequest
    >({
      query: (data) => ({
        url: "/adminLogin/create-branchM",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["BranchManager"],
    }),
    deleteBranchManager: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/adminLogin/del-branchM`,
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["BranchManager"],
    }),
    getAllBranchManagers: builder.query<
      { success: boolean; count: number; data: any[] },
      void
    >({
      query: () => ({
        url: "/adminLogin/branch-managers",
        method: "GET",
      }),
      providesTags: ["BranchManager"],
    }),
  }),
});

export const {
  useLoginBranchManagerMutation,
  useLogoutBranchManagerMutation,
  useCreateBranchManagerMutation,
  useDeleteBranchManagerMutation,
  useGetAllBranchManagersQuery,
} = branchManagerApi;
