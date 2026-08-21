import { lazy } from "react";

const LoginDeveloper = lazy(
  () => import("@/mainComponents/DeveloperM/LoginDeveloper"),
);
const DeveloperDashboard = lazy(
  () => import("@/mainComponents/DeveloperM/DeveloperDashboard"),
);

export const developerAuthRoutes = [
  { path: "/developer/login", component: LoginDeveloper },
];

export const developerRoutes = [
  { path: "/developer/dashboard", component: DeveloperDashboard },
];
