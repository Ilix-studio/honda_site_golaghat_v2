import { lazy } from "react";

// IMMEDIATE ROUTES - No lazy loading for critical routes
// Essential components that should load immediately
import Home from "../SystemComponents/public/Home";
import NotFoundPage from "../SystemComponents/common/NotFoundPage";
import { ViewBikeImage } from "../SystemComponents/shared/BikesCRUD/ViewBikeImage";
import { SimpleBookService } from "../SystemComponents/authentication/CustomerSystem/BookService/SimpleBookService";
const BillMemo = lazy(
  () => import("../SystemComponents/authentication/Admin/ZBillMemo"),
);

export const immediateRoutes = [
  {
    path: "/",
    component: Home,
  },
];

// PUBLIC ROUTES - With lazy loading
// Public pages accessible to everyone
const Finance = lazy(
  () => import("../SystemComponents/public/NavMenu/Finance"),
);
const Contact = lazy(
  () => import("../SystemComponents/public/NavMenu/Contact"),
);
const BranchesPage = lazy(
  () => import("../SystemComponents/public/NavMenu/Branches/BranchesPage"),
);
const BranchDetailPage = lazy(
  () => import("../SystemComponents/public/NavMenu/Branches/BranchDetailPage"),
);
const ViewAllBikes = lazy(() =>
  import("../SystemComponents/shared/BikeDetails/ViewAllBikes").then(
    (module) => ({
      default: module.ViewAllBikes,
    }),
  ),
);
const BikeDetailsPage = lazy(
  () => import("../SystemComponents/shared/BikeDetails/BikeDetailsPage"),
);
const ScooterDetailPage = lazy(
  () => import("../SystemComponents/shared/BikeDetails/ScooterDetailPage"),
);
const CompareBike = lazy(
  () =>
    import("../SystemComponents/shared/BikeDetails/CompareBikes/CompareBike"),
);

const SearchResults = lazy(
  () => import("../SystemComponents/public/Search/SearchResults"),
);

const DealershipLocator = lazy(
  () => import("../SystemComponents/public/Location/DealershipLocator"),
);

const DealershipReviews = lazy(
  () => import("../SystemComponents/public/Location/DealershipReviews"),
);

// View System - Public access
const ViewAllBranches = lazy(
  () => import("../SystemComponents/shared/ViewBS2/ViewAllBranches"),
);
//
const SelectVas = lazy(
  () => import("@/SystemComponents/shared/VAScrud/SelectVas"),
);

const ViewStockConcept = lazy(
  () => import("../SystemComponents/shared/ViewBS2/ViewStockConcept"),
);
const DownloadSafetyfeature = lazy(
  () => import("../SystemComponents/shared/ViewBS2/DownloadSafetyfeature"),
);

export const publicRoutes = [
  // Navigation pages
  { path: "/finance", component: Finance },
  { path: "/contact", component: Contact },

  // Branches
  { path: "/branches", component: BranchesPage },
  { path: "/branches/:id", component: BranchDetailPage },

  // Bikes & Scooters
  { path: "/view-all", component: ViewAllBikes },
  { path: "/bikes/:bikeId", component: BikeDetailsPage },
  { path: "/scooters/:bikeId", component: ScooterDetailPage },
  { path: "/compare", component: CompareBike },

  { path: "/see-bill-memo", component: BillMemo },

  // Services
  { path: "/search", component: SearchResults },

  // Location Services
  { path: "/dealership-locator", component: DealershipLocator },
  { path: "/dealership-reviews", component: DealershipReviews },

  // Public View System
  { path: "/admin/branches/view", component: ViewAllBranches },

  { path: "/view/stock-concept", component: ViewStockConcept },
  {
    path: "/download/safety-feature-stickers",
    component: DownloadSafetyfeature,
  },
];

// ADMIN ROUTES - Protected routes with /admin prefix

// Admin Authentication
const LoginSuperAdmin = lazy(
  () => import("../SystemComponents/authentication/Admin/LoginSuperAdmin"),
);
const LoginBranchManager = lazy(
  () =>
    import("../SystemComponents/authentication/BranchManager/LoginBranchManager"),
);

// Admin Dashboard
const AdminDashboard = lazy(
  () =>
    import("../SystemComponents/authentication/Admin/AdminDash/AdminDashboard"),
);

// Branch Management
const AddBranch = lazy(
  () => import("../SystemComponents/public/NavMenu/Branches/AddBranch"),
);
const BranchManager = lazy(
  () =>
    import("../SystemComponents/authentication/BranchManager/BranchManager"),
);

// Bike Management
const AddBikes = lazy(
  () => import("../SystemComponents/shared/BikesCRUD/AddBikes"),
);
const EditBikes = lazy(
  () => import("../SystemComponents/shared/BikesCRUD/EditBikes"),
);
const AddBikeImage = lazy(
  () => import("../SystemComponents/shared/BikesCRUD/AddBikeImage"),
);
const EditBikeImage = lazy(
  () => import("../SystemComponents/shared/BikesCRUD/EditBikeImage"),
);

// Customer Management (Admin only)

// Business System Forms
const VASForm = lazy(
  () => import("../SystemComponents/shared/VAScrud/VASForm"),
);

const StockConceptForm = lazy(
  () => import("../SystemComponents/shared/InventoryManual/StockConceptForm"),
);

const AdminBookingsManager = lazy(
  () =>
    import("../SystemComponents/authentication/Admin/ServiceBookings/AdminBookingsManager"),
);
const CustomerSignUp = lazy(
  () =>
    import("../SystemComponents/authentication/CustomerSystem/CustomerSignUp"),
);
const AssignStock = lazy(
  () => import("@/SystemComponents/shared/ActivateFeature/AssignStock"),
);
const UploadCSVForm = lazy(
  () => import("@/SystemComponents/shared/InventoryCSV/UploadCSVForm"),
);
const SelectStockForm = lazy(
  () => import("@/SystemComponents/shared/InventoryCSV/SelectStockForm"),
);

const GetCSVFiles = lazy(
  () => import("@/SystemComponents/shared/InventoryCSV/GetCSVFiles"),
);

const GetAllStockFiles = lazy(
  () => import("@/SystemComponents/shared/InventoryCSV/GetAllStockFiles"),
);

const FinanceQueries = lazy(
  () => import("../SystemComponents/shared/FinanceEnquiry/FinanceQueries"),
);
const ViewBikeImages = lazy(
  () => import("../SystemComponents/shared/BikesCRUD/ViewBike/ViewBikeImages"),
);

const ViewScootyImages = lazy(
  () => import("../SystemComponents/shared/BikesCRUD/ViewBike/ViewScootymages"),
);

const BikeImageManager = lazy(
  () =>
    import("../SystemComponents/authentication/Admin/AdminDash/BikeImageManager"),
);
const SeeMessages = lazy(
  () => import("../SystemComponents/authentication/Admin/SeeMessages"),
);

const GetAllAccidentReports = lazy(
  () =>
    import("../SystemComponents/shared/AcidentReport/GetAllAccidentReports"),
);
const GetAllAccidentReportsById = lazy(
  () =>
    import("../SystemComponents/shared/AcidentReport/GetAllAccidentReportsById"),
);
const ViewVAS = lazy(
  () => import("../SystemComponents/shared/ViewBS2/ViewVAS"),
);
// Create admin routes array
const createAdminRoutes = () => [
  // Authentication
  { path: "/admin/login", component: LoginSuperAdmin },

  // Dashboard
  { path: "/admin/dashboard", component: AdminDashboard },

  // Branch Management (Super Admin Only)
  { path: "/admin/branches/add", component: AddBranch },
  { path: "/admin/branches/managers", component: BranchManager },

  // Bike Management
  { path: "/admin/bikes/add", component: AddBikes },
  { path: "/admin/bikes/edit/:id", component: EditBikes },
  { path: "/admin/bikes/:bikeId/images/add", component: AddBikeImage },
  { path: "/admin/bikes/:bikeId/images/edit", component: EditBikeImage },
  { path: "/admin/bikes/images/:id", component: ViewBikeImage },
  { path: "/admin/bikeimages/:bikeId", component: ViewBikeImages },
  { path: "/admin/scootyimages/:bikeId", component: ViewScootyImages },
  //  admin view bikes
  { path: "/admin/bikes/add/:id/images", component: BikeImageManager },

  // Customer Management
  { path: "/customers/signup", component: CustomerSignUp },

  // Business System Forms
  { path: "/admin/vas/select", component: SelectVas },
  { path: "/admin/forms/vas", component: VASForm },
  { path: "/admin/view/vas", component: ViewVAS },

  { path: "/admin/stockC/select", component: SelectStockForm },
  { path: "/admin/forms/stock-concept", component: StockConceptForm },
  { path: "/admin/forms/stock-concept-csv", component: UploadCSVForm },
  { path: "/admin/get/all-stock", component: GetAllStockFiles },
  { path: "/admin/get/csv", component: GetCSVFiles },

  // Assignment System
  { path: "/admin/assign/stock-concept/:id", component: AssignStock },

  //Service Booking
  { path: "/admin/service-bookings", component: AdminBookingsManager },
  //Finance Queries
  { path: "/admin/finanace-query", component: FinanceQueries },
  //Contact Section
  { path: "/admin/any-messages", component: SeeMessages },
  //
  { path: "/admin/accident-reports", component: GetAllAccidentReports },
  { path: "/admin/accident-reports/:id", component: GetAllAccidentReportsById },
  //
];

export const adminRoutes = createAdminRoutes();

// CUSTOMER ROUTES - Protected routes with /customer prefix

// Customer Dashboard
const InitialDashboard = lazy(
  () =>
    import("../SystemComponents/authentication/CustomerSystem/Dashboards/InitialDashboard"),
);
const CustomerMainDash = lazy(
  () =>
    import("../SystemComponents/authentication/CustomerSystem/Dashboards/CustomerMainDash"),
);

// Customer Profile
const CustomerCreateProfile = lazy(
  () =>
    import("../SystemComponents/authentication/CustomerSystem/CustomerCreateProfile"),
);

// Customer Vehicle Management
const CustomerVehicleInfo = lazy(
  () => import("../SystemComponents/shared/AssignCustomer/CustomerVehicleInfo"),
);

// Customer Services

const ActivateVAS = lazy(
  () => import("../SystemComponents/shared/ActivateFeature/ActivateVAS"),
);

const CustomerServices = lazy(
  () => import("../SystemComponents/shared/Support/CustomerServices"),
);

const CustomerSupport = lazy(
  () => import("@/SystemComponents/shared/CustomerSupport/CustomerSupport"),
);

const CustomerProfile = lazy(
  () =>
    import("../SystemComponents/authentication/CustomerSystem/CustomerProfile"),
);
const ChooseStock = lazy(
  () => import("@/SystemComponents/shared/SelectStock/ChooseStock"),
);
const CustomerCSVStock = lazy(
  () => import("@/SystemComponents/shared/SelectStock/CustomerCSVStock"),
);
const UseToken = lazy(
  () => import("@/SystemComponents/shared/Scanfleet/UseToken"),
);

const FirstDash = lazy(
  () =>
    import("@/SystemComponents/authentication/CustomerSystem/Dashboards/FirstDash"),
);

const CustomerVehicleDetail = lazy(
  () =>
    import("@/SystemComponents/shared/AssignCustomer/CustomerVehicleDetail"),
);

// Create customer routes array
const createCustomerRoutes = () => {
  const CustomerLoginComponent = lazy(async () => {
    const module =
      await import("../SystemComponents/authentication/CustomerSystem/CustomerLogin");
    return { default: module.default };
  });

  return [
    // Authentication & Profile
    { path: "/customer/login", component: CustomerLoginComponent },
    { path: "/customer/profile/create", component: CustomerCreateProfile },

    // Dashboard
    { path: "/customer/first-dash", component: FirstDash },
    { path: "/customer/initialize", component: InitialDashboard },
    // Vehicle Management
    { path: "/customer/select/stock", component: ChooseStock },
    { path: "/customer/assign/csv-stock", component: CustomerCSVStock },
    { path: "/customer/vehicle/info", component: CustomerVehicleInfo },
    { path: "/customer/vehicle/:vehicleId", component: CustomerVehicleDetail },

    //
    { path: "/customer/dashboard", component: CustomerMainDash },
    { path: "/customer/profile-info", component: CustomerProfile },
    { path: "/customer/services", component: CustomerServices },
    { path: "/customer/support", component: CustomerSupport },

    // Select Services by Admin

    { path: "/customer/services/vas", component: ActivateVAS },
    { path: "/customer/book-service", component: SimpleBookService },
    { path: "/customer/attach-stickers", component: UseToken },
  ];
};

export const customerRoutes = createCustomerRoutes();

// Route configuration for dynamic titles and navigation
export const routeConfig: Record<
  string,
  {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    backTo?: string;
    menuItems?: Array<{ label: string; href: string }>;
  }
> = {
  "/customer/first-dash": {
    title: "Customer Lookup",
    subtitle: "Search and manage customer vehicles",
    showBack: true,
    backTo: "/admin/dashboard",
  },
  "/customer/dashboard": {
    title: "",
    subtitle: "",
  },
  "/customer/services": {
    title: "My Services",
    subtitle: "",
    showBack: true,
    backTo: "/customer/dashboard",
    menuItems: [
      { label: "Book Service", href: "/customer/services" },
      { label: "Service History", href: "/customer/service-history" },
      { label: "Customer Support", href: "/customer/support" },
    ],
  },
  "/customer/book-service": {
    title: "Book Service",
    subtitle: "",
    showBack: true,
    backTo: "/customer/dashboard",
    menuItems: [
      { label: "My Services", href: "/customer/services" },
      { label: "Service History", href: "/customer/service-history" },
    ],
  },

  "/customer/service-history": {
    title: "Service History",
    subtitle: "View your past service records",
    showBack: true,
    backTo: "/customer/dashboard",
    menuItems: [
      { label: "Book Service", href: "/customer/book-service" },
      { label: "My Services", href: "/customer/services" },
    ],
  },

  "/customer/profile-info": {
    title: "My Profile",
    subtitle: "Manage your account information",
    showBack: true,
    backTo: "/customer/dashboard",
  },
  "/customer/support": {
    title: "Customer Support",
    subtitle: "",
    showBack: true,
    backTo: "/customer/dashboard",
  },

  // Branch Manager Routes
  "/manager/dashboard": {
    title: "Branch Manager Dashboard",
    subtitle: "Overview of branch operations",
  },
  "/manager/service-bookings": {
    title: "Service Bookings",
    subtitle: "Manage service appointments",
    showBack: true,
    backTo: "/manager/dashboard",
  },
  "/manager/accident-reports": {
    title: "Accident Reports",
    subtitle: "View and manage accident reports",
    showBack: true,
    backTo: "/manager/dashboard",
  },

  "/manager/stock": {
    title: "Stock Management",
    subtitle: "Manage branch stock",
    showBack: true,
    backTo: "/manager/dashboard",
  },
  "/manager/vas": {
    title: "Value Added Services",
    subtitle: "Manage VAS offerings",
    showBack: true,
    backTo: "/manager/dashboard",
  },
  "/manager/customer-vehicles": {
    title: "Customer Vehicles",
    subtitle: "View customer vehicle information",
    showBack: true,
    backTo: "/manager/dashboard",
  },
  "/manager/finance-queries": {
    title: "Finance Queries",
    subtitle: "Manage finance enquiries",
    showBack: true,
    backTo: "/manager/dashboard",
  },
};

// BRANCH MANAGER ROUTES - Protected routes with /manager prefix
const BranchManagerDashboard = lazy(
  () =>
    import("../SystemComponents/authentication/BranchManager/BranchManagerDashboard"),
);

const BranchServiceBookings = lazy(
  () =>
    import("../SystemComponents/authentication/BranchManager/BranchServiceBookings"),
);

const BranchAccidentReports = lazy(
  () =>
    import("../SystemComponents/authentication/BranchManager/BranchAccidentReports"),
);

const BranchStockManagement = lazy(
  () =>
    import("../SystemComponents/authentication/BranchManager/BranchStockManagement"),
);

const BranchVASManagement = lazy(
  () =>
    import("../SystemComponents/authentication/BranchManager/BranchVASManagement"),
);

const BranchCustomerVehicles = lazy(
  () =>
    import("../SystemComponents/authentication/BranchManager/BranchCustomerVehicles"),
);

const BranchFinanceQueries = lazy(
  () =>
    import("../SystemComponents/authentication/BranchManager/BranchFinanceQueries"),
);

// Create branch manager routes array
const createBranchManagerRoutes = () => [
  // Authentication
  { path: "/manager-login", component: LoginBranchManager },

  // Dashboard
  { path: "/manager/dashboard", component: BranchManagerDashboard },

  // Service Bookings
  { path: "/manager/service-bookings", component: BranchServiceBookings },

  // Accident Reports
  { path: "/manager/accident-reports", component: BranchAccidentReports },

  // Stock Management
  { path: "/manager/stock", component: BranchStockManagement },

  // VAS Management
  { path: "/manager/vas", component: BranchVASManagement },

  // Customer Vehicles
  { path: "/manager/customer-vehicles", component: BranchCustomerVehicles },

  // Finance Queries
  { path: "/manager/finance-queries", component: BranchFinanceQueries },
];

export const branchManagerRoutes = createBranchManagerRoutes();

// FALLBACK ROUTE
export const fallbackRoute = {
  path: "*",
  component: NotFoundPage,
};

// ROUTE CATEGORIES FOR NAVIGATION LOGIC
export const routeCategories = {
  public: publicRoutes.map((route) => route.path),
  admin: adminRoutes.map((route) => route.path),
  customer: customerRoutes.map((route) => route.path),
  branchManager: branchManagerRoutes.map((route) => route.path),
  immediate: immediateRoutes.map((route) => route.path),
};

// Helper function to determine route category
export const getRouteCategory = (
  path: string,
): "public" | "admin" | "customer" | "branchManager" | "immediate" => {
  if (path.startsWith("/admin/")) return "admin";
  if (path.startsWith("/customer/")) return "customer";
  if (path.startsWith("/manager/")) return "branchManager";
  if (routeCategories.immediate.includes(path)) return "immediate";
  return "public";
};

// Helper function to check if route requires authentication
export const requiresAuth = (path: string): boolean => {
  return (
    path.startsWith("/admin/") ||
    path.startsWith("/customer/") ||
    path.startsWith("/manager/")
  );
};

// Helper function to check if route is admin-only
export const requiresAdminAuth = (path: string): boolean => {
  return path.startsWith("/admin/");
};

// Helper function to check if route is customer-only
export const requiresCustomerAuth = (path: string): boolean => {
  return path.startsWith("/customer/");
};

// Helper function to check if route is branch manager only
export const requiresBranchManagerAuth = (path: string): boolean => {
  return path.startsWith("/manager/");
};
