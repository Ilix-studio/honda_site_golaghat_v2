import React, { Suspense } from "react";
import { Route } from "react-router-dom";
import AdminHeader from "../mainComponents/Home/Header/AdminHeader";
import ManagerHeader from "../mainComponents/Home/Header/ManagerHeader";
import { CustomerDashHeader } from "../mainComponents/Home/Header/CustomerDashHeader";
import { Header } from "../mainComponents/Home/Header/Header";
import ProtectedRoute from "./ProtectedRoute";
import ServiceAdminsHeader from "@/mainComponents/Home/Header/ServiceAdminsHeader";
import StaffHeader from "@/mainComponents/Home/Header/StaffHeader";

// ─── Loading Fallback ────────────────────────────────────────────────────────

const RouteLoadingFallback: React.FC = () => (
  <div className='min-h-screen flex items-center justify-center'>
    <div className='text-center'>
      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
      <p className='text-gray-600'>Loading...</p>
    </div>
  </div>
);

// ─── Route Wrappers ──────────────────────────────────────────────────────────

const PublicRouteWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <>
    <Header />
    {children}
  </>
);

const AdminRouteWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute requiredRole='admin'>
    <AdminHeader />
    {children}
  </ProtectedRoute>
);

const SuperAdminRouteWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute requiredRole='super-admin-only'>
    <AdminHeader />
    {children}
  </ProtectedRoute>
);

const BranchManagerRouteWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute requiredRole='branch-admin'>
    <ManagerHeader />
    {children}
  </ProtectedRoute>
);

const ServiceAdminRouteWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute requiredRole='service-admin'>
    <ServiceAdminsHeader />
    {children}
  </ProtectedRoute>
);

const StaffRouteWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute requiredRole='staff'>
    <StaffHeader />
    {children}
  </ProtectedRoute>
);

const CustomerRouteWrapper: React.FC<{
  children: React.ReactNode;
  adminCanAccess?: boolean;
  showAdminHeader?: boolean;
}> = ({ children, adminCanAccess = true }) => (
  <ProtectedRoute requiredRole='customer' adminCanAccess={adminCanAccess}>
    <CustomerDashHeader />
    {children}
  </ProtectedRoute>
);

const AdminCustomerRouteWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute requiredRole='admin'>
    <AdminHeader />
    {children}
  </ProtectedRoute>
);

// ─── Route Creators ──────────────────────────────────────────────────────────

export const createImmediateRoute = (
  path: string,
  Component: React.ComponentType,
) => <Route key={path} path={path} element={<Component />} />;

export const createPublicRoute = (
  path: string,
  Component: React.ComponentType,
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

export const createAdminRoute = (
  path: string,
  Component: React.ComponentType,
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

export const createSuperAdminRoute = (
  path: string,
  Component: React.ComponentType,
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

export const createBranchManagerRoute = (
  path: string,
  Component: React.ComponentType,
) => (
  <Route
    key={path}
    path={path}
    element={
      <Suspense fallback={<RouteLoadingFallback />}>
        <BranchManagerRouteWrapper>
          <Component />
        </BranchManagerRouteWrapper>
      </Suspense>
    }
  />
);

export const createServiceAdminRoute = (
  path: string,
  Component: React.ComponentType,
) => (
  <Route
    key={path}
    path={path}
    element={
      <Suspense fallback={<RouteLoadingFallback />}>
        <ServiceAdminRouteWrapper>
          <Component />
        </ServiceAdminRouteWrapper>
      </Suspense>
    }
  />
);

export const createStaffRoute = (
  path: string,
  Component: React.ComponentType,
) => (
  <Route
    key={path}
    path={path}
    element={
      <Suspense fallback={<RouteLoadingFallback />}>
        <StaffRouteWrapper>
          <Component />
        </StaffRouteWrapper>
      </Suspense>
    }
  />
);

export const createCustomerRoute = (
  path: string,
  Component: React.ComponentType,
  options: {
    adminCanAccess?: boolean;
    showAdminHeader?: boolean;
  } = {},
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

export const createAdminCustomerRoute = (
  path: string,
  Component: React.ComponentType,
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

export const createAuthRoute = (
  path: string,
  Component: React.ComponentType,
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

// ─── Route Type Detection ────────────────────────────────────────────────────

type RouteType =
  | "immediate"
  | "public"
  | "admin"
  | "customer"
  | "auth"
  | "super-admin"
  | "branch-admin"
  | "service-admin"
  | "staff";

export const getRouteType = (path: string): RouteType => {
  if (path.includes("/login") || path.includes("/signup")) return "auth";
  if (path.startsWith("/staff/")) return "staff";
  if (path.startsWith("/service/")) return "service-admin";
  if (path.startsWith("/manager/") || path === "/manager-login")
    return "branch-admin";
  if (
    path.includes("/branches/add") ||
    path.includes("/branches/managers") ||
    path.includes("/service-admins/")
  )
    return "super-admin";
  if (path.startsWith("/admin/")) return "admin";
  if (path.startsWith("/customer/")) return "customer";
  if (path === "/" || path === "*") return "immediate";
  return "public";
};

// ─── Smart Route Creator ─────────────────────────────────────────────────────

export const createSmartRoute = (
  path: string,
  Component: React.ComponentType,
  options: {
    adminCanAccess?: boolean;
    showAdminHeader?: boolean;
  } = {},
) => {
  const routeType = getRouteType(path);

  const creators: Record<RouteType, () => React.ReactElement> = {
    immediate: () => createImmediateRoute(path, Component),
    public: () => createPublicRoute(path, Component),
    admin: () => createAdminRoute(path, Component),
    "super-admin": () => createSuperAdminRoute(path, Component),
    "branch-admin": () => createBranchManagerRoute(path, Component),
    "service-admin": () => createServiceAdminRoute(path, Component),
    staff: () => createStaffRoute(path, Component),
    customer: () => createCustomerRoute(path, Component, options),
    auth: () => createAuthRoute(path, Component),
  };

  return creators[routeType]();
};

// ─── Batch Route Creators ────────────────────────────────────────────────────

type BatchRouteType = RouteType;

const ROUTE_CREATOR_MAP: Record<
  BatchRouteType,
  (
    path: string,
    component: React.ComponentType,
    options?: any,
  ) => React.ReactElement
> = {
  immediate: (p, c) => createImmediateRoute(p, c),
  public: (p, c) => createPublicRoute(p, c),
  admin: (p, c) => createAdminRoute(p, c),
  "super-admin": (p, c) => createSuperAdminRoute(p, c),
  "branch-admin": (p, c) => createBranchManagerRoute(p, c),
  "service-admin": (p, c) => createServiceAdminRoute(p, c),
  staff: (p, c) => createStaffRoute(p, c),
  customer: (p, c, o) => createCustomerRoute(p, c, o),
  auth: (p, c) => createAuthRoute(p, c),
};

export const createRoutesBatch = (
  routes: Array<{
    path: string;
    component: React.ComponentType;
    options?: {
      adminCanAccess?: boolean;
      showAdminHeader?: boolean;
    };
  }>,
  routeType: BatchRouteType,
) => {
  const creator = ROUTE_CREATOR_MAP[routeType];
  return routes.map(({ path, component, options }) =>
    creator(path, component, options),
  );
};

export const createSmartRoutesBatch = (
  routes: Array<{
    path: string;
    component: React.ComponentType;
    options?: {
      adminCanAccess?: boolean;
      showAdminHeader?: boolean;
    };
  }>,
) =>
  routes.map(({ path, component, options }) =>
    createSmartRoute(path, component, options),
  );
