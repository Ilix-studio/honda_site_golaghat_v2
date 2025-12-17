import { lazy } from "react";

// IMMEDIATE ROUTES - No lazy loading for critical routes
// Essential components that should load immediately
import Home from "../Home";
import NotFoundPage from "../mainComponents/NotFoundPage";
import { ViewBikeImage } from "@/mainComponents/Admin/Bikes/ViewBikeImage";

export const immediateRoutes = [
  {
    path: "/",
    component: Home,
  },
];

// PUBLIC ROUTES - With lazy loading
// Public pages accessible to everyone
const Finance = lazy(() => import("../mainComponents/NavMenu/Finance"));
const Contact = lazy(() => import("../mainComponents/NavMenu/Contact"));
const BranchesPage = lazy(
  () => import("../mainComponents/NavMenu/Branches/BranchesPage")
);
const BranchDetailPage = lazy(
  () => import("../mainComponents/NavMenu/Branches/BranchDetailPage")
);
const ViewAllBikes = lazy(() =>
  import("../mainComponents/BikeDetails/ViewAllBikes").then((module) => ({
    default: module.ViewAllBikes,
  }))
);
const BikeDetailsPage = lazy(
  () => import("../mainComponents/BikeDetails/BikeDetailsPage")
);
const ScooterDetailPage = lazy(
  () => import("../mainComponents/BikeDetails/ScooterDetailPage")
);
const CompareBike = lazy(
  () => import("../mainComponents/BikeDetails/CompareBikes/CompareBike")
);
const BookServicePage = lazy(
  () => import("../mainComponents/BookService/BookServicePage")
);
const SearchResults = lazy(
  () => import("../mainComponents/Search/SearchResults")
);

// View System - Public access
const ViewAllBranches = lazy(
  () => import("../mainComponents/ViewBS2/ViewAllBranches")
);
const ViewVAS = lazy(() => import("../mainComponents/ViewBS2/ViewVAS"));

const ViewStockConcept = lazy(
  () => import("../mainComponents/ViewBS2/ViewStockConcept")
);
const DownloadSafetyfeature = lazy(
  () => import("../mainComponents/ViewBS2/DownloadSafetyfeature")
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

  // Services

  { path: "/search", component: SearchResults },

  // Public View System
  { path: "/admin/branches/view", component: ViewAllBranches },
  { path: "/admin/view/vas", component: ViewVAS },

  { path: "/view/stock-concept", component: ViewStockConcept },
  {
    path: "/download/safety-feature-stickers",
    component: DownloadSafetyfeature,
  },
];

// ADMIN ROUTES - Protected routes with /admin prefix

// Admin Authentication
const LoginSuperAdmin = lazy(
  () => import("../mainComponents/Admin/LoginSuperAdmin")
);
const LoginBranchManager = lazy(
  () => import("../mainComponents/Admin/LoginBranchManager")
);

// Admin Dashboard
const AdminDashboard = lazy(
  () => import("../mainComponents/Admin/AdminDash/AdminDashboard")
);

// Branch Management
const AddBranch = lazy(
  () => import("../mainComponents/NavMenu/Branches/AddBranch")
);
const BranchManager = lazy(
  () => import("../mainComponents/Admin/BranchM/BranchManager")
);

// Bike Management
const AddBikes = lazy(() => import("../mainComponents/Admin/Bikes/AddBikes"));
const EditBikes = lazy(() => import("../mainComponents/Admin/Bikes/EditBikes"));
const AddBikeImage = lazy(
  () => import("../mainComponents/Admin/Bikes/AddBikeImage")
);
const EditBikeImage = lazy(
  () => import("../mainComponents/Admin/Bikes/EditBikeImage")
);

// Customer Management (Admin only)

// Business System Forms
const VASForm = lazy(() => import("../mainComponents/BikeSystem2/VASForm"));

const StockConceptForm = lazy(
  () => import("../mainComponents/BikeSystem2/StockConceptForm")
);

const AdminBookingsManager = lazy(
  () => import("@/mainComponents/Admin/ServiceBookings/AdminBookingsManager")
);
const CustomerSignUp = lazy(
  () => import("@/mainComponents/CustomerSystem/CustomerSignUp")
);
const AssignStock = lazy(
  () => import("@/mainComponents/CustomerSystem/ActivateFeature/AssignStock")
);
const UploadCSVForm = lazy(
  () => import("@/mainComponents/BikeSsytem3/UploadCSVForm")
);
const SelectStockForm = lazy(
  () => import("@/mainComponents/BikeSsytem3/SelectStockForm")
);

const GetCSVFiles = lazy(
  () => import("@/mainComponents/BikeSsytem3/GetCSVFiles")
);

const GetAllStockFiles = lazy(
  () => import("@/mainComponents/BikeSsytem3/GetAllStockFiles")
);

// Create admin routes array
const createAdminRoutes = () => [
  // Authentication
  { path: "/admin/login", component: LoginSuperAdmin },
  { path: "/admin/manager-login", component: LoginBranchManager },

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

  // Customer Management
  { path: "/admin/customers/signup", component: CustomerSignUp },

  // Business System Forms
  { path: "/admin/forms/vas", component: VASForm },

  { path: "/admin/forms/select", component: SelectStockForm },
  { path: "/admin/forms/stock-concept", component: StockConceptForm },
  { path: "/admin/forms/stock-concept-csv", component: UploadCSVForm },
  { path: "/admin/get/all-stock", component: GetAllStockFiles },
  { path: "/admin/get/csv", component: GetCSVFiles },

  // Assignment System
  { path: "/admin/assign/stock-concept/:id", component: AssignStock },

  //Service Booking
  { path: "/admin/service-bookings", component: AdminBookingsManager },
];

export const adminRoutes = createAdminRoutes();

// CUSTOMER ROUTES - Protected routes with /customer prefix

// Customer Dashboard
const InitialDashboard = lazy(
  () => import("../mainComponents/CustomerSystem/Dashboards/InitialDashboard")
);
const CustomerMainDash = lazy(
  () => import("../mainComponents/CustomerSystem/Dashboards/CustomerMainDash")
);

// Customer Profile
const CustomerCreateProfile = lazy(
  () => import("../mainComponents/CustomerSystem/CustomerCreateProfile")
);

// Customer Vehicle Management
const CustomerVehicleInfo = lazy(
  () => import("../mainComponents/BikeSystem2/CustomerVehicleInfo")
);

// Customer Services
const GenerateTags = lazy(
  () => import("../mainComponents/CustomerSystem/GenerateTags")
);
const ActivateVAS = lazy(
  () => import("../mainComponents/CustomerSystem/ActivateFeature/ActivateVAS")
);

const CustomerServices = lazy(
  () => import("../mainComponents/CustomerSystem/Head/CustomerServices")
);

const CustomerSupport = lazy(
  () => import("@/mainComponents/CustomerSystem/Head/CustomerSupport")
);

const CustomerProfile = lazy(
  () => import("@/mainComponents/CustomerSystem/CustomerProfile")
);

// Create customer routes array
const createCustomerRoutes = () => {
  const CustomerLoginComponent = lazy(async () => {
    const module = await import(
      "../mainComponents/CustomerSystem/CustomerLogin"
    );
    return { default: module.default };
  });

  return [
    // Authentication & Profile
    { path: "/customer/login", component: CustomerLoginComponent },
    { path: "/customer/profile/create", component: CustomerCreateProfile },

    // Dashboard
    { path: "/customer/initialize", component: InitialDashboard },
    { path: "/customer/dashboard", component: CustomerMainDash },
    { path: "/customer/profile-info", component: CustomerProfile },
    { path: "/customer/services", component: CustomerServices },
    { path: "/customer/support", component: CustomerSupport },

    // Vehicle Management
    { path: "/customer/vehicle/info", component: CustomerVehicleInfo },

    // Select Services by Admin
    { path: "/customer/tags/generate", component: GenerateTags },
    { path: "/customer/services/vas", component: ActivateVAS },
    { path: "/customer/book-service", component: BookServicePage },
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
  "/customer/dashboard": {
    title: "",
    subtitle: "",
  },
  "/customer/services": {
    title: "My Services",
    subtitle: "Manage your service bookings",
    showBack: true,
    backTo: "/customer/dashboard",
    menuItems: [
      { label: "Book Service", href: "/customer/services" },
      { label: "Service History", href: "/customer/service-history" },
    ],
  },
  "/customer/book-service": {
    title: "Book Service",
    subtitle: "Schedule your motorcycle service",
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
};

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
  immediate: immediateRoutes.map((route) => route.path),
};

// Helper function to determine route category
export const getRouteCategory = (
  path: string
): "public" | "admin" | "customer" | "immediate" => {
  if (path.startsWith("/admin/")) return "admin";
  if (path.startsWith("/customer/")) return "customer";
  if (routeCategories.immediate.includes(path)) return "immediate";
  return "public";
};

// Helper function to check if route requires authentication
export const requiresAuth = (path: string): boolean => {
  return path.startsWith("/admin/") || path.startsWith("/customer/");
};

// Helper function to check if route is admin-only
export const requiresAdminAuth = (path: string): boolean => {
  return path.startsWith("/admin/");
};

// Helper function to check if route is customer-only
export const requiresCustomerAuth = (path: string): boolean => {
  return path.startsWith("/customer/");
};
