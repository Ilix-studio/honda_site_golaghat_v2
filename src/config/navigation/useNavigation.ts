import { useNavigate, useLocation } from "react-router-dom";
import { NavigationUser, ROUTES, canAccessRoute } from "../routeutils";
import { useAppSelector } from "@/hooks/redux";

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get user from Redux state
  const authState = useAppSelector((state) => state.auth);
  const customerAuthState = useAppSelector((state) => state.customerAuth);

  const user: NavigationUser | null = (() => {
    if (authState.isAuthenticated && authState.user) {
      return {
        role: authState.user.role as "Super-Admin" | "Branch-Admin",
        isAuthenticated: true,
        id: authState.user.id,
        name: authState.user.name,
        email: authState.user.email,
      };
    } else if (
      customerAuthState.isAuthenticated &&
      customerAuthState.customer
    ) {
      return {
        role: "Customer",
        isAuthenticated: true,
        id: customerAuthState.customer.id,
        email: customerAuthState.customer.email,
      };
    }
    return null;
  })();

  const safeNavigate = (path: string) => {
    const { canAccess, redirectTo } = canAccessRoute(path, user);
    navigate(canAccess ? path : redirectTo || ROUTES.HOME);
  };

  const goBack = () => {
    navigate(-1);
  };

  const goToDefault = () => {
    if (!user?.isAuthenticated) {
      navigate(ROUTES.HOME);
    } else {
      navigate(
        user.role === "Customer"
          ? ROUTES.CUSTOMER.DASHBOARD
          : ROUTES.ADMIN.DASHBOARD
      );
    }
  };

  return {
    navigate: safeNavigate,
    goBack,
    goToDefault,
    currentPath: location.pathname,
    user,
    routes: ROUTES,
  };
};
