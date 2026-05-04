import { lazy } from "react";
import { SimpleBookService } from "@/mainComponents/BookService/SimpleBookService";

const CustomerLogin = lazy(() =>
  import("@/mainComponents/CustomerSystem/CustomerLogin").then((m) => ({
    default: m.default,
  })),
);
const CustomerCreateProfile = lazy(
  () => import("@/mainComponents/CustomerSystem/CustomerCreateProfile"),
);

const InitialDashboard = lazy(
  () => import("@/mainComponents/CustomerSystem/Dashboards/InitialDashboard"),
);
const FirstDash = lazy(
  () => import("@/mainComponents/CustomerSystem/Dashboards/FirstDash"),
);
const ChooseStock = lazy(
  () => import("@/mainComponents/CustomerSystem/SelectStock/ChooseStock"),
);
const CustomerCSVStock = lazy(
  () => import("@/mainComponents/CustomerSystem/SelectStock/CustomerCSVStock"),
);
const CustomerVehicleInfo = lazy(
  () =>
    import("@/mainComponents/CustomerSystem/CustomerDetails/CustomerVehicleInfo"),
);
const CustomerVehicleDetail = lazy(
  () =>
    import("@/mainComponents/CustomerSystem/CustomerDetails/CustomerVehicleDetail"),
);
const CustomerMainDash = lazy(
  () => import("@/mainComponents/CustomerSystem/Dashboards/CustomerMainDash"),
);
const CustomerProfile = lazy(
  () => import("@/mainComponents/CustomerSystem/CustomerProfile"),
);
const CustomerServices = lazy(
  () => import("@/mainComponents/CustomerSystem/Head/CustomerServices"),
);
const CustomerSupport = lazy(
  () =>
    import("@/mainComponents/CustomerSystem/Head/CustomerSupport/CustomerSupport"),
);
const ActivateVAS = lazy(
  () => import("@/mainComponents/CustomerSystem/ActivateFeature/ActivateVAS"),
);
const UseToken = lazy(() => import("@/mainComponents/Scanfleet/UseToken"));

export const customerAuthRoutes = [
  { path: "/customer/login", component: CustomerLogin },
];

export const customerRoutes = [
  { path: "/customer/profile/create", component: CustomerCreateProfile },
  { path: "/customer/first-dash", component: FirstDash },
  { path: "/customer/initialize", component: InitialDashboard },
  { path: "/customer/select/stock", component: ChooseStock },
  { path: "/customer/assign/csv-stock", component: CustomerCSVStock },
  { path: "/customer/vehicle/info", component: CustomerVehicleInfo },
  { path: "/customer/vehicle/:vehicleId", component: CustomerVehicleDetail },
  { path: "/customer/dashboard", component: CustomerMainDash },
  { path: "/customer/profile-info", component: CustomerProfile },
  { path: "/customer/services", component: CustomerServices },
  { path: "/customer/support", component: CustomerSupport },
  { path: "/customer/services/vas", component: ActivateVAS },
  { path: "/customer/book-service", component: SimpleBookService },
  { path: "/customer/attach-stickers", component: UseToken },
];
