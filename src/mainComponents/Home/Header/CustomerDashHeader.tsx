import { useEffect } from "react";
import { Button } from "@/components/ui/button";

import { User, LogOut, Home, Wrench, Phone, ArrowLeft } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch } from "@/hooks/redux";
import { useAuthForCustomer } from "@/hooks/useAuthforCustomer";
import { logout } from "@/redux-store/slices/customer/customerAuthSlice";
import { addNotification } from "@/redux-store/slices/uiSlice";
import { routeConfig } from "@/config/routeConfig";
import { useGetCustomerProfileQuery } from "@/redux-store/services/customer/customerApi";
import { ApiResponse } from "@/mainComponents/CustomerSystem/CustomerProfileInto";

const NAV_LINKS = [
  { label: "Dashboard", to: "/customer/dashboard" },
  { label: "Services", to: "/customer/services" },
  { label: "Support", to: "/customer/support" },
];

const MOBILE_NAV = [
  { label: "Dashboard", to: "/customer/dashboard", icon: Home },
  { label: "Services", to: "/customer/services", icon: Wrench },
  { label: "Support", to: "/customer/support", icon: Phone },
];

export function CustomerDashHeader() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, firebaseToken } = useAuthForCustomer();
  const { data, isLoading } = useGetCustomerProfileQuery();
  const apiResponse = data as unknown as ApiResponse;
  const profile = apiResponse?.data?.profile;

  const currentRoute = routeConfig[location.pathname] || {
    title: "Customer Portal",
    subtitle: "Tsangpool Honda Service Center",
  };

  useEffect(() => {
    if (!isAuthenticated || !firebaseToken) navigate("/customer/login");
  }, [isAuthenticated, firebaseToken, navigate]);

  const handleLogout = async () => {
    try {
      dispatch(logout());
      dispatch(
        addNotification({ type: "success", message: "Logged out successfully" })
      );
      navigate("/");
    } catch {
      dispatch(
        addNotification({ type: "error", message: "Error logging out" })
      );
    }
  };

  const handleBack = () => {
    currentRoute.backTo ? navigate(currentRoute.backTo) : navigate(-1);
  };

  return (
    <header className='sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-15 py-3'>
          {/* ── Left ── */}
          <div className='flex items-center gap-3'>
            {currentRoute.showBack && (
              <button
                onClick={handleBack}
                className='w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors'
              >
                <ArrowLeft className='w-4 h-4 text-gray-600' />
              </button>
            )}

            <Link to='/customer/dashboard' className='flex items-center gap-2'>
              {/* Honda-red wordmark */}
              <div className='flex items-center gap-1.5'>
                <div className='w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center shrink-0'>
                  <span className='text-white text-xs font-black'>H</span>
                </div>
                <div className='leading-none'>
                  <p className='text-sm font-black text-gray-900 tracking-tight'>
                    Tsangpool
                  </p>
                  <p className='text-[10px] font-semibold text-red-500 tracking-widest uppercase'>
                    Honda
                  </p>
                </div>
              </div>
            </Link>

            {/* route breadcrumb */}
            {currentRoute.title && (
              <>
                <div className='hidden md:block w-px h-5 bg-gray-200' />
                <div className='hidden md:block'>
                  <p className='text-sm font-semibold text-gray-900 leading-none'>
                    {currentRoute.title}
                  </p>
                  {currentRoute.subtitle && (
                    <p className='text-[11px] text-gray-400 mt-0.5'>
                      {currentRoute.subtitle}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Center nav (desktop) ── */}
          <nav className='hidden md:flex items-center gap-1'>
            {NAV_LINKS.map(({ label, to }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "text-red-600 bg-red-50"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {label}
                  {active && (
                    <span className='absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-500' />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Right ── */}
          <div className='flex items-center gap-2'>
            {/* Book Service CTA */}
            <Link to='/customer/book-service' className='hidden sm:block'>
              <Button
                size='sm'
                className='rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold h-9 px-3.5 border-0'
              >
                <Wrench className='w-3.5 h-3.5 mr-1.5' />
                Book Service
              </Button>
            </Link>

            <div className='flex items-center gap-2'>
              <button className='flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors group'>
                <div className='w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center shrink-0'>
                  <User className='w-4 h-4 text-red-500' />
                </div>
                <div className='hidden sm:block text-left leading-none'>
                  <p className='text-xs font-semibold text-gray-900 truncate max-w-[80px]'>
                    {isLoading ? "..." : profile?.firstName ?? "User"}
                  </p>
                </div>
              </button>

              <button
                onClick={handleLogout}
                className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors'
              >
                <LogOut className='w-3.5 h-3.5' />
                <span className='hidden sm:block'>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile bottom nav ── */}
      <div className='md:hidden border-t border-gray-100 bg-white'>
        <div className='flex justify-around px-4 py-1'>
          {MOBILE_NAV.map(({ label, to, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors ${
                  active ? "text-red-600" : "text-gray-400 hover:text-gray-700"
                }`}
              >
                <Icon className='w-5 h-5' />
                <span className='text-[10px] font-semibold'>{label}</span>
                {active && <span className='w-1 h-1 rounded-full bg-red-500' />}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
