import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const PAGE_TITLES: Record<string, string> = {
  // Public
  "/": "Tsangpool Honda | Motorcycles & Scooters",
  "/finance": "Finance Options | Tsangpool Honda",
  "/contact": "Contact Us | Tsangpool Honda",
  "/view-all": "All Models | Tsangpool Honda",
  "/branches": "Our Branches | Tsangpool Honda",
  "/compare": "Compare Bikes | Tsangpool Honda",
  "/search": "Search | Tsangpool Honda",

  // Customer
  "/customer/login": "Login | Tsangpool Honda",
  "/customer/initialize": "Setup Account | Tsangpool Honda",
  "/customer/first-dash": "Dashboard | Tsangpool Honda",
  "/customer/profile/create": "Create Profile | Tsangpool Honda",
  "/customer/profile-info": "Profile | Tsangpool Honda",
  "/customer/services": "My Services | Tsangpool Honda",
  "/customer/services/vas": "Value Added Services | Tsangpool Honda",
  "/customer/support": "Support | Tsangpool Honda",
  "/customer/book-service": "Book Service | Tsangpool Honda",
  "/customer/select/stock": "Add Vehicle | Tsangpool Honda",
  "/customer/vehicle/info": "Vehicle Info | Tsangpool Honda",

  // Admin
  "/admin/login": "Admin Login | Tsangpool Honda",
  "/admin/dashboard": "Admin Dashboard | Tsangpool Honda",
  "/admin/bikes/add": "Add Bike | Tsangpool Honda",
  "/admin/branches/add": "Add Branch | Tsangpool Honda",
  "/admin/branches/view": "Branches | Tsangpool Honda",
  "/admin/forms/vas": "VAS Form | Tsangpool Honda",
  "/admin/view/vas": "View VAS | Tsangpool Honda",
  "/admin/forms/stock-concept": "Stock Concept | Tsangpool Honda",
  "/admin/view/stock-concept": "View Stock | Tsangpool Honda",
};

const FALLBACK_TITLE = "Tsangpool Honda";

export const usePageTitle = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Exact match first
    const exact = PAGE_TITLES[pathname];
    if (exact) {
      document.title = exact;
      return;
    }

    // Prefix match for dynamic segments (e.g. /admin/bikes/edit/:id)
    const prefix = Object.keys(PAGE_TITLES)
      .filter((key) => pathname.startsWith(key) && key !== "/")
      .sort((a, b) => b.length - a.length)[0]; // longest match wins

    document.title = prefix ? PAGE_TITLES[prefix] : FALLBACK_TITLE;
  }, [pathname]);
};
