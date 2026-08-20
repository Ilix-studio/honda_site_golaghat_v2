import { Wrench, Download } from "lucide-react";
import ServiceJobcardUploadForm from "@/mainComponents/ServiceM/ServiceJobcardUploadForm";
import { Button } from "@/components/ui/button";
import {
  SERVICE_JOBCARD_TEMPLATE_COLUMNS,
  downloadServiceJobcardTemplate,
} from "@/lib/serviceJobcardTemplate";

const requiredColumns = SERVICE_JOBCARD_TEMPLATE_COLUMNS.filter(
  (c) => c.required,
);

export default function ServiceRecordsImport() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-3xl mx-auto px-4 sm:px-6 pt-8'>
        <div className='flex items-center gap-3 mb-2'>
          <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-gray-900 text-white'>
            <Wrench className='h-5 w-5' />
          </div>
          <div>
            <h1 className='text-xl font-bold text-gray-900'>
              Service Records Import
            </h1>
            <p className='text-sm text-gray-500'>
              Upload the dealer service job-card export (XLSX/CSV)
            </p>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 bg-white p-4 mt-4'>
          <div className='flex items-start justify-between gap-4 flex-wrap'>
            <div className='min-w-0'>
              <p className='text-sm text-gray-500 mt-0.5'>
                Download the template, fill it in, and upload it here.
              </p>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={downloadServiceJobcardTemplate}
              className='shrink-0'
            >
              <Download className='h-4 w-4 mr-2' />
              Download template (CSV)
            </Button>
          </div>

          <div className='mt-3 pt-3 border-t border-gray-100'>
            <p className='text-xs font-medium text-gray-500 mb-1.5'>
              Required columns — an upload missing any of these is rejected:
            </p>
            <div className='flex flex-wrap gap-1.5'>
              {requiredColumns.map((column) => (
                <span
                  key={column.header}
                  className='bg-gray-100 text-gray-700 text-[11px] px-2 py-0.5 rounded-md font-mono'
                >
                  {column.header}
                </span>
              ))}
            </div>
            <p className='text-xs text-gray-400 mt-2'>
              The other{" "}
              {SERVICE_JOBCARD_TEMPLATE_COLUMNS.length - requiredColumns.length}{" "}
              columns in the template are optional, but Customer Name, Customer
              Mobile and Model Name are what let a row create or match a
              customer. Dates are DD-MM-YYYY; the example row shows the expected
              formatting and should be deleted before uploading real data.
            </p>
          </div>
        </div>
      </div>

      <ServiceJobcardUploadForm dashboardPath='/service-admin/dashboard' />
    </div>
  );
}
