import { apiSlice } from "./apiSlice";
import { User, UserBranch, loginSuccess } from "../slices/authSlice";
import { clearAuthState } from "../authHelpers";

// ─── Request Types ───────────────────────────────────────────────────────────

export interface SuperAdminLoginRequest {
  email: string;
  password: string;
}

export interface ApplicationLoginRequest {
  phoneNumber: string;
  password: string;
}

export interface CreateBranchAdminRequest {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  branch: string;
}

export interface CreateServiceAdminRequest {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  // Optional: Super-Admin must supply a branch; Branch-Admin is locked to their
  // own branch server-side, so they omit it.
  branch?: string;
}

export interface CreatePartAdminRequest {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  // Optional: Super-Admin must supply a branch; Branch-Admin is locked to their
  // own branch server-side, so they omit it.
  branch?: string;
}

export interface CreateStaffRequest {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  position: string;
}

// ─── Response Types ──────────────────────────────────────────────────────────

interface BaseResponse {
  success: boolean;
  message: string;
}

export interface SuperAdminLoginResponse extends BaseResponse {
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
    token: string;
  };
}

export interface BranchAdminLoginResponse extends BaseResponse {
  data: {
    id: string;
    name: string;
    phoneNumber: string;
    branch: UserBranch;
    role: string;
    token: string;
  };
}

export interface ServiceAdminLoginResponse extends BaseResponse {
  data: {
    id: string;
    name: string;
    phoneNumber: string;
    branch: UserBranch;
    role: string;
    token: string;
  };
}

export interface PartAdminLoginResponse extends BaseResponse {
  data: {
    id: string;
    name: string;
    phoneNumber: string;
    branch: UserBranch;
    role: string;
    token: string;
  };
}

export interface StaffLoginResponse extends BaseResponse {
  data: {
    id: string;
    name: string;
    phoneNumber: string;
    branch: UserBranch;
    position: string;
    role: string;
    token: string;
  };
}

export interface CreatedUserResponse extends BaseResponse {
  data: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    branch: string;
    position?: string;
  };
}

export interface UserListItem {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  isActive: boolean;
  branch: UserBranch;
  position?: string;
  createdBy: { name: string; email?: string; phoneNumber?: string };
  createdAt: string;
}

export interface UserListResponse extends BaseResponse {
  count: number;
  data: UserListItem[];
}

// ─── Current-user profile (GET/PATCH /api/users/me) ──────────────────────────

export interface MyProfile {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  role: string;
  position?: string;
  branch?: { _id: string; branchName: string };
  address?: string;
  bloodGroup?: string;
  lifeInsurance?: string;
  scanfleetStickerId?: string;
}

export interface MyProfileResponse extends BaseResponse {
  data: MyProfile;
}

export interface UpdateMyProfileRequest {
  address?: string;
  bloodGroup?: string;
  lifeInsurance?: string;
  scanfleetStickerId?: string;
}

// ─── API Slice ───────────────────────────────────────────────────────────────

export const adminAuthApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ═════════════════════════════════════════════════════════════════════
    // LOGIN — /api/auth/*
    // ═════════════════════════════════════════════════════════════════════

    loginSuperAdmin: builder.mutation<
      SuperAdminLoginResponse,
      SuperAdminLoginRequest
    >({
      query: (credentials) => ({
        url: "/auth/super-admin/login",
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
              role: data.data.role,
            };
            dispatch(loginSuccess({ user: userData, token: data.data.token }));
          }
        } catch (error) {
          console.error("Super-Admin login failed:", error);
        }
      },
    }),

    loginBranchAdmin: builder.mutation<
      BranchAdminLoginResponse,
      ApplicationLoginRequest
    >({
      query: (credentials) => ({
        url: "/auth/branch-admin/login",
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
              phoneNumber: data.data.phoneNumber,
              branch: data.data.branch,
              role: data.data.role,
            };
            dispatch(loginSuccess({ user: userData, token: data.data.token }));
          }
        } catch (error) {
          console.error("Branch-Admin login failed:", error);
        }
      },
    }),

    loginServiceAdmin: builder.mutation<
      ServiceAdminLoginResponse,
      ApplicationLoginRequest
    >({
      query: (credentials) => ({
        url: "/auth/service-admin/login",
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
              phoneNumber: data.data.phoneNumber,
              branch: data.data.branch,
              role: data.data.role,
            };
            dispatch(loginSuccess({ user: userData, token: data.data.token }));
          }
        } catch (error) {
          console.error("Service-Admin login failed:", error);
        }
      },
    }),

    loginPartAdmin: builder.mutation<
      PartAdminLoginResponse,
      ApplicationLoginRequest
    >({
      query: (credentials) => ({
        url: "/auth/part-admin/login",
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
              phoneNumber: data.data.phoneNumber,
              branch: data.data.branch,
              role: data.data.role,
            };
            dispatch(loginSuccess({ user: userData, token: data.data.token }));
          }
        } catch (error) {
          console.error("Part-Admin login failed:", error);
        }
      },
    }),

    loginStaff: builder.mutation<StaffLoginResponse, ApplicationLoginRequest>({
      query: (credentials) => ({
        url: "/auth/staff/login",
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
              phoneNumber: data.data.phoneNumber,
              branch: data.data.branch,
              position: data.data.position,
              role: data.data.role,
            };
            dispatch(loginSuccess({ user: userData, token: data.data.token }));
          }
        } catch (error) {
          console.error("Staff login failed:", error);
        }
      },
    }),

    // ═════════════════════════════════════════════════════════════════════
    // LOGOUT — /api/auth/*
    // ═════════════════════════════════════════════════════════════════════

    logoutSuperAdmin: builder.mutation<BaseResponse, void>({
      query: () => ({
        url: "/auth/super-admin/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error("Super-Admin logout failed:", error);
        } finally {
          clearAuthState(dispatch);
        }
      },
    }),

    logoutUser: builder.mutation<BaseResponse, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error("Logout failed:", error);
        } finally {
          clearAuthState(dispatch);
        }
      },
    }),

    // ═════════════════════════════════════════════════════════════════════
    // CURRENT USER PROFILE — /api/users/me
    // ═════════════════════════════════════════════════════════════════════

    getMe: builder.query<MyProfileResponse, void>({
      query: () => "/users/me",
      providesTags: ["Me"],
    }),

    updateMe: builder.mutation<MyProfileResponse, UpdateMyProfileRequest>({
      query: (body) => ({
        url: "/users/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Me"],
    }),

    // ═════════════════════════════════════════════════════════════════════
    // USER MANAGEMENT — BRANCH-ADMIN — /api/users/*
    // ═════════════════════════════════════════════════════════════════════

    createBranchAdmin: builder.mutation<
      CreatedUserResponse,
      CreateBranchAdminRequest
    >({
      query: (data) => ({
        url: "/users/branch-admin",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["BranchManager"],
    }),

    getAllBranchAdmins: builder.query<UserListResponse, void>({
      query: () => "/users/branch-admins",
      providesTags: ["BranchManager"],
    }),

    deleteBranchAdmin: builder.mutation<BaseResponse, string>({
      query: (id) => ({
        url: `/users/branch-admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BranchManager"],
    }),

    // ═════════════════════════════════════════════════════════════════════
    // USER MANAGEMENT — SERVICE-ADMIN — /api/users/*
    // ═════════════════════════════════════════════════════════════════════

    createServiceAdmin: builder.mutation<
      CreatedUserResponse,
      CreateServiceAdminRequest
    >({
      query: (data) => ({
        url: "/users/service-admin",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ServiceAdmin"],
    }),

    getAllServiceAdmins: builder.query<UserListResponse, void>({
      query: () => "/users/service-admins",
      providesTags: ["ServiceAdmin"],
    }),

    deleteServiceAdmin: builder.mutation<BaseResponse, string>({
      query: (id) => ({
        url: `/users/service-admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ServiceAdmin"],
    }),

    // ═════════════════════════════════════════════════════════════════════
    // USER MANAGEMENT — PART-ADMIN — /api/users/*
    // ═════════════════════════════════════════════════════════════════════

    createPartAdmin: builder.mutation<
      CreatedUserResponse,
      CreatePartAdminRequest
    >({
      query: (data) => ({
        url: "/users/part-admin",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PartAdmin"],
    }),

    getAllPartAdmins: builder.query<UserListResponse, void>({
      query: () => "/users/part-admins",
      providesTags: ["PartAdmin"],
    }),

    deletePartAdmin: builder.mutation<BaseResponse, string>({
      query: (id) => ({
        url: `/users/part-admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PartAdmin"],
    }),

    // ═════════════════════════════════════════════════════════════════════
    // USER MANAGEMENT — STAFF — /api/users/*
    // ═════════════════════════════════════════════════════════════════════

    createStaff: builder.mutation<CreatedUserResponse, CreateStaffRequest>({
      query: (data) => ({
        url: "/users/staff",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Staff"],
    }),

    getAllStaff: builder.query<UserListResponse, { branch?: string } | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params && "branch" in params && params.branch) {
          searchParams.append("branch", params.branch);
        }
        const qs = searchParams.toString();
        return `/users/staff${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Staff"],
    }),

    deleteStaff: builder.mutation<BaseResponse, string>({
      query: (id) => ({
        url: `/users/staff/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Staff"],
    }),
  }),
});

export const {
  // Login
  useLoginSuperAdminMutation,
  useLoginBranchAdminMutation,
  useLoginServiceAdminMutation,
  useLoginPartAdminMutation,
  useLoginStaffMutation,
  // Logout
  useLogoutSuperAdminMutation,
  useLogoutUserMutation,
  // Current-user profile
  useGetMeQuery,
  useUpdateMeMutation,
  // Branch-Admin management
  useCreateBranchAdminMutation,
  useGetAllBranchAdminsQuery,
  useDeleteBranchAdminMutation,
  // Service-Admin management
  useCreateServiceAdminMutation,
  useGetAllServiceAdminsQuery,
  useDeleteServiceAdminMutation,
  // Part-Admin management
  useCreatePartAdminMutation,
  useGetAllPartAdminsQuery,
  useDeletePartAdminMutation,
  // Staff management
  useCreateStaffMutation,
  useGetAllStaffQuery,
  useDeleteStaffMutation,
} = adminAuthApi;
