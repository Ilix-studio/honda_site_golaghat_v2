import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ReceiptText, Download, UploadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  COUNTER_SALE_TEMPLATE_COLUMNS,
  downloadCounterSaleTemplate,
} from "@/lib/counterSaleTemplate";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { selectAuth } from "@/redux-store/slices/authSlice";
import {
  counterSaleApi,
  type CounterSaleImportResponse,
} from "@/redux-store/services/counterSaleApi";
import {
  uploadWithProgress,
  type UploadWithProgressError,
} from "@/lib/uploadWithProgress";
import UploadingAnimation, {
  type UploadAnimationStatus,
} from "@/mainComponents/shared/UploadingAnimation";

export default function CounterSaleUploadForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector(selectAuth);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadAnimationStatus>("idle");
  const [result, setResult] = useState<CounterSaleImportResponse["data"] | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isUploading = status === "uploading";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setErrorMsg(null);
    setResult(null);
    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadWithProgress<CounterSaleImportResponse>(
        "/counter-sale/import",
        formData,
        token,
        () => {},
      );
      setResult(res.data);
      setStatus("success");
      // uploadWithProgress bypasses RTK Query, so replicate
      // importCounterSaleReport's invalidatesTags manually.
      dispatch(
        counterSaleApi.util.invalidateTags(["CounterSale", "CounterSaleBatch"]),
      );
    } catch (err) {
      const uploadErr = err as UploadWithProgressError;
      setErrorMsg(uploadErr?.data?.message || "Upload failed. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-16'>
        <div className='flex items-center gap-3 mb-2'>
          <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-gray-900 text-white'>
            <ReceiptText className='h-5 w-5' />
          </div>
          <div>
            <h1 className='text-xl font-bold text-gray-900'>
              Counter Sale Report Import
            </h1>
            <p className='text-sm text-gray-500'>
              Upload the channel-partner counter sale export (CSV/XLSX)
            </p>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 bg-white p-4 mt-4'>
          <div className='flex items-start justify-between gap-4 flex-wrap'>
            <div className='min-w-0'>
              <p className='text-sm font-semibold text-gray-900'>
                Not using a channel-partner export?
              </p>
              <p className='text-sm text-gray-500 mt-0.5'>
                Download the template, fill it in, and upload it here.
              </p>
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={downloadCounterSaleTemplate}
              className='shrink-0'
            >
              <Download className='h-4 w-4 mr-2' />
              Download template (CSV)
            </Button>
          </div>

          <div className='mt-3 pt-3 border-t border-gray-100 space-y-1.5'>
            {COUNTER_SALE_TEMPLATE_COLUMNS.map((column) => (
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

        <form
          onSubmit={handleSubmit}
          className='mt-6 rounded-xl border border-gray-200 bg-white p-6'
        >
          <label
            htmlFor='counter-sale-file'
            className='flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-10 cursor-pointer hover:border-gray-400 transition-colors'
          >
            <UploadCloud className='h-8 w-8 text-gray-400' />
            <span className='text-sm font-medium text-gray-700'>
              {file ? file.name : "Click to choose a CSV or XLSX file"}
            </span>
            <span className='text-xs text-gray-400'>Max 10MB</span>
          </label>
          <input
            id='counter-sale-file'
            ref={fileInputRef}
            type='file'
            accept='.csv,.xlsx,.xls'
            className='hidden'
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <UploadingAnimation
            status={status}
            onComplete={() => setStatus("idle")}
          />

          <div className='flex justify-end mt-4'>
            <Button type='submit' disabled={!file || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' /> Uploading...
                </>
              ) : (
                "Upload report"
              )}
            </Button>
          </div>
        </form>

        {errorMsg && (
          <div className='mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700'>
            {errorMsg}
          </div>
        )}

        {result && (
          <div className='mt-6 rounded-xl border border-gray-200 bg-white p-6 space-y-3'>
            <h2 className='font-semibold text-gray-900'>
              Imported {result.successCount}/{result.totalRows} records
            </h2>
            <p className='text-sm text-gray-500'>
              Batch: <span className='font-mono'>{result.batchId}</span>
              {result.reviewCount > 0 &&
                ` · ${result.reviewCount} row(s) need review`}
            </p>

            {result.errors.length > 0 && (
              <div className='rounded-lg bg-amber-50 border border-amber-200 p-3'>
                <p className='text-sm font-medium text-amber-800 mb-2'>
                  {result.errors.length} row(s) failed
                </p>
                <ul className='text-xs text-amber-700 space-y-1 max-h-48 overflow-y-auto'>
                  {result.errors.map((e) => (
                    <li key={e.row}>
                      Row {e.row}: {e.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='outline' onClick={() => setFile(null)}>
                Upload another
              </Button>
              <Button onClick={() => navigate(-1)}>Done</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
