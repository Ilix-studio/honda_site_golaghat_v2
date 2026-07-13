// staff.routes.tsx
import { lazy } from "react";
import ApplyLeave from "@/mainComponents/shared/ApplyLeave";

const DashStaff = lazy(() => import("@/mainComponents/StaffM/DashStaff"));
const LoginStaffs = lazy(() => import("@/mainComponents/StaffM/LoginStaffs"));

const StaffApplyLeave = () => <ApplyLeave dashboardPath='/staff/dashboard' />;

const BuyStickers = lazy(() => import("@/Scanfleet/BuyStickers"));
const ProfileView = lazy(() => import("@/mainComponents/shared/ProfileView"));

export const staffAuthRoutes = [
  { path: "/staff/login", component: LoginStaffs },
];

export const staffRoutes = [
  { path: "/staff/dashboard", component: DashStaff },
  { path: "/staff/apply-leave", component: StaffApplyLeave },
  { path: "/staff/profile", component: ProfileView },
  { path: "/buy-sticker", component: BuyStickers },
];
