import { useState } from "react";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Package,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  useGetPartsBatchesQuery,
  useGetPartsBatchesByDateQuery,
  useGetPartsStockStatusQuery,
  type PartsBatchDTO,
} from "@/redux-store/services/partsApi";
import FolderCard, {
  type FolderCardTone,
} from "@/mainComponents/shared/FolderCard";
import PartsDatasetRecords from "./PartsDatasetRecords";
import { Link } from "react-router-dom";

const toneForStatus = (status: PartsBatchDTO["status"]): FolderCardTone => {
  if (status === "failed") return "danger";
  if (status === "completed_with_errors") return "warning";
  return "default";
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const diffSubLabel = (batch: PartsBatchDTO): string | undefined => {
  const parts: string[] = [];
  if (batch.addedRows) parts.push(`+${batch.addedRows} new`);
  if (batch.changedRows) parts.push(`${batch.changedRows} changed`);
  if (batch.removedRows) parts.push(`-${batch.removedRows} removed`);
  if (batch.revenueDelta) {
    const sign = batch.revenueDelta > 0 ? "+" : "-";
    parts.push(
      `${sign}₹${Math.abs(batch.revenueDelta).toLocaleString("en-IN")}`,
    );
  }
  return parts.length > 0 ? parts.join(" · ") : "No stock changes";
};

const PartsFolderDashboard = () => {
  const [selectedBatch, setSelectedBatch] = useState<PartsBatchDTO | null>(
    null,
  );

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const { data, isLoading, refetch } = useGetPartsBatchesQuery();
  const { data: stockStatusData, isLoading: stockStatusLoading } =
    useGetPartsStockStatusQuery();
  const stockStatus = stockStatusData?.data;

  // Local calendar date, not toISOString() — the latter converts to UTC first,
  // so an evening pick in IST would query the previous day.
  const dateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined;
  const { data: dateBatchesData, isLoading: dateBatchesLoading } =
    useGetPartsBatchesByDateQuery(
      { date: dateKey ?? "" },
      { skip: !dateKey },
    );

  const showDateMode = Boolean(dateKey);
  const batches = showDateMode
    ? (dateBatchesData?.data ?? [])
    : (data?.data ?? []);
  const listLoading = showDateMode ? dateBatchesLoading : isLoading;
  const sortedBatches = [...batches].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (selectedBatch) {
    return (
      <div className='max-w-7xl mx-auto p-6'>
        <Card>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setSelectedBatch(null)}
              >
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to Folders
              </Button>
              <div>
                <CardTitle>{selectedBatch.fileName}</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  {selectedBatch.importedRows} rows imported • Imported{" "}
                  {formatDate(selectedBatch.createdAt)}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <PartsDatasetRecords batchId={selectedBatch.batchId} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto p-6 space-y-6'>
      <div className='flex items-center justify-between flex-wrap gap-3'>
        <div>
          <h2 className='text-xl font-semibold'>Imported Parts Reports</h2>
          {showDateMode && (
            <p className='text-sm text-muted-foreground'>
              Uploaded on {format(selectedDate!, "dd MMMM yyyy")}
            </p>
          )}
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
          <Button variant='outline' size='sm' onClick={() => refetch()}>
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
          <Link to='/part-admin/parts-stock/upload'>
            <Button className='bg-gray-600 hover:bg-blue-800'>
              <UploadCloud className='w-4 h-4 mr-2' /> Upload Report{" "}
            </Button>{" "}
          </Link>
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <p className='text-xs text-muted-foreground'>Current Parts</p>
            <p className='text-xl font-semibold'>
              {stockStatusLoading
                ? "—"
                : (stockStatus?.totalItems ?? 0).toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <p className='text-xs text-muted-foreground'>Total Revenue</p>
            <p className='text-xl font-semibold text-emerald-700'>
              {stockStatusLoading
                ? "—"
                : `₹${(stockStatus?.totalRevenue ?? 0).toLocaleString("en-IN")}`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <p className='text-xs text-muted-foreground'>Average Unit Price</p>
            <p className='text-xl font-semibold text-indigo-700'>
              {stockStatusLoading
                ? "—"
                : `₹${(stockStatus?.avgUnitPrice ?? 0).toLocaleString("en-IN")}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {listLoading && (
        <div className='text-center py-12'>
          <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-3 text-primary' />
          <p className='text-muted-foreground'>Loading imports...</p>
        </div>
      )}

      {!listLoading && sortedBatches.length > 0 && (
        <div className='flex flex-wrap gap-x-10 gap-y-12'>
          {sortedBatches.map((batch) => (
            <FolderCard
              key={batch.batchId}
              title={batch.fileName}
              countLabel={`${batch.importedRows} rows`}
              subLabel={diffSubLabel(batch)}
              tone={toneForStatus(batch.status)}
              onOpen={() => setSelectedBatch(batch)}
            />
          ))}
        </div>
      )}

      {!listLoading && sortedBatches.length === 0 && (
        <div className='text-center py-12 border rounded-lg'>
          <Package className='h-12 w-12 mx-auto mb-3 text-muted-foreground' />
          <h3 className='font-semibold mb-1'>
            {showDateMode
              ? "No parts reports on this date"
              : "No parts reports found"}
          </h3>
          <p className='text-sm text-muted-foreground'>
            {showDateMode
              ? "Pick another date, or clear the filter to see every batch"
              : "Upload a parts report to create your first import batch"}
          </p>
        </div>
      )}
    </div>
  );
};

export default PartsFolderDashboard;
