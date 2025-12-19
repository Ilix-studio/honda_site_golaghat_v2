// src/components/admin/forms/CustomerCSVStock.tsx

import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Folder,
  FolderOpen,
  Calendar,
  Package,
  RefreshCw,
  FileSpreadsheet,
  ArrowLeft,
  Search,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { CSVBatch, IStockConceptCSV } from "@/types/customer/stockcsv.types";

const CustomerCSVStock = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [selectedBatch, setSelectedBatch] = useState<CSVBatch | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch batches
  const {
    data: batchesData,
    isLoading: batchesLoading,
    error: batchesError,
    refetch: refetchBatches,
  } = useGetCSVBatchesQuery({ page: 1, limit: 100 });

  // Fetch stocks for selected batch (only available)
  const {
    data: stocksData,
    isLoading: stocksLoading,
    refetch: refetchStocks,
  } = useGetStocksByBatchQuery(
    { batchId: selectedBatch?.batchId || "", status: "Available" },
    { skip: !selectedBatch }
  );

  const batches = batchesData?.data || [];
  const stocks = stocksData?.data || [];

  // Filter batches with available stocks only
  const availableBatches = batches.filter((b) => b.availableStocks > 0);

  // Sort by import date (newest first)
  const sortedBatches = [...availableBatches].sort(
    (a, b) =>
      new Date(b.importDate).getTime() - new Date(a.importDate).getTime()
  );

  const filteredStocks = useMemo(() => {
    if (!searchQuery.trim()) return stocks;
    const query = searchQuery.toLowerCase();
    return stocks.filter(
      (stock) =>
        stock.stockId.toLowerCase().includes(query) ||
        stock.modelName.toLowerCase().includes(query) ||
        stock.engineNumber.toLowerCase().includes(query) ||
        stock.chassisNumber.toLowerCase().includes(query) ||
        stock.color.toLowerCase().includes(query)
    );
  }, [stocks, searchQuery]);

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

  const handleAssign = (stock: IStockConceptCSV) => {
    navigate(`/admin/assign/csv-stock/${stock._id}`, {
      state: {
        stockType: "csv",
        stockData: stock,
        customerId,
      },
    });
  };

  if (batchesError) {
    toast.error("Failed to load CSV batches");
  }

  // Stock list view for selected batch
  if (selectedBatch) {
    return (
      <div className='max-w-7xl mx-auto p-6'>
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setSelectedBatch(null);
                    setSearchQuery("");
                  }}
                >
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Back to Batches
                </Button>
                <div>
                  <CardTitle className='flex items-center gap-2'>
                    <FolderOpen className='h-5 w-5 text-yellow-600' />
                    {selectedBatch.fileName}
                  </CardTitle>
                  <p className='text-sm text-muted-foreground'>
                    {selectedBatch.availableStocks} available vehicles
                  </p>
                </div>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => refetchStocks()}
              >
                <RefreshCw className='h-4 w-4 mr-2' />
                Refresh
              </Button>
            </div>
          </CardHeader>

          <CardContent className='space-y-4'>
            {/* Search */}
            <div className='relative max-w-md'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search by stock ID, model, engine...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>

            {/* Loading */}
            {stocksLoading && (
              <div className='text-center py-12'>
                <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-3 text-primary' />
                <p className='text-muted-foreground'>Loading stocks...</p>
              </div>
            )}

            {/* Stock Table */}
            {!stocksLoading && filteredStocks.length > 0 && (
              <div className='border rounded-lg overflow-hidden'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stock ID</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Engine / Chassis</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className='text-right'>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStocks.map((stock) => (
                      <TableRow key={stock._id}>
                        <TableCell className='font-mono text-sm'>
                          {stock.stockId}
                        </TableCell>
                        <TableCell className='font-medium'>
                          {stock.modelName}
                        </TableCell>
                        <TableCell>{stock.color}</TableCell>
                        <TableCell>
                          <div className='text-xs space-y-1'>
                            <div>E: {stock.engineNumber}</div>
                            <div>C: {stock.chassisNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>{stock.stockStatus.location}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              stock.stockStatus.status === "Available"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {stock.stockStatus.status}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          <Button
                            size='sm'
                            onClick={() => handleAssign(stock)}
                            disabled={stock.stockStatus.status !== "Available"}
                          >
                            <CheckCircle className='h-4 w-4 mr-1' />
                            Assign
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Empty */}
            {!stocksLoading && filteredStocks.length === 0 && (
              <div className='text-center py-12 border rounded-lg'>
                <Package className='h-12 w-12 mx-auto mb-3 text-muted-foreground' />
                <p className='text-muted-foreground'>
                  {searchQuery
                    ? "No vehicles match your search"
                    : "No available vehicles in this batch"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Batch folder grid view
  return (
    <div className='max-w-7xl mx-auto p-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <Folder className='h-5 w-5' />
                Select CSV Stock Batch
              </CardTitle>
              <p className='text-sm text-muted-foreground mt-1'>
                Choose a batch to view available vehicles for assignment
              </p>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => refetchBatches()}
            >
              <RefreshCw className='h-4 w-4 mr-2' />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Loading */}
          {batchesLoading && (
            <div className='text-center py-12'>
              <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-3 text-primary' />
              <p className='text-muted-foreground'>Loading batches...</p>
            </div>
          )}

          {/* Batch Grid */}
          {!batchesLoading && sortedBatches.length > 0 && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
              {sortedBatches.map((batch) => (
                <div
                  key={batch.batchId}
                  onClick={() => setSelectedBatch(batch)}
                  className='group cursor-pointer'
                >
                  <Card className='h-full transition-all hover:shadow-lg hover:border-primary/50'>
                    <CardContent className='p-6'>
                      <div className='flex flex-col items-center text-center space-y-4'>
                        <div className='relative'>
                          <Folder className='h-20 w-20 text-red-500 transition-transform group-hover:scale-110' />
                          <Badge
                            variant='secondary'
                            className='absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center'
                          >
                            {batch.availableStocks}
                          </Badge>
                        </div>

                        <div className='space-y-1 w-full'>
                          <h3 className='font-semibold text-sm line-clamp-2'>
                            {batch.fileName}
                          </h3>
                          <div className='flex items-center justify-center gap-1 text-xs text-muted-foreground'>
                            <Calendar className='h-3 w-3' />
                            <span>
                              {formatDate(batch.importDate)} at{" "}
                              {formatTime(batch.importDate)}
                            </span>
                          </div>
                        </div>

                        <div className='flex flex-wrap items-center gap-2 w-full justify-center'>
                          <Badge
                            variant='outline'
                            className='text-xs bg-green-50 text-green-700'
                          >
                            <FileSpreadsheet className='h-3 w-3 mr-1' />
                            {batch.availableStocks} available
                          </Badge>
                        </div>

                        <div className='text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity'>
                          Click to view vehicles →
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!batchesLoading && sortedBatches.length === 0 && (
            <div className='text-center py-12 border rounded-lg'>
              <Package className='h-12 w-12 mx-auto mb-3 text-muted-foreground' />
              <h3 className='font-semibold mb-1'>No available stock batches</h3>
              <p className='text-sm text-muted-foreground'>
                Import CSV stock files or check existing batches for available
                vehicles
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerCSVStock;
