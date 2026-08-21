import OtherStaff from "@/mainComponents/StaffM/OtherStaff";
import { lazy } from "react";
import ApplyLeave from "@/mainComponents/shared/ApplyLeave";
import QuotationManager from "@/mainComponents/shared/Quotation/QuotationManager";
import RaiseMaintenanceRequest from "@/mainComponents/shared/RaiseMaintenanceRequest";

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
const EditVas = lazy(() => import("@/mainComponents/VASsystem/EditVas"));
const SelectVas = lazy(() => import("@/mainComponents/VASsystem/SelectVas"));

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
const BranchQuotations = () => (
  <QuotationManager dashboardPath='/manager/dashboard' />
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
const CounterSaleAdminDashboard = lazy(
  () => import("@/mainComponents/CounterSaleM/CounterSaleAdminDashboard"),
);
const SalesReportAdminDashboard = lazy(
  () => import("@/mainComponents/SalesReportImportM/SalesReportAdminDashboard"),
);
const B2BSalesManager = lazy(
  () => import("@/mainComponents/B2BSalesM/B2BSalesManager"),
);
const ViewAllNotification = lazy(
  () => import("@/mainComponents/shared/ViewAllNotification"),
);
export const branchManagerAuthRoutes = [
  { path: "/manager-login", component: LoginBranchManager },
];

export const branchManagerRoutes = [
  { path: "/manager/dashboard", component: BranchManagerDashboard },
  { path: "/manager/customers/signup", component: CustomerSignUp },
  // Handling Vas
  { path: "/manager/vas", component: BranchVASManagement },
  { path: "/manager/vas/select", component: SelectVas },
  { path: "/manager/edit/vas/:id", component: EditVas },
  { path: "/manager/forms/vas", component: VASForm },
  { path: "/manager/view/vas", component: ViewVAS },
  //Handling Stock Concept
  { path: "/manager/stock", component: BranchStockManagement },
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

  { path: "/manager/customer-vehicles", component: BranchCustomerVehicles },
  { path: "/manager/finance-queries", component: BranchFinanceQueries },
  { path: "/manager/any-messages", component: SeeMessages },
  { path: "/manager/staff", component: OtherStaff },
  { path: "/manager/part-admins", component: PartAdmins },
  { path: "/manager/service-admins", component: ServiceAdmins },
  { path: "/manager/profile", component: ProfileView },
  { path: "/manager/notifications", component: ViewAllNotification },
  { path: "/manager/view/stock-concept", component: ViewStockConcept },
  //
  { path: "/manager/apply-leave", component: BranchApplyLeave },
  { path: "/manager/quotations", component: BranchQuotations },

  // Data Import
  { path: "/manager/data-import", component: BranchDataImportDashboard },
  { path: "/manager/data-import/upload", component: BranchUploadDataImport },

  // Counter Sale Reports — Part-Admin uploads, Branch-Admin reads/deletes own branch
  { path: "/manager/counter-sale", component: CounterSaleAdminDashboard },

  // Sales Report — Branch-Admin uploads sold-vehicle CSVs, reads/deletes own branch
  { path: "/manager/sales-report", component: SalesReportAdminDashboard },

  // B2B Sales (Challans) — Branch-Admin submits/reads own branch
  { path: "/manager/b2b-sales", component: B2BSalesManager },
  {
    path: "/manager/raise-maintenance-request",
    component: RaiseMaintenanceRequest,
  },
];
