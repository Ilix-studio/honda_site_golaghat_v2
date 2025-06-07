// src/redux-store/services/staffApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../lib/apiConfig";

export interface CreateStaffRequest {
  branchId: string;
  name: string;
  position: string;
}

export interface StaffMember {
  name: string;
  position: string;
}

export const staffApi = createApi({
  reducerPath: "staffApi",
  baseQuery,
  tagTypes: ["Staff"],
  endpoints: (builder) => ({
    getStaffByBranch: builder.query<
      { success: boolean; count: number; data: StaffMember[] },
      string
    >({
      query: (branchId) => ({
        url: `/staff/${branchId}`,
        method: "GET",
      }),
      providesTags: ["Staff"],
    }),
    createStaff: builder.mutation<
      {
        success: boolean;
        data: { name: string; position: string; branch: string };
      },
      CreateStaffRequest
    >({
      query: (staffData) => ({
        url: "/staff/create-staffM",
        method: "POST",
        body: staffData,
      }),
      invalidatesTags: ["Staff"],
    }),
    updateStaff: builder.mutation<
      { success: boolean; data: StaffMember },
      { branchId: string; staffIndex: number; data: Partial<StaffMember> }
    >({
      query: ({ branchId, staffIndex, data }) => ({
        url: `/staff/${branchId}/${staffIndex}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Staff"],
    }),
    deleteStaff: builder.mutation<
      { success: boolean },
      { branchId: string; staffIndex: number }
    >({
      query: ({ branchId, staffIndex }) => ({
        url: `/staff/${branchId}/${staffIndex}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Staff"],
    }),
  }),
});

export const {
  useGetStaffByBranchQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
} = staffApi;
