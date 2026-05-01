// redux-store/services/branchManagerApi.ts
import { apiSlice } from "./apiSlice";
import { BranchUser, branchLoginSuccess } from "../slices/branchAuthSlice";

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
      _id: string;
      name?: string;
      branchName?: string;
      address: string;
    };
    role: string;
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
    [x: string]: string;
    applicationId: string;
    password: string;
    branch: string;
  };
}

export interface GetBranchManagerPasswordResponse {
  success: boolean;
  data: {
    applicationId: string;
    password: string;
    branch: {
      branchName: string;
      address: string;
    };
  };
}

export const branchManagerApi = apiSlice.injectEndpoints({
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
            const branchUser: BranchUser = {
              id: data.data.id,
              applicationId: data.data.applicationId,
              branchName:
                data.data.branch.name ||
                data.data.branch.branchName ||
                data.data.branch.address ||
                "Branch",
              branchId: data.data.branch._id,
              role: "Branch-Admin",
            };
            dispatch(
              branchLoginSuccess({
                user: branchUser,
                token: data.data.token,
              }),
            );
          }
        } catch (error) {
          console.error("Branch manager login failed:", error);
        }
      },
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
        url: `/adminLogin/del-branchM/${id}`,
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["BranchManager"],
    }),

    getBranchManagerPassword: builder.query<
      GetBranchManagerPasswordResponse,
      string
    >({
      query: (id) => ({
        url: `/adminLogin/branch-manager/${id}/password`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useLoginBranchManagerMutation,
  useLogoutBranchManagerMutation,
  useCreateBranchManagerMutation,
  useDeleteBranchManagerMutation,
  useGetAllBranchManagersQuery,
  useGetBranchManagerPasswordQuery,
} = branchManagerApi;
