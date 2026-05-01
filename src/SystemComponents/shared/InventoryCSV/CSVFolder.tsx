// src/components/admin/forms/CSVFolder.tsx

import { useState } from "react";
import {
  Folder,
  FolderOpen,
  Calendar,
  Package,
  RefreshCw,
  ArrowLeft,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

import { useGetCSVBatchesQuery } from "@/redux-store/services/csvStock/csvStockApi";
import GetCSVFiles from "./GetCSVFiles";
import { CSVBatch } from "@/types/customer/stockcsv.types";

// cycle through distinct folder accent colors
const FOLDER_COLORS = [
  {
    bg: "bg-blue-50",
    icon: "text-blue-400",
    hover: "hover:border-blue-300",
    ring: "group-hover:ring-blue-100",
  },
  {
    bg: "bg-violet-50",
    icon: "text-violet-400",
    hover: "hover:border-violet-300",
    ring: "group-hover:ring-violet-100",
  },
  {
    bg: "bg-amber-50",
    icon: "text-amber-400",
    hover: "hover:border-amber-300",
    ring: "group-hover:ring-amber-100",
  },
  {
    bg: "bg-emerald-50",
    icon: "text-emerald-400",
    hover: "hover:border-emerald-300",
    ring: "group-hover:ring-emerald-100",
  },
  {
    bg: "bg-rose-50",
    icon: "text-rose-400",
    hover: "hover:border-rose-300",
    ring: "group-hover:ring-rose-100",
  },
  {
    bg: "bg-cyan-50",
    icon: "text-cyan-400",
    hover: "hover:border-cyan-300",
    ring: "group-hover:ring-cyan-100",
  },
];

const CSVFolder = () => {
  const [selectedBatch, setSelectedBatch] = useState<CSVBatch | null>(null);

  const { data, isLoading, error, refetch } = useGetCSVBatchesQuery({
    page: 1,
    limit: 100,
  });

  const batches = data?.data || [];
  const sortedBatches = [...batches].sort(
    (a, b) =>
      new Date(b.importDate).getTime() - new Date(a.importDate).getTime(),
  );

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (error) toast.error("Failed to load CSV batches");

  // ── detail view ──
  if (selectedBatch) {
    return (
      <div className='p-6 space-y-5'>
        {/* back header */}
        <div className='flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setSelectedBatch(null)}
            className='rounded-xl'
          >
            <ArrowLeft className='h-4 w-4 mr-1.5' />
            Back
          </Button>
          <div className='flex items-center gap-2.5'>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100'>
              <FolderOpen className='h-4.5 w-4.5 text-amber-600' />
            </div>
            <div>
              <p className='text-sm font-bold text-gray-900'>
                {selectedBatch.fileName}
              </p>
              <p className='text-xs text-gray-400'>
                {selectedBatch.totalStocks} stocks · Imported{" "}
                {formatDate(selectedBatch.importDate)}
              </p>
            </div>
          </div>
        </div>

        <GetCSVFiles batchId={selectedBatch.batchId} />
      </div>
    );
  }

  // ── folder grid ──
  return (
    <div className='p-6 space-y-5'>
      {/* toolbar */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100'>
            <FileSpreadsheet className='h-4 w-4 text-emerald-600' />
          </div>
          <div>
            <p className='text-sm font-bold text-gray-900'>
              CSV Import Batches
            </p>
            <p className='text-xs text-gray-400'>
              {sortedBatches.length} batch
              {sortedBatches.length !== 1 ? "es" : ""} found
            </p>
          </div>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={() => refetch()}
          className='rounded-xl gap-1.5'
        >
          <RefreshCw className='h-3.5 w-3.5' />
          Refresh
        </Button>
      </div>

      {/* loading */}
      {isLoading && (
        <div className='flex flex-col items-center justify-center py-16 gap-3'>
          <RefreshCw className='h-7 w-7 animate-spin text-red-500' />
          <p className='text-sm text-gray-500'>Loading batches…</p>
        </div>
      )}

      {/* folder grid */}
      {!isLoading && sortedBatches.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          {sortedBatches.map((batch, i) => {
            const color = FOLDER_COLORS[i % FOLDER_COLORS.length];
            return (
              <div
                key={batch.batchId}
                onClick={() => setSelectedBatch(batch)}
                className={`group cursor-pointer rounded-2xl border border-gray-100 bg-white transition-all ring-4 ring-transparent ${color.hover} ${color.ring} hover:shadow-md hover:-translate-y-0.5 duration-200`}
              >
                <div className='p-5 flex flex-col gap-4'>
                  {/* folder icon + count badge */}
                  <div
                    className={`relative self-center w-fit rounded-2xl ${color.bg} p-4`}
                  >
                    <Folder
                      className={`h-10 w-10 ${color.icon} transition-transform group-hover:scale-105`}
                    />
                    <span className='absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white'>
                      {batch.totalStocks}
                    </span>
                  </div>

                  {/* info */}
                  <div className='space-y-1 text-center'>
                    <p className='text-sm font-semibold text-gray-900 line-clamp-2 leading-tight'>
                      {batch.fileName}
                    </p>
                    <div className='flex items-center justify-center gap-1 text-xs text-gray-400'>
                      <Calendar className='h-3 w-3' />
                      {formatDate(batch.importDate)} ·{" "}
                      {formatTime(batch.importDate)}
                    </div>
                  </div>

                  {/* stat badges */}
                  <div className='flex flex-wrap justify-center gap-1.5'>
                    <Badge className='rounded-lg bg-emerald-100 text-emerald-700 border-0 text-xs font-semibold'>
                      {batch.availableStocks} available
                    </Badge>
                    {batch.soldStocks > 0 && (
                      <Badge className='rounded-lg bg-blue-100 text-blue-700 border-0 text-xs font-semibold'>
                        {batch.soldStocks} sold
                      </Badge>
                    )}
                  </div>

                  {/* cta */}
                  <p className='text-center text-xs font-medium text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity'>
                    View stocks →
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* empty */}
      {!isLoading && sortedBatches.length === 0 && (
        <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 gap-3'>
          <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100'>
            <Package className='h-5 w-5 text-gray-400' />
          </div>
          <p className='text-sm font-semibold text-gray-700'>
            No CSV imports found
          </p>
          <p className='text-xs text-gray-400'>
            Upload a CSV file to create your first import batch
          </p>
        </div>
      )}
    </div>
  );
};

export default CSVFolder;
