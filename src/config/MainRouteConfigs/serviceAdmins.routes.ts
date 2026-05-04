import { lazy } from "react";

const DashServiceAdmins = lazy(
  () => import("@/mainComponents/ServiceM/DashServiceAdmins"),
);
const JobCardForm = lazy(() => import("@/mainComponents/ServiceM/JobCardForm"));
const LoginServiceAdmins = lazy(
  () => import("@/mainComponents/ServiceM/LoginServiceAdmins"),
);

export const serviceAdminAuthRoutes = [
  { path: "/service-admin/login", component: LoginServiceAdmins },
];

export const serviceAdminRoutes = [
  { path: "/service-admin/dashboard", component: DashServiceAdmins },
  { path: "/service-admin/job-card", component: JobCardForm },
];
