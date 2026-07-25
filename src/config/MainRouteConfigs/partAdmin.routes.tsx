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

const CounterSaleAdminDashboard = lazy(
  () => import("@/mainComponents/CounterSaleM/CounterSaleAdminDashboard")
);
const CounterSaleUploadForm = lazy(
  () => import("@/mainComponents/CounterSaleM/CounterSaleUploadForm")
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

  // Counter Sale Reports — Part-Admin uploads, all three roles read
  { path: "/part-admin/counter-sale", component: CounterSaleAdminDashboard },
  {
    path: "/part-admin/counter-sale/upload",
    component: CounterSaleUploadForm,
  },
];
