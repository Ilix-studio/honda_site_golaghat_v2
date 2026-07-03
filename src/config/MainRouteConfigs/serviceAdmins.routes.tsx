import ApplyLeave from "@/mainComponents/shared/ApplyLeave";

import { lazy } from "react";
const ServiceApplyLeave = () => (
  <ApplyLeave dashboardPath='/service-admin/dashboard' />
);
const CustomerInvoices = lazy(
  () => import("@/mainComponents/shared/CustomerInvoices"),
);

const DashServiceAdmins = lazy(
  () => import("@/mainComponents/ServiceM/DashServiceAdmins"),
);
const JobCardForm = lazy(() => import("@/mainComponents/ServiceM/JobCardForm"));
const LoginServiceAdmins = lazy(
  () => import("@/mainComponents/ServiceM/LoginServiceAdmins"),
);

const ServiceBookingsManager = lazy(
  () => import("@/mainComponents/ServiceM/ServiceBookingsManager"),
);
const JobCardCatalogManager = lazy(
  () => import("@/mainComponents/CustomerSystem/JobCard/JobCardCatalogManager"),
);

export const serviceAdminAuthRoutes = [
  { path: "/service-admin/login", component: LoginServiceAdmins },
];

export const serviceAdminRoutes = [
  { path: "/service-admin/dashboard", component: DashServiceAdmins },
  { path: "/service-admin/apply-leave", component: ServiceApplyLeave },
  {
    path: "/service-admin/service-bookings",
    component: ServiceBookingsManager,
  },
  { path: "/service-admin/job-card", component: JobCardForm },
  { path: "/service-admin/catalog", component: JobCardCatalogManager },
  { path: "/service-admin/customer-invoices", component: CustomerInvoices },
];
