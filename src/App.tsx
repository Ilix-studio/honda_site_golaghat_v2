import React, { useEffect } from "react";
import { Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";

// Immediate & fallback
import {
  fallbackRoute,
  immediateRoutes,
} from "./config/MainRouteConfigs/immediate.routes";

// Public
import { publicRoutes } from "./config/MainRouteConfigs/public.routes";

// Admin
import {
  adminAuthRoutes,
  adminRoutes,
} from "./config/MainRouteConfigs/admin.routes";

// Customer
import {
  customerAuthRoutes,
  customerRoutes,
} from "./config/MainRouteConfigs/customer.routes";

// Branch Manager
import {
  branchManagerAuthRoutes,
  branchManagerRoutes,
} from "./config/MainRouteConfigs/branchManager.routes.tsx";

import {
  createImmediateRoute,
  createPublicRoute,
  createAdminRoute,
  createCustomerRoute,
  createBranchManagerRoute,
  createAuthRoute,
  createServiceAdminRoute,
  createStaffRoute,
} from "./config/routeHelpers";

import { usePageTitle } from "./hooks/usePageTitle";
import NotificationSystem from "./mainComponents/Admin/NotificationSystem";
import {
  serviceAdminAuthRoutes,
  serviceAdminRoutes,
} from "./config/MainRouteConfigs/serviceAdmins.routes";
import {
  staffAuthRoutes,
  staffRoutes,
} from "./config/MainRouteConfigs/staff.routes";

const App: React.FC = () => {
  const location = useLocation();
  usePageTitle();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Toaster
        position='top-right'
        reverseOrder={false}
        gutter={8}
        containerStyle={{ top: 20, left: 20, bottom: 20, right: 20 }}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#363636",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow:
              "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
            fontSize: "14px",
            maxWidth: "420px",
            padding: "12px 16px",
            fontFamily: "system-ui, -apple-system, sans-serif",
          },
          success: {
            duration: 4000,
            iconTheme: { primary: "#10b981", secondary: "#fff" },
            style: {
              border: "1px solid #10b981",
              background: "#f0fdf4",
              color: "#065f46",
            },
          },
          error: {
            duration: 5000,
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
            style: {
              border: "1px solid #ef4444",
              background: "#fef2f2",
              color: "#991b1b",
            },
          },
          loading: {
            duration: Infinity,
            style: {
              border: "1px solid #3b82f6",
              background: "#eff6ff",
              color: "#1e40af",
            },
          },
        }}
      />

      <Routes>
        {/* IMMEDIATE — no lazy, no wrapper */}
        {immediateRoutes.map(({ path, component }) =>
          createImmediateRoute(path, component),
        )}

        {/* PUBLIC — lazy, public header */}
        {publicRoutes.map(({ path, component }) =>
          createPublicRoute(path, component),
        )}

        {/* ADMIN AUTH — login pages, no header */}
        {adminAuthRoutes.map(({ path, component }) =>
          createAuthRoute(path, component),
        )}

        {/* ADMIN — protected, admin header */}
        {adminRoutes.map(({ path, component }) =>
          createAdminRoute(path, component),
        )}

        {/* CUSTOMER AUTH — login page, no header */}
        {customerAuthRoutes.map(({ path, component }) =>
          createAuthRoute(path, component),
        )}

        {/* CUSTOMER — protected, customer header */}
        {customerRoutes.map(({ path, component }) =>
          createCustomerRoute(path, component),
        )}

        {/* BRANCH MANAGER AUTH — login page, no header */}
        {branchManagerAuthRoutes.map(({ path, component }) =>
          createAuthRoute(path, component),
        )}

        {/* BRANCH MANAGER — protected, manager header */}
        {branchManagerRoutes.map(({ path, component }) =>
          createBranchManagerRoute(path, component),
        )}
        {/* SERVICE ADMIN AUTH — login page, no header */}
        {serviceAdminAuthRoutes.map(({ path, component }) =>
          createAuthRoute(path, component),
        )}

        {/* SERVICE ADMIN — protected, service admin header */}
        {serviceAdminRoutes.map(({ path, component }) =>
          createServiceAdminRoute(path, component),
        )}
        {/* STAFF ADMIN AUTH — login page, no header */}
        {staffAuthRoutes.map(({ path, component }) =>
          createAuthRoute(path, component),
        )}

        {/* STAFF — protected, staff header */}
        {staffRoutes.map(({ path, component }) =>
          createStaffRoute(path, component),
        )}

        {/* FALLBACK — 404 */}
        {createImmediateRoute(fallbackRoute.path, fallbackRoute.component)}
      </Routes>

      <NotificationSystem />
    </>
  );
};

export default App;
