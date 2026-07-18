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

const VASForm = lazy(() => import("@/mainComponents/VASsystem/VASForm"));
const StockConceptForm = lazy(
  () => import("@/mainComponents/CSVsystem/StockConceptForm"),
);
const UploadCSVForm = lazy(
  () => import("@/mainComponents/CSVsystem/UploadCSVForm"),
);
const SelectStockForm = lazy(
  () => import("@/mainComponents/CSVsystem/SelectStockForm"),
);
const GetCSVFiles = lazy(
  () => import("@/mainComponents/CSVsystem/GetCSVFiles"),
);
const ViewCSVUploads = lazy(
  () => import("@/mainComponents/CSVsystem/ViewCSVUploads"),
);
const GetAllStockFiles = lazy(
  () => import("@/mainComponents/CSVsystem/GetAllStockFiles"),
);

const AssignStock = lazy(
  () => import("@/mainComponents/CustomerSystem/ActivateFeature/AssignStock"),
);
const ViewVAS = lazy(() => import("@/mainComponents/ViewBS2/ViewVAS"));


const SelectVas = lazy(() => import("@/mainComponents/VASsystem/SelectVas"));
const ViewStockConcept = lazy(
  () => import("@/mainComponents/ViewBS2/ViewStockConcept"),
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
const PartAdmins = lazy(() => import("@/mainComponents/PartsM/PartAdmins"));
const ServiceAdmins = lazy(
  () => import("@/mainComponents/ServiceM/ServiceAdmins"),
);
const ProfileView = lazy(() => import("@/mainComponents/shared/ProfileView"));
const BranchApplyLeave = () => (
  <ApplyLeave dashboardPath='/manager/dashboard' />
);
const BranchDataImportDashboard = lazy(
  () => import("@/mainComponents/BranchM/BranchDataImportDashboard"),
);
const UploadDataImportForm = lazy(
  () => import("@/mainComponents/DataImport/UploadDataImportForm"),
);
const BranchUploadDataImport = () => (
  <UploadDataImportForm dashboardPath='/manager/data-import' />
);
export const branchManagerAuthRoutes = [
  { path: "/manager-login", component: LoginBranchManager },
];

export const branchManagerRoutes = [
  { path: "/manager/dashboard", component: BranchManagerDashboard },
  { path: "/manager/customers/signup", component: CustomerSignUp },
  // Handling Customers

  { path: "/manager/vas/select", component: SelectVas },
  { path: "/manager/forms/vas", component: VASForm },
  { path: "/manager/stockC/select", component: SelectStockForm },
  { path: "/manager/forms/stock-concept", component: StockConceptForm },
  { path: "/manager/forms/stock-concept-csv", component: UploadCSVForm },
  {
    path: "/manager/forms/stock-concept-csv/view-uploads",
    component: ViewCSVUploads,
  },
  { path: "/manager/get/all-stock", component: GetAllStockFiles },
  { path: "/manager/get/csv", component: GetCSVFiles },
  { path: "/manager/assign/stock-concept/:id", component: AssignStock },
  //
  { path: "/manager/service-bookings", component: BranchServiceBookings },
  { path: "/manager/accident-reports", component: BranchAccidentReports },
  { path: "/manager/finanace-query", component: FinanceQueries },
  { path: "/manager/enquiries", component: BranchEnquiries },
  { path: "/manager/applications", component: BranchApplications },
  { path: "/manager/stock", component: BranchStockManagement },
  { path: "/manager/vas", component: BranchVASManagement },
  { path: "/manager/view/vas", component: ViewVAS },
  { path: "/manager/customer-vehicles", component: BranchCustomerVehicles },
  { path: "/manager/finance-queries", component: BranchFinanceQueries },
  { path: "/manager/any-messages", component: SeeMessages },
  { path: "/manager/staff", component: OtherStaff },
  { path: "/manager/part-admins", component: PartAdmins },
  { path: "/manager/service-admins", component: ServiceAdmins },
  { path: "/manager/profile", component: ProfileView },
    { path: "/manager/view/stock-concept", component: ViewStockConcept },
  //
  { path: "/manager/apply-leave", component: BranchApplyLeave },

  // Data Import
  { path: "/manager/data-import", component: BranchDataImportDashboard },
  { path: "/manager/data-import/upload", component: BranchUploadDataImport },
];
