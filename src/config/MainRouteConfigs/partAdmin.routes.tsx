import { lazy } from "react";

const LoginPartAdmin = lazy(
  () => import("@/mainComponents/PartsM/LoginPartAdmin"),
);
const PartsAdminDashboard = lazy(
  () => import("@/mainComponents/PartsM/PartsAdminDashboard"),
);
const UploadPartsReportForm = lazy(
  () => import("@/mainComponents/PartsM/UploadPartsReportForm"),
);
const ProfileView = lazy(() => import("@/mainComponents/shared/ProfileView"));

export const partAdminAuthRoutes = [
  { path: "/part-admin/login", component: LoginPartAdmin },
];

export const partAdminRoutes = [
  { path: "/part-admin/dashboard", component: PartsAdminDashboard },
  { path: "/part-admin/upload", component: UploadPartsReportForm },
  { path: "/part-admin/profile", component: ProfileView },
];
