import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Settings,
  User,
  LogOut,
  Home,
  Wrench,
  FileText,
  Phone,
  User2Icon,
  ArrowLeft,
  Menu,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Redux imports (add these to your project)
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

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
  "/customer-dash": {
    title: "",
    subtitle: "",
  },
  "/dashboard/services": {
    title: "My Services",
    subtitle: "View and manage your service bookings",
    showBack: true,
    backTo: "/customer-dash",
    menuItems: [
      { label: "Book Service", href: "/book-service" },
      { label: "Service History", href: "/dashboard/service-history" },
      { label: "Documents", href: "/dashboard/documents" },
    ],
  },
  "/book-service": {
    title: "Book Service",
    subtitle: "Schedule your motorcycle service",
    showBack: true,
    backTo: "/dashboard/services",
    menuItems: [
      { label: "My Services", href: "/dashboard/services" },
      { label: "Service History", href: "/dashboard/service-history" },
      { label: "Documents", href: "/dashboard/documents" },
    ],
  },
  "/dashboard/documents": {
    title: "My Documents",
    subtitle: "Access your service records and warranties",
    showBack: true,
    backTo: "/customer-dash",
    menuItems: [
      { label: "Book Service", href: "/book-service" },
      { label: "My Services", href: "/dashboard/services" },
      { label: "Service History", href: "/dashboard/service-history" },
    ],
  },
  "/dashboard/service-history": {
    title: "Service History",
    subtitle: "View your past service records",
    showBack: true,
    backTo: "/dashboard/services",
    menuItems: [
      { label: "Book Service", href: "/book-service" },
      { label: "My Services", href: "/dashboard/services" },
      { label: "Documents", href: "/dashboard/documents" },
    ],
  },
  "/customer-initialize": {
    title: "",
    subtitle: "",
    showBack: true,
    backTo: "/customer-dash",
  },
  "/profile": {
    title: "My Profile",
    subtitle: "Manage your account information",
    showBack: true,
    backTo: "/customer-dash",
  },
};

export function CustomerDashHeader() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector(selectAuth);

  const [notifications] = useState(3); // Mock notification count
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [logoutCustomer, { isLoading: isLoggingOut }] = useLogoutCustomerMutation();

  // Get current route configuration
  const currentRoute = routeConfig[location.pathname] || {
    title: "Customer Portal",
    subtitle: "Tsangpool Honda Service Center",
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login"); // Adjust to your customer login route
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    try {
      // await logoutCustomer().unwrap();
      dispatch(logout());
      dispatch(
        addNotification({
          type: "success",
          message: "Logged out successfully",
        })
      );
      navigate("/");
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          message: "Error logging out",
        })
      );
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
    <header className='bg-white border-b border-gray-200 sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Left Section - Logo and Title with Back Button */}
          <div className='flex items-center space-x-4'>
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

            <Link to='/' className='flex items-center space-x-2'>
              <span className='font-bold text-xl text-red-500'>
                Tsangpool Honda
              </span>
            </Link>
            <div className='hidden md:block h-6 w-px bg-gray-300' />

            {/* Dynamic Title */}
            <div className='hidden md:block'>
              <h1 className='text-lg font-semibold text-gray-900'>
                {currentRoute.title}
              </h1>
              {currentRoute.subtitle && (
                <p className='text-sm text-gray-600'>{currentRoute.subtitle}</p>
              )}
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className='hidden md:flex items-center space-x-6'>
            <Link
              to='/customer-dash'
              className={`transition-colors ${
                location.pathname === "/customer-dash"
                  ? "text-red-600 font-medium"
                  : "text-gray-600 hover:text-red-600"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to='/dashboard/services'
              className={`transition-colors ${
                location.pathname === "/dashboard/services"
                  ? "text-red-600 font-medium"
                  : "text-gray-600 hover:text-red-600"
              }`}
            >
              Services
            </Link>
            <Link
              to='/dashboard/documents'
              className={`transition-colors ${
                location.pathname === "/dashboard/documents"
                  ? "text-red-600 font-medium"
                  : "text-gray-600 hover:text-red-600"
              }`}
            >
              Documents
            </Link>
            <Link
              to='/contact'
              className='text-gray-600 hover:text-red-600 transition-colors'
            >
              Support
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className='flex items-center space-x-4'>
            {/* Notifications */}
            <Button variant='ghost' size='sm' className='relative'>
              <Bell className='h-5 w-5' />
              {notifications > 0 && (
                <Badge className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-600'>
                  {notifications}
                </Badge>
              )}
            </Button>

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

            {/* Quick Service Button - Desktop */}
            <div className='hidden sm:flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                className='text-red-600 border-red-600 hover:bg-red-50 bg-transparent'
                asChild
              >
                <Link to='/book-service'>
                  <Wrench className='h-4 w-4 mr-1' />
                  Book Service
                </Link>
              </Button>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='relative h-10 w-10 rounded-full bg-gray-200'
                >
                  <User2Icon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-56' align='end' forceMount>
                <DropdownMenuLabel className='font-normal'>
                  <div className='flex flex-col space-y-1'>
                    <p className='text-sm font-medium leading-none'>
                      {user?.name || "Customer"}
                    </p>
                    <p className='text-xs leading-none text-muted-foreground'>
                      {user?.email || "customer@email.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to='/profile'>
                    <User className='mr-2 h-4 w-4' />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className='mr-2 h-4 w-4' />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to='/dashboard/documents'>
                    <FileText className='mr-2 h-4 w-4' />
                    <span>Documents</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to='/'>
                    <Home className='mr-2 h-4 w-4' />
                    <span>Back to Website</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-red-600'
                  onClick={handleLogout}
                  // disabled={isLoggingOut}
                >
                  <LogOut className='mr-2 h-4 w-4' />
                  {/* <span>{isLoggingOut ? "Logging out..." : "Log out"}</span> */}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className='md:hidden border-t border-gray-200 bg-gray-50'>
        <div className='px-4 py-2'>
          <div className='flex justify-around'>
            <Link
              to='/customer-dash'
              className={`flex flex-col items-center py-2 ${
                location.pathname === "/customer-dash"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              <Home className='h-5 w-5' />
              <span className='text-xs mt-1'>Dashboard</span>
            </Link>
            <Link
              to='/dashboard/services'
              className={`flex flex-col items-center py-2 ${
                location.pathname === "/dashboard/services"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              <Wrench className='h-5 w-5' />
              <span className='text-xs mt-1'>Services</span>
            </Link>
            <Link
              to='/dashboard/documents'
              className={`flex flex-col items-center py-2 ${
                location.pathname === "/dashboard/documents"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              <FileText className='h-5 w-5' />
              <span className='text-xs mt-1'>Documents</span>
            </Link>
            <Link
              to='/contact'
              className='flex flex-col items-center py-2 text-gray-600'
            >
              <Phone className='h-5 w-5' />
              <span className='text-xs mt-1'>Support</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
