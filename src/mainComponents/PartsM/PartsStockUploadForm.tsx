import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChangesMarkdown from "@/mainComponents/shared/ChangesMarkdown";
import {
  useImportPartsReportMutation,
  type PartsImportResponse,
} from "@/redux-store/services/partsApi";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED = [".xlsx", ".xls", ".csv", ".pdf"];

const validateFile = (file: File): string | null => {
  const name = file.name.toLowerCase();
  if (!ALLOWED.some((ext) => name.endsWith(ext))) {
    return "Only XLSX, XLS, CSV, or PDF files are allowed.";
  }
  if (file.size > MAX_SIZE) {
    return "File exceeds the 10MB limit.";
  }
  return null;
};

interface PartsStockUploadFormProps {
  dashboardPath?: string;
}

/**
 * Single-shot parts-stock upload (no preview/column-selection step, matching
 * /api/parts/import's contract): parse+diff+persist happen in one request.
 * Result is either "no changes detected" (duplicate) or an added/changed/
 * removed/revenue-delta summary with the rendered changelog.
 */
export default function PartsStockUploadForm({
  dashboardPath = "/part-admin/dashboard",
}: PartsStockUploadFormProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [importPartsReport, { isLoading }] = useImportPartsReportMutation();

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
    setApiError(null);
    setResult(null);
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setApiError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await importPartsReport(formData).unwrap();
      setResult(res.data);
    } catch (err: any) {
      setApiError(err?.data?.message || "Upload failed. Please try again.");
    }
  };

  const resetAll = () => {
    setFile(null);
    setResult(null);
    setApiError(null);
    setValidationError(null);
  };

  return (
    <div className='max-w-3xl mx-auto p-6 space-y-6'>
      <Card className='border border-gray-200 shadow-sm'>
        <CardHeader>
          <CardTitle>Upload Parts Stock Report</CardTitle>
          <p className='text-sm text-gray-500'>
            Compares this file against your last upload — only new or changed
            parts are imported.
          </p>
        </CardHeader>
        <CardContent className='space-y-4'>
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
                Drag & drop a file here, or click to browse (XLSX / XLS / CSV /
                PDF, ≤10MB)
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
              onClick={handleUpload}
              disabled={!file || isLoading}
              className='bg-emerald-600 hover:bg-emerald-700'
            >
              {isLoading ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
            <Button variant='ghost' onClick={() => navigate(dashboardPath)}>
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {result?.duplicate && (
        <Card className='border border-blue-200 shadow-sm bg-blue-50/40'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg text-blue-900'>
              <Info className='w-5 h-5 text-blue-600' />
              No changes detected
            </CardTitle>
            <p className='text-sm text-blue-800'>
              This file matches your last upload
              {result.previousBatchId ? ` (batch ${result.previousBatchId})` : ""} — nothing
              was imported. {result.totalRows} row(s) checked, all unchanged.
            </p>
          </CardHeader>
          <CardContent>
            <Button variant='outline' onClick={resetAll}>
              Upload another file
            </Button>
          </CardContent>
        </Card>
      )}

      {result && !result.duplicate && (
        <Card className='border border-gray-200 shadow-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <CheckCircle2 className='w-5 h-5 text-green-600' />
              Imported {result.importedRows}/{result.totalRows} rows
            </CardTitle>
            <p className='text-sm text-gray-500'>
              Batch {result.batchId} · {result.duplicateRows} unchanged ·{" "}
              {result.reviewRows} flagged for review
            </p>
          </CardHeader>
          <CardContent className='space-y-4'>
            {result.changesMarkdown && (
              <div className='rounded-lg border border-gray-200 p-4'>
                <p className='text-sm font-semibold text-gray-700 mb-3'>
                  Changes vs previous upload
                </p>
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3'>
                  <div>
                    <p className='text-xs text-gray-500'>Added</p>
                    <p className='font-semibold text-green-700'>
                      {result.addedRows ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-500'>Changed</p>
                    <p className='font-semibold text-amber-700'>
                      {result.changedRows ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-500'>Removed</p>
                    <p className='font-semibold text-red-700'>
                      {result.removedRows ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-500'>Revenue change</p>
                    <p
                      className={`font-semibold ${
                        (result.revenueDelta ?? 0) >= 0
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {(result.revenueDelta ?? 0) >= 0 ? "+" : "-"}₹
                      {Math.abs(result.revenueDelta ?? 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                <ChangesMarkdown markdown={result.changesMarkdown} />
              </div>
            )}

            <Button variant='outline' onClick={resetAll}>
              Upload another file
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
