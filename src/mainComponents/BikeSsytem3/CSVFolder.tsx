// src/components/admin/forms/CSVFolder.tsx

import { useState } from "react";
import {
  Folder,
  FolderOpen,
  Calendar,
  Package,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

import { useGetCSVBatchesQuery } from "@/redux-store/services/BikeSystemApi3/csvStockApi";
import GetCSVFiles from "./GetCSVFiles";
import { CSVBatch } from "@/types/customer/stockcsv.types";

const CSVFolder = () => {
  const [selectedBatch, setSelectedBatch] = useState<CSVBatch | null>(null);

  const { data, isLoading, error, refetch } = useGetCSVBatchesQuery({
    page: 1,
    limit: 100,
  });

  const batches = data?.data || [];

  // Sort batches by import date (newest first)
  const sortedBatches = [...batches].sort(
    (a, b) =>
      new Date(b.importDate).getTime() - new Date(a.importDate).getTime()
  );

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

  if (error) {
    toast.error("Failed to load CSV batches");
  }

  // Show batch files view
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
                  onClick={() => setSelectedBatch(null)}
                >
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Back to Folders
                </Button>
                <div>
                  <CardTitle className='flex items-center gap-2'>
                    <FolderOpen className='h-5 w-5 text-yellow-600' />
                    {selectedBatch.fileName}
                  </CardTitle>
                  <p className='text-sm text-muted-foreground'>
                    {selectedBatch.totalStocks} stocks • Imported{" "}
                    {formatDate(selectedBatch.importDate)}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
        <div className='mt-6'>
          <GetCSVFiles batchId={selectedBatch.batchId} />
        </div>
      </div>
    );
  }

  // Show batch folder grid
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
          {isLoading && (
            <div className='text-center py-12'>
              <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-3 text-primary' />
              <p className='text-muted-foreground'>Loading batches...</p>
            </div>
          )}

          {!isLoading && sortedBatches.length > 0 && (
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
                        {/* Folder Icon */}
                        <div className='relative'>
                          <Folder className='h-20 w-20 text-blue-400 transition-transform group-hover:scale-110' />
                          <Badge
                            variant='secondary'
                            className='absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center'
                          >
                            {batch.totalStocks}
                          </Badge>
                        </div>

                        {/* Batch Info */}
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

                        {/* Stats */}
                        <div className='flex flex-wrap items-center gap-2 w-full justify-center'>
                          <Badge
                            variant='outline'
                            className='text-xs bg-green-50 text-green-700'
                          >
                            {batch.availableStocks} available
                          </Badge>
                          {batch.soldStocks > 0 && (
                            <Badge
                              variant='outline'
                              className='text-xs bg-blue-50 text-blue-700'
                            >
                              {batch.soldStocks} sold
                            </Badge>
                          )}
                        </div>

                        {/* Hover Indicator */}
                        <div className='text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity'>
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
