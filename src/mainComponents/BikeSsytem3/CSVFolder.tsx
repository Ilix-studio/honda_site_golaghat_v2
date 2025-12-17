// src/components/admin/forms/CSVFolder.tsx

import { useState } from "react";
import {
  Folder,
  FolderOpen,
  Calendar,
  Package,
  RefreshCw,
  FileSpreadsheet,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

import {
  useGetCSVStocksQuery,
  IStockConceptCSV,
} from "@/redux-store/services/BikeSystemApi3/csvStockApi";
import GetCSVFiles from "./GetCSVFiles";

interface GroupedStocks {
  [date: string]: IStockConceptCSV[];
}

const CSVFolder = () => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useGetCSVStocksQuery({
    page: 1,
    limit: 1000,
  });

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
    const uniqueBatches = new Set(stocks.map((s) => s.csvImportBatch));
    return uniqueBatches.size;
  };

  if (error) {
    toast.error("Failed to load CSV folders");
  }

  // If a folder is selected, show GetCSVFiles with filtered data
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
                    {groupedStocks[selectedFolder]?.length || 0} files
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
        <div className='mt-6'>
          <GetCSVFiles folderDate={selectedFolder} />
        </div>
      </div>
    );
  }

  // Show folder grid view
  return (
    <div className='max-w-7xl mx-auto p-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <Folder className='h-5 w-5' />
              CSV Import Folders
            </CardTitle>
            <Button variant='outline' size='sm' onClick={() => refetch()}>
              <RefreshCw className='h-4 w-4 mr-2' />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Loading State */}
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
                const folderStocks = groupedStocks[date];
                const batchCount = getBatchCount(folderStocks);

                return (
                  <div
                    key={date}
                    onClick={() => setSelectedFolder(date)}
                    className='group cursor-pointer'
                  >
                    <Card className='h-full transition-all hover:shadow-lg hover:border-primary/50'>
                      <CardContent className='p-6'>
                        <div className='flex flex-col items-center text-center space-y-4'>
                          {/* Folder Icon */}
                          <div className='relative'>
                            <Folder className='h-20 w-20 text-yellow-600 transition-transform group-hover:scale-110' />
                            <Badge
                              variant='secondary'
                              className='absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center'
                            >
                              {folderStocks.length}
                            </Badge>
                          </div>

                          {/* Folder Info */}
                          <div className='space-y-2 w-full'>
                            <h3 className='font-semibold text-sm line-clamp-2'>
                              {date}
                            </h3>
                            <div className='flex items-center justify-center gap-1 text-xs text-muted-foreground'>
                              <Calendar className='h-3 w-3' />
                              <span>
                                {new Date(
                                  folderStocks[0].csvImportDate
                                ).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className='flex items-center gap-2 w-full justify-center'>
                            <Badge variant='outline' className='text-xs'>
                              <FileSpreadsheet className='h-3 w-3 mr-1' />
                              {folderStocks.length} files
                            </Badge>
                            <Badge variant='outline' className='text-xs'>
                              {batchCount} batch{batchCount > 1 ? "es" : ""}
                            </Badge>
                          </div>

                          {/* Hover Indicator */}
                          <div className='text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity'>
                            Click to view files →
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && sortedDates.length === 0 && (
            <div className='text-center py-12 border rounded-lg'>
              <Package className='h-12 w-12 mx-auto mb-3 text-muted-foreground' />
              <h3 className='font-semibold mb-1'>No CSV imports found</h3>
              <p className='text-sm text-muted-foreground'>
                Upload a CSV file to create your first import folder
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CSVFolder;
