import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronRight,
  Cog,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface NavNode {
  label: string;
  /** A leaf links somewhere; a node with `children` only expands. */
  href?: string;
  children?: NavNode[];
}

interface NavSection extends NavNode {
  icon: LucideIcon;
}

/**
 * The routes behind the dashboard's "Operations" and "Operations Type 2"
 * tabs, kept in step with the cards in BranchManagerDashboard.tsx and
 * Tabs/OperationOpz.tsx.
 */
const NAV: NavSection[] = [
  {
    label: "Operations",
    icon: Cog,
    children: [
      {
        label: "Stock Inventory",
        children: [
          { label: "Add Stock", href: "/manager/stockC/select" },
          { label: "All Stock Files", href: "/manager/get/all-stock" },
          { label: "CSV Uploads", href: "/manager/get/csv" },
        ],
      },
      { label: "Sales Report", href: "/manager/sales-report" },
      { label: "B2B Challan", href: "/manager/b2b-sales" },
      { label: "Customer List", href: "/customers/new" },
      {
        label: "Bike Catalogue",
        children: [
          { label: "Add Bike & Images", href: "/bikes/add" },
          { label: "View All Bikes", href: "/viewAll" },
          // Editing needs a bike id, so this opens the list with an Edit button per card.
          { label: "Edit Bike", href: "/viewAll" },
        ],
      },
      { label: "Quotations", href: "/manager/quotations" },
    ],
  },
  {
    label: "Operations Type 2",
    icon: Cog,
    children: [
      {
        label: "Value-Added Services",
        children: [
          { label: "Add VAS", href: "/manager/vas/select" },
          { label: "View VAS", href: "/manager/view/vas" },
        ],
      },
      {
        label: "Team",
        children: [
          { label: "Service Admins", href: "/manager/service-admins" },
          { label: "Part Admins", href: "/manager/part-admins" },
          { label: "Staff", href: "/manager/staff" },
        ],
      },
      { label: "Apply Leave", href: "/manager/apply-leave" },
      { label: "Price Manager", href: "/manager/add-new-price" },
      {
        label: "Maintenance Request",
        href: "/manager/raise-maintenance-request",
      },
    ],
  },
];

/** Pages that use the full width and so don't get the floating Menu button. */
const HIDDEN_ON = [
  "/manager/sales-report",
  "/manager/get/all-stock",
  "/customers/new",
];

/** Does this node, or anything under it, point at the current page? */
const containsPath = (node: NavNode, pathname: string): boolean =>
  node.href === pathname ||
  (node.children?.some((c) => containsPath(c, pathname)) ?? false);

function NavItem({
  node,
  depth,
  pathname,
  onNavigate,
}: {
  node: NavNode;
  depth: number;
  pathname: string;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(() => containsPath(node, pathname));
  // Indent per level so the nesting reads at a glance.
  const indent = { paddingLeft: `${0.75 + depth * 0.9}rem` };

  if (node.children) {
    return (
      <li>
        <button
          type='button'
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          style={indent}
          className='flex w-full items-center justify-between rounded-md py-2 pr-3 text-left text-sm font-medium text-gray-800 hover:bg-gray-100'
        >
          {node.label}
          <ChevronRight
            className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-90" : ""}`}
          />
        </button>
        {open && (
          <ul className='space-y-0.5'>
            {node.children.map((child) => (
              <NavItem
                key={child.label}
                node={child}
                depth={depth + 1}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  const active = node.href === pathname;
  return (
    <li>
      <Link
        to={node.href!}
        onClick={onNavigate}
        style={indent}
        className={`block rounded-md py-2 pr-3 text-sm transition-colors ${
          active
            ? "bg-gray-900 font-medium text-white"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        {node.label}
      </Link>
    </li>
  );
}

/**
 * Multi-level navigation for the Branch-Admin dashboard: a button pinned to
 * the left edge, vertically centred, that opens a slide-in tree of the
 * Operations and Operations Type 2 routes.
 */
export default function BranchSidebar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  if (HIDDEN_ON.includes(pathname.replace(/\/+$/, ""))) return null;

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        aria-label='Open navigation menu'
        className='fixed left-0 top-1/2 z-40 flex -translate-y-1/2 items-center gap-1.5 rounded-r-xl border border-l-0 border-gray-700 bg-gray-900 px-2 py-3 text-white shadow-lg transition-colors hover:bg-gray-700'
      >
        <PanelLeftOpen className='h-4 w-4' />
        <span className='hidden text-xs font-medium sm:inline'>Menu</span>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side='left'
          className='w-72 overflow-y-auto p-0 sm:max-w-xs'
        >
          <SheetHeader className='border-b'>
            <SheetTitle>Branch Menu</SheetTitle>
          </SheetHeader>
          <nav className='space-y-4 p-3' aria-label='Branch manager'>
            {NAV.map((section) => (
              <div key={section.label}>
                <p className='mb-1 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400'>
                  <section.icon className='h-3.5 w-3.5' />
                  {section.label}
                </p>
                <ul className='space-y-0.5'>
                  {section.children!.map((node) => (
                    <NavItem
                      key={node.label}
                      node={node}
                      depth={0}
                      pathname={pathname}
                      onNavigate={() => setOpen(false)}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
