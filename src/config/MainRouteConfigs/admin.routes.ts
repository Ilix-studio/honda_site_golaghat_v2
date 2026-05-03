import { lazy } from "react";
import { ViewBikeImage } from "@/mainComponents/Admin/Bikes/ViewBikeImage";

const LoginSuperAdmin = lazy(
  () => import("@/mainComponents/Admin/LoginSuperAdmin"),
);
const LoginBranchManager = lazy(
  () => import("@/mainComponents/Admin/LoginBranchManager"),
);
const AdminDashboard = lazy(
  () => import("@/mainComponents/Admin/AdminDash/AdminDashboard"),
);
const AddBranch = lazy(
  () => import("@/mainComponents/NavMenu/Branches/AddBranch"),
);
const BranchManager = lazy(
  () => import("@/mainComponents/Admin/BranchM/BranchManager"),
);
const AddBikes = lazy(() => import("@/mainComponents/Admin/Bikes/AddBikes"));
const EditBikes = lazy(() => import("@/mainComponents/Admin/Bikes/EditBikes"));
const AddBikeImage = lazy(
  () => import("@/mainComponents/Admin/Bikes/AddBikeImage"),
);
const EditBikeImage = lazy(
  () => import("@/mainComponents/Admin/Bikes/EditBikeImage"),
);
const ViewBikeImages = lazy(
  () => import("@/mainComponents/Admin/Bikes/ViewBike/ViewBikeImages"),
);
const ViewScootyImages = lazy(
  () => import("@/mainComponents/Admin/Bikes/ViewBike/ViewScootymages"),
);
const BikeImageManager = lazy(
  () => import("@/mainComponents/Admin/AdminDash/BikeImageManager"),
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
const GetAllStockFiles = lazy(
  () => import("@/mainComponents/CSVsystem/GetAllStockFiles"),
);
const CustomerSignUp = lazy(
  () => import("@/mainComponents/CustomerSystem/CustomerSignUp"),
);
const AssignStock = lazy(
  () => import("@/mainComponents/CustomerSystem/ActivateFeature/AssignStock"),
);
const AdminBookingsManager = lazy(
  () => import("@/mainComponents/Admin/ServiceBookings/AdminBookingsManager"),
);
const FinanceQueries = lazy(
  () =>
    import("@/mainComponents/Admin/AdminDash/FinanceEnquiry/FinanceQueries"),
);
const SeeMessages = lazy(() => import("@/mainComponents/Admin/SeeMessages"));
const GetAllAccidentReports = lazy(
  () => import("@/mainComponents/Admin/AcidentReport/GetAllAccidentReports"),
);
const GetAllAccidentReportsById = lazy(
  () =>
    import("@/mainComponents/Admin/AcidentReport/GetAllAccidentReportsById"),
);
const SelectVas = lazy(() => import("@/mainComponents/VASsystem/SelectVas"));

export const adminAuthRoutes = [
  { path: "/admin/login", component: LoginSuperAdmin },
];

export const adminRoutes = [
  { path: "/admin/dashboard", component: AdminDashboard },
  { path: "/admin/branches/add", component: AddBranch },
  { path: "/admin/branches/managers", component: BranchManager },
  { path: "/admin/bikes/add", component: AddBikes },
  { path: "/admin/bikes/edit/:id", component: EditBikes },
  { path: "/admin/bikes/:bikeId/images/add", component: AddBikeImage },
  { path: "/admin/bikes/:bikeId/images/edit", component: EditBikeImage },
  { path: "/admin/bikes/images/:id", component: ViewBikeImage },
  { path: "/admin/bikeimages/:bikeId", component: ViewBikeImages },
  { path: "/admin/scootyimages/:bikeId", component: ViewScootyImages },
  { path: "/admin/bikes/add/:id/images", component: BikeImageManager },
  { path: "/admin/customers/signup", component: CustomerSignUp },
  { path: "/admin/vas/select", component: SelectVas },
  { path: "/admin/forms/vas", component: VASForm },
  { path: "/admin/stockC/select", component: SelectStockForm },
  { path: "/admin/forms/stock-concept", component: StockConceptForm },
  { path: "/admin/forms/stock-concept-csv", component: UploadCSVForm },
  { path: "/admin/get/all-stock", component: GetAllStockFiles },
  { path: "/admin/get/csv", component: GetCSVFiles },
  { path: "/admin/assign/stock-concept/:id", component: AssignStock },
  { path: "/admin/service-bookings", component: AdminBookingsManager },
  { path: "/admin/finanace-query", component: FinanceQueries },
  { path: "/admin/any-messages", component: SeeMessages },
  { path: "/admin/accident-reports", component: GetAllAccidentReports },
  { path: "/admin/accident-reports/:id", component: GetAllAccidentReportsById },
];

// Kept separate for LoginBranchManager — used in manager auth flow
export { LoginBranchManager };
