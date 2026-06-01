import { useEffect, useRef } from "react";
import { LogOut, ArrowLeft, Menu } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { logout, selectAuth } from "@/redux-store/slices/authSlice";
import { addNotification } from "@/redux-store/slices/uiSlice";
import { useLogoutSuperAdminMutation } from "@/redux-store/services/adminApi";

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
  "/admin/branches": {
    title: "Branch Management",
    subtitle: "View and manage dealership branches",
    showBack: true,
    backTo: "/admin/dashboard",
    menuItems: [
      { label: "Add Branch", href: "/admin/branches/add" },
      { label: "Branch Managers", href: "/admin/branches/managers" },
      { label: "Service Admins", href: "/admin/branches/service-admins" },
    ],
  },
  "/admin/branches/managers": {
    title: "Branch Managers",
    subtitle: "",
    showBack: true,
    backTo: "/admin/dashboard",
    menuItems: [
      { label: "Add Branch", href: "/admin/branches/add" },
      { label: "Service Admins", href: "/admin/branches/service-admins" },
    ],
  },
  "/admin/branches/add": {
    title: "Add Branch",
    subtitle: "",
    showBack: true,
    backTo: "/admin/branches",
  },
  "/admin/branches/service-admins": {
    title: "Service Admins",
    subtitle: "",
    showBack: true,
    backTo: "/admin/dashboard",
    menuItems: [
      { label: "Add Branch", href: "/admin/branches/add" },
      { label: "Branch Managers", href: "/admin/branches/managers" },
    ],
  },
  "/admin/viewStaff": {
    title: "View Staff",
    subtitle: "",
    showBack: true,
    backTo: "/admin/dashboard",
    menuItems: [
      { label: "Branch Managers", href: "/admin/branches/managers" },
      { label: "Service Admins", href: "/admin/branches/service-admins" },
    ],
  },
  "/admin/view-total-vas": {
    title: "View Total VAS",
    subtitle: "",
    showBack: true,
    backTo: "/admin/dashboard",
    menuItems: [
      { label: "Branch Managers", href: "/admin/branches/managers" },
      { label: "Service Admins", href: "/admin/branches/service-admins" },
    ],
  },
  "/admin/sales-report": {
    title: "Sales Report",
    subtitle: "",
    showBack: true,
    backTo: "/admin/dashboard",
    menuItems: [
      {
        label: "View Staff",
        href: "/admin/viewStaff",
      },
      {
        label: "View Total VAS",
        href: "/admin/view-total-vas",
      },
    ],
  },
  "/admin/leave-requests": {
    title: "All Leave Requests",
    subtitle: "",
    showBack: true,
    backTo: "/admin/dashboard",
    menuItems: [
      { label: "Branch Managers", href: "/admin/branches/managers" },
      { label: "Service Admins", href: "/admin/branches/service-admins" },
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
  "/admin/service-revenue-stats": {
    title: "Service Revenue Stats",
    subtitle: "",
    showBack: true,
    backTo: "/admin/dashboard",
  },
};

const AdminHeader = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector(selectAuth);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [logoutAdmin, { isLoading: isLoggingOut }] =
    useLogoutSuperAdminMutation();

  const currentRoute = routeConfig[location.pathname] ?? {
    title: "Admin Panel",
    subtitle: "Honda Dealership Management",
  };

  useEffect(() => {
    if (!isAuthenticated) navigate("/admin/login");
  }, [isAuthenticated, navigate]);

  // Close <details> when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        detailsRef.current &&
        !detailsRef.current.contains(e.target as Node)
      ) {
        detailsRef.current.open = false;
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const closeMenu = () => {
    if (detailsRef.current) detailsRef.current.open = false;
  };

  const handleLogout = async () => {
    closeMenu();
    try {
      const result = await logoutAdmin().unwrap();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(
        addNotification({
          type: "success",
          message: result.message || "Logged out successfully",
        }),
      );
    } catch (error: any) {
      dispatch(logout());
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(
        addNotification({
          type: "error",
          message: error?.data?.message || "Error logging out",
        }),
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
            <Link
              to='/admin/dashboard'
              className='flex items-center gap-2 shrink-0'
            >
              <div className='w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center'>
                <span className='text-white text-xs font-black'>T</span>
              </div>
              <span className='text-sm font-black text-white tracking-tight hidden sm:block'>
                Tsangpool <span className='text-red-500'>Admin</span>
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
                <p className='text-[11px] text-gray-200 mt-0.5'>
                  {currentRoute.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* ── Right ── */}
          <div className='flex items-center gap-2'>
            {/* Quick Actions — native <details> menu */}
            {currentRoute.menuItems && (
              <details ref={detailsRef} className='relative'>
                <summary className='flex items-center gap-1.5 h-8 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-medium cursor-pointer list-none transition-colors select-none'>
                  <Menu className='w-3.5 h-3.5 shrink-0' />
                  <span>Quick Actions</span>
                  <svg
                    className='w-3 h-3 opacity-60 shrink-0'
                    viewBox='0 0 12 12'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1.5'
                  >
                    <path
                      d='M2 4l4 4 4-4'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </summary>

                <ul className='absolute right-0 top-[calc(100%+6px)] w-48 rounded-2xl border border-gray-100 bg-white shadow-lg p-1.5 z-50'>
                  {currentRoute.menuItems.map((item, i) => (
                    <li key={i}>
                      <Link
                        to={item.href}
                        onClick={closeMenu}
                        className='flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors'
                      >
                        <span className='w-1.5 h-1.5 rounded-full bg-red-500 shrink-0' />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className='flex items-center gap-1.5 h-8 px-3 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 hover:border-red-600/40 text-red-400 hover:text-red-300 text-xs font-semibold transition-colors disabled:opacity-50'
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
