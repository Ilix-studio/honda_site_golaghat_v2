export const routeConfigAdmin: Record<
  string,
  {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    backTo?: string;
    menuItems?: Array<{ label: string; href: string }>;
  }
> = {
  // ── existing entries ──
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

  // ── Branch Management ──
  "/admin/branches/managers": {
    title: "Branch Managers",
    subtitle: "Manage branch staff",
    showBack: true,
    backTo: "/admin/dashboard",
    menuItems: [{ label: "Add Branch", href: "/admin/branches/add" }],
  },

  // ── Bike Image Management ──
  "/admin/bikes/images/:id": {
    title: "Bike Image",
    subtitle: "View bike image",
    showBack: true,
    backTo: "/admin/dashboard",
  },
  "/admin/bikes/:bikeId/images/add": {
    title: "Add Bike Images",
    subtitle: "Upload images for this motorcycle",
    showBack: true,
    backTo: "/admin/dashboard",
    menuItems: [
      { label: "Edit Images", href: "/admin/bikes/:bikeId/images/edit" },
    ],
  },
  "/admin/bikes/:bikeId/images/edit": {
    title: "Edit Bike Images",
    subtitle: "Manage motorcycle images",
    showBack: true,
    backTo: "/admin/dashboard",
  },
  "/admin/bikeimages/:bikeId": {
    title: "Bike Images",
    subtitle: "View all bike images",
    showBack: true,
    backTo: "/admin/dashboard",
  },
  "/admin/scootyimages/:bikeId": {
    title: "Scooter Images",
    subtitle: "View all scooter images",
    showBack: true,
    backTo: "/admin/dashboard",
  },
  "/admin/bikes/add/:id/images": {
    title: "Manage Bike Images",
    subtitle: "Add or update motorcycle images",
    showBack: true,
    backTo: "/admin/bikes/add",
  },

  // ── Customer Management ──
  "/customers/signup": {
    title: "Customer Sign Up",
    subtitle: "Register a new customer",
    showBack: true,
    backTo: "/admin/dashboard",
  },

  // ── VAS ──
  "/admin/vas/select": {
    title: "Select VAS",
    subtitle: "Choose value-added service",
    showBack: true,
    backTo: "/admin/dashboard",
    menuItems: [{ label: "VAS Form", href: "/admin/forms/vas" }],
  },
  "/admin/forms/vas": {
    title: "VAS Form",
    subtitle: "Configure value-added service",
    showBack: true,
    backTo: "/admin/vas/select",
  },
  "/admin/view/vas": {
    title: "View VAS",
    subtitle: "View VAS records",
    showBack: true,
    backTo: "/admin/vas/select",
  },

  // ── Stock Concept ──
  "/admin/stockC/select": {
    title: "Select Stock",
    subtitle: "Choose stock concept",
    showBack: true,
    backTo: "/admin/dashboard",
    menuItems: [
      { label: "Stock Concept Form", href: "/admin/forms/stock-concept" },
      { label: "CSV Import", href: "/admin/forms/stock-concept-csv" },
    ],
  },
  "/admin/forms/stock-concept": {
    title: "Stock Concept Form",
    subtitle: "Add stock concept details",
    showBack: true,
    backTo: "/admin/stockC/select",
    menuItems: [
      { label: "CSV Import", href: "/admin/forms/stock-concept-csv" },
      { label: "View All Stock", href: "/admin/get/all-stock" },
    ],
  },
  "/admin/forms/stock-concept-csv": {
    title: "Import CSV Stock",
    subtitle: "Bulk stock upload via CSV",
    showBack: true,
    backTo: "/admin/stockC/select",
    menuItems: [
      { label: "View CSV Files", href: "/admin/get/csv" },
      { label: "View All Stock", href: "/admin/get/all-stock" },
    ],
  },
  "/admin/get/all-stock": {
    title: "All Stock Files",
    subtitle: "View and manage stock records",
    showBack: true,
    backTo: "/admin/stockC/select",
    menuItems: [
      { label: "Add Stock", href: "/admin/stockC/select" },
      { label: "CSV Files", href: "/admin/get/csv" },
    ],
  },
  "/admin/get/csv": {
    title: "CSV Files",
    subtitle: "Manage CSV stock imports",
    showBack: true,
    backTo: "/admin/dashboard",
    menuItems: [
      { label: "Import CSV", href: "/admin/forms/stock-concept-csv" },
      { label: "All Stock", href: "/admin/get/all-stock" },
    ],
  },

  // ── Assignment ──
  "/admin/assign/stock-concept/:id": {
    title: "Assign Stock",
    subtitle: "Assign stock concept to customer",
    showBack: true,
    backTo: "/admin/get/all-stock",
  },

  // ── Service Bookings ──
  "/admin/service-bookings": {
    title: "Service Bookings",
    subtitle: "Manage all service appointments",
    showBack: true,
    backTo: "/admin/dashboard",
  },

  // ── Finance Queries ──
  "/admin/finanace-query": {
    title: "Finance Queries",
    subtitle: "Manage finance enquiries",
    showBack: true,
    backTo: "/admin/dashboard",
  },

  // ── Messages ──
  "/admin/any-messages": {
    title: "Messages",
    subtitle: "Customer contact messages",
    showBack: true,
    backTo: "/admin/dashboard",
  },

  // ── Accident Reports ──
  "/admin/accident-reports": {
    title: "Accident Reports",
    subtitle: "View all accident reports",
    showBack: true,
    backTo: "/admin/dashboard",
  },
  "/admin/accident-reports/:id": {
    title: "Accident Report Detail",
    subtitle: "View report details",
    showBack: true,
    backTo: "/admin/accident-reports",
  },
};
