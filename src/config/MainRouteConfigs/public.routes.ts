import { lazy } from "react";

const Finance = lazy(() => import("@/mainComponents/NavMenu/Finance"));
const Contact = lazy(() => import("@/mainComponents/NavMenu/Contact"));
const BranchesPage = lazy(
  () => import("@/mainComponents/NavMenu/Branches/BranchesPage"),
);
const BranchDetailPage = lazy(
  () => import("@/mainComponents/NavMenu/Branches/BranchDetailPage"),
);
const ViewAllBikes = lazy(() =>
  import("@/mainComponents/BikeDetails/ViewAllBikes").then((m) => ({
    default: m.ViewAllBikes,
  })),
);
const BikeDetailsPage = lazy(
  () => import("@/mainComponents/BikeDetails/BikeDetailsPage"),
);
const ScooterDetailPage = lazy(
  () => import("@/mainComponents/BikeDetails/ScooterDetailPage"),
);
const CompareBike = lazy(
  () => import("@/mainComponents/BikeDetails/CompareBikes/CompareBike"),
);
const SearchResults = lazy(
  () => import("@/mainComponents/Search/SearchResults"),
);
const DealershipLocator = lazy(
  () => import("@/mainComponents/Location/DealershipLocator"),
);
const DealershipReviews = lazy(
  () => import("@/mainComponents/Location/DealershipReviews"),
);
const ViewAllBranches = lazy(
  () => import("@/mainComponents/ViewBS2/ViewAllBranches"),
);

const ViewVAS = lazy(() => import("@/mainComponents/ViewBS2/ViewVAS"));
const ViewStockConcept = lazy(
  () => import("@/mainComponents/ViewBS2/ViewStockConcept"),
);
const DownloadSafetyfeature = lazy(
  () => import("@/mainComponents/ViewBS2/DownloadSafetyfeature"),
);
const BillMemo = lazy(() => import("@/mainComponents/Admin/ZBillMemo"));

export const publicRoutes = [
  { path: "/finance", component: Finance },
  { path: "/contact", component: Contact },
  { path: "/branches", component: BranchesPage },
  { path: "/branches/:id", component: BranchDetailPage },
  { path: "/view-all", component: ViewAllBikes },
  { path: "/bikes/:bikeId", component: BikeDetailsPage },
  { path: "/scooters/:bikeId", component: ScooterDetailPage },
  { path: "/compare", component: CompareBike },
  { path: "/see-bill-memo", component: BillMemo },
  { path: "/search", component: SearchResults },
  { path: "/dealership-locator", component: DealershipLocator },
  { path: "/dealership-reviews", component: DealershipReviews },
  { path: "/admin/branches/view", component: ViewAllBranches },
  { path: "/admin/view/vas", component: ViewVAS },
  { path: "/view/stock-concept", component: ViewStockConcept },
  {
    path: "/download/safety-feature-stickers",
    component: DownloadSafetyfeature,
  },
];
