import OpenJobCards from "@/mainComponents/ServiceM/OpenJobCards";
import ApplyLeave from "@/mainComponents/shared/ApplyLeave";
import { lazy } from "react";
const ServiceApplyLeave = () => (
  <ApplyLeave dashboardPath='/service-admin/dashboard' />
);

const DashServiceAdmins = lazy(
  () => import("@/mainComponents/ServiceM/DashServiceAdmins"),
);
const JobCardForm = lazy(() => import("@/mainComponents/ServiceM/JobCardForm"));
const LoginServiceAdmins = lazy(
  () => import("@/mainComponents/ServiceM/LoginServiceAdmins"),
);

const ServiceBookingsManager = lazy(
  () => import("@/mainComponents/Admin/ServiceBookings/ServiceBookingsManager"),
);

export const serviceAdminAuthRoutes = [
  { path: "/service-admin/login", component: LoginServiceAdmins },
];

export const serviceAdminRoutes = [
  { path: "/service-admin/dashboard", component: DashServiceAdmins },
  { path: "/service-admin/job-card", component: JobCardForm },
  //
  { path: "/service-admin/apply-leave", component: ServiceApplyLeave },
  {
    path: "/service-admin/service-bookings",
    component: ServiceBookingsManager,
  },
  { path: "/service-admin/job-cards", component: OpenJobCards },
];
