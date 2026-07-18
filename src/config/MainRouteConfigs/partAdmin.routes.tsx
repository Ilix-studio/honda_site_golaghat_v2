import { lazy } from "react";

const LoginPartAdmin = lazy(
  () => import("@/mainComponents/PartsM/LoginPartAdmin")
);
const PartsAdminDashboard = lazy(
  () => import("@/mainComponents/PartsM/PartsAdminDashboard")
);
const ProfileView = lazy(() => import("@/mainComponents/shared/ProfileView"));

const PartsStockImport = lazy(
  () => import("@/mainComponents/PartsM/PartsStockImport")
);

const PartsFolderDashboard = lazy(
  () => import("@/mainComponents/PartsM/PartsFolderDashboard")
);

export const partAdminAuthRoutes = [
  { path: "/part-admin/login", component: LoginPartAdmin },
];

export const partAdminRoutes = [
  { path: "/part-admin/dashboard", component: PartsAdminDashboard },
  { path: "/part-admin/profile", component: ProfileView },

  {
    path: "/part-admin/parts-stock/upload",
    component: PartsStockImport,
  },
  {
    path: "/part-admin/folder",
    component: PartsFolderDashboard,
  },
];
