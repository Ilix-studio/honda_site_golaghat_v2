import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "./redux";
import { selectAuth } from "../redux-store/slices/authSlice";

export const useAuth = (redirectTo: string = "/admin/superlogin") => {
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useAppSelector(selectAuth);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, token, navigate, redirectTo]);

  return {
    isAuthenticated,
    user,
    token,
    isLoading: false, // You can add loading state if needed
  };
};
