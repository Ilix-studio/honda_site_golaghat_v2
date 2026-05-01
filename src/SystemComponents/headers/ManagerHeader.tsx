import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { LogOut, Menu, ChevronDown, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useLogoutBranchManagerMutation } from "@/redux-store/services/branchManagerApi";

import { addNotification } from "@/redux-store/slices/uiSlice";
import {
  branchLogout,
  selectBranchAuth,
} from "@/redux-store/slices/branchAuthSlice";

const routeConfig: Record<
  string,
  {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    backTo?: string;
    menuItems?: Array<{ label: string; href: string }>;
  }
> = {
  "/manager/dashboard": {
    title: "Manager Dashboard",
    subtitle: "Branch Management",
  },
  "/manager/service-bookings": {
    title: "Service Bookings",
    subtitle: "Manage service appointments",
    showBack: true,
    backTo: "/manager/dashboard",
  },
  "/manager/accident-reports": {
    title: "Accident Reports",
    subtitle: "View and manage accident cases",
    showBack: true,
    backTo: "/manager/dashboard",
  },

  "/manager/stock": {
    title: "Stock Management",
    subtitle: "Manage branch inventory",
    showBack: true,
    backTo: "/manager/dashboard",
  },
  "/manager/vas": {
    title: "Value Added Services",
    subtitle: "Manage VAS offerings",
    showBack: true,
    backTo: "/manager/dashboard",
  },
  "/manager/customer-vehicles": {
    title: "Customer Vehicles",
    subtitle: "View customer vehicle information",
    showBack: true,
    backTo: "/manager/dashboard",
  },
  "/manager/finance-queries": {
    title: "Finance Queries",
    subtitle: "Handle finance-related requests",
    showBack: true,
    backTo: "/manager/dashboard",
  },
  "/manager/stockC/select": {
    title: "Stock Selection",
    subtitle: "Select stock for branch",
    showBack: true,
    backTo: "/manager/dashboard",
  },
  "/manager/forms/stock-concept-csv": {
    title: "Stock Concept CSV",
    subtitle: "Upload stock concept CSV",
    showBack: true,
    backTo: "/manager/stockC/select",
  },
  "/manager/vas/select": {
    title: "VAS Selection",
    subtitle: "Select VAS for branch",
    showBack: true,
    backTo: "/manager/dashboard",
  },

  "/manager/view/vas": {
    title: "View VAS",
    subtitle: "View VAS records",
    showBack: true,
    backTo: "/manager/vas/select",
  },
  "/manager/forms/vas": {
    title: "Add VAS",
    subtitle: "Add new VAS",
    showBack: true,
    backTo: "/manager/vas/select",
  },
  "/manager/customers/signup": {
    title: "Register Customer",
    subtitle: "Create new customer account",
    showBack: true,
    backTo: "/manager/dashboard",
  },
};

const ManagerHeader = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector(selectBranchAuth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoutBranchManager, { isLoading: isLoggingOut }] =
    useLogoutBranchManagerMutation();

  const currentRoute = routeConfig[location.pathname] || {
    title: "Branch Admin",
    subtitle: "Honda Dealership Management",
  };

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== "/manager-login") {
      navigate("/manager-login", { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    try {
      const result = await logoutBranchManager().unwrap();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(
        addNotification({
          type: "success",
          message: result.message || "Logged out successfully",
        }),
      );
    } catch (error: any) {
      dispatch(branchLogout());
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(
        addNotification({
          type: "error",
          message: error?.data?.message || "Error logging out",
        }),
      );
    } finally {
      navigate("/manager-login", { replace: true });
    }
  };

  const handleBack = () => {
    currentRoute.backTo ? navigate(currentRoute.backTo) : navigate(-1);
  };

  return (
    <header className='sticky top-0 z-50 bg-gray-950 border-b border-gray-800'>
      <div className='container px-4'>
        <div className='flex items-center justify-between h-14'>
          {/* ── Left ── */}
          <div className='flex items-center gap-3'>
            {/* Logo mark */}
            <Link
              to='/manager/dashboard'
              className='flex items-center gap-2 shrink-0'
            >
              <div className='w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center'>
                <span className='text-white text-xs font-black'>T</span>
              </div>
              <span className='text-sm font-black text-white tracking-tight hidden sm:block'>
                Tsangpool <span className='text-red-500'>Manager</span>
              </span>
            </Link>

            <div className='w-px h-5 bg-gray-700 mx-1' />

            {/* Back button */}
            {currentRoute.showBack && (
              <button
                onClick={handleBack}
                className='flex items-center justify-center w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors'
              >
                <ArrowLeft className='w-3.5 h-3.5 text-gray-400' />
              </button>
            )}

            {/* Page title */}
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

          {/* ── Right ── */}
          <div className='flex items-center gap-2'>
            {/* Quick Actions */}
            {currentRoute.menuItems && (
              <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border-0 text-xs font-medium gap-1.5'
                  >
                    <Menu className='w-3.5 h-3.5' />
                    Quick Actions
                    <ChevronDown className='w-3 h-3 opacity-60' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='end'
                  sideOffset={8}
                  className='w-48 rounded-2xl border border-gray-100 shadow-lg p-1.5'
                >
                  {currentRoute.menuItems.map((item, i) => (
                    <DropdownMenuItem
                      key={i}
                      asChild
                      className='rounded-xl cursor-pointer'
                    >
                      <Link
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className='flex items-center gap-2 px-3 py-2 text-sm font-medium'
                      >
                        <div className='w-1.5 h-1.5 rounded-full bg-red-500 shrink-0' />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className='flex items-center gap-1.5 h-8 px-3 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 hover:border-red-600/40 text-red-400 hover:text-red-300 text-xs font-semibold transition-all disabled:opacity-50'
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

export default ManagerHeader;
