// src/mainComponents/CSVsystem/ViewCSVUploads.tsx
//
// Lets a Branch-Admin review exactly what was extracted from an uploaded
// CSV/Excel file into the database — the raw parsed columns (`csvData`) next
// to the canonical fields the app actually uses, per row, per upload batch.
// Folder-grid styling mirrors CounterSaleAdminDashboard (FolderCard + date
// picker + MetricTile summary row) for a consistent look across upload
// modules.

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FileSpreadsheet,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  RefreshCw,
  Package,
  Calendar as CalendarIcon,
  UploadCloud,
  Trash2,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import toast from "react-hot-toast";

import { MetricTile } from "@/mainComponents/Admin/AdminDash/StatCard";
import FolderCard from "@/mainComponents/shared/FolderCard";
import { inr } from "@/mainComponents/DataImport/SalesKpiCharts";
import {
  useGetCSVBatchesQuery,
  useGetCSVBatchesByDateQuery,
  useGetStocksByBatchQuery,
  useDeleteCSVBatchMutation,
} from "@/redux-store/services/BikeSystemApi3/csvStockApi";
import { IStockConceptCSV } from "@/types/customer/stockcsv.types";

const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getStatusBadge = (status: IStockConceptCSV["stockStatus"]["status"]) => {
  const variants: Record<typeof status, string> = {
    Available: "bg-green-100 text-green-800",
    Sold: "bg-blue-100 text-blue-800",
    Reserved: "bg-yellow-100 text-yellow-800",
    Service: "bg-purple-100 text-purple-800",
  };
  return <Badge className={`${variants[status]} border-0`}>{status}</Badge>;
};

const StockRow = ({ stock }: { stock: IStockConceptCSV }) => {
  const [expanded, setExpanded] = useState(false);
  const rawFields = Object.entries(stock.csvData || {});

  return (
    <>
      <TableRow
        className='cursor-pointer'
        onClick={() => setExpanded((prev) => !prev)}
      >
        <TableCell>
          {expanded ? (
            <ChevronDown className='h-4 w-4' />
          ) : (
            <ChevronRight className='h-4 w-4' />
          )}
        </TableCell>
        <TableCell className='font-medium'>{stock.modelVariant}</TableCell>
        <TableCell className='text-xs'>
          <div>E: {stock.engineNumber}</div>
          <div className='text-muted-foreground'>F: {stock.frameNumber}</div>
        </TableCell>
        <TableCell>{stock.color}</TableCell>
        <TableCell>
          {stock.costPrice !== undefined ? `₹${stock.costPrice}` : "—"}
        </TableCell>
        <TableCell>{getStatusBadge(stock.stockStatus.status)}</TableCell>
        <TableCell>
          <Badge variant='outline' className='text-xs'>
            {stock.creationSource}
          </Badge>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={7} className='bg-muted/30'>
            <div className='py-2 px-2 space-y-2'>
              <p className='text-xs font-semibold text-muted-foreground'>
                Exact fields extracted from the uploaded file (stockId:{" "}
                {stock.stockId})
              </p>
              {rawFields.length === 0 ? (
                <p className='text-xs text-muted-foreground'>
                  No raw column data captured for this row.
                </p>
              ) : (
                <div className='grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1'>
                  {rawFields.map(([key, value]) => (
                    <div key={key} className='text-xs'>
                      <span className='font-semibold'>{key}: </span>
                      <span className='text-muted-foreground'>
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

const ViewCSVUploads = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBatch, setSelectedBatch] = useState<string | null>(
    searchParams.get("batchId"),
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    undefined,
  );

  const {
    data: batchesData,
    isLoading: batchesLoading,
    error: batchesError,
    refetch: refetchBatches,
  } = useGetCSVBatchesQuery({ page: 1, limit: 50 });

  const dateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined;
  const { data: dateBatchesData, isLoading: dateBatchesLoading } =
    useGetCSVBatchesByDateQuery(
      dateKey ? { date: dateKey } : ({ date: "" } as any),
      { skip: !dateKey },
    );

  const [deleteCSVBatch, { isLoading: isDeleting }] =
    useDeleteCSVBatchMutation();

  const {
    data: stocksData,
    isLoading: stocksLoading,
    error: stocksError,
  } = useGetStocksByBatchQuery(
    { batchId: selectedBatch ?? "", limit: 200 },
    { skip: !selectedBatch },
  );

  useEffect(() => {
    if (batchesError) toast.error("Failed to load upload batches");
  }, [batchesError]);

  useEffect(() => {
    if (stocksError) toast.error("Failed to load batch contents");
  }, [stocksError]);

  const showDateMode = Boolean(dateKey);
  const batches = showDateMode
    ? (dateBatchesData?.data ?? [])
    : (batchesData?.data ?? []);
  const sortedBatches = [...batches].sort(
    (a, b) => new Date(b.importDate).getTime() - new Date(a.importDate).getTime(),
  );
  const stocks = stocksData?.data || [];

  const totalStocks = sortedBatches.reduce((sum, b) => sum + b.totalStocks, 0);
  const totalAvailable = sortedBatches.reduce(
    (sum, b) => sum + b.availableStocks,
    0,
  );
  const totalSold = sortedBatches.reduce((sum, b) => sum + b.soldStocks, 0);

  const selectBatch = (batchId: string) => {
    setSelectedBatch(batchId);
    setSearchParams({ batchId });
  };

  const goBack = () => {
    setSelectedBatch(null);
    setSearchParams({});
  };

  const handleDeleteBatch = async (batchId: string) => {
    try {
      const res = await deleteCSVBatch(batchId).unwrap();
      toast.success(res.message || "Folder deleted");
      if (selectedBatch === batchId) goBack();
    } catch (err) {
      const message =
        (err as { data?: { message?: string }; message?: string })?.data
          ?.message ||
        (err as { message?: string })?.message ||
        "Failed to delete folder";
      toast.error(message);
    }
  };

  // ---- Batch detail view ----
  if (selectedBatch) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 py-8'>
          <button
            onClick={goBack}
            className='flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-4'
          >
            <ArrowLeft className='h-4 w-4' /> Back to batches
          </button>
          <h1 className='text-xl font-bold text-gray-900 mb-1 font-mono'>
            {selectedBatch}
          </h1>
          <p className='text-xs text-muted-foreground mb-4'>
            Click a row to see the exact fields extracted from the file for
            that vehicle.
          </p>

          {stocksLoading && (
            <div className='text-center py-12'>
              <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-3 text-primary' />
              <p className='text-muted-foreground'>Loading rows...</p>
            </div>
          )}

          {!stocksLoading && stocks.length > 0 && (
            <div className='rounded-md border overflow-x-auto bg-white'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-8' />
                    <TableHead>Model</TableHead>
                    <TableHead>Engine / Frame</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Cost Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stocks.map((stock) => (
                    <StockRow key={stock._id} stock={stock} />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!stocksLoading && stocks.length === 0 && (
            <div className='text-center py-12 border rounded-lg bg-white'>
              <Package className='h-12 w-12 mx-auto mb-3 text-muted-foreground' />
              <h3 className='font-semibold mb-1'>No rows in this batch</h3>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- Folder grid view ----
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
                Daily Stock Uploads
              </h1>
              <p className='text-sm text-gray-500'>
                Review CSV/Excel imports batch by batch
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
              <UploadCloud className='h-4 w-4 mr-2' /> New Upload
            </Button>
            <Button variant='outline' size='sm' onClick={() => refetchBatches()}>
              <RefreshCw className='h-4 w-4 mr-2' /> Refresh
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

        {(batchesLoading || dateBatchesLoading) && (
          <div className='text-center py-12'>
            <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-3 text-primary' />
            <p className='text-muted-foreground'>Loading batches...</p>
          </div>
        )}

        {!batchesLoading && !dateBatchesLoading && sortedBatches.length === 0 && (
          <div className='text-center py-16 border rounded-lg bg-white'>
            <FileSpreadsheet className='h-12 w-12 mx-auto mb-3 text-muted-foreground' />
            <h3 className='font-semibold mb-1'>No uploads yet</h3>
            <p className='text-sm text-muted-foreground'>
              {showDateMode
                ? "No batches found for the selected date."
                : "Upload a CSV or Excel file to see it here."}
            </p>
          </div>
        )}

        {!batchesLoading && !dateBatchesLoading && sortedBatches.length > 0 && (
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
                    countLabel={`${formatDateTime(batch.importDate)} · ${batch.totalStocks} stock(s)`}
                    subLabel={`${batch.availableStocks} available · ${batch.soldStocks} sold · ${inr(batch.totalCostPrice || 0)}`}
                    onOpen={() => selectBatch(batch.batchId)}
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className='absolute top-1 right-1 p-1.5 rounded-md bg-white/90 border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50'
                        aria-label={`Delete batch ${batch.fileName}`}
                      >
                        <Trash2 className='h-3.5 w-3.5 text-red-600' />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this folder?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This removes{" "}
                          <span className='font-semibold'>
                            {batch.fileName}
                          </span>{" "}
                          and its {batch.totalStocks} stock(s). Sold stock
                          batches can't be deleted. This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          disabled={isDeleting}
                          onClick={() => handleDeleteBatch(batch.batchId)}
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
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewCSVUploads;
