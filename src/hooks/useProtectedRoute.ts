import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "./redux";
import { selectAuth } from "../redux-store/slices/authSlice";
import { addNotification } from "../redux-store/slices/uiSlice";

interface UseProtectedRouteOptions {
  redirectTo?: string;
  requiredRole?: string;
  showNotification?: boolean;
}

export const useProtectedRoute = (options: UseProtectedRouteOptions = {}) => {
  const {
    redirectTo = "/admin/superlogin",
    requiredRole,
    showNotification = true,
  } = options;

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, token } = useAppSelector(selectAuth);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (showNotification) {
        dispatch(
          addNotification({
            type: "warning",
            message: "Please login to access this page",
          })
        );
      }
      navigate(redirectTo);
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      if (showNotification) {
        dispatch(
          addNotification({
            type: "error",
            message: "You don't have permission to access this page",
          })
        );
      }
      navigate("/admin/dashboard");
      return;
    }
  }, [
    isAuthenticated,
    token,
    user,
    requiredRole,
    navigate,
    redirectTo,
    dispatch,
    showNotification,
  ]);

  return {
    isAuthenticated,
    user,
    token,
    hasRequiredRole: !requiredRole || user?.role === requiredRole,
  };
};
