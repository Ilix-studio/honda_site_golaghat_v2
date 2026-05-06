import { lazy } from "react";

const DashStaff = lazy(() => import("@/mainComponents/StaffM/DashStaff"));
const LoginStaffs = lazy(() => import("@/mainComponents/StaffM/LoginStaffs"));

export const staffAuthRoutes = [
  { path: "/staff/login", component: LoginStaffs },
];

export const staffRoutes = [{ path: "/staff/dashboard", component: DashStaff }];
