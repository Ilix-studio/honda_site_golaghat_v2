import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { LogOut, ArrowLeft, Menu } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Redux
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useLogoutAdminMutation } from "@/redux-store/services/adminApi";
import { logout, selectAuth } from "@/redux-store/slices/authSlice";
import { addNotification } from "@/redux-store/slices/uiSlice";

// Route configuration for dynamic titles and navigation
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
  "/admin/dashboard": {
    title: "Admin Dashboard",
    subtitle: "",
  },
  "/admin/addbranch": {
    title: "Add New Branch",
    subtitle: "",
    showBack: true,
    backTo: "/admin/dashboard",
    menuItems: [
      { label: "Add Bikes/Scooty", href: "/admin/addbikes" },
      { label: "Manage Branches", href: "/admin/branches" },
    ],
  },
  "/admin/addbikes": {
    title: "Add New Bike",
    subtitle: "Add motorcycle to inventory",
    showBack: true,
    backTo: "/admin/dashboard",
    menuItems: [
      { label: "Add Branch", href: "/admin/addbranch" },
      { label: "Manage Branches", href: "/admin/branches" },
    ],
  },
  "/admin/editbikes": {
    title: "Edit Bike",
    subtitle: "Update motorcycle details",
    showBack: true,
    backTo: "/admin/dashboard",
    menuItems: [
      { label: "Add Branch", href: "/admin/addbranch" },
      { label: "Add Bikes/Scooty", href: "/admin/addbikes" },
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

  // Get current route configuration
  const currentRoute = routeConfig[location.pathname] || {
    title: "Admin Panel",
    subtitle: "Honda Dealership Management",
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/superlogin");
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    try {
      // Show loading state
      setIsMenuOpen(false);

      const result = await logoutAdmin().unwrap();

      // Clear any additional client-side data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      dispatch(
        addNotification({
          type: "success",
          message: result.message || "Logged out successfully",
        })
      );

      // Force navigation after successful logout
      navigate("/", { replace: true });
    } catch (error: any) {
      // Even on error, clear local state and redirect
      dispatch(logout());
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      dispatch(
        addNotification({
          type: "error",
          message: error?.data?.message || "Error logging out",
        })
      );

      // Still redirect to home
      navigate("/", { replace: true });
    }
  };

  const handleBack = () => {
    if (currentRoute.backTo) {
      navigate(currentRoute.backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className='bg-white shadow-sm  sticky top-0 z-50 border-b-4 border-black-600'>
      <div className='container px-4 py-4'>
        <div className='flex justify-between items-center'>
          {/* Left Section - Title with Back Button */}
          <div className='flex items-center gap-4'>
            {currentRoute.showBack && (
              <Button
                variant='ghost'
                size='sm'
                onClick={handleBack}
                className='pl-0'
              >
                <ArrowLeft className='h-4 w-4 mr-2' />
              </Button>
            )}

            <div>
              <h1 className='text-1xl font-bold text-gray-900'>
                {currentRoute.title}
              </h1>
              {currentRoute.subtitle && (
                <p className='text-gray-600'>{currentRoute.subtitle}</p>
              )}
            </div>
          </div>

          {/* Right Section - Menu and Logout */}
          <div className='flex items-center gap-2'>
            {/* Quick Actions Menu - Desktop */}
            {currentRoute.menuItems && (
              <div className='hidden md:flex items-center gap-2'>
                <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' size='sm'>
                      <Menu className='h-4 w-4 mr-2' />
                      Quick Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-48'>
                    {currentRoute.menuItems.map((item, index) => (
                      <DropdownMenuItem key={index} asChild>
                        <Link
                          to={item.href}
                          className='cursor-pointer'
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Logout Button - Desktop (when no menu items) */}
            {!currentRoute.menuItems && (
              <Button
                variant='outline'
                size='sm'
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className='h-4 w-4 mr-2' />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            )}

            {/* Logout Button - Desktop (when menu items exist) */}
            {currentRoute.menuItems && (
              <div className='hidden md:block'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className='h-4 w-4 mr-2' />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
