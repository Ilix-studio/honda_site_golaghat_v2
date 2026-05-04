import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux-store/store";

// ─── Types ───────────────────────────────────────────────────────────────────

type RequiredRole =
  | "admin"
  | "customer"
  | "admin-or-customer"
  | "super-admin-only"
  | "branch-admin"
  | "service-admin"
  | "staff"
  | "branch-admin-or-super-admin"
  | "service-admin-or-super-admin";

type AdminRole =
  | "Super-Admin"
  | "Branch-Admin"
  | "Service-Admin"
  | "Staff"
  | null;

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: RequiredRole;
  adminCanAccess?: boolean;
  customerRestrictedPaths?: string[];
  redirectTo?: string;
}

// ─── Customer setup paths — ONLY Branch-Admin can access these ───────────────
// Super-Admin, Service-Admin, Staff, and Customers are all blocked.

const BRANCH_ADMIN_ONLY_CUSTOMER_PATHS = [
  "/customer/first-dash",
  "/customer/initialize",
  "/customer/select/stock",
  "/customer/vehicle/info",
  "/customer/assign/csv-stock",
  "/customer/profile/create",
  "/customer/services/vas",
  "/customer/attach-stickers",
];

// ─── Role → dashboard mapping ────────────────────────────────────────────────

const ROLE_DASHBOARDS: Record<string, string> = {
  "Super-Admin": "/admin/dashboard",
  "Branch-Admin": "/manager/dashboard",
  "Service-Admin": "/service/dashboard",
  Staff: "/staff/dashboard",
  customer: "/customer/dashboard",
};

// ─── Role → login path mapping ───────────────────────────────────────────────

const ROLE_LOGIN_PATHS: Record<string, string> = {
  admin: "/admin/login",
  customer: "/customer/login",
  "super-admin-only": "/admin/login",
  "branch-admin": "/manager-login",
  "service-admin": "/service-login",
  staff: "/staff-login",
  "branch-admin-or-super-admin": "/admin/login",
  "service-admin-or-super-admin": "/admin/login",
  "admin-or-customer": "/admin/login",
};

// ─── Component ───────────────────────────────────────────────────────────────

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  adminCanAccess = true,
  customerRestrictedPaths = BRANCH_ADMIN_ONLY_CUSTOMER_PATHS,
  redirectTo,
}) => {
  const location = useLocation();

  const authState = useSelector((state: RootState) => state.auth);
  const customerAuthState = useSelector(
    (state: RootState) => state.customerAuth,
  );

  const isAuthenticated =
    authState?.isAuthenticated || customerAuthState?.isAuthenticated || false;

  const user = authState?.user || customerAuthState?.customer || null;

  // Admin session ALWAYS takes priority.
  // After CustomerSignUp, both authState.user (Branch-Admin) and
  // customerAuthState.customer exist simultaneously. If we check
  // customerAuthState first, userType becomes "customer" and the
  // Branch-Admin gets blocked from setup paths.
  const userType: "admin" | "customer" | null =
    authState?.isAuthenticated && authState?.user
      ? "admin"
      : customerAuthState?.isAuthenticated && customerAuthState?.customer
        ? "customer"
        : null;

  const adminRole: AdminRole = (authState?.user?.role as AdminRole) || null;

  // ── Helpers ──────────────────────────────────────────────────────────

  const getDashboard = (): string => {
    if (userType === "customer") return ROLE_DASHBOARDS.customer;
    if (adminRole) return ROLE_DASHBOARDS[adminRole] || "/";
    return "/";
  };

  const hasRole = (...roles: string[]): boolean =>
    userType === "admin" && adminRole !== null && roles.includes(adminRole);

  const hasAnyAdminRole = (): boolean =>
    hasRole("Super-Admin", "Branch-Admin", "Service-Admin", "Staff");

  const isBranchAdmin = (): boolean => hasRole("Branch-Admin");

  const isBranchAdminRestrictedPath = (path: string): boolean =>
    customerRestrictedPaths.some((p) => path.startsWith(p));

  // ── Not authenticated ────────────────────────────────────────────────

  if (!isAuthenticated || !user) {
    const loginPath =
      redirectTo || ROLE_LOGIN_PATHS[requiredRole || "admin"] || "/admin/login";

    return (
      <Navigate to={loginPath} state={{ from: location.pathname }} replace />
    );
  }

  // ── No role requirement ──────────────────────────────────────────────

  if (!requiredRole) {
    return <>{children}</>;
  }

  // ── Role-based access control ────────────────────────────────────────

  switch (requiredRole) {
    case "super-admin-only":
      if (!hasRole("Super-Admin")) {
        return <Navigate to={getDashboard()} replace />;
      }
      break;

    case "admin":
      if (!hasAnyAdminRole()) {
        return <Navigate to={getDashboard()} replace />;
      }
      break;

    case "branch-admin":
      if (!hasRole("Branch-Admin")) {
        return <Navigate to={getDashboard()} replace />;
      }
      break;

    case "service-admin":
      if (!hasRole("Service-Admin")) {
        return <Navigate to={getDashboard()} replace />;
      }
      break;

    case "staff":
      if (!hasRole("Staff")) {
        return <Navigate to={getDashboard()} replace />;
      }
      break;

    case "branch-admin-or-super-admin":
      if (!hasRole("Branch-Admin", "Super-Admin")) {
        return <Navigate to={getDashboard()} replace />;
      }
      break;

    case "service-admin-or-super-admin":
      if (!hasRole("Service-Admin", "Super-Admin")) {
        return <Navigate to={getDashboard()} replace />;
      }
      break;

    case "customer": {
      const currentPath = location.pathname;

      if (userType === "customer") {
        // Customers cannot access branch-admin-only setup paths
        if (isBranchAdminRestrictedPath(currentPath)) {
          return <Navigate to='/customer/dashboard' replace />;
        }
        return <>{children}</>;
      }

      if (userType === "admin") {
        // Branch-Admin-only customer setup paths
        if (isBranchAdminRestrictedPath(currentPath)) {
          if (isBranchAdmin()) {
            return <>{children}</>;
          }
          // Super-Admin, Service-Admin, Staff → redirected to their dashboard
          return <Navigate to={getDashboard()} replace />;
        }

        // Non-restricted customer paths (e.g. /customer/dashboard)
        // Branch-Admin can access if adminCanAccess is true
        if (adminCanAccess && isBranchAdmin()) {
          return <>{children}</>;
        }

        // All other admin roles → blocked from customer routes entirely
        return <Navigate to={getDashboard()} replace />;
      }

      return <Navigate to='/' replace />;
    }

    case "admin-or-customer":
      if (userType === "customer" || hasAnyAdminRole()) {
        return <>{children}</>;
      }
      return <Navigate to='/' replace />;

    default:
      console.warn(`Unknown requiredRole: ${requiredRole}`);
      break;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
