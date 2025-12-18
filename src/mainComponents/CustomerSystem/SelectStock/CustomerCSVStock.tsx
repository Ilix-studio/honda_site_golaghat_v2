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
  useGetCSVStocksQuery,
  IStockConceptCSV,
  CSVStockFilters,
} from "@/redux-store/services/BikeSystemApi3/csvStockApi";

interface GroupedStocks {
  [date: string]: IStockConceptCSV[];
}

const CustomerCSVStock = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters] = useState<CSVStockFilters>({
    page: 1,
    limit: 100,
    status: "Available",
  });

  const { data, isLoading, error, refetch } = useGetCSVStocksQuery(filters);

  const stocks = data?.data || [];

  const groupStocksByDate = (stocks: IStockConceptCSV[]): GroupedStocks => {
    return stocks.reduce((acc, stock) => {
      const date = new Date(stock.csvImportDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(stock);
      return acc;
    }, {} as GroupedStocks);
  };

  const groupedStocks = groupStocksByDate(stocks);
  const sortedDates = Object.keys(groupedStocks).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const getBatchCount = (stocks: IStockConceptCSV[]) => {
    return new Set(stocks.map((s) => s.csvImportBatch)).size;
  };

  // Filter stocks for selected folder
  const folderStocks = selectedFolder
    ? groupedStocks[selectedFolder] || []
    : [];

  const filteredStocks = useMemo(() => {
    if (!searchQuery.trim()) return folderStocks;

    const query = searchQuery.toLowerCase();
    return folderStocks.filter(
      (stock) =>
        stock.stockId.toLowerCase().includes(query) ||
        stock.modelName.toLowerCase().includes(query) ||
        stock.engineNumber.toLowerCase().includes(query) ||
        stock.chassisNumber.toLowerCase().includes(query) ||
        stock.color.toLowerCase().includes(query)
    );
  }, [folderStocks, searchQuery]);

  const handleAssign = (stock: IStockConceptCSV) => {
    // Navigate to assignment form with stock details
    navigate(`/admin/assign/csv-stock/${stock._id}`, {
      state: {
        stockType: "csv",
        stockData: stock,
        customerId,
      },
    });
  };

  if (error) {
    toast.error("Failed to load CSV stocks");
  }

  // Stock list view for selected folder
  if (selectedFolder) {
    return (
      <div className='max-w-7xl mx-auto p-6'>
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setSelectedFolder(null)}
                >
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Back to Folders
                </Button>
                <div>
                  <CardTitle className='flex items-center gap-2'>
                    <FolderOpen className='h-5 w-5 text-yellow-600' />
                    {selectedFolder}
                  </CardTitle>
                  <p className='text-sm text-muted-foreground'>
                    {folderStocks.length} available vehicles
                  </p>
                </div>
              </div>
              <Button variant='outline' size='sm' onClick={() => refetch()}>
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

            {/* Stock Table */}
            {filteredStocks.length > 0 ? (
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
            ) : (
              <div className='text-center py-12 border rounded-lg'>
                <Package className='h-12 w-12 mx-auto mb-3 text-muted-foreground' />
                <p className='text-muted-foreground'>
                  {searchQuery
                    ? "No vehicles match your search"
                    : "No available vehicles in this folder"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Folder grid view
  return (
    <div className='max-w-7xl mx-auto p-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <Folder className='h-5 w-5' />
                Select CSV Stock Folder
              </CardTitle>
              <p className='text-sm text-muted-foreground mt-1'>
                Choose a folder to view available vehicles for assignment
              </p>
            </div>
            <Button variant='outline' size='sm' onClick={() => refetch()}>
              <RefreshCw className='h-4 w-4 mr-2' />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Loading */}
          {isLoading && (
            <div className='text-center py-12'>
              <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-3 text-primary' />
              <p className='text-muted-foreground'>Loading CSV folders...</p>
            </div>
          )}

          {/* Folder Grid */}
          {!isLoading && sortedDates.length > 0 && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
              {sortedDates.map((date) => {
                const dateStocks = groupedStocks[date];
                const availableCount = dateStocks.filter(
                  (s) => s.stockStatus.status === "Available"
                ).length;
                const batchCount = getBatchCount(dateStocks);

                return (
                  <div
                    key={date}
                    onClick={() => setSelectedFolder(date)}
                    className='group cursor-pointer'
                  >
                    <Card className='h-full transition-all hover:shadow-lg hover:border-primary/50'>
                      <CardContent className='p-6'>
                        <div className='flex flex-col items-center text-center space-y-4'>
                          <div className='relative'>
                            <Folder className='h-20 w-20 text-yellow-600 transition-transform group-hover:scale-110' />
                            <Badge
                              variant='secondary'
                              className='absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center'
                            >
                              {availableCount}
                            </Badge>
                          </div>

                          <div className='space-y-2 w-full'>
                            <h3 className='font-semibold text-sm'>{date}</h3>
                            <div className='flex items-center justify-center gap-1 text-xs text-muted-foreground'>
                              <Calendar className='h-3 w-3' />
                              <span>
                                {new Date(
                                  dateStocks[0].csvImportDate
                                ).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>

                          <div className='flex items-center gap-2 w-full justify-center'>
                            <Badge variant='outline' className='text-xs'>
                              <FileSpreadsheet className='h-3 w-3 mr-1' />
                              {availableCount} available
                            </Badge>
                            <Badge variant='outline' className='text-xs'>
                              {batchCount} batch{batchCount > 1 ? "es" : ""}
                            </Badge>
                          </div>

                          <div className='text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity'>
                            Click to view vehicles →
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty */}
          {!isLoading && sortedDates.length === 0 && (
            <div className='text-center py-12 border rounded-lg'>
              <Package className='h-12 w-12 mx-auto mb-3 text-muted-foreground' />
              <h3 className='font-semibold mb-1'>No CSV imports found</h3>
              <p className='text-sm text-muted-foreground'>
                Import CSV stock files first to assign vehicles
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerCSVStock;
