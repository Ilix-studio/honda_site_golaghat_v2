import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/redux";
import { selectAuth, selectIsAdmin } from "@/redux-store/slices/authSlice";
import { selectBranchAuth } from "@/redux-store/slices/branchAuthSlice";

const CustomerSignupRedirect = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector(selectAuth);
  const isAdmin = useAppSelector(selectIsAdmin);
  const { isAuthenticated: isBranchAuth } = useAppSelector(selectBranchAuth);

  useEffect(() => {
    // Redirect based on authentication status
    if (isAdmin && isAuthenticated) {
      // Admin can access customer signup
      navigate("/admin/customers/signup", { replace: true });
    } else if (isBranchAuth) {
      // Branch manager can access customer signup
      navigate("/manager/customers/signup", { replace: true });
    } else {
      // Not authenticated, redirect to home or login
      navigate("/", { replace: true });
    }
  }, [navigate, isAuthenticated, isAdmin, isBranchAuth]);

  // Show loading state while redirecting
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4'></div>
        <p className='text-gray-600'>Redirecting...</p>
      </div>
    </div>
  );
};

export default CustomerSignupRedirect;
