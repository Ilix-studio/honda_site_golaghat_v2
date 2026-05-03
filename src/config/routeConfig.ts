// move the big Record<string,...> there

export const requiresAuth = (path: string): boolean =>
  path.startsWith("/admin/") ||
  path.startsWith("/customer/") ||
  path.startsWith("/manager/");

export const getRouteCategory = (
  path: string,
): "public" | "admin" | "customer" | "branchManager" | "immediate" => {
  if (path.startsWith("/admin/")) return "admin";
  if (path.startsWith("/customer/")) return "customer";
  if (path.startsWith("/manager/")) return "branchManager";
  if (path === "/") return "immediate";
  return "public";
};

// Route configuration object for CustomerDashHeader
export const routeConfig: Record<
  string,
  {
    title?: string;
    subtitle?: string;
    showBack?: boolean;
    backTo?: string;
  }
> = {
  "/customer/dashboard": {
    title: "Dashboard",
    subtitle: "Customer Portal",
  },
  "/customer/services": {
    title: "Services",
    subtitle: "Customer Portal",
  },
  "/customer/support": {
    title: "Support",
    subtitle: "Customer Portal",
  },
  "/customer/book-service": {
    title: "Book Service",
    subtitle: "Customer Portal",
    showBack: true,
    backTo: "/customer/services",
  },
  "/customer/profile": {
    title: "Profile",
    subtitle: "Customer Portal",
    showBack: true,
    backTo: "/customer/dashboard",
  },
};
