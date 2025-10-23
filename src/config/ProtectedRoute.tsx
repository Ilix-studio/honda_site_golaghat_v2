import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux-store/store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "customer";
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo,
}) => {
  const location = useLocation();

  // Get auth state from Redux
  const { isAuthenticated, user, userType } = useSelector(
    (state: RootState) => ({
      isAuthenticated:
        state.auth?.isAuthenticated ||
        state.customerAuth?.isAuthenticated ||
        false,
      user: state.auth?.user || state.customerAuth?.customer || null,
      userType: state.auth?.user
        ? "admin"
        : state.customerAuth?.customer
        ? "customer"
        : null,
    })
  );

  // Not authenticated - redirect to appropriate login
  if (!isAuthenticated || !user) {
    const loginPath =
      requiredRole === "customer" ? "/customer/login" : "/admin/login/super";
    const redirectPath = redirectTo || loginPath;

    return (
      <Navigate to={redirectPath} state={{ from: location.pathname }} replace />
    );
  }

  // Wrong role - redirect to appropriate area
  if (requiredRole && userType !== requiredRole) {
    if (userType === "admin" && requiredRole === "customer") {
      return <Navigate to='/admin/dashboard' replace />;
    }
    if (userType === "customer" && requiredRole === "admin") {
      return <Navigate to='/customer/dashboard' replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
