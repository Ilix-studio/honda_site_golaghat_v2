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
    CUSTOMER_SIGNUP: "/admin/customer-signup",
    DASHBOARD: "/admin/dashboard",
    BRANCHES: {
      ADD: "/admin/branches/add",
      MANAGERS: "/admin/branches/managers",
      VIEW: "/admin/branches/view",
    },
    SERVICE_ADMINS: {
      ADD: "/admin/service-admins/add",
      MANAGERS: "/admin/service-admins/managers",
      VIEW: "/admin/service-admins/view",
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

  BRANCH_MANAGER: {
    LOGIN: "/manager-login",
    DASHBOARD: "/manager/dashboard",
    SERVICE_BOOKINGS: "/manager/service-bookings",
    ACCIDENT_REPORTS: "/manager/accident-reports",
    ENQUIRIES: "/manager/enquiries",
    APPLICATIONS: "/manager/applications",
    STOCK: "/manager/stock",
    VAS: "/manager/vas",
    CUSTOMER_VEHICLES: "/manager/customer-vehicles",
    FINANCE_QUERIES: "/manager/finance-queries",
  },

  SERVICE_ADMIN: {
    LOGIN: "/service-login",
    DASHBOARD: "/service/dashboard",
  },

  STAFF: {
    LOGIN: "/staff-login",
    DASHBOARD: "/staff/dashboard",
  },

  CUSTOMER: {
    LOGIN: "/customer/login",
    INITIALIZE: "/customer/first-dash",
    PROFILE: { CREATE: "/customer/profile/create" },
    GENERATE_TAGS: "/customer/generate-tags",
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

// ─── Types ───────────────────────────────────────────────────────────────────

export type UserRole =
  | "Super-Admin"
  | "Branch-Admin"
  | "Service-Admin"
  | "Staff"
  | "Customer";

export interface NavigationUser {
  role: UserRole;
  isAuthenticated: boolean;
  id: string;
  name?: string;
  email?: string;
}

// ─── Customer paths that Branch-Admin can access ─────────────────────────────

const BRANCH_ADMIN_ALLOWED_CUSTOMER_PATHS = [
  "/customer/first-dash",
  "/customer/initialize",
  "/customer/select/stock",
  "/customer/vehicle/info",
  "/customer/assign/csv-stock",
  "/customer/profile/create",
  "/customer/services/vas",
  "/customer/attach-stickers",
];

const isBranchAdminAllowedCustomerPath = (path: string): boolean =>
  BRANCH_ADMIN_ALLOWED_CUSTOMER_PATHS.some((p) => path.startsWith(p));

// ─── Route detection helpers ─────────────────────────────────────────────────

export const isAdminRoute = (path: string): boolean =>
  path.startsWith("/admin");

export const isBranchManagerRoute = (path: string): boolean =>
  path.startsWith("/manager") || path === "/manager-login";

export const isServiceAdminRoute = (path: string): boolean =>
  path.startsWith("/service");

export const isStaffRoute = (path: string): boolean =>
  path.startsWith("/staff");

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
    (publicPath) => path === publicPath || path.startsWith(`${publicPath}/`),
  );
};

// ─── Role → dashboard mapping ────────────────────────────────────────────────

const ROLE_DASHBOARDS: Record<UserRole, string> = {
  "Super-Admin": ROUTES.ADMIN.DASHBOARD,
  "Branch-Admin": ROUTES.BRANCH_MANAGER.DASHBOARD,
  "Service-Admin": ROUTES.SERVICE_ADMIN.DASHBOARD,
  Staff: ROUTES.STAFF.DASHBOARD,
  Customer: ROUTES.CUSTOMER.DASHBOARD,
};

// ─── Access control ──────────────────────────────────────────────────────────

export const canAccessRoute = (
  path: string,
  user: NavigationUser | null,
): { canAccess: boolean; redirectTo?: string; reason?: string } => {
  // Public routes — always accessible
  if (isPublicRoute(path)) return { canAccess: true };

  // Not authenticated — redirect to appropriate login
  if (!user?.isAuthenticated) {
    let redirectTo: string = ROUTES.ADMIN.LOGIN;
    if (isCustomerRoute(path)) redirectTo = ROUTES.CUSTOMER.LOGIN;
    else if (isBranchManagerRoute(path))
      redirectTo = ROUTES.BRANCH_MANAGER.LOGIN;
    else if (isServiceAdminRoute(path)) redirectTo = ROUTES.SERVICE_ADMIN.LOGIN;
    else if (isStaffRoute(path)) redirectTo = ROUTES.STAFF.LOGIN;

    return { canAccess: false, redirectTo, reason: "Authentication required" };
  }

  const dashboard = ROLE_DASHBOARDS[user.role] || ROUTES.HOME;

  // ── Admin routes (/admin/*) ────────────────────────────────────────
  if (isAdminRoute(path)) {
    if (user.role === "Customer") {
      return {
        canAccess: false,
        redirectTo: ROUTES.CUSTOMER.DASHBOARD,
        reason: "Admin access required",
      };
    }

    // Super-Admin-only paths
    if (
      (path.includes("/branches/add") ||
        path.includes("/branches/managers") ||
        path.includes("/service-admins/")) &&
      user.role !== "Super-Admin"
    ) {
      return {
        canAccess: false,
        redirectTo: dashboard,
        reason: "Super-Admin access required",
      };
    }

    return { canAccess: true };
  }

  // ── Branch Manager routes (/manager/*) ─────────────────────────────
  if (isBranchManagerRoute(path)) {
    if (user.role === "Branch-Admin" || user.role === "Super-Admin") {
      return { canAccess: true };
    }
    return {
      canAccess: false,
      redirectTo: dashboard,
      reason: "Branch Admin access required",
    };
  }

  // ── Service Admin routes (/service/*) ──────────────────────────────
  if (isServiceAdminRoute(path)) {
    if (user.role === "Service-Admin" || user.role === "Super-Admin") {
      return { canAccess: true };
    }
    return {
      canAccess: false,
      redirectTo: dashboard,
      reason: "Service Admin access required",
    };
  }

  // ── Staff routes (/staff/*) ────────────────────────────────────────
  if (isStaffRoute(path)) {
    if (user.role === "Staff" || user.role === "Super-Admin") {
      return { canAccess: true };
    }
    return {
      canAccess: false,
      redirectTo: dashboard,
      reason: "Staff access required",
    };
  }

  // ── Customer routes (/customer/*) ──────────────────────────────────
  if (isCustomerRoute(path)) {
    // Customers can access their own routes
    if (user.role === "Customer") {
      return { canAccess: true };
    }

    // Branch-Admin can access specific customer setup paths
    if (
      user.role === "Branch-Admin" &&
      isBranchAdminAllowedCustomerPath(path)
    ) {
      return { canAccess: true };
    }

    // All other roles/paths — blocked
    return {
      canAccess: false,
      redirectTo: dashboard,
      reason: "Customer access required",
    };
  }

  return { canAccess: true };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const getDefaultRoute = (user: NavigationUser | null): string => {
  if (!user?.isAuthenticated) return ROUTES.HOME;
  return ROLE_DASHBOARDS[user.role] || ROUTES.HOME;
};

export const safeNavigate = (
  navigate: NavigateFunction,
  path: string,
  user: NavigationUser | null,
): void => {
  const { canAccess, redirectTo } = canAccessRoute(path, user);
  navigate(canAccess ? path : redirectTo || ROUTES.HOME);
};
