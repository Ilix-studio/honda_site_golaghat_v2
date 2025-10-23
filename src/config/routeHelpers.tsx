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

// Customer route wrapper with customer header and protection
const CustomerRouteWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute requiredRole='customer'>
    <CustomerDashHeader />
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
 * Create customer route with lazy loading, protection, and customer header
 */
export const createCustomerRoute = (
  path: string,
  Component: React.ComponentType
) => (
  <Route
    key={path}
    path={path}
    element={
      <Suspense fallback={<RouteLoadingFallback />}>
        <CustomerRouteWrapper>
          <Component />
        </CustomerRouteWrapper>
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
): "immediate" | "public" | "admin" | "customer" | "auth" => {
  // Login/auth routes
  if (path.includes("/login") || path.includes("/signup")) {
    return "auth";
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
  Component: React.ComponentType
) => {
  const routeType = getRouteType(path);

  switch (routeType) {
    case "immediate":
      return createImmediateRoute(path, Component);
    case "public":
      return createPublicRoute(path, Component);
    case "admin":
      return createAdminRoute(path, Component);
    case "customer":
      return createCustomerRoute(path, Component);
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
  routes: Array<{ path: string; component: React.ComponentType }>,
  routeType: "immediate" | "public" | "admin" | "customer" | "auth"
) => {
  const creatorMap = {
    immediate: createImmediateRoute,
    public: createPublicRoute,
    admin: createAdminRoute,
    customer: createCustomerRoute,
    auth: createAuthRoute,
  };

  const creator = creatorMap[routeType];
  return routes.map(({ path, component }) => creator(path, component));
};

/**
 * Create routes automatically based on path patterns
 */
export const createSmartRoutesBatch = (
  routes: Array<{ path: string; component: React.ComponentType }>
) => {
  return routes.map(({ path, component }) => createSmartRoute(path, component));
};
