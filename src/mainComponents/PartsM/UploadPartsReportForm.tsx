import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useImportPartsReportMutation,
  type PartsImportResponse,
} from "@/redux-store/services/partsApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from "lucide-react";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED = [".xlsx", ".xls", ".csv", ".pdf"];

const validateFile = (file: File): string | null => {
  const name = file.name.toLowerCase();
  if (!ALLOWED.some((ext) => name.endsWith(ext))) {
    return "Only XLSX, CSV, or PDF files are allowed.";
  }
  if (file.size > MAX_SIZE) {
    return "File exceeds the 10MB limit.";
  }
  return null;
};

export default function UploadPartsReportForm() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [importParts, { isLoading }] = useImportPartsReportMutation();

  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<PartsImportResponse["data"] | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleFileSelect = (selected: File) => {
    const err = validateFile(selected);
    if (err) {
      setValidationError(err);
      setFile(null);
      return;
    }
    setValidationError(null);
    setResult(null);
    setApiError(null);
    setFile(selected);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setApiError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await importParts(formData).unwrap();
      setResult(res.data);
    } catch (err: any) {
      setApiError(err?.data?.message || "Upload failed. Please try again.");
    }
  };

  return (
    <div className='max-w-3xl mx-auto p-6 space-y-6'>
      <Card className='border border-gray-200 shadow-sm'>
        <CardHeader>
          <CardTitle>Upload Parts Report</CardTitle>
          <p className='text-sm text-gray-500'>
            Upload an XLSX, CSV, or PDF parts report. Rows are extracted and
            duplicates are skipped automatically.
          </p>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
            }}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-colors ${
              dragOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <UploadCloud className='w-10 h-10 text-blue-500' />
            {file ? (
              <div className='flex items-center gap-2 text-sm font-medium text-gray-800'>
                <FileSpreadsheet className='w-4 h-4 text-blue-600' />
                {file.name}
              </div>
            ) : (
              <p className='text-sm text-gray-500'>
                Drag & drop a file here, or click to browse (XLSX / CSV / PDF, ≤10MB)
              </p>
            )}
            <input
              ref={inputRef}
              type='file'
              accept='.xlsx,.xls,.csv,.pdf'
              className='hidden'
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
              }}
            />
          </div>

          {validationError && (
            <div className='flex items-center gap-2 text-red-600 text-sm'>
              <AlertCircle className='w-4 h-4' />
              {validationError}
            </div>
          )}
          {apiError && (
            <div className='flex items-center gap-2 text-red-600 text-sm'>
              <AlertCircle className='w-4 h-4' />
              {apiError}
            </div>
          )}

          <div className='flex gap-3'>
            <Button
              onClick={handleSubmit}
              disabled={!file || isLoading}
              className='bg-blue-600 hover:bg-blue-700'
            >
              {isLoading ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Importing...
                </>
              ) : (
                "Import Report"
              )}
            </Button>
            <Button
              variant='ghost'
              onClick={() => navigate("/part-admin/dashboard")}
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Result summary */}
      {result && (
        <Card className='border border-gray-200 shadow-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <CheckCircle2 className='w-5 h-5 text-green-600' />
              Imported {result.successCount}/{result.totalRows} rows
            </CardTitle>
            <p className='text-sm text-gray-500'>
              Batch {result.batchId} · {result.sourceFormat.toUpperCase()} ·{" "}
              {result.failureCount} skipped · {result.reviewCount} flagged for
              review
            </p>
          </CardHeader>
          <CardContent className='space-y-4'>
            {result.reviewCount > 0 && (
              <div className='flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800'>
                <AlertTriangle className='w-4 h-4 mt-0.5 shrink-0' />
                <span>
                  {result.reviewCount} row(s) came from a PDF and are flagged
                  for manual review — verify them in the parts list.
                </span>
              </div>
            )}

            {result.errors.length > 0 && (
              <div className='overflow-x-auto'>
                <p className='text-sm font-semibold text-gray-700 mb-2'>
                  Skipped rows
                </p>
                <table className='w-full text-xs border border-gray-200 rounded-lg'>
                  <thead className='bg-gray-50 text-gray-600'>
                    <tr>
                      <th className='text-left px-3 py-2'>Row</th>
                      <th className='text-left px-3 py-2'>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.slice(0, 50).map((e, i) => (
                      <tr key={i} className='border-t border-gray-100'>
                        <td className='px-3 py-2 tabular-nums'>{e.row}</td>
                        <td className='px-3 py-2 text-gray-600'>{e.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
