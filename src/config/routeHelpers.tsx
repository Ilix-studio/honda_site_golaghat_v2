import React, { Suspense } from "react";
import { Route } from "react-router-dom";
import AdminHeader from "../mainComponents/Home/Header/AdminHeader";
import { CustomerDashHeader } from "../mainComponents/Home/Header/CustomerDashHeader";
import { Header } from "../mainComponents/Home/Header/Header";
import ProtectedRoute from "./ProtectedRoute";

// LOADING FALLBACK COMPONENT
const RouteLoadingFallback: React.FC = () => (
  <div className='min-h-screen flex items-center justify-center'>
    <div className='text-center'>
      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
      <p className='text-gray-600'>Loading...</p>
    </div>
  </div>
);

// ROUTE WRAPPER COMPONENTS

// Public route wrapper with public header
const PublicRouteWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <>
    <Header />
    {children}
  </>
);

// Admin route wrapper with admin header and protection
const AdminRouteWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute requiredRole='admin'>
    <AdminHeader />
    {children}
  </ProtectedRoute>
);

// Customer route wrapper with flexible header and protection
const CustomerRouteWrapper: React.FC<{
  children: React.ReactNode;
  adminCanAccess?: boolean;
  showAdminHeader?: boolean; // Whether to show admin header when admin accesses
}> = ({ children, adminCanAccess = true }) => {
  return (
    <ProtectedRoute requiredRole='customer' adminCanAccess={adminCanAccess}>
      {/* Show appropriate header based on user type */}
      <CustomerDashHeader />
      {children}
    </ProtectedRoute>
  );
};

// Admin-only customer route wrapper (for administrative tasks)
const AdminCustomerRouteWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute requiredRole='admin'>
    <AdminHeader />
    {children}
  </ProtectedRoute>
);

// Super Admin only route wrapper
const SuperAdminRouteWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute requiredRole='super-admin-only'>
    <AdminHeader />
    {children}
  </ProtectedRoute>
);

// ROUTE CREATION HELPERS

/**
 * Create immediate route (no lazy loading, no wrapper)
 */
export const createImmediateRoute = (
  path: string,
  Component: React.ComponentType
) => <Route key={path} path={path} element={<Component />} />;

/**
 * Create public route with lazy loading and public header
 */
export const createPublicRoute = (
  path: string,
  Component: React.ComponentType
) => (
  <Route
    key={path}
    path={path}
    element={
      <Suspense fallback={<RouteLoadingFallback />}>
        <PublicRouteWrapper>
          <Component />
        </PublicRouteWrapper>
      </Suspense>
    }
  />
);

/**
 * Create admin route with lazy loading, protection, and admin header
 */
export const createAdminRoute = (
  path: string,
  Component: React.ComponentType
) => (
  <Route
    key={path}
    path={path}
    element={
      <Suspense fallback={<RouteLoadingFallback />}>
        <AdminRouteWrapper>
          <Component />
        </AdminRouteWrapper>
      </Suspense>
    }
  />
);

/**
 * Create customer route with lazy loading, flexible protection, and appropriate header
 */
export const createCustomerRoute = (
  path: string,
  Component: React.ComponentType,
  options: {
    adminCanAccess?: boolean;
    showAdminHeader?: boolean;
  } = {}
) => {
  const { adminCanAccess = true, showAdminHeader = true } = options;

  return (
    <Route
      key={path}
      path={path}
      element={
        <Suspense fallback={<RouteLoadingFallback />}>
          <CustomerRouteWrapper
            adminCanAccess={adminCanAccess}
            showAdminHeader={showAdminHeader}
          >
            <Component />
          </CustomerRouteWrapper>
        </Suspense>
      }
    />
  );
};

/**
 * Create admin-only customer route (for administrative tasks like customer signup)
 */
export const createAdminCustomerRoute = (
  path: string,
  Component: React.ComponentType
) => (
  <Route
    key={path}
    path={path}
    element={
      <Suspense fallback={<RouteLoadingFallback />}>
        <AdminCustomerRouteWrapper>
          <Component />
        </AdminCustomerRouteWrapper>
      </Suspense>
    }
  />
);

/**
 * Create super admin only route
 */
export const createSuperAdminRoute = (
  path: string,
  Component: React.ComponentType
) => (
  <Route
    key={path}
    path={path}
    element={
      <Suspense fallback={<RouteLoadingFallback />}>
        <SuperAdminRouteWrapper>
          <Component />
        </SuperAdminRouteWrapper>
      </Suspense>
    }
  />
);

/**
 * Create auth route (login pages) with lazy loading but no header
 */
export const createAuthRoute = (
  path: string,
  Component: React.ComponentType
) => (
  <Route
    key={path}
    path={path}
    element={
      <Suspense fallback={<RouteLoadingFallback />}>
        <Component />
      </Suspense>
    }
  />
);

// ROUTE TYPE DETECTION HELPERS

export const getRouteType = (
  path: string
): "immediate" | "public" | "admin" | "customer" | "auth" | "super-admin" => {
  // Login/auth routes
  if (path.includes("/login") || path.includes("/signup")) {
    return "auth";
  }

  // Super admin routes (branch management, etc.)
  if (path.includes("/branches/add") || path.includes("/branches/managers")) {
    return "super-admin";
  }

  // Admin routes
  if (path.startsWith("/admin/")) {
    return "admin";
  }

  // Customer routes
  if (path.startsWith("/customer/")) {
    return "customer";
  }

  // Immediate routes (critical paths)
  if (path === "/" || path === "*") {
    return "immediate";
  }

  // Default to public
  return "public";
};

/**
 * Smart route creator that automatically determines the appropriate wrapper
 */
export const createSmartRoute = (
  path: string,
  Component: React.ComponentType,
  options: {
    adminCanAccess?: boolean;
    showAdminHeader?: boolean;
  } = {}
) => {
  const routeType = getRouteType(path);

  switch (routeType) {
    case "immediate":
      return createImmediateRoute(path, Component);
    case "public":
      return createPublicRoute(path, Component);
    case "super-admin":
      return createSuperAdminRoute(path, Component);
    case "admin":
      return createAdminRoute(path, Component);
    case "customer":
      return createCustomerRoute(path, Component, options);
    case "auth":
      return createAuthRoute(path, Component);
    default:
      return createPublicRoute(path, Component);
  }
};

// BATCH ROUTE CREATORS

/**
 * Create multiple routes with the same type
 */
export const createRoutesBatch = (
  routes: Array<{
    path: string;
    component: React.ComponentType;
    options?: {
      adminCanAccess?: boolean;
      showAdminHeader?: boolean;
    };
  }>,
  routeType:
    | "immediate"
    | "public"
    | "admin"
    | "customer"
    | "auth"
    | "super-admin"
) => {
  const creatorMap = {
    immediate: (path: string, component: React.ComponentType) =>
      createImmediateRoute(path, component),
    public: (path: string, component: React.ComponentType) =>
      createPublicRoute(path, component),
    admin: (path: string, component: React.ComponentType) =>
      createAdminRoute(path, component),
    customer: (path: string, component: React.ComponentType, options?: any) =>
      createCustomerRoute(path, component, options),
    auth: (path: string, component: React.ComponentType) =>
      createAuthRoute(path, component),
    "super-admin": (path: string, component: React.ComponentType) =>
      createSuperAdminRoute(path, component),
  };

  const creator = creatorMap[routeType];
  return routes.map(({ path, component, options }) =>
    creator(path, component, options)
  );
};

/**
 * Create routes automatically based on path patterns
 */
export const createSmartRoutesBatch = (
  routes: Array<{
    path: string;
    component: React.ComponentType;
    options?: {
      adminCanAccess?: boolean;
      showAdminHeader?: boolean;
    };
  }>
) => {
  return routes.map(({ path, component, options }) =>
    createSmartRoute(path, component, options)
  );
};
