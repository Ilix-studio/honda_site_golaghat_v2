import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  User,
  LogOut,
  Home,
  Wrench,
  Phone,
  User2Icon,
  ArrowLeft,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Redux imports - Using the custom hook for customer authentication
import { useAppDispatch } from "@/hooks/redux";
import { useAuthForCustomer } from "@/hooks/useAuthforCustomer";
import { logout } from "@/redux-store/slices/customer/customerAuthSlice";
import { addNotification } from "@/redux-store/slices/uiSlice";
import { routeConfig } from "@/config/routeConfig";

export function CustomerDashHeader() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Using the custom hook for customer authentication
  const { isAuthenticated, customer, firebaseToken } = useAuthForCustomer();

  // const [logoutCustomer, { isLoading: isLoggingOut }] = useLogoutCustomerMutation();

  // Get current route configuration
  const currentRoute = routeConfig[location.pathname] || {
    title: "Customer Portal",
    subtitle: "Tsangpool Honda Service Center",
  };

  // Redirect if not authenticated or no firebase token
  useEffect(() => {
    if (!isAuthenticated || !firebaseToken) {
      navigate("/customer/login");
    }
  }, [isAuthenticated, firebaseToken, navigate]);

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
  const seeNotification = () => {
    navigate("/customer/notification");
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

            <Link
              to='/customer/dashboard'
              className='flex items-center space-x-2'
            >
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
              to='/customer/dashboard'
              className={`transition-colors ${
                location.pathname === "/customer/dashboard"
                  ? "text-red-600 font-medium"
                  : "text-gray-600 hover:text-red-600"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to='/customer/services'
              className={`transition-colors ${
                location.pathname === "/dashboard/services"
                  ? "text-red-600 font-medium"
                  : "text-gray-600 hover:text-red-600"
              }`}
            >
              Services
            </Link>

            <Link
              to='/customer/support'
              className='text-gray-600 hover:text-red-600 transition-colors'
            >
              Support
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className='flex items-center space-x-4'>
            {/* Notifications */}
            <Button
              variant='ghost'
              size='sm'
              className='relative'
              onClick={seeNotification}
            ></Button>

            {/* Quick Service Button - Desktop */}
            <div className='hidden sm:flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                className='text-red-600 border-red-600 hover:bg-red-50 bg-transparent'
                asChild
              >
                <Link to='/customer/book-service'>
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
                      {customer?.firstName && customer?.lastName
                        ? `${customer.firstName} ${customer.lastName}`
                        : customer?.firstName || "Customer"}
                    </p>
                    <p className='text-xs leading-none text-muted-foreground'>
                      {customer?.email ||
                        customer?.phoneNumber ||
                        "customer@email.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to='/customer/profile-info'>
                    <User className='mr-2 h-4 w-4' />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild></DropdownMenuItem>
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
                  <span>Log out</span>
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
              to='/customer/dashboard'
              className={`flex flex-col items-center py-2 ${
                location.pathname === "/customer/dashboard"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              <Home className='h-5 w-5' />
              <span className='text-xs mt-1'>Dashboard</span>
            </Link>
            <Link
              to='/customer/services'
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
              to='/customer/support'
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
