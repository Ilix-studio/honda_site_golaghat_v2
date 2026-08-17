// src/components/admin/forms/CSVFolder.tsx

import { useEffect, useMemo, useState } from "react";
import {
  FolderOpen,
  Calendar as CalendarIcon,
  Package,
  RefreshCw,
  ArrowLeft,
  Upload,
  Folder,
  Trash2,
  Loader2,
  IndianRupee,
  ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const formatCurrency = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const batchHasSoldStock = (batchToDelete?.soldStocks ?? 0) > 0;

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
      <div className='max-w-7xl mx-auto p-3 sm:p-6'>
        <Card size='sm'>
          <CardHeader>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setSelectedBatch(null)}
                className='w-fit'
              >
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to Folders
              </Button>
              <div className='min-w-0'>
                <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
                  <FolderOpen className='h-5 w-5 shrink-0 text-yellow-600' />
                  <span className='truncate'>{selectedBatch.fileName}</span>
                </CardTitle>
                <p className='text-sm text-muted-foreground'>
                  {selectedBatch.totalStocks} stocks • Imported{" "}
                  {formatDate(selectedBatch.importDate)}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
        <div className='mt-4 sm:mt-6'>
          <GetCSVFiles batchId={selectedBatch.batchId} />
        </div>
      </div>
    );
  }

  // Show batch folder grid
  return (
    <div className='max-w-7xl mx-auto p-3 sm:p-6'>
      <Card size='sm'>
        <CardHeader>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <Folder className='h-5 w-5 shrink-0' />
              CSV Import Folders
            </CardTitle>
            <div className='flex flex-wrap gap-2'>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline' size='sm' className='w-fit'>
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
                  className='w-fit'
                >
                  Clear
                </Button>
              )}
              <Button
                variant='outline'
                size='sm'
                onClick={() => refetch()}
                className='w-fit'
              >
                <RefreshCw className='h-4 w-4 mr-2' />
                Refresh
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => navigate("/manager/forms/stock-concept-csv")}
                className='w-fit bg-blue-800 text-white hover:bg-blue-900 hover:text-white'
              >
                <Upload className='h-4 w-4 mr-2' />
                Add New CSV
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {(isLoading || dateBatchesLoading) && (
            <div className='text-center py-12'>
              <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-3 text-primary' />
              <p className='text-muted-foreground'>Loading batches...</p>
            </div>
          )}

          {!isLoading && !dateBatchesLoading && sortedBatches.length > 0 && (
            <div className='space-y-4'>
              {showDateMode && (
                <h3 className='text-sm font-semibold text-foreground'>
                  Batches for {format(selectedDate!, "dd MMMM yyyy")}
                </h3>
              )}
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4'>
              {sortedBatches.map((batch) => (
                <div
                  key={batch.batchId}
                  onClick={() => setSelectedBatch(batch)}
                  className='group cursor-pointer'
                >
                  <Card className='relative h-full transition-all hover:shadow-lg hover:border-primary/50'>
                    <Button
                      variant='ghost'
                      size='icon'
                      aria-label='Delete folder'
                      onClick={(e) => {
                        e.stopPropagation();
                        setBatchToDelete(batch);
                      }}
                      className='absolute top-1 right-1 z-10 h-7 w-7 text-muted-foreground opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 group-hover:opacity-100'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                    <CardContent className='p-3 sm:p-6'>
                      <div className='flex flex-col items-center text-center space-y-2 sm:space-y-4'>
                        {/* Folder Icon */}
                        <div className='relative'>
                          <Folder className='h-12 w-12 sm:h-20 sm:w-20 text-blue-400 transition-transform group-hover:scale-110' />
                          <Badge
                            variant='secondary'
                            className='absolute -top-2 -right-2 h-5 w-5 sm:h-6 sm:w-6 rounded-full p-0 flex items-center justify-center text-[10px] sm:text-xs'
                          >
                            {batch.totalStocks}
                          </Badge>
                        </div>

                        {/* Batch Info */}
                        <div className='space-y-1 w-full min-w-0'>
                          <h3 className='font-semibold text-xs sm:text-sm line-clamp-2 break-words'>
                            {batch.fileName}
                          </h3>
                          <div className='flex items-center justify-center gap-1 text-[11px] sm:text-xs text-muted-foreground'>
                            <CalendarIcon className='h-3 w-3 shrink-0' />
                            <span className='truncate'>
                              {formatDate(batch.importDate)} at{" "}
                              {formatTime(batch.importDate)}
                            </span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className='flex flex-wrap items-center gap-1.5 sm:gap-2 w-full justify-center'>
                          <Badge
                            variant='outline'
                            className='text-[10px] sm:text-xs bg-green-50 text-green-700'
                          >
                            {batch.availableStocks} available
                          </Badge>
                          {batch.soldStocks > 0 && (
                            <Badge
                              variant='outline'
                              className='text-[10px] sm:text-xs bg-blue-50 text-blue-700'
                            >
                              {batch.soldStocks} sold
                            </Badge>
                          )}
                        </div>
                        <div className='flex items-center gap-1 text-[11px] sm:text-xs font-medium text-amber-700'>
                          <IndianRupee className='h-3 w-3 shrink-0' />
                          {formatCurrency(batch.totalCostPrice || 0)}
                        </div>

                        {/* Hover Indicator */}
                        <div className='hidden sm:block text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity'>
                          Click to view stocks →
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
              </div>
            </div>
          )}

          {!isLoading && !dateBatchesLoading && sortedBatches.length === 0 && (
            <div className='text-center py-12 border rounded-lg'>
              <Package className='h-12 w-12 mx-auto mb-3 text-muted-foreground' />
              <h3 className='font-semibold mb-1'>No CSV imports found</h3>
              <p className='text-sm text-muted-foreground'>
                {showDateMode
                  ? "No batches found for the selected date."
                  : "Upload a CSV file to create your first import batch"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
                        {formatCurrency(batchToDelete?.totalCostPrice || 0)}
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
