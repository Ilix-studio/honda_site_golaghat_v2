import React, { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TagVariant = "fe" | "be" | "admin" | "infra";

interface LineItem {
  name: string;
  components: string;
  scope: string;
  complexity: "Simple" | "Medium" | "Complex";
  charge: number;
  tag: TagVariant;
}

interface TotalRow {
  label: string;
  value: string;
  variant?: "default" | "discount" | "grand";
}

interface NoteBox {
  title: string;
  highlight?: boolean;
  content: React.ReactNode;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TAG_STYLES: Record<TagVariant, string> = {
  fe: "bg-blue-50 text-blue-700",
  be: "bg-red-50 text-red-800",
  admin: "bg-red-50 text-red-800",
  infra: "bg-yellow-50 text-yellow-800",
};

const TAG_LABELS: Record<TagVariant, string> = {
  fe: "Frontend",
  be: "Backend",
  admin: "Admin",
  infra: "Infra",
};

const FRONTEND_ITEMS: LineItem[] = [
  {
    name: "Parts Module — Part-Admin Dashboard & AI Assistant",
    components:
      "PartsFolderDashboard, PartsRecordsFolder, PartsDatasetRecords, PartsStockUploadForm, PartsStockImport, PartsKpiCharts, PartsAiAssistant, PartAdmins, LoginPartAdmin, partsApi",
    scope:
      "Dedicated Part-Admin login, folder-based dataset browser, XLSX/CSV/PDF upload with progress UI, KPI chart dashboard, conversational AI assistant panel grounded on report aggregates",
    complexity: "Complex",
    charge: 8400,
    tag: "admin",
  },
  {
    name: "Counter Sale Report Module UI",
    components:
      "CounterSaleAdminDashboard, CounterSaleRecordsTable, CounterSaleUploadForm, CounterSaleKpiCharts, CounterSaleDeletedBatches, counterSaleApi",
    scope:
      "Branch-scoped KPI dashboard, tabular records view, batch upload form, soft-delete audit/restore view for deleted batches",
    complexity: "Complex",
    charge: 7700,
    tag: "admin",
  },
  {
    name: "Current-User Profile",
    components: "ProfileView, ProfileUpdate",
    scope:
      "Shared self-view/edit profile screens across all admin/staff roles, including ScanFleet sticker and blood-group/insurance fields",
    complexity: "Simple",
    charge: 4200,
    tag: "fe",
  },
  {
    name: "ScanFleet Vehicle-Tracking UI",
    components: "BuyStickers, UseToken, ScanfleetSupport",
    scope:
      "Sticker bind/purchase flow with tokenId/qrId confirmation, token activation form, customer-support tracking screen",
    complexity: "Medium",
    charge: 5600,
    tag: "fe",
  },
  {
    name: "Part-Admin Role Routing & Header",
    components:
      "routeutils (isPartAdminRoute), routeHelpers (PartAdminRouteWrapper, createPartAdminRoute), PartAdminHeader",
    scope:
      "New role threaded through ProtectedRoute, route-type resolution, and header selection — structural addition alongside Super-Admin / Branch-Admin / Service-Admin / Staff",
    complexity: "Medium",
    charge: 5600,
    tag: "admin",
  },
  {
    name: "Finance Pre-Approval & Bike Enquiry Flow",
    components:
      "GetApprovedForm, BikeEnquiryButton, FinanceWithBikeEnquiry, EnquiryDashboard, useGetApproved, getApprovedApi, getApprovedSlice",
    scope:
      "Multi-step loan pre-approval form integrated with bike enquiry, plus an admin-side enquiry management dashboard",
    complexity: "Complex",
    charge: 7700,
    tag: "fe",
  },
  {
    name: "Dealership Locator (Google Places)",
    components:
      "DealershipFinder, DealershipLocator, DealershipReviews, useGooglePlaces",
    scope:
      "Map/autocomplete-driven dealership locator with live reviews display, replacing the original static landing page section",
    complexity: "Medium",
    charge: 5600,
    tag: "fe",
  },
  {
    name: "Staff Leave & Accident Report UI",
    components:
      "ApplyLeave, ListLeave, LeaveStatus, TabBased, GetAllAccidentReports, GetAllAccidentReportsById, BranchAccidentReports, AccidentReport, ViewAccidentReport",
    scope:
      "Submission forms plus review/status flows spanning customer, staff, branch-manager, and admin roles",
    complexity: "Medium",
    charge: 6300,
    tag: "admin",
  },
  {
    name: "Marketing Site Extras — Visitor Tracking & Contact",
    components: "ContactSection, SeeMessages, visitorApi wiring in Footer",
    scope:
      "Public contact form, admin message inbox, and site visitor-tracking hook",
    complexity: "Simple",
    charge: 4200,
    tag: "fe",
  },
  {
    name: "Quotation Manager UI",
    components: "QuotationManager",
    scope: "Quotation creation/management screen for staff/admin roles",
    complexity: "Medium",
    charge: 5600,
    tag: "admin",
  },
];

const BACKEND_ITEMS: LineItem[] = [
  {
    name: "Parts Module — Backend & AI Assistant",
    components:
      "partsReport.service, partsAi.service, partsStockDiff.service, controllers/Parts (upload/stats/AI), PartsReport, PartsReportBatch",
    scope:
      "XLSX/CSV parsing (SheetJS) + best-effort PDF extraction, SHA-256 row-hash dedup, Claude-backed AI assistant grounded on aggregated stats (not raw rows)",
    complexity: "Complex",
    charge: 8400,
    tag: "be",
  },
  {
    name: "Counter Sale Report Module — Backend",
    components:
      "counterSaleReport.service, controllers/CounterSale (upload/stats/delete), CounterSaleReport",
    scope:
      "Business-key dedup (CPOTC Order #) with partial unique index, soft-delete + full audit trail, flexible date/currency parsing, live batch-total aggregation",
    complexity: "Complex",
    charge: 7700,
    tag: "be",
  },
  {
    name: "Current-User Profile API",
    components: "UserProfile, profile.controller",
    scope:
      "Role-agnostic profile extension (blood group, insurance, ScanFleet sticker, address override) merged with identity from the resolved role document",
    complexity: "Simple",
    charge: 4200,
    tag: "be",
  },
  {
    name: "ScanFleet Integration — Backend Proxy",
    components: "setting.scanfleet, scanfleet.service, scanfleet.controller",
    scope:
      "Third-party GPS/sticker activation proxy with Basic-auth upstream calls and 502 error wrapping",
    complexity: "Medium",
    charge: 5600,
    tag: "be",
  },
  {
    name: "Refresh Token & Session System",
    components:
      "jwt.ts (refresh-token generation/verification), tokenCleanup, authCookie config, /api/auth/refresh",
    scope:
      "Dual-secret token rotation with httpOnly cookie, wired across all five login role variants",
    complexity: "Medium",
    charge: 5950,
    tag: "be",
  },
  {
    name: "Part-Admin Role — Backend & Permissions",
    components:
      "user.types (ROLES/AuthenticatedUser/guards), protect middleware, usermanagement.controller",
    scope:
      "New role added to the auth union with branch-scoped creation/list/delete enforced at the controller level",
    complexity: "Medium",
    charge: 5250,
    tag: "be",
  },
  {
    name: "Staff Leave & Accident Report API",
    components:
      "LeaveApplication, leave_controller, AccidentReport, accidentReport.controller",
    scope:
      "13 endpoints combined — apply/list/cancel plus admin/branch-manager review-and-approve flows across two features",
    complexity: "Medium",
    charge: 6300,
    tag: "be",
  },
  {
    name: "Marketing & Finance Enquiry APIs",
    components:
      "getapproved.controller, enquiry.controller, visitor.controller, contact.controller",
    scope:
      "Loan-style pre-approval flow with status checks (~10 endpoints), enquiry capture, visitor tracking/stats, and contact-message inbox",
    complexity: "Complex",
    charge: 8400,
    tag: "be",
  },
  {
    name: "Google Places API Integration",
    components: "routes/googlePlaces",
    scope:
      "Field-masked proxy to Places API v1 for dealership search/autocomplete/reviews",
    complexity: "Medium",
    charge: 5600,
    tag: "be",
  },
  {
    name: "Quotation Module — Backend",
    components: "quotation_controller, Quotation model",
    scope: "Quotation CRUD scoped to staff/admin roles",
    complexity: "Medium",
    charge: 5250,
    tag: "be",
  },
  {
    name: "Service-Jobcard Bulk-Import Pipeline",
    components:
      "service-jobcard controllers/service/models (distinct from the original ServiceM job-card module)",
    scope:
      "Dedicated bulk-import pipeline for service job cards, separate from the manually-created job-card flow already billed",
    complexity: "Complex",
    charge: 7700,
    tag: "be",
  },
  {
    name: "Generic Data-Import Framework",
    components:
      "data-import config/list/upload controllers, ImportedDataset, ImportedRow",
    scope:
      "Reusable, schema-flexible import infrastructure generalizing the ad-hoc CSV/XLSX patterns used by Parts and Counter Sale",
    complexity: "Complex",
    charge: 8400,
    tag: "infra",
  },
  {
    name: "RAG / AI Dashboard System",
    components:
      "service/rag (embeddings, query router, per-source adapters), EmbeddingChunk, /api/rag routes",
    scope:
      "Vector-embedding pipeline with multi-source retrieval and a query router — the most complex net-new subsystem, beyond anything in the original build",
    complexity: "Complex",
    charge: 9800,
    tag: "be",
  },
];

const TOTALS: TotalRow[] = [
  { label: "Frontend Subtotal", value: "₹60,900" },
  { label: "Backend Subtotal", value: "₹88,550" },
  { label: "Gross Total", value: "₹1,49,450" },
  { label: "Grand Total", value: "₹1,49,450", variant: "grand" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const Tag: React.FC<{ variant: TagVariant }> = ({ variant }) => (
  <span
    className={`inline-block font-bold px-1.5 py-0.5 rounded-sm mt-1 uppercase tracking-widest ${TAG_STYLES[variant]}`}
    style={{ fontSize: 9 }}
  >
    {TAG_LABELS[variant]}
  </span>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div
    className='flex items-center gap-2 border-b-2 border-red-600 uppercase font-bold text-red-600 tracking-widest'
    style={{ fontSize: 10, paddingTop: 24, paddingBottom: 12 }}
  >
    <span className='w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0' />
    {children}
  </div>
);

const MetaItem: React.FC<{
  label: string;
  value: string;
  valueClass?: string;
}> = ({ label, value, valueClass = "text-white" }) => (
  <div>
    <span
      className='block text-gray-500 uppercase tracking-widest mb-1'
      style={{ fontSize: 10 }}
    >
      {label}
    </span>
    <span className={`text-sm ${valueClass}`}>{value}</span>
  </div>
);

const ItemRow: React.FC<{ item: LineItem }> = ({ item }) => (
  <tr className='hover:bg-gray-50 transition-colors duration-150'>
    <td
      className='py-2 sm:py-3 px-2 border-b border-gray-100 align-top'
      style={{ width: "36%" }}
    >
      <div className='font-bold text-sm text-gray-900 pr-2'>{item.name}</div>
      <div className='text-xs text-gray-400 mt-0.5 leading-relaxed hidden sm:block'>
        {item.components}
      </div>
      <div className='text-xs text-gray-400 mt-0.5 leading-relaxed sm:hidden'>
        {item.components.length > 50
          ? item.components.substring(0, 50) + "..."
          : item.components}
      </div>
      <Tag variant={item.tag} />
    </td>
    <td
      className='py-2 sm:py-3 px-2 border-b border-gray-100 align-top hidden sm:table-cell'
      style={{ width: "28%" }}
    >
      <div className='text-xs text-gray-400 leading-relaxed'>{item.scope}</div>
    </td>
    <td className='py-2 sm:py-3 px-2 border-b border-gray-100 align-top text-center'>
      <span
        className={`inline-block font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs ${
          item.complexity === "Simple"
            ? "bg-green-100 text-green-800"
            : item.complexity === "Medium"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
        }`}
      >
        {item.complexity}
      </span>
    </td>
    <td
      className='py-2 sm:py-3 px-2 border-b border-gray-100 align-top text-right text-sm font-medium text-gray-900'
      style={{ fontFamily: "monospace" }}
    >
      ₹{item.charge.toLocaleString("en-IN")}
    </td>
  </tr>
);

const TABLE_HEADERS = ["Item", "Scope", "Complexity", "Amount"];

const TableSection: React.FC<{ title: string; items: LineItem[] }> = ({
  title,
  items,
}) => (
  <div className='px-4 sm:px-6 lg:px-12'>
    <SectionTitle>{title}</SectionTitle>
    <div className='overflow-x-auto -mx-4 sm:mx-0'>
      <table className='w-full border-collapse min-w-[600px]'>
        <thead>
          <tr>
            {TABLE_HEADERS.map((h, i) => (
              <th
                key={h}
                className={`font-bold text-gray-400 border-b border-gray-200 px-2 py-3 uppercase tracking-widest ${
                  i === 0 || i === 1
                    ? "text-left"
                    : i === 2
                      ? "text-center"
                      : "text-right"
                } ${i === 1 ? "hidden sm:table-cell" : ""}`}
                style={{ fontSize: 10 }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <ItemRow key={item.name} item={item} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Copy Function ──────────────────────────────────────────────────────────────

const formatBillForCopy = () => {
  let billText = `TSANGPOOL HONDA - BILL MEMO (SYSTEM UPGRADE)\n`;
  billText += `================================\n\n`;

  // Frontend Section
  billText += `FRONTEND DEVELOPMENT\n`;
  billText += `-------------------\n`;
  FRONTEND_ITEMS.forEach((item) => {
    billText += `${item.name}\n`;
    billText += `  Components: ${item.components}\n`;
    billText += `  Scope: ${item.scope}\n`;
    billText += `  Complexity: ${item.complexity}\n`;
    billText += `  Charge: ₹${item.charge.toLocaleString("en-IN")}\n\n`;
  });

  // Backend Section
  billText += `BACKEND DEVELOPMENT\n`;
  billText += `------------------\n`;
  BACKEND_ITEMS.forEach((item) => {
    billText += `${item.name}\n`;
    billText += `  Components: ${item.components}\n`;
    billText += `  Scope: ${item.scope}\n`;
    billText += `  Complexity: ${item.complexity}\n`;
    billText += `  Charge: ₹${item.charge.toLocaleString("en-IN")}\n\n`;
  });

  // Totals
  billText += `TOTALS\n`;
  billText += `------\n`;
  TOTALS.forEach((row) => {
    billText += `${row.label}: ${row.value}\n`;
  });

  billText += `\nPrevious Engagement: Initial build (Bill Memo v1) — ₹88,600 quoted / ₹37,000 received. This bill covers only the subsequent system-upgrade work above.\n`;
  billText += `Payment Terms: 50% advance, 50% on delivery\n`;
  billText += `Generated: ${new Date().toLocaleDateString("en-IN")}\n`;

  return billText;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const NOTE_BOXES: NoteBox[] = [
  {
    title: "Previous Engagement",
    content: (
      <p className='text-sm text-gray-600 leading-relaxed'>
        Initial system build (Bill Memo v1) — ₹88,600 quoted, ₹37,000
        received.
        <br />
        This bill covers only the subsequent system-upgrade work described
        below.
      </p>
    ),
  },
  {
    title: "Payment Terms",
    highlight: true,
    content: (
      <p className='text-sm text-gray-600 leading-relaxed'>
        50% advance (₹74,725) before development start.
        <br />
        50% balance (₹74,725) on final delivery.
        <br />
        Payment via NEFT/UPI.
      </p>
    ),
  },
  {
    title: "What's Included",
    content: (
      <ul className='text-sm text-gray-600 list-disc pl-4 leading-loose'>
        <li>Full TypeScript codebase updates (FE + BE)</li>
        <li>Claude-backed AI assistant for the Parts module</li>
        <li>RAG / vector-search dashboard system</li>
        <li>ScanFleet vehicle-tracking integration</li>
        <li>Google Places dealership locator</li>
        <li>30-day post-delivery bug support</li>
      </ul>
    ),
  },
  {
    title: "Not Included",
    content: (
      <ul className='text-sm text-gray-600 list-disc pl-4 leading-loose'>
        <li>Domain / hosting subscription fees</li>
        <li>Firebase / Cloudinary / Anthropic API plan costs</li>
        <li>Future feature additions post-delivery</li>
        <li>Third-party API licensing fees (ScanFleet, Google Places)</li>
        <li>Content creation / data entry</li>
      </ul>
    ),
  },
  {
    title: "Additional Services you may apply",
    content: (
      <ul className='text-sm text-gray-600 list-disc pl-4 leading-loose'>
        <li>Ecommerce system for Bike Parts</li>
        <li>Payment Integration and Delivery Integration</li>
        <li>Cibil Score checker for loan applications</li>
      </ul>
    ),
  },
];

const BillMemo: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyBill = async () => {
    const billText = formatBillForCopy();
    try {
      await navigator.clipboard.writeText(billText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy bill:", err);
      alert("Failed to copy to clipboard");
    }
  };

  return (
    <div className='min-h-screen bg-gray-200 flex justify-center items-start py-6 sm:py-8 lg:py-10 px-3 sm:px-5 lg:px-5'>
      <div className='w-full max-w-4xl bg-white shadow-2xl rounded-lg sm:rounded-xl'>
        {/* ── Header ── */}
        <div className='bg-gray-900 text-white px-6 sm:px-8 lg:px-12 pt-6 sm:pt-8 lg:pt-9 pb-4 sm:pb-6 lg:pb-7 relative overflow-hidden'>
          <div
            className='absolute rounded-full pointer-events-none'
            style={{
              right: -40,
              top: -40,
              width: 240,
              height: 240,
              border: "60px solid rgba(227,27,35,0.15)",
            }}
          />

          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start relative z-10 gap-4 sm:gap-0'>
            {/* Brand */}
            <div className='flex items-center gap-2 sm:gap-3'>
              <div
                className='w-8 h-8 sm:w-11 sm:h-11 bg-red-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold flex-shrink-0'
                style={{ fontFamily: "Georgia, serif" }}
              >
                T
              </div>
              <div>
                <h1
                  className='text-lg sm:text-xl font-semibold tracking-wide text-white'
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Tsangpool Honda
                </h1>

                <span
                  className='text-gray-400 font-bold uppercase tracking-widest'
                  style={{ fontSize: "9px" }}
                >
                  Authorized Honda Dealer · Golaghat, Assam
                </span>
              </div>
            </div>

            {/* Invoice label */}
            <div className='text-right sm:text-left'>
              <div
                className='text-white font-light'
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "clamp(24px, 5vw, 38px)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1,
                }}
              >
                Bill Memo
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div
            className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 lg:gap-10 mt-6 sm:mt-7 pt-4 sm:pt-6 relative z-10'
            style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
          >
            <MetaItem label='Issue Date' value='25 July 2026' />
            <MetaItem label='Due Date' value='14 August 2026' />
            <MetaItem label='Project' value='TsangPool Honda DMS — System Upgrade' />
            <MetaItem label='Currency' value='INR (₹)' />
            <MetaItem
              label='Status'
              value='PENDING'
              valueClass='text-red-500'
            />
          </div>
        </div>

        {/* ── Parties ── */}
        <div
          className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-0 px-6 sm:px-8 lg:px-12 py-6 sm:py-8 border-b border-gray-200'
          style={{ gridTemplateColumns: "1fr 1px 1fr" }}
        >
          <div className='pr-0 lg:pr-6'>
            <p
              className='text-gray-400 uppercase tracking-widest mb-2.5'
              style={{ fontSize: 10 }}
            >
              Billed By
            </p>
            <h3 className='text-base font-black mb-1.5 text-gray-900'>
              Himanku Borah and Ilish Hazarika
            </h3>
            <p className='text-sm text-gray-600 leading-7'>
              Full-Stack Developers
              <br />
              Golaghat, Assam, India
            </p>
            <div className='mt-4'>
              <h4 className='text-sm font-semibold text-gray-900'>
                Development Time Taken
              </h4>
              <p className='text-sm text-gray-600'>
                Mar 11, 2026 - Jul 25, 2026
              </p>
            </div>
          </div>
          <div className='hidden lg:block bg-gray-200' />
          <div className='pl-0 lg:pl-6'>
            <p
              className='text-gray-400 uppercase tracking-widest mb-2.5'
              style={{ fontSize: 10 }}
            >
              Billed To
            </p>
            <h3 className='text-base font-black mb-1.5 text-gray-900'>
              TsangPool Honda
            </h3>
            <p className='text-sm text-gray-600 leading-7'>
              Bengenakhowa GF Rd
              <br />
              Golaghat, Assam 785621
              <br />
              info@tsangpoolhonda.com
              <br />
              Honda Authorized Dealership
            </p>
          </div>
        </div>

        {/* ── Line Item Tables ── */}
        <TableSection
          title='Frontend Development — React · TypeScript · Vite'
          items={FRONTEND_ITEMS}
        />
        <div className='mt-2'>
          <TableSection
            title='Backend Development — Node.js · Express · MongoDB · TypeScript'
            items={BACKEND_ITEMS}
          />
        </div>

        {/* ── Totals ── */}
        <div className='flex justify-end px-12 pb-8'>
          <div className='w-80 mt-2'>
            {TOTALS.map((row) =>
              row.variant === "grand" ? (
                <div
                  key={row.label}
                  className='flex justify-between items-center bg-gray-900 text-white px-4 py-3.5 mt-2'
                >
                  <span
                    className='font-black uppercase tracking-wide'
                    style={{ fontSize: 11 }}
                  >
                    {row.label}
                  </span>
                  <span
                    className='text-red-500 font-bold'
                    style={{
                      fontFamily: "monospace",
                      fontSize: 20,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ) : (
                <div
                  key={row.label}
                  className='flex justify-between items-center py-2 border-b border-gray-100 text-sm'
                >
                  <span className='text-gray-600'>{row.label}</span>
                  <span
                    className={`font-medium ${row.variant === "discount" ? "text-green-700" : "text-gray-800"}`}
                    style={{ fontFamily: "monospace" }}
                  >
                    {row.value}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
        <div className='bg-gray-100 px-3 sm:px-4 py-3 flex justify-center border-b'>
          <button
            onClick={handleCopyBill}
            className='flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200'
          >
            {copied ? (
              <>
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                  />
                </svg>
                Copy Bill for ChatGPT Review
              </>
            )}
          </button>
        </div>

        {/* ── Notes ── */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 px-4 sm:px-6 lg:px-12 pb-6 sm:pb-8'>
          {NOTE_BOXES.map((box: NoteBox) => (
            <div
              key={box.title}
              className={`bg-gray-100 p-4 sm:p-5 border-l-4 ${box.highlight ? "border-red-600" : "border-gray-300"}`}
            >
              <h4
                className='text-gray-400 font-bold uppercase tracking-widest mb-2'
                style={{ fontSize: 10 }}
              >
                {box.title}
              </h4>
              {box.content}
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        <div className='bg-gray-900 text-gray-500 px-4 sm:px-6 lg:px-12 py-4 sm:py-5 flex flex-col sm:flex-row justify-between items-center text-xs gap-2 sm:gap-0'>
          <div className='text-center sm:text-left text-white'>
            Bill Memo made for{" "}
            <strong className='text-white'>TsangPool Honda</strong>
            {" · "}
            <a
              href='https://tsangpoolhonda.com'
              className='text-red-500 hover:underline'
            >
              tsangpoolhonda.com
            </a>
            {" · "}
            Golaghat, Assam 785621
          </div>
          <div
            className='text-white uppercase tracking-widest text-center sm:text-right'
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 13,
              opacity: 0.15,
            }}
          >
            Tsangpool Honda DMS
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillMemo;
