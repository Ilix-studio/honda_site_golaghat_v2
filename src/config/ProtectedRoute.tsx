import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux-store/store";
import { selectBranchAuth } from "@/redux-store/slices/branchAuthSlice";
import { useAppSelector } from "@/hooks/redux";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?:
    | "admin"
    | "customer"
    | "admin-or-customer"
    | "super-admin-only"
    | "branch-manager";
  adminCanAccess?: boolean; // Allow admin access to customer routes
  customerRestrictedPaths?: string[]; // Specific paths customers cannot access
  redirectTo?: string;
}

// Define paths that only admins should access even in customer routes
const ADMIN_ONLY_CUSTOMER_PATHS = [
  "/customer/first-dash",
  "/customer/initialize",
  "/customer/select/stock",
  "/customer/vehicle/info",
  "/customer/assign/csv-stock",
  "/customer/profile/create",
  "/customer/assign/csv-stock",
  "/customer/services/vas",
  "/customer/attach-stickers",
];

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  adminCanAccess = true,
  customerRestrictedPaths = ADMIN_ONLY_CUSTOMER_PATHS,
  redirectTo,
}) => {
  const location = useLocation();

  // Get auth state from Redux
  const authState = useSelector((state: RootState) => state.auth);
  const customerAuthState = useSelector(
    (state: RootState) => state.customerAuth,
  );
  const branchAuth = useAppSelector(selectBranchAuth);

  const { isAuthenticated, user, userType, adminRole } = {
    isAuthenticated:
      authState?.isAuthenticated ||
      customerAuthState?.isAuthenticated ||
      branchAuth?.isAuthenticated ||
      false,
    user:
      authState?.user ||
      customerAuthState?.customer ||
      branchAuth?.user ||
      null,
    userType: customerAuthState?.customer
      ? "customer"
      : authState?.user
        ? "admin"
        : branchAuth?.user
          ? "branch-manager"
          : null,
    adminRole: authState?.user?.role || null,
  };

  // Helper function to check if current path is admin-restricted
  const isAdminRestrictedPath = (path: string): boolean => {
    return customerRestrictedPaths.some((restrictedPath) =>
      path.startsWith(restrictedPath),
    );
  };

  // Helper function to check admin privileges
  const hasAdminPrivileges = (): boolean => {
    return (
      userType === "admin" &&
      (adminRole === "Super-Admin" || adminRole === "Branch-Admin")
    );
  };

  // Helper function to check super admin privileges
  const hasSuperAdminPrivileges = (): boolean => {
    return userType === "admin" && adminRole === "Super-Admin";
  };

  // Not authenticated - redirect to appropriate login
  if (!isAuthenticated || !user) {
    const loginPath =
      requiredRole === "customer"
        ? "/customer/login"
        : requiredRole === "branch-manager"
          ? "/manager-login"
          : "/admin/login";
    const redirectPath = redirectTo || loginPath;

    return (
      <Navigate to={redirectPath} state={{ from: location.pathname }} replace />
    );
  }

  // Role-based access control
  if (requiredRole) {
    switch (requiredRole) {
      case "super-admin-only":
        if (!hasSuperAdminPrivileges()) {
          const fallbackPath =
            userType === "admin"
              ? "/admin/dashboard"
              : userType === "customer"
                ? "/customer/dashboard"
                : "/";
          return <Navigate to={fallbackPath} replace />;
        }
        break;

      case "admin":
        if (!hasAdminPrivileges()) {
          const fallbackPath =
            userType === "customer" ? "/customer/dashboard" : "/";
          return <Navigate to={fallbackPath} replace />;
        }
        break;

      case "customer":
        const currentPath = location.pathname;

        if (userType === "customer") {
          if (isAdminRestrictedPath(currentPath)) {
            return <Navigate to='/customer/dashboard' replace />;
          }
          return <>{children}</>;
        } else if (userType === "admin") {
          if (adminCanAccess && hasAdminPrivileges()) {
            return <>{children}</>;
          } else {
            return <Navigate to='/admin/dashboard' replace />;
          }
        } else if (userType === "branch-manager") {
          // Branch Manager gets same access as admin on customer routes
          if (branchAuth.isAuthenticated) {
            return <>{children}</>;
          }
          return <Navigate to='/manager-login' replace />;
        } else {
          return <Navigate to='/' replace />;
        }
        break;

      case "admin-or-customer":
        if (
          userType === "customer" ||
          hasAdminPrivileges() ||
          branchAuth.isAuthenticated
        ) {
          return <>{children}</>;
        } else {
          return <Navigate to='/' replace />;
        }
        break;

      case "branch-manager":
        // Check dedicated branchAuth slice — NOT the shared authSlice
        if (!branchAuth.isAuthenticated) {
          return <Navigate to='/manager-login' replace />;
        }
        break;

      default:
        console.warn(`Unknown requiredRole: ${requiredRole}`);
        break;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
