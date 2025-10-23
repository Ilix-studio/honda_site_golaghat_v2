import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux-store/store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?:
    | "admin"
    | "customer"
    | "admin-or-customer"
    | "super-admin-only";
  adminCanAccess?: boolean; // Allow admin access to customer routes
  customerRestrictedPaths?: string[]; // Specific paths customers cannot access
  redirectTo?: string;
}

// Define paths that only admins should access even in customer routes
const ADMIN_ONLY_CUSTOMER_PATHS = [
  "/customer/profile/create", // Admin creates customer profiles
  "/customer/services/assign", // Admin assigns services
  "/customer/vehicle/assign", // Admin assigns vehicles
  "/customer/tags/generate", // Admin generates tags for customers
  "/customer/services/activate", // Admin activates services
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
    (state: RootState) => state.customerAuth
  );

  const { isAuthenticated, user, userType, adminRole } = {
    isAuthenticated:
      authState?.isAuthenticated || customerAuthState?.isAuthenticated || false,
    user: authState?.user || customerAuthState?.customer || null,
    userType: authState?.user
      ? "admin"
      : customerAuthState?.customer
      ? "customer"
      : null,
    adminRole: authState?.user?.role || null, // "Super-Admin" or "Branch-Admin"
  };

  // Helper function to check if current path is admin-restricted
  const isAdminRestrictedPath = (path: string): boolean => {
    return customerRestrictedPaths.some((restrictedPath) =>
      path.startsWith(restrictedPath)
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
      requiredRole === "customer" ? "/customer/login" : "/admin/login";
    const redirectPath = redirectTo || loginPath;

    return (
      <Navigate to={redirectPath} state={{ from: location.pathname }} replace />
    );
  }

  // Role-based access control
  if (requiredRole) {
    switch (requiredRole) {
      case "super-admin-only":
        // Only Super-Admin can access
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
        // Only admins can access
        if (!hasAdminPrivileges()) {
          const fallbackPath =
            userType === "customer" ? "/customer/dashboard" : "/";
          return <Navigate to={fallbackPath} replace />;
        }
        break;

      case "customer":
        // Customer routes with admin override capability
        const currentPath = location.pathname;

        if (userType === "customer") {
          // Customer accessing routes
          if (isAdminRestrictedPath(currentPath)) {
            // Customer trying to access admin-only customer route
            return <Navigate to='/customer/dashboard' replace />;
          }
          // Customer can access their allowed routes
          return <>{children}</>;
        } else if (userType === "admin") {
          // Admin accessing customer routes
          if (adminCanAccess && hasAdminPrivileges()) {
            // Admin has permission to access customer routes for administrative tasks
            return <>{children}</>;
          } else {
            // Admin doesn't have permission or adminCanAccess is false
            return <Navigate to='/admin/dashboard' replace />;
          }
        } else {
          // Neither customer nor admin
          return <Navigate to='/' replace />;
        }
        break;

      case "admin-or-customer":
        // Both admin and customer can access
        if (userType === "customer" || hasAdminPrivileges()) {
          return <>{children}</>;
        } else {
          const fallbackPath = "/";
          return <Navigate to={fallbackPath} replace />;
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
