// types/leave_types.ts — add this

// src/types/leave_types.ts

export type LeaveType = "Sick" | "Casual";
export type LeaveStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";
export type ApplicantModel = "BranchManager" | "ServiceAdmin" | "Staff";

export const LEAVE_LIMITS = {
  Sick: 12,
  Casual: 12,
} as const;

export interface LeaveBalanceEntry {
  total: number;
  used: number;
  remaining: number;
}

export interface LeaveBalance {
  Sick: LeaveBalanceEntry;
  Casual: LeaveBalanceEntry;
}
