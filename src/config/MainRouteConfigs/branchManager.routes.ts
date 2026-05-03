import { lazy } from "react";

const LoginBranchManager = lazy(
  () => import("@/mainComponents/Admin/LoginBranchManager"),
);
const BranchManagerDashboard = lazy(
  () => import("@/mainComponents/BranchM/BranchManagerDashboard"),
);
const BranchServiceBookings = lazy(
  () => import("@/mainComponents/BranchM/BranchServiceBookings"),
);
const BranchAccidentReports = lazy(
  () => import("@/mainComponents/BranchM/BranchAccidentReports"),
);
const BranchEnquiries = lazy(
  () => import("@/mainComponents/BranchM/BranchEnquiries"),
);
const BranchApplications = lazy(
  () => import("@/mainComponents/BranchM/BranchApplications"),
);
const BranchStockManagement = lazy(
  () => import("@/mainComponents/BranchM/BranchStockManagement"),
);
const BranchVASManagement = lazy(
  () => import("@/mainComponents/BranchM/BranchVASManagement"),
);
const BranchCustomerVehicles = lazy(
  () => import("@/mainComponents/BranchM/BranchCustomerVehicles"),
);
const BranchFinanceQueries = lazy(
  () => import("@/mainComponents/BranchM/BranchFinanceQueries"),
);

export const branchManagerAuthRoutes = [
  { path: "/manager-login", component: LoginBranchManager },
];

export const branchManagerRoutes = [
  { path: "/manager/dashboard", component: BranchManagerDashboard },
  { path: "/manager/service-bookings", component: BranchServiceBookings },
  { path: "/manager/accident-reports", component: BranchAccidentReports },
  { path: "/manager/enquiries", component: BranchEnquiries },
  { path: "/manager/applications", component: BranchApplications },
  { path: "/manager/stock", component: BranchStockManagement },
  { path: "/manager/vas", component: BranchVASManagement },
  { path: "/manager/customer-vehicles", component: BranchCustomerVehicles },
  { path: "/manager/finance-queries", component: BranchFinanceQueries },
];
