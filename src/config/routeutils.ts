// Enhanced navigation utilities for role-based routing
import { NavigateFunction } from "react-router-dom";

export const ROUTES = {
  HOME: "/",
  FINANCE: "/finance",
  CONTACT: "/contact",
  BOOK_SERVICE: "/book-service",
  SEARCH: "/search",
  COMPARE: "/compare",
  BRANCHES: "/branches",
  VIEW_ALL: "/view-all",

  ADMIN: {
    LOGIN: "/admin/login",
    MANAGER_LOGIN: "/admin/manager-login",
    CUSTOMER_SIGNUP: "/admin/customer-signup",
    DASHBOARD: "/admin/dashboard",

    BRANCHES: {
      ADD: "/admin/branches/add",
      MANAGERS: "/admin/branches/managers",
      VIEW: "/admin/branches/view",
    },

    BIKES: {
      ADD: "/admin/bikes/add",
      EDIT: (id: string) => `/admin/bikes/edit/${id}`,
      IMAGES: {
        ADD: (bikeId: string) => `/admin/bikes/${bikeId}/images/add`,
        EDIT: (bikeId: string) => `/admin/bikes/${bikeId}/images/edit`,
        VIEW: (id: string) => `/admin/bikes/images/${id}`,
      },
    },

    FORMS: {
      VAS: "/admin/forms/vas",
      SERVICE_ADDONS: "/admin/forms/service-addons",
      STOCK_CONCEPT: "/admin/forms/stock-concept",
    },

    VIEW: {
      VAS: "/admin/view/vas",
      SERVICE_ADDONS: "/admin/view/service-addons",
      STOCK_CONCEPT: "/admin/view/stock-concept",
    },

    ASSIGN: {
      STOCK_CONCEPT: (id: string) => `/admin/assign/stock-concept/${id}`,
    },

    INTEGRATE: {
      VAS: "/admin/integrate/vas",
      SERVICE_ADDONS: "/admin/integrate/service-addons",
    },
  },

  CUSTOMER: {
    LOGIN: "/customer/login",
    INITIALIZE: "/customer/initialize",
    PROFILE: { CREATE: "/customer/profile/create" },
    DASHBOARD: "/customer/dashboard",
    VEHICLE_INFO: "/customer/vehicle-info",
    GENERATE_TAGS: "/customer/generate-tags",
    BOOK_SERVICE: "/customer/book-service",
  },

  DOWNLOAD: { SAFETY_FEATURES: "/download/safety-features" },
} as const;

export type UserRole = "Super-Admin" | "Branch-Admin" | "Customer";

export interface NavigationUser {
  role: UserRole;
  isAuthenticated: boolean;
  id: string;
  name?: string;
  email?: string;
}

export const isAdminRoute = (path: string): boolean =>
  path.startsWith("/admin");
export const isCustomerRoute = (path: string): boolean =>
  path.startsWith("/customer");

export const isPublicRoute = (path: string): boolean => {
  const publicPaths = [
    "/",
    "/finance",
    "/contact",
    "/book-service",
    "/search",
    "/compare",
    "/branches",
    "/view-all",
    "/bikes",
    "/scooters",
    "/download",
  ];
  return publicPaths.some(
    (publicPath) => path === publicPath || path.startsWith(`${publicPath}/`)
  );
};

export const canAccessRoute = (
  path: string,
  user: NavigationUser | null
): { canAccess: boolean; redirectTo?: string; reason?: string } => {
  if (isPublicRoute(path)) return { canAccess: true };

  if (!user?.isAuthenticated) {
    return {
      canAccess: false,
      redirectTo: isCustomerRoute(path)
        ? ROUTES.CUSTOMER.LOGIN
        : ROUTES.ADMIN.LOGIN,
      reason: "Authentication required",
    };
  }

  if (isAdminRoute(path)) {
    if (user.role === "Customer") {
      return {
        canAccess: false,
        redirectTo: ROUTES.CUSTOMER.DASHBOARD,
        reason: "Admin access required",
      };
    }

    if (
      (path.includes("/branches/add") || path.includes("/branches/managers")) &&
      user.role !== "Super-Admin"
    ) {
      return {
        canAccess: false,
        redirectTo: ROUTES.ADMIN.DASHBOARD,
        reason: "Super-Admin access required",
      };
    }
  }

  if (isCustomerRoute(path) && user.role !== "Customer") {
    return {
      canAccess: false,
      redirectTo: ROUTES.ADMIN.DASHBOARD,
      reason: "Customer access required",
    };
  }

  return { canAccess: true };
};

export const getDefaultRoute = (user: NavigationUser | null): string => {
  if (!user?.isAuthenticated) return ROUTES.HOME;
  return user.role === "Customer"
    ? ROUTES.CUSTOMER.DASHBOARD
    : ROUTES.ADMIN.DASHBOARD;
};

export const safeNavigate = (
  navigate: NavigateFunction,
  path: string,
  user: NavigationUser | null
): void => {
  const { canAccess, redirectTo } = canAccessRoute(path, user);
  navigate(canAccess ? path : redirectTo || ROUTES.HOME);
};

// Legacy route mappings for backward compatibility
export const LEGACY_ROUTE_MAP: Record<string, string> = {
  "/admin/superlogin": ROUTES.ADMIN.LOGIN,
  "/admin/managerlogin": ROUTES.ADMIN.MANAGER_LOGIN,
  "/customer-login": ROUTES.CUSTOMER.LOGIN,
  "/customer-initialize": ROUTES.CUSTOMER.INITIALIZE,
  "/customer-profile": ROUTES.CUSTOMER.PROFILE.CREATE,
  "/customer-dash": ROUTES.CUSTOMER.DASHBOARD,
  "/admin/addbranch": ROUTES.ADMIN.BRANCHES.ADD,
  "/admin/managers": ROUTES.ADMIN.BRANCHES.MANAGERS,
  "/admin/addbikes": ROUTES.ADMIN.BIKES.ADD,
  "/admin/VAS-form": ROUTES.ADMIN.FORMS.VAS,
  "/admin/service-Addons": ROUTES.ADMIN.FORMS.SERVICE_ADDONS,
  "/admin/stock-concept": ROUTES.ADMIN.FORMS.STOCK_CONCEPT,
  "/view/all-branches": ROUTES.ADMIN.BRANCHES.VIEW,
  "/view/VAS": ROUTES.ADMIN.VIEW.VAS,
  "/view/service-Addons": ROUTES.ADMIN.VIEW.SERVICE_ADDONS,
  "/view/stock-concept": ROUTES.ADMIN.VIEW.STOCK_CONCEPT,
  "/integrate/VAS": ROUTES.ADMIN.INTEGRATE.VAS,
  "/integrate/service-Addons": ROUTES.ADMIN.INTEGRATE.SERVICE_ADDONS,
  "/customer-vehicle-info": ROUTES.CUSTOMER.VEHICLE_INFO,
  "/generate-tags": ROUTES.CUSTOMER.GENERATE_TAGS,
  "/dowmload/safety-feature-stickers": ROUTES.DOWNLOAD.SAFETY_FEATURES,
};
