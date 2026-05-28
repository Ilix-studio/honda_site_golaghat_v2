import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux-store/store";
import {
  useListInvoicesAdminQuery,
  useGetInvoiceByIdAdminQuery,
  InvoiceListItem,
} from "@/redux-store/services/ServiceM/invoiceApi";
import { useGetBranchesQuery } from "@/redux-store/services/branchApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Receipt,
  ChevronRight,
  AlertCircle,
  Loader2,
  Building2,
  Bike,
  Calendar,
  IndianRupee,
  FileText,
  Wrench,
  Package,
  Scissors,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const ITEM_ICON: Record<string, React.ReactNode> = {
  labour: <Wrench className='w-3.5 h-3.5' />,
  part: <Package className='w-3.5 h-3.5' />,
  accessory: <Scissors className='w-3.5 h-3.5' />,
  custom: <FileText className='w-3.5 h-3.5' />,
};

const ITEM_COLOR: Record<string, string> = {
  labour: "bg-blue-50 text-blue-700 border-blue-200",
  part: "bg-orange-50 text-orange-700 border-orange-200",
  accessory: "bg-purple-50 text-purple-700 border-purple-200",
  custom: "bg-gray-50 text-gray-600 border-gray-200",
};

// ─── Invoice Detail Sheet ─────────────────────────────────────────────────────

function InvoiceDetailSheet({
  invoiceId,
  open,
  onClose,
}: {
  invoiceId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { data, isLoading, isError } = useGetInvoiceByIdAdminQuery(invoiceId, {
    skip: !invoiceId || !open,
  });

  const invoice = data?.data;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side='right'
        className='w-full sm:max-w-lg overflow-y-auto p-0'
      >
        <SheetHeader className='px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-8 h-8 rounded-xl bg-red-50 border border-red-100'>
              <Receipt className='w-3.5 h-3.5 text-red-500' />
            </div>
            <div>
              <SheetTitle className='text-sm font-black text-gray-900'>
                {invoice?.invoiceNumber ?? "Invoice"}
              </SheetTitle>
              <SheetDescription className='text-xs text-gray-400'>
                {invoice ? fmtDate(String(invoice.issuedAt)) : "Loading..."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className='px-5 py-5 space-y-5'>
          {isLoading && (
            <div className='flex items-center justify-center py-16'>
              <Loader2 className='w-5 h-5 text-gray-300 animate-spin' />
            </div>
          )}

          {isError && (
            <div className='flex flex-col items-center justify-center py-16 gap-2'>
              <AlertCircle className='w-8 h-8 text-red-300' />
              <p className='text-sm text-gray-400'>Failed to load invoice</p>
            </div>
          )}

          {invoice && (
            <>
              {/* Meta */}
              <div className='grid grid-cols-2 gap-3'>
                {invoice.branch && (
                  <div className='rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 flex items-start gap-2'>
                    <Building2 className='w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0' />
                    <div className='min-w-0'>
                      <p className='text-[10px] text-gray-400 font-medium uppercase tracking-wide'>
                        Branch
                      </p>
                      <p className='text-xs font-semibold text-gray-900 truncate'>
                        {(invoice.branch as any).branchName}
                      </p>
                    </div>
                  </div>
                )}
                {invoice.customer && (
                  <div className='rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 flex items-start gap-2'>
                    <IndianRupee className='w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0' />
                    <div className='min-w-0'>
                      <p className='text-[10px] text-gray-400 font-medium uppercase tracking-wide'>
                        Customer
                      </p>
                      <p className='text-xs font-semibold text-gray-900 truncate'>
                        {(invoice.customer as any).phoneNumber}
                      </p>
                    </div>
                  </div>
                )}
                {invoice.vehicle && (
                  <div className='rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 flex items-start gap-2'>
                    <Bike className='w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0' />
                    <div className='min-w-0'>
                      <p className='text-[10px] text-gray-400 font-medium uppercase tracking-wide'>
                        Vehicle
                      </p>
                      <p className='text-xs font-semibold text-gray-900 truncate'>
                        {(invoice.vehicle as any).numberPlate ?? "—"}
                      </p>
                    </div>
                  </div>
                )}
                <div className='rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 flex items-start gap-2'>
                  <Calendar className='w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0' />
                  <div>
                    <p className='text-[10px] text-gray-400 font-medium uppercase tracking-wide'>
                      Issued
                    </p>
                    <p className='text-xs font-semibold text-gray-900'>
                      {fmtDate(String(invoice.issuedAt))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Line items */}
              <div>
                <p className='text-xs font-black text-gray-500 uppercase tracking-wide mb-3'>
                  Line Items
                </p>
                <div className='rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100'>
                  {invoice.lineItemsSnapshot
                    .filter((i) => !i.isRemoved)
                    .map((item, idx) => (
                      <div
                        key={idx}
                        className='flex items-start justify-between px-4 py-3 gap-3 bg-white'
                      >
                        <div className='flex items-start gap-2 min-w-0'>
                          <span className='mt-0.5 text-gray-400 shrink-0'>
                            {ITEM_ICON[item.itemType] ?? (
                              <FileText className='w-3.5 h-3.5' />
                            )}
                          </span>
                          <div className='min-w-0'>
                            <p className='text-xs font-semibold text-gray-900 truncate'>
                              {item.name}
                            </p>
                            {item.description && (
                              <p className='text-[11px] text-gray-400'>
                                {item.description}
                              </p>
                            )}
                            <div className='flex items-center flex-wrap gap-1.5 mt-1'>
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-medium capitalize ${ITEM_COLOR[item.itemType] ?? "bg-gray-50 text-gray-500 border-gray-200"}`}
                              >
                                {ITEM_ICON[item.itemType]}
                                {item.itemType}
                              </span>
                              <span className='text-[11px] text-gray-400'>
                                ×{item.quantity}
                              </span>
                              {item.discount > 0 && (
                                <span className='text-[11px] text-green-600 font-medium'>
                                  -{item.discount}%
                                </span>
                              )}
                              <span className='text-[11px] text-gray-400'>
                                GST {item.taxRate}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className='text-xs font-bold text-gray-900 shrink-0'>
                          {fmt(item.lineTotal)}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Totals */}
              <div className='rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 space-y-2'>
                <div className='flex justify-between text-xs text-gray-500'>
                  <span>Subtotal</span>
                  <span>{fmt(invoice.subtotal)}</span>
                </div>
                <div className='flex justify-between text-xs text-gray-500'>
                  <span>GST</span>
                  <span>{fmt(invoice.taxTotal)}</span>
                </div>
                <div className='flex justify-between text-sm font-black text-gray-900 border-t border-gray-200 pt-2 mt-1'>
                  <span>Grand Total</span>
                  <span className='text-red-600'>
                    {fmt(invoice.grandTotal)}
                  </span>
                </div>
              </div>

              {/* Signature token */}
              <div className='rounded-xl border border-gray-100 bg-gray-50 px-4 py-3'>
                <p className='text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1'>
                  Verification Token
                </p>
                <p className='text-[10px] font-mono text-gray-500 break-all'>
                  {invoice.digitalSignatureToken}
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Invoice Row ──────────────────────────────────────────────────────────────

function InvoiceRow({
  invoice,
  onOpen,
  showBranch,
}: {
  invoice: InvoiceListItem;
  onOpen: (id: string) => void;
  showBranch: boolean;
}) {
  return (
    <button
      onClick={() => onOpen(invoice._id)}
      className='w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl
                 bg-white border border-gray-200
                 hover:bg-gray-50 hover:border-gray-300
                 transition-all duration-150 text-left'
    >
      <div className='shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-red-50 border border-red-100'>
        <Receipt className='w-4 h-4 text-red-500' />
      </div>

      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <span className='text-xs font-black text-gray-900 tracking-tight'>
            {invoice.invoiceNumber}
          </span>
          <Badge
            variant='outline'
            className='text-[10px] text-green-600 border-green-200 bg-green-50 px-1.5 py-0'
          >
            Paid
          </Badge>
        </div>
        <div className='flex items-center gap-3 mt-0.5 flex-wrap'>
          {showBranch && invoice.branch && (
            <span className='flex items-center gap-1 text-[11px] text-gray-400'>
              <Building2 className='w-3 h-3' />
              {invoice.branch.branchName}
            </span>
          )}
          {invoice.customer && (
            <span className='flex items-center gap-1 text-[11px] text-gray-400'>
              {invoice.customer.phoneNumber}
            </span>
          )}
          {invoice.vehicle && (
            <span className='flex items-center gap-1 text-[11px] text-gray-400'>
              <Bike className='w-3 h-3' />
              {invoice.vehicle.numberPlate}
            </span>
          )}
          <span className='flex items-center gap-1 text-[11px] text-gray-400'>
            <Calendar className='w-3 h-3' />
            {fmtDate(invoice.issuedAt)}
          </span>
        </div>
      </div>

      <div className='shrink-0 flex items-center gap-2'>
        <span className='text-sm font-black text-gray-900'>
          {fmt(invoice.grandTotal)}
        </span>
        <ChevronRight className='w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors' />
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomerInvoices() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isSuperAdmin = user?.role === "Super-Admin";

  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [branchFilter, setBranchFilter] = useState<string | undefined>(
    undefined,
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isError, refetch } = useListInvoicesAdminQuery({
    page,
    limit: 15,
    branchId: branchFilter,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const { data: branchData } = useGetBranchesQuery(undefined, {
    skip: !isSuperAdmin,
  });

  const invoices = (data?.data ?? []).filter((inv) =>
    search
      ? inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        inv.customer?.phoneNumber.includes(search) ||
        inv.vehicle?.numberPlate
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        inv.branch?.branchName.toLowerCase().includes(search.toLowerCase())
      : true,
  );

  const totalPages = data?.pages ?? 1;

  const handleClearFilters = () => {
    setBranchFilter(undefined);
    setStartDate("");
    setEndDate("");
    setSearch("");
    setPage(1);
  };

  const hasActiveFilters = !!(branchFilter || startDate || endDate || search);

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='space-y-4 p-10'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-base font-black text-gray-900'>Invoices</h2>
            <p className='text-xs text-gray-400 mt-px'>
              {data?.total ?? 0} invoice{(data?.total ?? 0) !== 1 ? "s" : ""}
              {!isSuperAdmin && " · branch-scoped"}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setShowFilters((p) => !p)}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-xl border text-xs font-semibold transition-all ${
                showFilters || hasActiveFilters
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
              }`}
            >
              <SlidersHorizontal className='w-3.5 h-3.5' />
              Filters
              {hasActiveFilters && (
                <span className='flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black'>
                  !
                </span>
              )}
            </button>
            <button
              onClick={() => refetch()}
              className='w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors'
            >
              <RefreshCw className='w-3.5 h-3.5 text-gray-400' />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400' />
          <Input
            placeholder='Search invoice, phone, plate...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-9 h-9 text-sm rounded-xl border-gray-200'
          />
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className='rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-3'>
            <div className='flex flex-wrap gap-3'>
              {/* Branch filter — Super-Admin only */}
              {isSuperAdmin && (
                <div className='flex-1 min-w-[160px]'>
                  <p className='text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5'>
                    Branch
                  </p>
                  <Select
                    value={branchFilter ?? "all"}
                    onValueChange={(v) => {
                      setBranchFilter(v === "all" ? undefined : v);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className='h-9 text-xs rounded-xl bg-white'>
                      <SelectValue placeholder='All Branches' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Branches</SelectItem>
                      {branchData?.data?.map((b) => (
                        <SelectItem key={b._id} value={b._id}>
                          {b.branchName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Date range */}
              <div className='flex-1 min-w-[140px]'>
                <p className='text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5'>
                  From
                </p>
                <Input
                  type='date'
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className='h-9 text-xs rounded-xl bg-white'
                />
              </div>
              <div className='flex-1 min-w-[140px]'>
                <p className='text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5'>
                  To
                </p>
                <Input
                  type='date'
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className='h-9 text-xs rounded-xl bg-white'
                />
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className='text-xs text-red-500 font-semibold hover:underline'
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className='flex items-center justify-center py-16'>
            <Loader2 className='w-5 h-5 text-gray-300 animate-spin' />
          </div>
        )}

        {/* Error */}
        {isError && (
          <Card className='border-red-100'>
            <CardContent className='p-8 text-center'>
              <AlertCircle className='w-8 h-8 text-red-300 mx-auto mb-2' />
              <p className='text-sm text-gray-500'>Failed to load invoices</p>
              <Button
                variant='outline'
                size='sm'
                onClick={() => refetch()}
                className='mt-3'
              >
                <RefreshCw className='w-3.5 h-3.5 mr-1.5' />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty */}
        {!isLoading && !isError && invoices.length === 0 && (
          <Card>
            <CardContent className='p-12 text-center'>
              <div className='flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 mx-auto mb-4'>
                <Receipt className='w-5 h-5 text-gray-300' />
              </div>
              <h3 className='text-sm font-semibold text-gray-900 mb-1'>
                No invoices found
              </h3>
              <p className='text-xs text-gray-400'>
                {hasActiveFilters
                  ? "Try adjusting your filters."
                  : "Invoices will appear here after job cards are confirmed."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* List */}
        {!isLoading && invoices.length > 0 && (
          <div className='flex flex-col gap-2'>
            {invoices.map((invoice) => (
              <InvoiceRow
                key={invoice._id}
                invoice={invoice}
                onOpen={setSelectedId}
                showBranch={isSuperAdmin}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex items-center justify-center gap-3 pt-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className='h-8 w-8 p-0 rounded-xl'
            >
              <ArrowLeft className='w-3.5 h-3.5' />
            </Button>
            <span className='text-xs text-gray-500 font-medium'>
              {page} / {totalPages}
            </span>
            <Button
              variant='outline'
              size='sm'
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className='h-8 w-8 p-0 rounded-xl'
            >
              <ArrowRight className='w-3.5 h-3.5' />
            </Button>
          </div>
        )}

        {/* Detail sheet */}
        <InvoiceDetailSheet
          invoiceId={selectedId ?? ""}
          open={!!selectedId}
          onClose={() => setSelectedId(null)}
        />
      </div>
    </div>
  );
}
