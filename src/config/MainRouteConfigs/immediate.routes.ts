import Home from "@/Home";
import NotFoundPage from "@/mainComponents/NotFoundPage";

export const immediateRoutes = [{ path: "/", component: Home }];

export const fallbackRoute = {
  path: "*",
  component: NotFoundPage,
};
