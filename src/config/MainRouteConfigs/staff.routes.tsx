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

// Report pages shared with the Branch-Admin area. Each one is branch-scoped
// server-side for a Staff caller, so the same component is safe to reuse here.
const FinanceQueries = lazy(
  () => import("@/mainComponents/Admin/AdminDash/FinanceEnquiry/FinanceQueries"),
);
const SeeMessages = lazy(() => import("@/mainComponents/Admin/SeeMessages"));
const GetAllAccidentReports = lazy(
  () => import("@/mainComponents/Admin/AcidentReport/GetAllAccidentReports"),
);
const GetAllAccidentReportsById = lazy(
  () => import("@/mainComponents/Admin/AcidentReport/GetAllAccidentReportsById"),
);
const CounterSaleAdminDashboard = lazy(
  () => import("@/mainComponents/CounterSaleM/CounterSaleAdminDashboard"),
);

const StaffAccidentReports = () => (
  <GetAllAccidentReports basePath='/staff/accident-reports' />
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
  { path: "/staff/finanace-query", component: FinanceQueries },
  { path: "/staff/any-messages", component: SeeMessages },
  // Literal path first — "/staff/accident-reports/:id" must not shadow the list.
  { path: "/staff/accident-reports", component: StaffAccidentReports },
  { path: "/staff/accident-reports/:id", component: GetAllAccidentReportsById },
  { path: "/staff/counter-sale", component: CounterSaleAdminDashboard },
  { path: "/staff/profile", component: ProfileView },
  { path: "/staff/notifications", component: ViewAllNotification },
  { path: "/buy-sticker", component: BuyStickers },
];
