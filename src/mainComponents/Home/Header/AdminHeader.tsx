import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { LogOut, ArrowLeft, Menu, ChevronDown, Settings } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useLogoutAdminMutation } from "@/redux-store/services/adminApi";
import { logout, selectAuth } from "@/redux-store/slices/authSlice";
import { addNotification } from "@/redux-store/slices/uiSlice";

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
  "/admin/dashboard": { title: "Admin Dashboard", subtitle: "" },
  "/admin/branches/add": {
    title: "Add New Branch",
    subtitle: "",
    showBack: true,
    backTo: "/admin/dashboard",
    menuItems: [
      { label: "Add Bikes/Scooty", href: "/admin/bikes/add" },
      { label: "Manage Branches", href: "/admin/branches" },
    ],
  },
  "/admin/bikes/add": {
    title: "Add New Bike",
    subtitle: "Add motorcycle to inventory",
    showBack: true,
    backTo: "/admin/dashboard",
    menuItems: [
      { label: "Add Branch", href: "/admin/branches/add" },
      { label: "Manage Branches", href: "/admin/branches" },
    ],
  },
  "/admin/editbikes": {
    title: "Edit Bike",
    subtitle: "Update motorcycle details",
    showBack: true,
    backTo: "/admin/dashboard",
    menuItems: [
      { label: "Add Branch", href: "/admin/branches/add" },
      { label: "Add Bikes/Scooty", href: "/admin/bikes/add" },
      { label: "Manage Branches", href: "/admin/branches" },
    ],
  },
};

const AdminHeader = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector(selectAuth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoutAdmin, { isLoading: isLoggingOut }] = useLogoutAdminMutation();

  const currentRoute = routeConfig[location.pathname] || {
    title: "Admin Panel",
    subtitle: "Honda Dealership Management",
  };

  useEffect(() => {
    if (!isAuthenticated) navigate("/admin/login");
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    try {
      const result = await logoutAdmin().unwrap();
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
      navigate("/", { replace: true });
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
              to='/admin/dashboard'
              className='flex items-center gap-2 shrink-0'
            >
              <div className='w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center'>
                <span className='text-white text-xs font-black'>H</span>
              </div>
              <span className='text-sm font-black text-white tracking-tight hidden sm:block'>
                Tsangpool <span className='text-red-500'>Admin</span>
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

            {/* Settings icon (visual affordance) */}
            <button className='hidden sm:flex w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 items-center justify-center transition-colors'>
              <Settings className='w-3.5 h-3.5 text-gray-400' />
            </button>

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

export default AdminHeader;
