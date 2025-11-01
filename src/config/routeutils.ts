// Enhanced navigation utilities for role-based routing
import { NavigateFunction } from "react-router-dom";

export const ROUTES = {
  HOME: "/",
  FINANCE: "/finance",
  CONTACT: "/contact",
  BOOK_SERVICE: "/customer/book-service",
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
      STOCK_CONCEPT: "/admin/forms/stock-concept",
    },
    VIEW: {
      VAS: "/admin/view/vas",
      STOCK_CONCEPT: "/admin/view/stock-concept",
    },
    ASSIGN: {
      STOCK_CONCEPT: (id: string) => `/admin/assign/stock-concept/${id}`,
      VAS: (id: string) => `/admin/assign/VAS/${id}`,
      SERVICE_ADDONS: (id: string) => `/admin/assign/SERVICE_ADDONS/${id}`,
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
    GENERATE_TAGS: "/customer/generate-tags",
    //
    DASHBOARD: "/customer/dashboard",
    PROFILE_INFO: "/customer/profile-info",
    SERVICES: "/customer/services",
    SUPPORT: "/customer/support",
    NOTIFICATION: "/customer/notification",
    BOOK_SERVICE: "/customer/book-service",
    SERVICE_HISTORY: "/customer/service-history",
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
    "/customer/book-service",
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
