import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ReceiptText,
  UploadCloud,
  Trash2,
  ArrowLeft,
  Archive,
  RefreshCw,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import CounterSaleRecordsTable from "./CounterSaleRecordsTable";
import { inr } from "@/mainComponents/DataImport/SalesKpiCharts";
import { useAppSelector } from "@/hooks/redux";
import { selectAuth } from "@/redux-store/slices/authSlice";
import {
  useGetCounterSaleBatchesQuery,
  useGetCounterSaleBatchesByDateQuery,
  useDeleteCounterSaleBatchMutation,
} from "@/redux-store/services/counterSaleApi";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN");

export default function CounterSaleAdminDashboard() {
  const { user, isAuthenticated } = useAppSelector(selectAuth);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    undefined,
  );

  const { data, isLoading, refetch } = useGetCounterSaleBatchesQuery(
    undefined,
    {
      skip: !isAuthenticated,
    },
  );
  const dateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined;
  const { data: dateBatchesData, isLoading: dateBatchesLoading } =
    useGetCounterSaleBatchesByDateQuery(
      dateKey ? { date: dateKey } : ({ date: "" } as any),
      { skip: !isAuthenticated || !dateKey },
    );
  const [deleteBatch, { isLoading: isDeleting }] =
    useDeleteCounterSaleBatchMutation();

  const batches = dateKey ? (dateBatchesData?.data ?? []) : (data?.data ?? []);
  const showDateMode = Boolean(dateKey);
  const totalRevenue = batches.reduce((sum, b) => sum + b.totalInvoice, 0);
  const totalRecords = batches.reduce((sum, b) => sum + b.totalRecords, 0);

  const canDelete = (branchId: string) =>
    user?.role === "Super-Admin" || user?.branch?._id === branchId;

  if (selectedBatchId) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 py-8'>
          <button
            onClick={() => setSelectedBatchId(null)}
            className='flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-4'
          >
            <ArrowLeft className='h-4 w-4' /> Back to batches
          </button>
          <h1 className='text-xl font-bold text-gray-900 mb-4 font-mono'>
            {selectedBatchId}
          </h1>
          <CounterSaleRecordsTable batchId={selectedBatchId} />
        </div>
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
                Counter Sale Reports
              </h1>
              <p className='text-sm text-gray-500'>
                Channel-partner counter sale uploads and revenue by batch
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
            {user?.role === "Super-Admin" && (
              <Link to='/admin/counter-sale/deleted'>
                <Button variant='outline' size='sm'>
                  <Archive className='h-4 w-4 mr-1.5' /> Deleted batches
                </Button>
              </Link>
            )}
            {user?.role === "Part-Admin" && (
              <Link to='/part-admin/counter-sale/upload'>
                <Button size='sm'>
                  <UploadCloud className='h-4 w-4 mr-1.5' /> Upload report
                </Button>
              </Link>
            )}
            <Button variant='outline' size='sm' onClick={() => refetch()}>
              <RefreshCw className='h-4 w-4 mr-2' /> Refresh
            </Button>
          </div>
        </div>

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
            value={totalRecords}
            bg='bg-blue-50'
            text='text-blue-900'
            sub='text-blue-600'
          />
          <MetricTile
            index={2}
            label='Total Revenue'
            value={inr(totalRevenue)}
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
            <h3 className='font-semibold mb-1'>No counter sale reports yet</h3>
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
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 border-2 rounded-2xl p-6 bg-white'>
              {batches.map((b) => (
                <div key={b.batchId} className='relative group'>
                  <FolderCard
                    title={b.batchId}
                    countLabel={`${formatDate(b.importDate)} · ${inr(b.totalInvoice)}`}
                    onOpen={() => setSelectedBatchId(b.batchId)}
                  />
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
                            This removes {b.totalRecords} record(s) from
                            batch{" "}
                            <span className='font-mono'>{b.batchId}</span>. It
                            can be re-imported later; the deletion is logged
                            for Super-Admin review.
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
