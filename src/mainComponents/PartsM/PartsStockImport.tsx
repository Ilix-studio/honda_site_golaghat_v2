import { Boxes, Download } from "lucide-react";
import PartsStockUploadForm from "@/mainComponents/PartsM/PartsStockUploadForm";
import { Button } from "@/components/ui/button";
import {
  PARTS_STOCK_TEMPLATE_COLUMNS,
  downloadPartsStockTemplate,
} from "@/lib/partsStockTemplate";

export default function PartsStockImport() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-3xl mx-auto px-4 sm:px-6 pt-8'>
        <div className='flex items-center gap-3 mb-2'>
          <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-gray-900 text-white'>
            <Boxes className='h-5 w-5' />
          </div>
          <div>
            <h1 className='text-xl font-bold text-gray-900'>
              Parts Stock Import
            </h1>
            <p className='text-sm text-gray-500'>
              Upload the parts inventory export (CSV/XLSX)
            </p>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 bg-white p-4 mt-4'>
          <div className='flex items-start justify-between gap-4 flex-wrap'>
            <div className='min-w-0'>
              <p className='text-sm font-semibold text-gray-900'>
                Not using an inventory export?
              </p>
              <p className='text-sm text-gray-500 mt-0.5'>
                Download the template, fill it in, and upload it here.
              </p>
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={downloadPartsStockTemplate}
              className='shrink-0'
            >
              <Download className='h-4 w-4 mr-2' />
              Download template (CSV)
            </Button>
          </div>

          <div className='mt-3 pt-3 border-t border-gray-100 space-y-1.5'>
            {PARTS_STOCK_TEMPLATE_COLUMNS.map((column) => (
              <div
                key={column.header}
                className='flex items-start gap-2 text-xs'
              >
                <span className='bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-mono shrink-0'>
                  {column.header}
                </span>
                {column.required && (
                  <span className='text-red-600 font-semibold shrink-0'>
                    required
                  </span>
                )}
                <span className='text-gray-400'>{column.hint}</span>
              </div>
            ))}
            <p className='text-xs text-gray-400 pt-1'>
              Extra columns are kept as-is on each stored row. Delete the
              example row before uploading real data.
            </p>
          </div>
        </div>
      </div>

      <PartsStockUploadForm dashboardPath='/part-admin/dashboard' />
    </div>
  );
}
