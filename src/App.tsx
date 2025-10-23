import React, { useEffect } from "react";
import { Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";

// Import route configurations
import {
  publicRoutes,
  immediateRoutes,
  adminRoutes,
  fallbackRoute,
  customerRoutes,
} from "./config/routeConfig";

// Import route helpers
import {
  createImmediateRoute,
  createPublicRoute,
  createAdminRoute,
  createCustomerRoute,
  createAuthRoute,
} from "./config/routeHelpers";

// Import global components
import NotificationSystem from "./mainComponents/Admin/NotificationSystem";

const App: React.FC = () => {
  const location = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Toaster
        position='top-right'
        reverseOrder={false}
        gutter={8}
        containerClassName=''
        containerStyle={{
          top: 20,
          left: 20,
          bottom: 20,
          right: 20,
        }}
        toastOptions={{
          // Default options for all toasts
          duration: 3000,
          style: {
            background: "#fff",
            color: "#363636",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            fontSize: "14px",
            maxWidth: "420px",
            padding: "12px 16px",
            fontFamily: "system-ui, -apple-system, sans-serif",
          },
          // Specific styles for different toast types
          success: {
            duration: 4000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
            style: {
              border: "1px solid #10b981",
              background: "#f0fdf4",
              color: "#065f46",
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
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
        {/* IMMEDIATE ROUTES - Critical routes that load immediately */}
        {immediateRoutes.map(({ path, component }) =>
          createImmediateRoute(path, component)
        )}

        {/* PUBLIC ROUTES - Lazy loaded public routes with Header */}
        {publicRoutes.map(({ path, component }) =>
          createPublicRoute(path, component)
        )}

        {/* ADMIN ROUTES - Protected admin routes with AdminHeader */}
        {adminRoutes
          .filter(({ path }) => !path.includes("/login")) // Separate auth routes
          .map(({ path, component }) => createAdminRoute(path, component))}

        {/* ADMIN AUTH ROUTES - Login pages without header */}
        {adminRoutes
          .filter(({ path }) => path.includes("/login"))
          .map(({ path, component }) => createAuthRoute(path, component))}

        {/* CUSTOMER ROUTES - Protected customer routes with CustomerHeader */}
        {customerRoutes
          .filter(({ path }) => !path.includes("/login"))
          .map(({ path, component }) => createCustomerRoute(path, component))}

        {/* CUSTOMER AUTH ROUTES - Login pages without header */}
        {customerRoutes
          .filter(({ path }) => path.includes("/login"))
          .map(({ path, component }) => createAuthRoute(path, component))}

        {/* FALLBACK ROUTE - 404 Not Found */}

        {createImmediateRoute(fallbackRoute.path, fallbackRoute.component)}
      </Routes>

      {/* Global Notification System */}
      <NotificationSystem />
    </>
  );
};

export default App;
