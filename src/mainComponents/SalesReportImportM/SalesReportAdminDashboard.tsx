import { useEffect, useMemo, useState } from "react";
import {
  ReceiptText,
  UploadCloud,
  Trash2,
  Pencil,
  ArrowLeft,
  Archive,
  RefreshCw,
  Search,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MetricTile } from "@/mainComponents/Admin/AdminDash/StatCard";
import FolderCard from "@/mainComponents/shared/FolderCard";
import SalesReportRecordsTable from "./SalesReportRecordsTable";
import SalesReportUploadForm from "./SalesReportUploadForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesReportPendingTable from "./SalesReportPendingTable";
import SalesReportKpiCharts from "./SalesReportKpiCharts";
import SalesReportDeletedBatches from "./SalesReportDeletedBatches";
import { inr } from "@/mainComponents/DataImport/SalesKpiCharts";
import { useAppSelector } from "@/hooks/redux";
import { selectAuth } from "@/redux-store/slices/authSlice";
import {
  useGetSalesReportBatchesQuery,
  useGetSalesReportBatchesByDateQuery,
  useDeleteSalesReportBatchMutation,
  useGetPendingSalesReportsQuery,
} from "@/redux-store/services/salesReportApi";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN");

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/**
 * Sale months as "JAN", "JAN|FEB", "JAN|FEB|+1" — two shown, the rest counted.
 * When the batch spans more than one year the month carries its year
 * ("APR'24|APR'26"), otherwise the same name would appear twice.
 */
const monthLabel = (saleMonths: string[]) => {
  const multiYear = new Set(saleMonths.map((m) => m.slice(0, 4))).size > 1;
  return saleMonths
    .slice(0, 2)
    .map((m) => {
      const name = MONTHS[Number(m.slice(5, 7)) - 1] ?? m;
      return multiYear ? `${name}'${m.slice(2, 4)}` : name;
    })
    .concat(saleMonths.length > 2 ? [`+${saleMonths.length - 2}`] : [])
    .join("|");
};

// Sale dates are stored as UTC midnight, so read them in UTC.
const formatSaleDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", { timeZone: "UTC" });

/** "05/10/2026 – 28/10/2026", or one date when the batch is a single day. */
const dateRange = (from: string | null, to: string | null) => {
  if (!from || !to) return "";
  const a = formatSaleDate(from);
  const b = formatSaleDate(to);
  return a === b ? a : `${a} – ${b}`;
};

type View =
  | "batches"
  | "upload"
  | "kpis"
  | "deleted"
  | { batchId: string }
  // Rows waiting on EX SHOWROOM / INSURANCE / REGISTRATION; batchId narrows to one upload.
  | { pending: true; batchId?: string };

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className='flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-4'
  >
    <ArrowLeft className='h-4 w-4' /> Back to batches
  </button>
);

/**
 * One batch: its imported records, plus (Branch-Admin) an Edit tab holding the
 * rows of that batch still waiting on EX SHOWROOM / INSURANCE / REGISTRATION.
 */
function BatchDetail({ batchId, canEdit }: { batchId: string; canEdit: boolean }) {
  const { isAuthenticated } = useAppSelector(selectAuth);
  const { data } = useGetPendingSalesReportsQuery(
    { batchId },
    { skip: !isAuthenticated || !canEdit },
  );
  const pending = data?.data.length ?? 0;

  if (!canEdit) return <SalesReportRecordsTable batchId={batchId} />;

  return (
    <Tabs defaultValue='records'>
      <TabsList className='mb-4'>
        <TabsTrigger value='records'>Records</TabsTrigger>
        <TabsTrigger value='edit'>
          Edit{pending > 0 && ` (${pending})`}
        </TabsTrigger>
      </TabsList>
      <TabsContent value='records'>
        <SalesReportRecordsTable batchId={batchId} />
      </TabsContent>
      <TabsContent value='edit'>
        <SalesReportPendingTable batchId={batchId} />
      </TabsContent>
    </Tabs>
  );
}

export default function SalesReportAdminDashboard() {
  const { user, isAuthenticated } = useAppSelector(selectAuth);
  const [view, setView] = useState<View>("batches");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  // Global lookup by phone / Frame No / Engine No across every batch.
  const [searchInput, setSearchInput] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      const q = searchInput.trim();
      setGlobalSearch(q.length >= 3 ? q : "");
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, refetch } = useGetSalesReportBatchesQuery(
    undefined,
    { skip: !isAuthenticated },
  );
  const dateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined;
  const { data: dateBatchesData, isLoading: dateBatchesLoading } =
    useGetSalesReportBatchesByDateQuery(
      dateKey ? { date: dateKey } : ({ date: "" } as any),
      { skip: !isAuthenticated || !dateKey },
    );
  const { data: pendingData } = useGetPendingSalesReportsQuery(undefined, {
    skip: !isAuthenticated || user?.role !== "Branch-Admin",
  });
  const pendingTotal = pendingData?.data.length ?? 0;
  const [deleteBatch, { isLoading: isDeleting }] =
    useDeleteSalesReportBatchMutation();

  const batches = useMemo(
    () => (dateKey ? (dateBatchesData?.data ?? []) : (data?.data ?? [])),
    [dateKey, dateBatchesData, data],
  );
  const showDateMode = Boolean(dateKey);
  // Batches are ordered by import time; newest first unless the user flips it.
  const [batchOrder, setBatchOrder] = useState<"desc" | "asc">("desc");
  const sortedBatches = useMemo(() => {
    const dir = batchOrder === "asc" ? 1 : -1;
    return [...batches].sort(
      (a, b) =>
        dir * (Date.parse(a.importDate) - Date.parse(b.importDate)) ||
        dir * a.batchId.localeCompare(b.batchId),
    );
  }, [batches, batchOrder]);
  const totalPayment = batches.reduce((sum, b) => sum + b.totalPayment, 0);
  // Completed = imported rows; pending = still waiting on their three amounts.
  const totalRecords = batches.reduce((sum, b) => sum + b.totalRecords, 0);
  const totalPending = batches.reduce((sum, b) => sum + b.pendingCount, 0);

  const canUpload = user?.role === "Branch-Admin";
  const isSuperAdmin = user?.role === "Super-Admin";
  const canDelete = (branchId: string) =>
    isSuperAdmin || user?.branch?._id === branchId;

  if (view === "upload") {
    return (
      <div className='max-w-6xl mx-auto p-4 sm:p-6'>
        <BackButton onClick={() => setView("batches")} />
        <SalesReportUploadForm
          onDone={(pendingBatchId) =>
            setView(
              pendingBatchId
                ? { pending: true, batchId: pendingBatchId }
                : "batches",
            )
          }
        />
      </div>
    );
  }

  if (view === "kpis") {
    return (
      <div className='max-w-6xl mx-auto p-4 sm:p-6'>
        <BackButton onClick={() => setView("batches")} />
        <SalesReportKpiCharts />
      </div>
    );
  }

  if (view === "deleted") {
    return (
      <div className='max-w-6xl mx-auto p-4 sm:p-6'>
        <BackButton onClick={() => setView("batches")} />
        <SalesReportDeletedBatches />
      </div>
    );
  }

  if (typeof view === "object" && "pending" in view) {
    return (
      <div className='max-w-[1500px] mx-auto p-4 sm:p-6'>
        <BackButton onClick={() => setView("batches")} />
        <SalesReportPendingTable batchId={view.batchId} />
      </div>
    );
  }

  if (typeof view === "object") {
    return (
      <div className='max-w-[1500px] mx-auto p-4 sm:p-6'>
        <BackButton onClick={() => setView("batches")} />
        <h2 className='text-lg font-bold text-gray-900 mb-4 font-mono'>
          {view.batchId}
        </h2>
        <BatchDetail batchId={view.batchId} canEdit={canUpload} />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 py-8'>
        <div className='flex items-center justify-between flex-wrap gap-3 mb-6'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-gray-900 text-white'>
              <ReceiptText className='h-5 w-5' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>
                Sold Vehicles Import
              </h1>
              <p className='text-sm text-gray-500'>
                Branch-Admin CSV uploads of sold vehicles, matched against stock
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant='outline' size='sm'>
                  <CalendarIcon className='h-4 w-4 mr-2' />
                  {selectedDate
                    ? format(selectedDate, "dd MMM yyyy")
                    : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='end'>
                <Calendar
                  mode='single'
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                />
              </PopoverContent>
            </Popover>
            {selectedDate && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setSelectedDate(undefined)}
              >
                Clear
              </Button>
            )}
            {isSuperAdmin && (
              <>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setView("kpis")}
                >
                  <BarChart3 className='h-4 w-4 mr-1.5' /> KPIs
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setView("deleted")}
                >
                  <Archive className='h-4 w-4 mr-1.5' /> Deleted batches
                </Button>
              </>
            )}
            {canUpload && pendingTotal > 0 && (
              <Button
                variant='outline'
                size='sm'
                className='border-amber-400 text-amber-800'
                onClick={() => setView({ pending: true })}
              >
                Pending amounts ({pendingTotal})
              </Button>
            )}
            {canUpload && (
              <Button
                size='sm'
                className='border-2 border-red-500'
                onClick={() => setView("upload")}
              >
                <UploadCloud className='h-4 w-4 mr-1.5' /> Upload report
              </Button>
            )}
            <Button variant='outline' size='sm' onClick={() => refetch()}>
              <RefreshCw className='h-4 w-4 mr-2' /> Refresh
            </Button>
          </div>
        </div>

        <div className='relative mb-6'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder='Search all batches by phone number, frame number or engine number (3+ characters)'
            className='pl-9 bg-white border-black'
          />
        </div>

        {globalSearch && (
          <div className='mb-8'>
            <SalesReportRecordsTable
              globalSearch={globalSearch}
              onOpenBatch={(id) => setView({ batchId: id })}
            />
          </div>
        )}

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
          <MetricTile
            index={0}
            label='Batches'
            value={batches.length}
            bg='bg-gray-900'
            text='text-white'
            sub='text-gray-300'
          />
          <MetricTile
            index={1}
            label='Records'
            value={totalRecords + totalPending}
            note={`${totalRecords} completed · ${totalPending} pending`}
            bg='bg-blue-50'
            text='text-blue-900'
            sub='text-blue-600'
          />
          <MetricTile
            index={2}
            label='Total Payment'
            value={inr(totalPayment)}
            bg='bg-emerald-50'
            text='text-emerald-900'
            sub='text-emerald-600'
          />
        </div>

        {isLoading || dateBatchesLoading ? (
          <p className='text-sm text-muted-foreground'>Loading batches...</p>
        ) : batches.length === 0 ? (
          <div className='text-center py-16 border rounded-lg bg-white'>
            <ReceiptText className='h-12 w-12 mx-auto mb-3 text-muted-foreground' />
            <h3 className='font-semibold mb-1'>No sales reports yet</h3>
            <p className='text-sm text-muted-foreground'>
              {showDateMode
                ? "No batches found for the selected date."
                : "Upload a report to see batches here."}
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {showDateMode && (
              <h3 className='text-base font-semibold text-gray-900'>
                Batches for {format(selectedDate!, "dd MMMM yyyy")}
              </h3>
            )}
            <div className='flex justify-end'>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  setBatchOrder((o) => (o === "desc" ? "asc" : "desc"))
                }
                aria-label='Sort batches by import date'
              >
                {batchOrder === "desc" ? (
                  <ArrowDown className='h-4 w-4 mr-1.5' />
                ) : (
                  <ArrowUp className='h-4 w-4 mr-1.5' />
                )}
                {batchOrder === "desc" ? "Newest first" : "Oldest first"}
              </Button>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 border-2 rounded-2xl p-6 bg-white'>
              {sortedBatches.map((b) => (
                <div key={b.batchId} className='relative group'>
                  <FolderCard
                    title={monthLabel(b.saleMonths) || b.fileName}
                    // One month: the name alone. Several: the span of dates too.
                    countLabel={
                      b.saleMonths.length === 1
                        ? ""
                        : dateRange(b.firstSaleDate, b.lastSaleDate) ||
                          formatDate(b.importDate)
                    }
                    subLabel={`${inr(b.totalPayment)}${b.pendingCount > 0 ? ` · ${b.pendingCount} pending` : ""}`}
                    onOpen={() =>
                      setView(
                        b.totalRecords === 0 && canUpload
                          ? { pending: true, batchId: b.batchId }
                          : { batchId: b.batchId },
                      )
                    }
                  />
                  {canUpload && canDelete(b.branchId) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setView({ pending: true, batchId: b.batchId });
                      }}
                      className='absolute top-1 right-10 p-1.5 rounded-md bg-white/90 border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50'
                      aria-label={`Edit pending amounts in batch ${b.batchId}`}
                    >
                      <Pencil className='h-3.5 w-3.5 text-red-600' />
                    </button>
                  )}
                  {canDelete(b.branchId) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className='absolute top-1 right-1 p-1.5 rounded-md bg-white/90 border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50'
                          aria-label={`Delete batch ${b.batchId}`}
                        >
                          <Trash2 className='h-3.5 w-3.5 text-red-600' />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete this batch?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This removes {b.totalRecords} record(s) from batch{" "}
                            <span className='font-mono'>{b.batchId}</span> from
                            reports. It does not revert any stock/customer
                            records this batch already matched — it can be
                            re-imported later, and the deletion is logged for
                            Super-Admin review.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            disabled={isDeleting}
                            onClick={() => deleteBatch({ batchId: b.batchId })}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// SL NO.	DATE	CUSTOMER NAME	PHONE NO.	LOCATION	FRAME NO	ENGINE NO	MODEL NAME	COLOUR	EW	AMC	RSA	JOY CLUB	FINANCE	EXECUTIVE	STATUS
