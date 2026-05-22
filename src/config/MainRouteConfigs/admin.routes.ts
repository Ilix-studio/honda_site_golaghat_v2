import { lazy } from "react";
import { ViewBikeImage } from "@/mainComponents/Admin/Bikes/ViewBikeImage";

const LoginSuperAdmin = lazy(
  () => import("@/mainComponents/Admin/LoginSuperAdmin"),
);
const LoginBranchManager = lazy(
  () => import("@/mainComponents/BranchM/LoginBranchManager"),
);
const AdminDashboard = lazy(
  () => import("@/mainComponents/Admin/AdminDash/AdminDashboard"),
);
const AddBranch = lazy(
  () => import("@/mainComponents/NavMenu/Branches/AddBranch"),
);
const BranchManager = lazy(
  () => import("@/mainComponents/BranchM/BranchManager"),
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


const GetAllAccidentReports = lazy(
  () => import("@/mainComponents/Admin/AcidentReport/GetAllAccidentReports"),
);
const GetAllAccidentReportsById = lazy(
  () =>
    import("@/mainComponents/Admin/AcidentReport/GetAllAccidentReportsById"),
);

const ServiceAdmins = lazy(
  () => import("@/mainComponents/ServiceM/ServiceAdmins"),
);

const TabBased = lazy(
  () => import("@/mainComponents/Admin/LeaveApplication/TabBased"),
);

export const adminAuthRoutes = [
  { path: "/admin/login", component: LoginSuperAdmin },
];

export const adminRoutes = [
  { path: "/admin/dashboard", component: AdminDashboard },
  { path: "/admin/branches/add", component: AddBranch },
  { path: "/admin/branches/managers", component: BranchManager },
  { path: "/admin/branches/service-admins", component: ServiceAdmins },

  //Handling Bikes
  { path: "/admin/bikes/add", component: AddBikes },
  { path: "/admin/bikes/edit/:id", component: EditBikes },
  { path: "/admin/bikes/:bikeId/images/add", component: AddBikeImage },
  { path: "/admin/bikes/:bikeId/images/edit", component: EditBikeImage },
  { path: "/admin/bikes/images/:id", component: ViewBikeImage },
  { path: "/admin/bikeimages/:bikeId", component: ViewBikeImages },
  { path: "/admin/scootyimages/:bikeId", component: ViewScootyImages },
  { path: "/admin/bikes/add/:id/images", component: BikeImageManager },

  // Leave Management
  { path: "/admin/leave-requests", component: TabBased },

  // Handling Dealer Queries

  { path: "/admin/accident-reports", component: GetAllAccidentReports },
  { path: "/admin/accident-reports/:id", component: GetAllAccidentReportsById },
];

// Kept separate for LoginBranchManager — used in manager auth flow
export { LoginBranchManager };
