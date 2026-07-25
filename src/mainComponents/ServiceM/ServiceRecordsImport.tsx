import { Wrench, Info } from "lucide-react";
import ServiceJobcardUploadForm from "@/mainComponents/ServiceM/ServiceJobcardUploadForm";

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

        <div className='flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800 mt-4'>
          <Info className='w-4 h-4 mt-0.5 shrink-0' />
          <span>
            Every upload is compared against your last one — added and
            corrected job cards are shown with a revenue impact, and an
            identical re-upload is rejected with no changes made. Each row is
            matched by Frame Number and Customer Mobile: customers and
            vehicle assignments are created automatically (no OTP required)
            using Customer Name, Customer Mobile, Model Name, Model Variant,
            Current KMs, Service Type and AMC Service from the file — the
            row's Customer Name is also checked against the matched
            customer's profile name and flagged for review on a mismatch.
            Parts Revenue, Lubes Revenue and Total Job Card Revenue are added
            to each matched customer's vehicle as service expenses (corrected
            by the exact delta if a job card is re-uploaded with different
            figures). If a row's Service Type is <strong>PAID</strong> for a
            phone number already on record, that customer's complimentary
            free services are disabled going forward.
          </span>
        </div>
      </div>

      <ServiceJobcardUploadForm dashboardPath='/service-admin/dashboard' />
    </div>
  );
}
