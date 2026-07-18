// src/components/admin/forms/CSVFolder.tsx

import { useEffect, useMemo, useState } from "react";
import {
  FolderOpen,
  Calendar,
  Package,
  RefreshCw,
  ArrowLeft,
  Upload,
  Folder,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

import { useGetCSVBatchesQuery } from "@/redux-store/services/BikeSystemApi3/csvStockApi";
import GetCSVFiles from "./GetCSVFiles";
import { CSVBatch } from "@/types/customer/stockcsv.types";
import { useNavigate } from "react-router";

const CSVFolder = () => {
  const navigate = useNavigate();
  const [selectedBatch, setSelectedBatch] = useState<CSVBatch | null>(null);

  const { data, isLoading, error, refetch } = useGetCSVBatchesQuery({
    page: 1,
    limit: 50,
  });

  const batches = data?.data || [];

  // Sort batches by import date (newest first)
  const sortedBatches = useMemo(
    () =>
      [...batches].sort(
        (a, b) =>
          new Date(b.importDate).getTime() - new Date(a.importDate).getTime()
      ),
    [batches]
  );

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
          {isLoading && (
            <div className='text-center py-12'>
              <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-3 text-primary' />
              <p className='text-muted-foreground'>Loading batches...</p>
            </div>
          )}

          {!isLoading && sortedBatches.length > 0 && (
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4'>
              {sortedBatches.map((batch) => (
                <div
                  key={batch.batchId}
                  onClick={() => setSelectedBatch(batch)}
                  className='group cursor-pointer'
                >
                  <Card className='h-full transition-all hover:shadow-lg hover:border-primary/50'>
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
                            <Calendar className='h-3 w-3 shrink-0' />
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
          )}

          {!isLoading && sortedBatches.length === 0 && (
            <div className='text-center py-12 border rounded-lg'>
              <Package className='h-12 w-12 mx-auto mb-3 text-muted-foreground' />
              <h3 className='font-semibold mb-1'>No CSV imports found</h3>
              <p className='text-sm text-muted-foreground'>
                Upload a CSV file to create your first import batch
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CSVFolder;
