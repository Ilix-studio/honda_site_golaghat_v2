import { useEffect } from "react";
import { LogOut, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

import { logout, selectAuth } from "@/redux-store/slices/authSlice";
import { addNotification } from "@/redux-store/slices/uiSlice";
import { useLogoutUserMutation } from "@/redux-store/services/adminApi";

const routeConfig: Record<
  string,
  { title: string; subtitle?: string; showBack?: boolean; backTo?: string }
> = {
  "/part-admin/dashboard": {
    title: "Parts Admin Dashboard",
    subtitle: "Parts Inventory Management",
  },
  "/part-admin/parts-stock/upload": {
    title: "Parts Stock Import",
    subtitle: "Import XLSX / CSV",
    showBack: true,
    backTo: "/part-admin/dashboard",
  },
};

const PartAdminHeader = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector(selectAuth);
  const [logoutUser, { isLoading: isLoggingOut }] = useLogoutUserMutation();

  const currentRoute = routeConfig[location.pathname] || {
    title: "Parts Admin",
    subtitle: "Honda Dealership Management",
  };

  useEffect(() => {
    if (!isAuthenticated) navigate("/part-admin/login");
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    try {
      const result = await logoutUser().unwrap();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(
        addNotification({
          type: "success",
          message: result.message || "Logged out successfully",
        })
      );
    } catch (error: any) {
      dispatch(logout());
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(
        addNotification({
          type: "error",
          message: error?.data?.message || "Error logging out",
        })
      );
    } finally {
      navigate("/part-admin/login", { replace: true });
    }
  };

  const handleBack = () => {
    currentRoute.backTo ? navigate(currentRoute.backTo) : navigate(-1);
  };

  return (
    <header className='sticky top-0 z-50 bg-gray-950 border-b border-gray-800'>
      <div className='container px-4'>
        <div className='flex items-center justify-between h-14'>
          <div className='flex items-center gap-3'>
            <Link
              to='/part-admin/dashboard'
              className='flex items-center gap-2 shrink-0'
            >
              <div className='w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center'>
                <span className='text-white text-xs font-black'>T</span>
              </div>
              <span className='text-sm font-black text-white tracking-tight hidden sm:block'>
                Tsangpool <span className='text-blue-500'>Parts</span>
              </span>
            </Link>

            <div className='w-px h-5 bg-gray-700 mx-1' />

            {currentRoute.showBack && (
              <button
                onClick={handleBack}
                className='flex items-center justify-center w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors'
              >
                <ArrowLeft className='w-3.5 h-3.5 text-gray-400' />
              </button>
            )}

            <div className='leading-none'>
              <p className='text-sm font-bold text-white'>
                {currentRoute.title}
              </p>
              {currentRoute.subtitle && (
                <p className='text-[11px] text-gray-500 mt-0.5'>
                  {currentRoute.subtitle}
                </p>
              )}
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className='flex items-center gap-1.5 h-8 px-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/20 hover:border-blue-600/40 text-blue-400 hover:text-blue-300 text-xs font-semibold transition-all disabled:opacity-50'
            >
              <LogOut className='w-3.5 h-3.5' />
              <span className='hidden sm:inline'>
                {isLoggingOut ? "Logging out..." : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PartAdminHeader;
