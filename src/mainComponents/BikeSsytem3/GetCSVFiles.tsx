// src/components/admin/forms/GetCSVFiles.tsx

import { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  Search,
  RefreshCw,
  Calendar,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  useGetCSVStocksQuery,
  CSVStockFilters,
  IStockConceptCSV,
} from "@/redux-store/services/BikeSystemApi3/csvStockApi";

export interface GetCSVFilesProps {
  folderDate?: string;
}

interface BatchGroup {
  batchId: string;
  stocks: IStockConceptCSV[];
  importTime: string;
}

const GetCSVFiles = ({ folderDate }: GetCSVFilesProps) => {
  const [filters, setFilters] = useState<CSVStockFilters>({
    page: 1,
    limit: 100,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");

  const { data, isLoading, error, refetch } = useGetCSVStocksQuery(filters);

  const stocks = data?.data || [];
  const pagination = data?.pagination;

  // Filter by folder date if provided
  const folderFilteredStocks = folderDate
    ? stocks.filter((stock) => {
        const stockDate = new Date(stock.csvImportDate).toLocaleDateString(
          "en-IN",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        );
        return stockDate === folderDate;
      })
    : stocks;

  // Group stocks by batch
  const batchGroups: BatchGroup[] = useMemo(() => {
    const grouped = folderFilteredStocks.reduce((acc, stock) => {
      const batchId = stock.csvImportBatch;
      if (!acc[batchId]) {
        acc[batchId] = {
          batchId,
          stocks: [],
          importTime: stock.csvImportDate,
        };
      }
      acc[batchId].stocks.push(stock);
      return acc;
    }, {} as Record<string, BatchGroup>);

    return Object.values(grouped).sort(
      (a, b) =>
        new Date(b.importTime).getTime() - new Date(a.importTime).getTime()
    );
  }, [folderFilteredStocks]);

  // Filter stocks based on selected batch
  const batchFilteredStocks =
    selectedBatch === "all"
      ? folderFilteredStocks
      : folderFilteredStocks.filter(
          (stock) => stock.csvImportBatch === selectedBatch
        );

  const handleFilterChange = (
    key: keyof CSVStockFilters,
    value: string | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : Number(value),
    }));
  };

  const handleStatusChange = (value: string) => {
    if (value === "all") {
      const { status, ...rest } = filters;
      setFilters({ ...rest, page: 1 });
    } else {
      handleFilterChange(
        "status",
        value as IStockConceptCSV["stockStatus"]["status"]
      );
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const filteredStocks = batchFilteredStocks.filter((stock) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      stock.modelName.toLowerCase().includes(query) ||
      stock.engineNumber.toLowerCase().includes(query) ||
      stock.chassisNumber.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (
    status: IStockConceptCSV["stockStatus"]["status"]
  ) => {
    const variants: Record<typeof status, string> = {
      Available: "bg-green-100 text-green-800",
      Sold: "bg-blue-100 text-blue-800",
      Reserved: "bg-yellow-100 text-yellow-800",
      Service: "bg-purple-100 text-purple-800",
    };

    return <Badge className={`${variants[status]} border-0`}>{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBatchLabel = (index: number) => {
    return `Batch ${index + 1}`;
  };

  if (error) {
    toast.error("Failed to load CSV stock files");
  }

  return (
    <div className={folderDate ? "" : "max-w-7xl mx-auto p-6 space-y-6"}>
      <Card>
        {!folderDate && (
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center gap-2'>
                <FileSpreadsheet className='h-5 w-5' />
                CSV Stock Imports
              </CardTitle>
              <Button variant='outline' size='sm' onClick={() => refetch()}>
                <RefreshCw className='h-4 w-4 mr-2' />
                Refresh
              </Button>
            </div>
          </CardHeader>
        )}

        <CardContent className='space-y-4'>
          {/* Batch Tabs - Only show if multiple batches exist */}
          {batchGroups.length > 1 && (
            <Tabs value={selectedBatch} onValueChange={setSelectedBatch}>
              <TabsList className='w-full justify-start overflow-x-auto flex-wrap h-auto'>
                <TabsTrigger value='all' className='flex items-center gap-2'>
                  <FileSpreadsheet className='h-3 w-3' />
                  All Batches
                  <Badge variant='secondary' className='ml-1'>
                    {folderFilteredStocks.length}
                  </Badge>
                </TabsTrigger>
                {batchGroups.map((batch, index) => (
                  <TabsTrigger
                    key={batch.batchId}
                    value={batch.batchId}
                    className='flex items-center gap-2'
                  >
                    <FileSpreadsheet className='h-3 w-3' />
                    {getBatchLabel(index)}
                    <Badge variant='secondary' className='ml-1'>
                      {batch.stocks.length}
                    </Badge>
                    <span className='text-xs text-muted-foreground ml-2'>
                      {formatTime(batch.importTime)}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          {/* Filters */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search model, engine, chassis...'
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className='pl-9'
              />
            </div>

            <Select
              value={filters.status || "all"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='Available'>Available</SelectItem>
                <SelectItem value='Sold'>Sold</SelectItem>
                <SelectItem value='Reserved'>Reserved</SelectItem>
                <SelectItem value='Service'>Service</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder='Location...'
              value={filters.location || ""}
              onChange={(e) => handleFilterChange("location", e.target.value)}
            />

            <Select
              value={filters.limit?.toString() || "100"}
              onValueChange={(value) =>
                handleFilterChange("limit", Number(value))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='10'>10 per page</SelectItem>
                <SelectItem value='20'>20 per page</SelectItem>
                <SelectItem value='50'>50 per page</SelectItem>
                <SelectItem value='100'>100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Batch Info Alert */}
          {selectedBatch !== "all" && (
            <div className='bg-muted/50 rounded-lg p-4 border'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <FileSpreadsheet className='h-5 w-5 text-primary' />
                  <div>
                    <p className='font-medium text-sm'>
                      {getBatchLabel(
                        batchGroups.findIndex(
                          (b) => b.batchId === selectedBatch
                        )
                      )}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Batch ID: {selectedBatch}
                    </p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='text-xs text-muted-foreground'>
                    Imported on{" "}
                    {formatDate(
                      batchGroups.find((b) => b.batchId === selectedBatch)
                        ?.importTime || ""
                    )}{" "}
                    at{" "}
                    {formatTime(
                      batchGroups.find((b) => b.batchId === selectedBatch)
                        ?.importTime || ""
                    )}
                  </p>
                  <p className='text-sm font-medium mt-1'>
                    {filteredStocks.length} items
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className='text-center py-12'>
              <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-3 text-primary' />
              <p className='text-muted-foreground'>Loading CSV stock data...</p>
            </div>
          )}

          {/* Table with Horizontal Scroll */}
          {!isLoading && filteredStocks.length > 0 && (
            <>
              <div className='rounded-md border overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='min-w-[200px]'>Model</TableHead>
                      <TableHead className='min-w-[200px]'>
                        Engine / Chassis
                      </TableHead>
                      <TableHead className='min-w-[150px]'>Color</TableHead>
                      <TableHead className='min-w-[100px]'>Status</TableHead>
                      <TableHead className='min-w-[120px]'>Location</TableHead>
                      <TableHead className='min-w-[120px]'>
                        Import Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStocks.map((stock) => (
                      <TableRow key={stock._id}>
                        <TableCell>{stock.modelName}</TableCell>
                        <TableCell className='text-xs'>
                          <div>E: {stock.engineNumber}</div>
                          <div className='text-muted-foreground'>
                            C: {stock.chassisNumber}
                          </div>
                        </TableCell>
                        <TableCell>{stock.color}</TableCell>
                        <TableCell>
                          {getStatusBadge(stock.stockStatus.status)}
                        </TableCell>
                        <TableCell>{stock.stockStatus.location}</TableCell>
                        <TableCell className='text-sm'>
                          <div className='flex items-center gap-1'>
                            <Calendar className='h-3 w-3' />
                            {formatDate(stock.csvImportDate)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Results Summary */}
              <div className='flex items-center justify-between'>
                <p className='text-sm text-muted-foreground'>
                  Showing {filteredStocks.length}{" "}
                  {selectedBatch === "all" ? "total" : "in this batch"} results
                  {searchQuery && ` (filtered by search)`}
                </p>
              </div>
            </>
          )}
          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className='flex items-center justify-between'>
              <p className='text-sm text-muted-foreground'>
                Showing {stocks.length} of {pagination.total} results
              </p>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={filters.page === 1}
                  onClick={() =>
                    handleFilterChange("page", (filters.page || 1) - 1)
                  }
                >
                  Previous
                </Button>
                <span className='text-sm'>
                  Page {filters.page} of {pagination.pages}
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={filters.page === pagination.pages}
                  onClick={() =>
                    handleFilterChange("page", (filters.page || 1) + 1)
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredStocks.length === 0 && (
            <div className='text-center py-12 border rounded-lg'>
              <Package className='h-12 w-12 mx-auto mb-3 text-muted-foreground' />
              <h3 className='font-semibold mb-1'>No CSV stock found</h3>
              <p className='text-sm text-muted-foreground'>
                {searchQuery || filters.status || filters.location
                  ? "Try adjusting your filters or search"
                  : "Upload a CSV file to get started"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GetCSVFiles;
