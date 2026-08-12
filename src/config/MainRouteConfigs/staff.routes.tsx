// staff.routes.tsx
import { lazy } from "react";
import ApplyLeave from "@/mainComponents/shared/ApplyLeave";
import QuotationManager from "@/mainComponents/shared/Quotation/QuotationManager";

const DashStaff = lazy(() => import("@/mainComponents/StaffM/DashStaff"));
const LoginStaffs = lazy(() => import("@/mainComponents/StaffM/LoginStaffs"));

const StaffApplyLeave = () => <ApplyLeave dashboardPath='/staff/dashboard' />;
const StaffQuotations = () => (
  <QuotationManager dashboardPath='/staff/dashboard' />
);

const BuyStickers = lazy(() => import("@/Scanfleet/BuyStickers"));
const ProfileView = lazy(() => import("@/mainComponents/shared/ProfileView"));
const ViewAllNotification = lazy(
  () => import("@/mainComponents/shared/ViewAllNotification"),
);

export const staffAuthRoutes = [
  { path: "/staff/login", component: LoginStaffs },
];

export const staffRoutes = [
  { path: "/staff/dashboard", component: DashStaff },
  { path: "/staff/apply-leave", component: StaffApplyLeave },
  { path: "/staff/quotations", component: StaffQuotations },
  { path: "/staff/profile", component: ProfileView },
  { path: "/staff/notifications", component: ViewAllNotification },
  { path: "/buy-sticker", component: BuyStickers },
];
