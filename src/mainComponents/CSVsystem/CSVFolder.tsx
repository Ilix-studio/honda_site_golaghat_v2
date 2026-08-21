// src/components/admin/forms/CSVFolder.tsx

import { useEffect, useMemo, useState } from "react";
import {
  FileSpreadsheet,
  Calendar as CalendarIcon,
  Package,
  RefreshCw,
  ArrowLeft,
  UploadCloud,
  Trash2,
  Loader2,
  ShieldAlert,
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
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";

import { MetricTile } from "@/mainComponents/Admin/AdminDash/StatCard";
import FolderCard from "@/mainComponents/shared/FolderCard";
import { inr } from "@/mainComponents/DataImport/SalesKpiCharts";
import {
  useDeleteCSVBatchMutation,
  useGetCSVBatchesQuery,
  useGetCSVBatchesByDateQuery,
} from "@/redux-store/services/BikeSystemApi3/csvStockApi";
import GetCSVFiles from "./GetCSVFiles";
import { CSVBatch } from "@/types/customer/stockcsv.types";
import { useNavigate } from "react-router";

const CSVFolder = () => {
  const navigate = useNavigate();
  const [selectedBatch, setSelectedBatch] = useState<CSVBatch | null>(null);
  const [batchToDelete, setBatchToDelete] = useState<CSVBatch | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    undefined,
  );

  const { data, isLoading, error, refetch } = useGetCSVBatchesQuery({
    page: 1,
    limit: 50,
  });
  const dateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined;
  const { data: dateBatchesData, isLoading: dateBatchesLoading } =
    useGetCSVBatchesByDateQuery(
      dateKey ? { date: dateKey } : ({ date: "" } as any),
      { skip: !dateKey },
    );

  const [deleteCSVBatch, { isLoading: isDeleting }] =
    useDeleteCSVBatchMutation();

  const handleDeleteBatch = async () => {
    if (!batchToDelete) return;
    try {
      const res = await deleteCSVBatch(batchToDelete.batchId).unwrap();
      toast.success(res.message || "Folder deleted");
      setBatchToDelete(null);
    } catch (err) {
      const message =
        (err as { data?: { message?: string }; message?: string })?.data
          ?.message ||
        (err as { message?: string })?.message ||
        "Failed to delete folder";
      toast.error(message);
    }
  };

  const batches = useMemo(
    () => (dateKey ? (dateBatchesData?.data ?? []) : (data?.data ?? [])),
    [dateKey, dateBatchesData, data],
  );
  const showDateMode = Boolean(dateKey);

  // Sort batches by import date (newest first)
  const sortedBatches = useMemo(
    () =>
      [...batches].sort(
        (a, b) =>
          new Date(b.importDate).getTime() - new Date(a.importDate).getTime(),
      ),
    [batches],
  );

  const batchHasSoldStock = (batchToDelete?.soldStocks ?? 0) > 0;

  const totalStocks = sortedBatches.reduce((sum, b) => sum + b.totalStocks, 0);
  const totalAvailable = sortedBatches.reduce(
    (sum, b) => sum + b.availableStocks,
    0,
  );
  const totalSold = sortedBatches.reduce((sum, b) => sum + b.soldStocks, 0);

  useEffect(() => {
    if (error) toast.error("Failed to load CSV batches");
  }, [error]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show batch files view
  if (selectedBatch) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 py-8'>
          <button
            onClick={() => setSelectedBatch(null)}
            className='flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-4'
          >
            <ArrowLeft className='h-4 w-4' /> Back to folders
          </button>
          <h1 className='text-xl font-bold text-gray-900 mb-1'>
            {selectedBatch.fileName}
          </h1>
          <p className='text-sm text-gray-500 mb-6'>
            {selectedBatch.totalStocks} stocks • Imported{" "}
            {formatDate(selectedBatch.importDate)}
          </p>
          <GetCSVFiles batchId={selectedBatch.batchId} />
        </div>
      </div>
    );
  }

  // Show batch folder grid
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 py-8'>
        <div className='flex items-center justify-between flex-wrap gap-3 mb-6'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-gray-900 text-white'>
              <FileSpreadsheet className='h-5 w-5' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>
                CSV Import Folders
              </h1>
              <p className='text-sm text-gray-500'>
                Daily stock CSV/Excel imports, grouped by upload batch
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2 flex-wrap'>
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
            <Button
              variant='outline'
              size='sm'
              onClick={() => navigate("/manager/forms/stock-concept-csv")}
            >
              <UploadCloud className='h-4 w-4 mr-2' />
              Add New CSV
            </Button>
            <Button variant='outline' size='sm' onClick={() => refetch()}>
              <RefreshCw className='h-4 w-4 mr-2' />
              Refresh
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8'>
          <MetricTile
            index={0}
            label='Batches'
            value={sortedBatches.length}
            bg='bg-gray-900'
            text='text-white'
            sub='text-gray-300'
          />
          <MetricTile
            index={1}
            label='Total Stocks'
            value={totalStocks}
            bg='bg-blue-50'
            text='text-blue-900'
            sub='text-blue-600'
          />
          <MetricTile
            index={2}
            label='Available'
            value={totalAvailable}
            bg='bg-green-50'
            text='text-green-900'
            sub='text-green-600'
          />
          <MetricTile
            index={3}
            label='Sold'
            value={totalSold}
            bg='bg-purple-50'
            text='text-purple-900'
            sub='text-purple-600'
          />
        </div>

        {(isLoading || dateBatchesLoading) && (
          <div className='text-center py-12'>
            <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-3 text-primary' />
            <p className='text-muted-foreground'>Loading batches...</p>
          </div>
        )}

        {!isLoading && !dateBatchesLoading && sortedBatches.length === 0 && (
          <div className='text-center py-16 border rounded-lg bg-white'>
            <Package className='h-12 w-12 mx-auto mb-3 text-muted-foreground' />
            <h3 className='font-semibold mb-1'>No CSV imports found</h3>
            <p className='text-sm text-muted-foreground'>
              {showDateMode
                ? "No batches found for the selected date."
                : "Upload a CSV file to create your first import batch"}
            </p>
          </div>
        )}

        {!isLoading && !dateBatchesLoading && sortedBatches.length > 0 && (
          <div className='space-y-4'>
            {showDateMode && (
              <h3 className='text-base font-semibold text-gray-900'>
                Batches for {format(selectedDate!, "dd MMMM yyyy")}
              </h3>
            )}
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 border-2 rounded-2xl p-6 bg-white'>
              {sortedBatches.map((batch) => (
                <div key={batch.batchId} className='relative group'>
                  <FolderCard
                    title={batch.fileName}
                    countLabel={`${formatDate(batch.importDate)} at ${formatTime(batch.importDate)} · ${batch.totalStocks} stock(s)`}
                    subLabel={`${batch.availableStocks} available · ${batch.soldStocks} sold · ${inr(batch.totalCostPrice || 0)}`}
                    onOpen={() => setSelectedBatch(batch)}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setBatchToDelete(batch);
                    }}
                    aria-label='Delete folder'
                    className='absolute top-1 right-1 p-1.5 rounded-md bg-white/90 border border-gray-200 opacity-0 transition-opacity hover:bg-red-50 focus-visible:opacity-100 group-hover:opacity-100'
                  >
                    <Trash2 className='h-3.5 w-3.5 text-red-600' />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AlertDialog
        open={!!batchToDelete}
        onOpenChange={(open) => !open && setBatchToDelete(null)}
      >
        <AlertDialogContent>
          {batchHasSoldStock ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className='flex items-center gap-2 text-amber-700'>
                  <ShieldAlert className='h-5 w-5 shrink-0' />
                  This folder can't be deleted
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className='space-y-3'>
                    <p>
                      <span className='font-semibold text-foreground'>
                        {batchToDelete?.fileName}
                      </span>{" "}
                      holds {batchToDelete?.soldStocks} sold stock(s) worth{" "}
                      <span className='font-semibold text-foreground'>
                        {inr(batchToDelete?.totalCostPrice || 0)}
                      </span>{" "}
                      in cost price, linked to real sale invoices and customer
                      vehicle records.
                    </p>
                    <div className='rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800'>
                      Deleting this folder would permanently remove those
                      financial and vehicle-ownership records. To delete it
                      anyway, first unassign each sold stock from its customer
                      to reverse the sale.
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setBatchToDelete(null)}>
                  Understood
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this folder?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove{" "}
                  <span className='font-semibold'>
                    {batchToDelete?.fileName}
                  </span>{" "}
                  and its {batchToDelete?.totalStocks} stock(s). This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteBatch();
                  }}
                  disabled={isDeleting}
                  className='bg-red-600 text-white hover:bg-red-700'
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Deleting...
                    </>
                  ) : (
                    "Delete Folder"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CSVFolder;
