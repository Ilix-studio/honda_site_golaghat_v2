// src/redux-store/services/branchApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../lib/apiConfig";
import { Branch } from "../slices/branchSlice";

export interface CreateBranchRequest {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  staff?: Array<{
    name: string;
    position: string;
  }>;
}

export const branchApi = createApi({
  reducerPath: "branchApi",
  baseQuery,
  tagTypes: ["Branch"],
  endpoints: (builder) => ({
    getBranches: builder.query<
      { success: boolean; count: number; data: Branch[] },
      void
    >({
      query: () => ({
        url: "/branch",
        method: "GET",
      }),
      providesTags: ["Branch"],
    }),
    getBranchById: builder.query<{ success: boolean; data: Branch }, string>({
      query: (id) => ({
        url: `/branch/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Branch", id }],
    }),
    createBranch: builder.mutation<
      { success: boolean; data: Branch },
      CreateBranchRequest
    >({
      query: (branchData) => ({
        url: "/branch",
        method: "POST",
        body: branchData,
      }),
      invalidatesTags: ["Branch"],
    }),
    updateBranch: builder.mutation<
      { success: boolean; data: Branch },
      { id: string; data: Partial<CreateBranchRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/branch/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Branch", id }],
    }),
    deleteBranch: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/branch/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Branch"],
    }),
  }),
});

export const {
  useGetBranchesQuery,
  useGetBranchByIdQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
} = branchApi;
