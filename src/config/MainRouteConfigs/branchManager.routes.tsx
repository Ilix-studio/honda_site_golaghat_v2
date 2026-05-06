import OtherStaff from "@/mainComponents/StaffM/OtherStaff";
import { lazy } from "react";
import ApplyLeave from "@/mainComponents/shared/ApplyLeave";

const LoginBranchManager = lazy(
  () => import("@/mainComponents/BranchM/LoginBranchManager"),
);

const BranchManagerDashboard = lazy(
  () => import("@/mainComponents/BranchM/BranchManagerDashboard"),
);
const CustomerSignUp = lazy(
  () => import("@/mainComponents/CustomerSystem/CustomerSignUp"),
);
const FinanceQueries = lazy(
  () =>
    import("@/mainComponents/Admin/AdminDash/FinanceEnquiry/FinanceQueries"),
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
const SeeMessages = lazy(() => import("@/mainComponents/Admin/SeeMessages"));
const BranchApplyLeave = () => (
  <ApplyLeave dashboardPath='/manager/dashboard' />
);
export const branchManagerAuthRoutes = [
  { path: "/manager-login", component: LoginBranchManager },
];

export const branchManagerRoutes = [
  { path: "/manager/dashboard", component: BranchManagerDashboard },
  { path: "/manager/customers/signup", component: CustomerSignUp },
  //
  { path: "/manager/service-bookings", component: BranchServiceBookings },
  { path: "/manager/accident-reports", component: BranchAccidentReports },
  { path: "/manager/finanace-query", component: FinanceQueries },
  { path: "/manager/enquiries", component: BranchEnquiries },
  { path: "/manager/applications", component: BranchApplications },
  { path: "/manager/stock", component: BranchStockManagement },
  { path: "/manager/vas", component: BranchVASManagement },
  { path: "/manager/customer-vehicles", component: BranchCustomerVehicles },
  { path: "/manager/finance-queries", component: BranchFinanceQueries },
  { path: "/manager/any-messages", component: SeeMessages },
  { path: "/manager/staff", component: OtherStaff },
  //
  { path: "/manager/apply-leave", component: BranchApplyLeave },
];
