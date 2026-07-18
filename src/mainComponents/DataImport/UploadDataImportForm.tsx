import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { selectAuth } from "@/redux-store/slices/authSlice";
import {
  useGetDataImportConfigQuery,
  dataImportApi,
} from "@/redux-store/services/dataImportApi";
import { useGetBranchesQuery } from "@/redux-store/services/branchApi";
import type {
  DatasetType,
  PreviewResponse,
  CommitResponse,
} from "@/redux-store/services/dataImport.types";
import {
  uploadWithProgress,
  formatEta,
  type UploadProgress,
  type UploadWithProgressError,
} from "@/lib/uploadWithProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ColumnMatchTable from "./ColumnMatchTable";
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
    return "Only XLSX, XLS, CSV, or PDF files are allowed.";
  }
  if (file.size > MAX_SIZE) {
    return "File exceeds the 10MB limit.";
  }
  return null;
};

type Stage =
  | "idle"
  | "uploading"
  | "validation"
  | "committing"
  | "result"
  | "error";

interface UploadDataImportFormProps {
  dashboardPath?: string;
  /** Lock the dataset type and hide the picker — for purpose-built pages. */
  fixedDatasetType?: DatasetType;
}

export default function UploadDataImportForm({
  dashboardPath = "/",
  fixedDatasetType,
}: UploadDataImportFormProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, token } = useAppSelector(selectAuth);
  const isSuperAdmin = user?.role === "Super-Admin";

  const { data: configData } = useGetDataImportConfigQuery();
  const { data: branchesData } = useGetBranchesQuery(undefined, {
    skip: !isSuperAdmin,
  });

  const datasets = configData?.data?.datasets ?? [];

  const [stage, setStage] = useState<Stage>("idle");
  const [datasetType, setDatasetType] = useState<DatasetType | "">(
    fixedDatasetType ?? "",
  );
  const [branchId, setBranchId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [sheetName, setSheetName] = useState<string>("");
  const [preview, setPreview] = useState<PreviewResponse["data"] | null>(null);
  const [result, setResult] = useState<CommitResponse["data"] | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null,
  );

  const handleFileSelect = (selected: File) => {
    const err = validateFile(selected);
    if (err) {
      setValidationError(err);
      setFile(null);
      return;
    }
    setValidationError(null);
    setApiError(null);
    setPreview(null);
    setResult(null);
    setSheetName("");
    setFile(selected);
  };

  const buildFormData = (sheet?: string) => {
    const formData = new FormData();
    formData.append("file", file as File);
    formData.append("datasetType", datasetType);
    if (isSuperAdmin && branchId) formData.append("branchId", branchId);
    if (sheet) formData.append("sheetName", sheet);
    return formData;
  };

  const runPreview = async (sheet?: string) => {
    if (!file || !datasetType) return;
    setApiError(null);
    setUploadProgress(null);
    setStage("uploading");
    try {
      const res = await uploadWithProgress<PreviewResponse>(
        "/data-import/preview",
        buildFormData(sheet),
        token,
        setUploadProgress,
      );
      setPreview(res.data);
      if (res.data.sheetUsed) setSheetName(res.data.sheetUsed);
      setStage("validation");
    } catch (err) {
      const uploadErr = err as UploadWithProgressError;
      setApiError(uploadErr?.data?.message || "Preview failed. Please try again.");
      setStage("error");
    }
  };

  const handleSheetChange = (nextSheet: string) => {
    setSheetName(nextSheet);
    runPreview(nextSheet);
  };

  const handleCommit = async () => {
    if (!file || !datasetType || !preview) return;
    setApiError(null);
    setUploadProgress(null);
    setStage("committing");
    try {
      const res = await uploadWithProgress<CommitResponse>(
        "/data-import/commit",
        buildFormData(sheetName || undefined),
        token,
        setUploadProgress,
      );
      setResult(res.data);
      setStage("result");
      // uploadWithProgress bypasses RTK Query, so replicate commitImport's
      // invalidatesTags manually to keep batch lists / sales charts fresh.
      dispatch(
        dataImportApi.util.invalidateTags(["DataImportDataset", "SalesTimeseries"]),
      );
    } catch (err) {
      const uploadErr = err as UploadWithProgressError;
      setApiError(uploadErr?.data?.message || "Commit failed. Please try again.");
      setStage("error");
    }
  };

  const resetAll = () => {
    setStage("idle");
    setFile(null);
    setPreview(null);
    setResult(null);
    setApiError(null);
    setSheetName("");
    setUploadProgress(null);
  };

  const isBusy = stage === "uploading" || stage === "committing";

  return (
    <div className='max-w-3xl mx-auto p-6 space-y-6'>
      <Card className='border border-gray-200 shadow-sm'>
        <CardHeader>
          <CardTitle>Upload Data</CardTitle>
          <p className='text-sm text-gray-500'>
            Upload an XLSX, XLS, CSV, or PDF export. Columns are matched
            automatically and duplicate rows are skipped.
          </p>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div>
              <label className='block text-xs font-medium text-gray-500 mb-1'>
                Dataset type
              </label>
              {fixedDatasetType ? (
                <div className='h-9 flex items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700'>
                  {datasets.find((d) => d.datasetType === fixedDatasetType)
                    ?.label ?? fixedDatasetType}
                </div>
              ) : (
                <select
                  value={datasetType}
                  onChange={(e) => {
                    setDatasetType(e.target.value as DatasetType);
                    resetAll();
                  }}
                  className='w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm'
                >
                  <option value=''>Select dataset type…</option>
                  {datasets.map((d) => (
                    <option key={d.datasetType} value={d.datasetType}>
                      {d.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {isSuperAdmin && (
              <div>
                <label className='block text-xs font-medium text-gray-500 mb-1'>
                  Branch
                </label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className='w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm'
                >
                  <option value=''>Select branch…</option>
                  {branchesData?.data?.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.branchName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

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

          {stage === "uploading" && (
            <UploadProgressBar progress={uploadProgress} label='Uploading' />
          )}

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
              onClick={() => runPreview()}
              disabled={
                !file ||
                !datasetType ||
                (isSuperAdmin && !branchId) ||
                isBusy
              }
              className='bg-blue-600 hover:bg-blue-700'
            >
              {stage === "uploading" ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Parsing file...
                </>
              ) : (
                "Preview"
              )}
            </Button>
            <Button variant='ghost' onClick={() => navigate(dashboardPath)}>
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Validation stage */}
      {(stage === "validation" || stage === "committing") && preview && (
        <Card className='border border-gray-200 shadow-sm'>
          <CardHeader>
            <CardTitle>Column Matching</CardTitle>
            <p className='text-sm text-gray-500'>
              {preview.totalRows} row(s) detected · format{" "}
              {preview.format.toUpperCase()}
            </p>
          </CardHeader>
          <CardContent className='space-y-4'>
            {preview.sheetNames && preview.sheetNames.length > 1 && (
              <div>
                <label className='block text-xs font-medium text-gray-500 mb-1'>
                  Sheet
                </label>
                <select
                  value={sheetName}
                  onChange={(e) => handleSheetChange(e.target.value)}
                  className='w-full sm:w-64 h-9 rounded-md border border-gray-200 bg-white px-3 text-sm'
                >
                  {preview.sheetNames.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <ColumnMatchTable
              matchedFields={preview.matchedFields}
              unmatchedColumns={preview.unmatchedColumns}
              missingRequired={preview.missingRequired}
            />

            {preview.sampleRows.length > 0 && (
              <div>
                <p className='text-sm font-semibold text-gray-700 mb-2'>
                  Sample rows
                </p>
                <div className='overflow-x-auto rounded-lg border border-gray-200'>
                  <table className='w-full text-xs'>
                    <thead className='bg-gray-50 text-gray-600'>
                      <tr>
                        {preview.columns.map((c) => (
                          <th key={c} className='text-left px-3 py-2 whitespace-nowrap'>
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.sampleRows.slice(0, 10).map((row, i) => (
                        <tr key={i} className='border-t border-gray-100'>
                          {preview.columns.map((c) => (
                            <td key={c} className='px-3 py-2 whitespace-nowrap text-gray-600'>
                              {String(row[c] ?? "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {stage === "committing" && (
              <UploadProgressBar progress={uploadProgress} label='Importing' />
            )}

            <div className='flex gap-3'>
              <Button
                onClick={handleCommit}
                disabled={preview.missingRequired.length > 0 || isBusy}
                className='bg-emerald-600 hover:bg-emerald-700'
              >
                {stage === "committing" ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Importing...
                  </>
                ) : (
                  "Confirm & Import"
                )}
              </Button>
              <Button variant='ghost' onClick={resetAll}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result stage */}
      {stage === "result" && result && (
        <Card className='border border-gray-200 shadow-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <CheckCircle2 className='w-5 h-5 text-green-600' />
              Imported {result.importedRows}/{result.totalRows} rows
            </CardTitle>
            <p className='text-sm text-gray-500'>
              Batch {result.batchId} · {result.sourceFormat.toUpperCase()} ·{" "}
              {result.duplicateRows} duplicate · {result.reviewRows} flagged
              for review
            </p>
          </CardHeader>
          <CardContent className='space-y-4'>
            {result.autoRegistration && (
              <div className='rounded-lg border border-gray-200 p-4'>
                <p className='text-sm font-semibold text-gray-700 mb-3'>
                  Customer / vehicle auto-registration
                </p>
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm'>
                  <div>
                    <p className='text-xs text-gray-500'>New customers + vehicles</p>
                    <p className='font-semibold text-gray-900'>
                      {result.autoRegistration.customerCreatedVehicleCreated}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-500'>Vehicles created for existing customers</p>
                    <p className='font-semibold text-gray-900'>
                      {result.autoRegistration.customerMatchedVehicleCreated}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-500'>Existing vehicles updated</p>
                    <p className='font-semibold text-gray-900'>
                      {result.autoRegistration.vehicleMatchedServiceUpdated}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-500'>Free services disabled</p>
                    <p className='font-semibold text-gray-900'>
                      {result.autoRegistration.freeServicesDisabled}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-500'>Conflicts</p>
                    <p className='font-semibold text-gray-900'>
                      {result.autoRegistration.conflicts}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-500'>Skipped</p>
                    <p className='font-semibold text-gray-900'>
                      {result.autoRegistration.skipped}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {result.reviewRows > 0 && (
              <div className='flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800'>
                <AlertTriangle className='w-4 h-4 mt-0.5 shrink-0' />
                <span>
                  {result.reviewRows} row(s) need manual review — verify them
                  in the dataset list.
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

            <Button variant='outline' onClick={resetAll}>
              Upload another file
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function UploadProgressBar({
  progress,
  label,
}: {
  progress: UploadProgress | null;
  label: string;
}) {
  const percent = progress?.percent ?? 0;
  return (
    <div className='space-y-1.5'>
      <div className='flex items-center justify-between text-xs text-gray-500'>
        <span>
          {label}... {percent}%
        </span>
        <span>{formatEta(progress?.etaSeconds ?? null)}</span>
      </div>
      <div className='h-2 w-full rounded-full bg-gray-100 overflow-hidden'>
        <div
          className='h-full bg-blue-600 transition-[width] duration-200'
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
