import { Boxes, Info } from "lucide-react";
import PartsStockUploadForm from "@/mainComponents/PartsM/PartsStockUploadForm";

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

        <div className='flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800 mt-4'>
          <Info className='w-4 h-4 mt-0.5 shrink-0' />
          <span>
            Extracts Part Number, Description, Quantity, Unit Price, and
            Location from the file. Every upload is compared against your
            last one — added, changed, and removed parts are shown with a
            revenue impact, and an identical re-upload is rejected with no
            changes made.
          </span>
        </div>
      </div>

      <PartsStockUploadForm dashboardPath='/part-admin/dashboard' />
    </div>
  );
}
