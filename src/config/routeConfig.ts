// src/config/routeConfig.ts

import { lazy, type LazyExoticComponent, type ComponentType } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface RouteItem {
  path: string;
  component: LazyExoticComponent<ComponentType<any>> | ComponentType<any>;
}

interface RouteConfigEntry {
  title: string;
  subtitle: string;
  showBack?: boolean;
  backTo?: string;
  menuItems?: Array<{ label: string; href: string }>;
}

// ============================================================================
// IMMEDIATE ROUTES — No lazy loading for critical paths
// ============================================================================

import Home from "../SystemComponents/public/Home";
import NotFoundPage from "../SystemComponents/common/NotFoundPage";

export const immediateRoutes: RouteItem[] = [{ path: "/", component: Home }];

// ============================================================================
// PUBLIC ROUTES — Lazy loaded, accessible to everyone
// ============================================================================

// Navigation
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

// Bikes
const ViewAllBikes = lazy(() =>
  import("../SystemComponents/shared/BikeDetails/ViewAllBikes").then((m) => ({
    default: m.ViewAllBikes,
  })),
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
const BookServicePage = lazy(() =>
  import("../SystemComponents/authentication/CustomerSystem/BookService/SimpleBookService").then(
    (m) => ({
      default: m.SimpleBookService,
    }),
  ),
);
const SearchResults = lazy(
  () => import("../SystemComponents/public/Search/SearchResults"),
);

// View System — public access
const ViewAllBranches = lazy(
  () => import("../SystemComponents/shared/ViewBS2/ViewAllBranches"),
);
const ViewVAS = lazy(
  () => import("../SystemComponents/shared/ViewBS2/ViewVAS"),
);
const ViewStockConcept = lazy(
  () => import("../SystemComponents/shared/ViewBS2/ViewStockConcept"),
);
const DownloadSafetyfeature = lazy(
  () => import("../SystemComponents/shared/ViewBS2/DownloadSafetyfeature"),
);

// Get Approved / Enquiry
const GetApprovedForm = lazy(() =>
  import("../SystemComponents/shared/GetApproved/GetApprovedForm").then(
    (m) => ({
      default: m.GetApprovedForm,
    }),
  ),
);
const FinanceWithBikeEnquiry = lazy(() =>
  import("../SystemComponents/shared/GetApproved/FinanceWithBikeEnquiry").then(
    (m) => ({
      default: m.FinanceWithBikeEnquiry,
    }),
  ),
);

export const publicRoutes: RouteItem[] = [
  // Navigation pages
  { path: "/finance", component: Finance },
  { path: "/contact", component: Contact },
  { path: "/branches", component: BranchesPage },
  { path: "/branches/:id", component: BranchDetailPage },

  // Bikes
  { path: "/view-all", component: ViewAllBikes },
  { path: "/bikes/:id", component: BikeDetailsPage },
  { path: "/scooter/:id", component: ScooterDetailPage },
  { path: "/compare", component: CompareBike },
  { path: "/book-service", component: BookServicePage },
  { path: "/search", component: SearchResults },

  // View System
  { path: "/view/branches", component: ViewAllBranches },

  { path: "/view/stock-concept", component: ViewStockConcept },
  { path: "/download/safety-features", component: DownloadSafetyfeature },

  // Get Approved / Enquiry
  { path: "/get-approved", component: GetApprovedForm },
  { path: "/finance-enquiry", component: FinanceWithBikeEnquiry },
];

// ============================================================================
// SHARED COMPONENTS — Used by both Super-Admin and Branch-Admin
// ============================================================================

// Bike CRUD
const AddBikes = lazy(
  () => import("../SystemComponents/shared/BikesCRUD/AddBikes"),
);
const AddBikeImage = lazy(
  () => import("../SystemComponents/shared/BikesCRUD/AddBikeImage"),
);
const EditBikeImage = lazy(
  () => import("../SystemComponents/shared/BikesCRUD/EditBikeImage"),
);
const ViewBikeImage = lazy(() =>
  import("../SystemComponents/shared/BikesCRUD/ViewBikeImage").then((m) => ({
    default: m.ViewBikeImage,
  })),
);

// VAS
const SelectVas = lazy(
  () => import("../SystemComponents/shared/VAScrud/SelectVas"),
);
const VASForm = lazy(
  () => import("../SystemComponents/shared/VAScrud/VASForm"),
);

// Stock Concept
const SelectStockForm = lazy(
  () => import("../SystemComponents/shared/InventoryCSV/SelectStockForm"),
);
const StockConceptForm = lazy(
  () => import("../SystemComponents/shared/InventoryManual/StockConceptForm"),
);

// CSV Stock
const UploadCSVForm = lazy(
  () => import("../SystemComponents/shared/InventoryCSV/UploadCSVForm"),
);
const GetCSVFiles = lazy(
  () => import("../SystemComponents/shared/InventoryCSV/GetCSVFiles"),
);
const GetAllStockFiles = lazy(
  () => import("../SystemComponents/shared/InventoryCSV/GetAllStockFiles"),
);

// Assignment
const AssignStock = lazy(
  () => import("../SystemComponents/shared/ActivateFeature/AssignStock"),
);
const ChooseStock = lazy(
  () => import("../SystemComponents/shared/SelectStock/ChooseStock"),
);
const CustomerCSVStock = lazy(
  () => import("../SystemComponents/shared/SelectStock/CustomerCSVStock"),
);

// Service Bookings
const AdminBookingsManager = lazy(
  () =>
    import("../SystemComponents/authentication/Admin/ServiceBookings/AdminBookingsManager"),
);

// Finance
const FinanceQueries = lazy(
  () => import("../SystemComponents/shared/FinanceEnquiry/FinanceQueries"),
);

// Messages
const SeeMessages = lazy(
  () => import("../SystemComponents/authentication/Admin/SeeMessages"),
);

// Accident Reports
const GetAllAccidentReports = lazy(
  () =>
    import("../SystemComponents/shared/AcidentReport/GetAllAccidentReports"),
);
const GetAllAccidentReportsById = lazy(
  () =>
    import("../SystemComponents/shared/AcidentReport/GetAllAccidentReportsById"),
);

// Customer Management
const CustomerSignUp = lazy(
  () =>
    import("../SystemComponents/authentication/CustomerSystem/CustomerSignUp"),
);

// Enquiry Dashboard
const EnquiryDashboard = lazy(
  () => import("../SystemComponents/authentication/Admin/EnquiryDetailsView"),
);

// ============================================================================
// SHARED ROUTES — Identical paths (suffix) used by both admin & manager
// ============================================================================

const createSharedRoutes = (prefix: "/admin" | "/manager"): RouteItem[] => [
  // Bike CRUD
  { path: `${prefix}/bikes/add`, component: AddBikes },
  {
    path: `${prefix}/bikes/:bikeId/images/add`,
    component: AddBikeImage,
  },
  {
    path: `${prefix}/bikes/:bikeId/images/edit`,
    component: EditBikeImage,
  },
  { path: `${prefix}/bikes/images/:id`, component: ViewBikeImage },
  { path: `${prefix}/bikeimages/:bikeId`, component: ViewBikeImage },
  { path: `${prefix}/scootyimages/:bikeId`, component: ViewBikeImage },

  // VAS CRUD
  { path: `${prefix}/vas/select`, component: SelectVas },
  { path: `${prefix}/forms/vas`, component: VASForm },
  { path: `${prefix}/view/vas`, component: ViewVAS },

  // Stock CRUD
  { path: `${prefix}/stockC/select`, component: SelectStockForm },
  { path: `${prefix}/forms/stock-concept`, component: StockConceptForm },
  { path: `${prefix}/forms/stock-concept-csv`, component: UploadCSVForm },
  { path: `${prefix}/get/csv`, component: GetCSVFiles },
  { path: `${prefix}/get/all-stock`, component: GetAllStockFiles },
  { path: `${prefix}/assign/stock-concept/:id`, component: AssignStock },
  { path: `${prefix}/assign/choose-stock`, component: ChooseStock },
  { path: `${prefix}/assign/csv-stock`, component: CustomerCSVStock },

  // Service Bookings — Read, Update, Delete
  { path: `${prefix}/service-bookings`, component: AdminBookingsManager },

  // Finance — Read
  { path: `${prefix}/finanace-query`, component: FinanceQueries },

  // Accident Reports
  { path: `${prefix}/accident-reports`, component: GetAllAccidentReports },
  {
    path: `${prefix}/accident-reports/:id`,
    component: GetAllAccidentReportsById,
  },

  // Customer Management
  { path: `${prefix}/customers/signup`, component: CustomerSignUp },

  // Messages
  { path: `${prefix}/any-messages`, component: SeeMessages },

  // Enquiries
  { path: `${prefix}/enquiries`, component: EnquiryDashboard },
];

// ============================================================================
// ADMIN-ONLY ROUTES — Super-Admin exclusive
// ============================================================================

// Super-Admin auth
const LoginSuperAdmin = lazy(
  () => import("../SystemComponents/authentication/Admin/LoginSuperAdmin"),
);
const AdminDashboard = lazy(
  () =>
    import("../SystemComponents/authentication/Admin/AdminDash/AdminDashboard"),
);

// Branch management — Super-Admin only
const AddBranch = lazy(
  () => import("../SystemComponents/public/NavMenu/Branches/AddBranch"),
);
const BranchManager = lazy(
  () =>
    import("../SystemComponents/authentication/BranchManager/BranchManager"),
);

// Bike edit — Super-Admin only
const AdminEditBikes = lazy(
  () => import("../SystemComponents/shared/BikesCRUD/EditBikes"),
);

const createAdminRoutes = (): RouteItem[] => [
  // Auth
  { path: "/admin/login/super", component: LoginSuperAdmin },

  // Dashboard
  { path: "/admin/dashboard", component: AdminDashboard },

  // Super-Admin only: Branch management
  { path: "/admin/branches/add", component: AddBranch },
  { path: "/admin/managers", component: BranchManager },
  { path: "/admin/branches/view", component: ViewAllBranches },

  // Super-Admin only: Bike edit/delete
  { path: "/admin/bikes/edit/:id", component: AdminEditBikes },

  // Shared routes with /admin prefix
  ...createSharedRoutes("/admin"),
];

export const adminRoutes = createAdminRoutes();

// ============================================================================
// BRANCH MANAGER ROUTES — Branch-Admin
// ============================================================================

const LoginBranchManager = lazy(
  () =>
    import("../SystemComponents/authentication/BranchManager/LoginBranchManager"),
);
const BranchManagerDashboard = lazy(
  () =>
    import("../SystemComponents/authentication/BranchManager/BranchManagerDashboard"),
);

// Branch-specific wrapper (customer vehicles with branch scope)
const BranchCustomerVehicles = lazy(
  () =>
    import("../SystemComponents/authentication/BranchManager/BranchCustomerVehicles"),
);

const createBranchManagerRoutes = (): RouteItem[] => [
  // Auth
  { path: "/manager-login", component: LoginBranchManager },

  // Dashboard
  { path: "/manager/dashboard", component: BranchManagerDashboard },

  // Branch-scoped customer vehicles
  { path: "/manager/customer-vehicles", component: BranchCustomerVehicles },

  // Shared routes with /manager prefix
  ...createSharedRoutes("/manager"),
];

export const branchManagerRoutes = createBranchManagerRoutes();

// ============================================================================
// CUSTOMER ROUTES — Firebase auth required
// ============================================================================

const CustomerLogin = lazy(
  () =>
    import("../SystemComponents/authentication/CustomerSystem/CustomerLogin"),
);
const CustomerCreateProfile = lazy(
  () =>
    import("../SystemComponents/authentication/CustomerSystem/CustomerCreateProfile"),
);
const InitialDashboard = lazy(
  () =>
    import("../SystemComponents/authentication/CustomerSystem/Dashboards/InitialDashboard"),
);
const CustomerMainDash = lazy(
  () =>
    import("../SystemComponents/authentication/CustomerSystem/Dashboards/CustomerMainDash"),
);
const CustomerVehicleInfo = lazy(() =>
  import("../SystemComponents/authentication/CustomerSystem/CustomerBikeInfo").then(
    (m) => ({
      default: m.CustomerBikeInfo,
    }),
  ),
);
const SimpleBookService = lazy(() =>
  import("../SystemComponents/authentication/CustomerSystem/BookService/SimpleBookService").then(
    (m) => ({
      default: m.SimpleBookService,
    }),
  ),
);
const CustomerBikeInfo = lazy(() =>
  import("../SystemComponents/authentication/CustomerSystem/CustomerBikeInfo").then(
    (m) => ({
      default: m.CustomerBikeInfo,
    }),
  ),
);
const CustomerVehicleDetail = lazy(
  () =>
    import("../SystemComponents/shared/AssignCustomer/CustomerVehicleDetail"),
);

export const customerRoutes: RouteItem[] = [
  // Auth & Profile
  { path: "/customer/login", component: CustomerLogin },
  { path: "/customer/profile/create", component: CustomerCreateProfile },

  // Dashboard
  { path: "/customer/dashboard/initial", component: InitialDashboard },
  { path: "/customer/dashboard", component: CustomerMainDash },

  // Vehicle Management
  { path: "/customer/vehicle/info", component: CustomerVehicleInfo },
  { path: "/customer/vehicle/:id", component: CustomerVehicleDetail },
  { path: "/customer/bike-info", component: CustomerBikeInfo },

  // Services
  { path: "/customer/book-service", component: SimpleBookService },
];

// ============================================================================
// FALLBACK
// ============================================================================

export const fallbackRoute: RouteItem = {
  path: "*",
  component: NotFoundPage as any,
};

// ============================================================================
// ROUTE CATEGORIES & HELPERS
// ============================================================================

export const routeCategories = {
  public: publicRoutes.map((r) => r.path),
  admin: adminRoutes.map((r) => r.path),
  manager: branchManagerRoutes.map((r) => r.path),
  customer: customerRoutes.map((r) => r.path),
  immediate: immediateRoutes.map((r) => r.path),
};

export const getRouteCategory = (
  path: string,
): "public" | "admin" | "manager" | "customer" | "immediate" => {
  if (path.startsWith("/admin/")) return "admin";
  if (path.startsWith("/manager")) return "manager";
  if (path.startsWith("/customer/")) return "customer";
  if (routeCategories.immediate.includes(path)) return "immediate";
  return "public";
};

export const requiresAuth = (path: string): boolean =>
  path.startsWith("/admin/") ||
  path.startsWith("/manager") ||
  path.startsWith("/customer/");

export const requiresAdminAuth = (path: string): boolean =>
  path.startsWith("/admin/");

export const requiresBranchAuth = (path: string): boolean =>
  path.startsWith("/manager");

export const requiresCustomerAuth = (path: string): boolean =>
  path.startsWith("/customer/");

// ============================================================================
// ROUTE CONFIG — Title/subtitle/back for admin & manager headers
// ============================================================================

// Helper to generate shared config entries for both prefixes
const createSharedRouteConfig = (
  prefix: "/admin" | "/manager",
  backPrefix: string,
): Record<string, RouteConfigEntry> => ({
  // Bike management
  [`${prefix}/bikes/add`]: {
    title: "Add Motorcycle",
    subtitle: "Add new motorcycle to catalog",
    showBack: true,
    backTo: `${backPrefix}`,
  },
  [`${prefix}/bikes/:bikeId/images/add`]: {
    title: "Add Bike Images",
    subtitle: "Upload images for this motorcycle",
    showBack: true,
    backTo: `${backPrefix}`,
  },
  [`${prefix}/bikes/:bikeId/images/edit`]: {
    title: "Edit Bike Images",
    subtitle: "Manage motorcycle images",
    showBack: true,
    backTo: `${backPrefix}`,
  },
  [`${prefix}/bikes/images/:id`]: {
    title: "View Bike Image",
    subtitle: "View bike image details",
    showBack: true,
    backTo: `${backPrefix}`,
  },
  [`${prefix}/bikeimages/:bikeId`]: {
    title: "Bike Images",
    subtitle: "View all bike images",
    showBack: true,
    backTo: `${backPrefix}`,
  },
  [`${prefix}/scootyimages/:bikeId`]: {
    title: "Scooter Images",
    subtitle: "View all scooter images",
    showBack: true,
    backTo: `${backPrefix}`,
  },

  // VAS
  [`${prefix}/vas/select`]: {
    title: "Select VAS",
    subtitle: "Choose value-added service",
    showBack: true,
    backTo: `${backPrefix}`,
    menuItems: [{ label: "VAS Form", href: `${prefix}/forms/vas` }],
  },
  [`${prefix}/forms/vas`]: {
    title: "VAS Form",
    subtitle: "Configure value-added service",
    showBack: true,
    backTo: `${prefix}/vas/select`,
  },

  // Stock Concept
  [`${prefix}/stockC/select`]: {
    title: "Select Stock",
    subtitle: "Choose stock concept",
    showBack: true,
    backTo: `${backPrefix}`,
    menuItems: [
      { label: "Stock Form", href: `${prefix}/forms/stock-concept` },
      { label: "CSV Import", href: `${prefix}/forms/stock-concept-csv` },
    ],
  },
  [`${prefix}/forms/stock-concept`]: {
    title: "Stock Concept Form",
    subtitle: "Add stock concept details",
    showBack: true,
    backTo: `${prefix}/stockC/select`,
    menuItems: [
      { label: "CSV Import", href: `${prefix}/forms/stock-concept-csv` },
      { label: "All Stock", href: `${prefix}/get/all-stock` },
    ],
  },
  [`${prefix}/forms/stock-concept-csv`]: {
    title: "Import CSV Stock",
    subtitle: "Bulk stock upload via CSV",
    showBack: true,
    backTo: `${prefix}/stockC/select`,
    menuItems: [
      { label: "CSV Files", href: `${prefix}/get/csv` },
      { label: "All Stock", href: `${prefix}/get/all-stock` },
    ],
  },
  [`${prefix}/get/all-stock`]: {
    title: "All Stock Files",
    subtitle: "View and manage stock records",
    showBack: true,
    backTo: `${backPrefix}`,
    menuItems: [
      { label: "Add Stock", href: `${prefix}/stockC/select` },
      { label: "CSV Files", href: `${prefix}/get/csv` },
    ],
  },
  [`${prefix}/get/csv`]: {
    title: "CSV Files",
    subtitle: "Manage CSV stock imports",
    showBack: true,
    backTo: `${backPrefix}`,
    menuItems: [
      { label: "Import CSV", href: `${prefix}/forms/stock-concept-csv` },
      { label: "All Stock", href: `${prefix}/get/all-stock` },
    ],
  },
  [`${prefix}/assign/stock-concept/:id`]: {
    title: "Assign Stock",
    subtitle: "Assign stock to customer",
    showBack: true,
    backTo: `${prefix}/get/all-stock`,
  },
  [`${prefix}/assign/choose-stock`]: {
    title: "Choose Stock Source",
    subtitle: "Select manual or CSV stock for assignment",
    showBack: true,
    backTo: `${backPrefix}`,
  },
  [`${prefix}/assign/csv-stock`]: {
    title: "CSV Stock Assignment",
    subtitle: "Assign from CSV-imported stock",
    showBack: true,
    backTo: `${prefix}/assign/choose-stock`,
  },

  // Service Bookings
  [`${prefix}/service-bookings`]: {
    title: "Service Bookings",
    subtitle: "Manage all service appointments",
    showBack: true,
    backTo: `${backPrefix}`,
  },

  // Finance
  [`${prefix}/finanace-query`]: {
    title: "Finance Queries",
    subtitle: "Manage finance enquiries",
    showBack: true,
    backTo: `${backPrefix}`,
  },

  // Messages
  [`${prefix}/any-messages`]: {
    title: "Messages",
    subtitle: "Customer contact messages",
    showBack: true,
    backTo: `${backPrefix}`,
  },

  // Accident Reports
  [`${prefix}/accident-reports`]: {
    title: "Accident Reports",
    subtitle: "View all accident reports",
    showBack: true,
    backTo: `${backPrefix}`,
  },
  [`${prefix}/accident-reports/:id`]: {
    title: "Accident Report Detail",
    subtitle: "View report details",
    showBack: true,
    backTo: `${prefix}/accident-reports`,
  },

  // Enquiries
  [`${prefix}/enquiries`]: {
    title: "Enquiries",
    subtitle: "Manage customer enquiries",
    showBack: true,
    backTo: `${backPrefix}`,
  },
});

export const routeConfig: Record<string, RouteConfigEntry> = {
  // ── Admin-only entries ──
  "/admin/dashboard": {
    title: "Admin Dashboard",
    subtitle: "Honda Dealership Management System",
  },
  "/admin/branches/add": {
    title: "Add Branch",
    subtitle: "Create a new dealership branch",
    showBack: true,
    backTo: "/admin/dashboard",
  },
  "/admin/managers": {
    title: "Branch Managers",
    subtitle: "Manage branch administrator accounts",
    showBack: true,
    backTo: "/admin/dashboard",
  },
  "/admin/branches/view": {
    title: "View Branches",
    subtitle: "All dealership branches",
    showBack: true,
    backTo: "/admin/dashboard",
  },
  "/admin/bikes/edit/:id": {
    title: "Edit Motorcycle",
    subtitle: "Update motorcycle details",
    showBack: true,
    backTo: "/admin/dashboard",
  },

  // ── Shared entries for /admin ──
  ...createSharedRouteConfig("/admin", "/admin/dashboard"),

  // ── Manager-only entries ──
  "/manager/dashboard": {
    title: "Branch Dashboard",
    subtitle: "Branch operations management",
  },
  "/manager/customer-vehicles": {
    title: "Customer Vehicles",
    subtitle: "View customer vehicle information",
    showBack: true,
    backTo: "/manager/dashboard",
  },

  // ── Shared entries for /manager ──
  ...createSharedRouteConfig("/manager", "/manager/dashboard"),
};
