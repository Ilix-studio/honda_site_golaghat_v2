// src/mainComponents/CSVsystem/ViewCSVUploads.tsx
//
// Lets a Branch-Admin review exactly what was extracted from an uploaded
// CSV/Excel file into the database — the raw parsed columns (`csvData`) next
// to the canonical fields the app actually uses, per row, per upload batch.

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FileSpreadsheet,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  RefreshCw,
  Package,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import toast from "react-hot-toast";

import {
  useGetCSVBatchesQuery,
  useGetStocksByBatchQuery,
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBatch, setSelectedBatch] = useState<string | null>(
    searchParams.get("batchId"),
  );

  const {
    data: batchesData,
    isLoading: batchesLoading,
    error: batchesError,
    refetch: refetchBatches,
  } = useGetCSVBatchesQuery({ page: 1, limit: 50 });

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

  const batches = batchesData?.data || [];
  const stocks = stocksData?.data || [];

  const selectBatch = (batchId: string) => {
    setSelectedBatch(batchId);
    setSearchParams({ batchId });
  };

  const goBack = () => {
    setSelectedBatch(null);
    setSearchParams({});
  };

  return (
    <div className='max-w-6xl mx-auto p-6 space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <FileSpreadsheet className='h-5 w-5' />
              {selectedBatch ? "Upload Details" : "View Uploads"}
            </CardTitle>
            <div className='flex items-center gap-2'>
              {selectedBatch && (
                <Button variant='outline' size='sm' onClick={goBack}>
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Back to Batches
                </Button>
              )}
              <Button
                variant='outline'
                size='sm'
                onClick={() => refetchBatches()}
              >
                <RefreshCw className='h-4 w-4 mr-2' />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          {!selectedBatch && (
            <>
              {batchesLoading && (
                <div className='text-center py-12'>
                  <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-3 text-primary' />
                  <p className='text-muted-foreground'>Loading uploads...</p>
                </div>
              )}

              {!batchesLoading && batches.length === 0 && (
                <div className='text-center py-12 border rounded-lg'>
                  <Package className='h-12 w-12 mx-auto mb-3 text-muted-foreground' />
                  <h3 className='font-semibold mb-1'>No uploads yet</h3>
                  <p className='text-sm text-muted-foreground'>
                    Upload a CSV or Excel file to see it here.
                  </p>
                </div>
              )}

              {!batchesLoading && batches.length > 0 && (
                <div className='rounded-md border overflow-x-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Rows</TableHead>
                        <TableHead>Available</TableHead>
                        <TableHead>Sold</TableHead>
                        <TableHead>Models</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batches.map((batch) => (
                        <TableRow
                          key={batch.batchId}
                          className='cursor-pointer hover:bg-muted/50'
                          onClick={() => selectBatch(batch.batchId)}
                        >
                          <TableCell className='font-medium'>
                            {batch.fileName}
                          </TableCell>
                          <TableCell className='text-sm'>
                            <div className='flex items-center gap-1'>
                              <Calendar className='h-3 w-3' />
                              {formatDateTime(batch.importDate)}
                            </div>
                          </TableCell>
                          <TableCell>{batch.totalStocks}</TableCell>
                          <TableCell>{batch.availableStocks}</TableCell>
                          <TableCell>{batch.soldStocks}</TableCell>
                          <TableCell className='text-xs max-w-[200px] truncate'>
                            {batch.models.join(", ")}
                          </TableCell>
                          <TableCell>
                            <ChevronRight className='h-4 w-4 text-muted-foreground' />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}

          {selectedBatch && (
            <>
              <p className='text-xs text-muted-foreground'>
                Batch ID: {selectedBatch} — click a row to see the exact
                fields extracted from the file for that vehicle.
              </p>

              {stocksLoading && (
                <div className='text-center py-12'>
                  <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-3 text-primary' />
                  <p className='text-muted-foreground'>Loading rows...</p>
                </div>
              )}

              {!stocksLoading && stocks.length > 0 && (
                <div className='rounded-md border overflow-x-auto'>
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
                <div className='text-center py-12 border rounded-lg'>
                  <Package className='h-12 w-12 mx-auto mb-3 text-muted-foreground' />
                  <h3 className='font-semibold mb-1'>No rows in this batch</h3>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewCSVUploads;
