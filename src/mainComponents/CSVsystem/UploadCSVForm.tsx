// src/components/admin/forms/UploadCSVForm.tsx

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileSpreadsheet,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileCheck,
  Database,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import toast from "react-hot-toast";

import { useImportCSVStockMutation } from "@/redux-store/services/BikeSystemApi3/csvStockApi";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const ALLOWED_EXTENSIONS = [".csv", ".xls", ".xlsx"];

type UploadStage =
  | "idle"
  | "uploading"
  | "validating"
  | "checking"
  | "success"
  | "error";

interface DuplicateError {
  row: number;
  data: Record<string, unknown>;
  error: string;
}

const UploadCSVForm = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadStage, setUploadStage] = useState<UploadStage>("idle");
  const [progress, setProgress] = useState(0);
  const [duplicates, setDuplicates] = useState<DuplicateError[]>([]);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(
    null
  );

  const [importCSV, { isLoading: importing, data: importResult }] =
    useImportCSVStockMutation();

  const uploadStages = {
    uploading: { icon: Upload, text: "Uploading CSV file...", progress: 33 },
    validating: {
      icon: FileCheck,
      text: "Validating data...",
      progress: 66,
    },
    checking: {
      icon: Database,
      text: "Checking for duplicates...",
      progress: 90,
    },
    success: {
      icon: CheckCircle,
      text: "Import completed successfully!",
      progress: 100,
    },
    error: { icon: AlertCircle, text: "Upload failed", progress: 0 },
  };

  useEffect(() => {
    if (uploadStage !== "idle") {
      setProgress(uploadStages[uploadStage]?.progress || 0);
    }
  }, [uploadStage]);

  useEffect(() => {
    if (uploadStage !== "success" || !importResult?.data) return;

    // Only auto-navigate away when the file processed cleanly. If any rows
    // failed (duplicates or otherwise), stay on this screen so the errors
    // stay visible — the admin can review them and move on manually.
    if (importResult.data.failureCount > 0) {
      setRedirectCountdown(null);
      return;
    }

    const delay = 2000;
    setRedirectCountdown(delay / 1000);

    const countdownInterval = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    const timer = setTimeout(() => {
      navigate("/manager/forms/stock-concept-csv/view-uploads");
    }, delay);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [uploadStage, navigate, importResult]);

  useEffect(() => {
    if (importResult?.data?.errors) {
      const duplicateErrors = importResult.data.errors.filter((err) =>
        err.error.toLowerCase().includes("duplicate")
      );
      setDuplicates(duplicateErrors);
    }
  }, [importResult]);

  const validateFile = (selectedFile: File): string | null => {
    const name = selectedFile.name.toLowerCase();
    const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) =>
      name.endsWith(ext)
    );
    if (!ALLOWED_TYPES.includes(selectedFile.type) && !hasAllowedExtension) {
      return "Invalid file type. Only CSV, XLS, and XLSX files are allowed.";
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      return "File size exceeds 5MB limit.";
    }
    return null;
  };

  const handleFileSelect = (selectedFile: File) => {
    const error = validateFile(selectedFile);
    if (error) {
      setValidationError(error);
      setFile(null);
      return;
    }
    setValidationError(null);
    setFile(selectedFile);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    setValidationError(null);
    setUploadStage("idle");
    setProgress(0);
    setDuplicates([]);
    setRedirectCountdown(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const simulateStages = async () => {
    setUploadStage("uploading");
    await new Promise((resolve) => setTimeout(resolve, 800));

    setUploadStage("validating");
    await new Promise((resolve) => setTimeout(resolve, 800));

    setUploadStage("checking");
    await new Promise((resolve) => setTimeout(resolve, 800));
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await simulateStages();

      const result = await importCSV(formData).unwrap();

      setUploadStage("success");
      toast.success(result.message);
    } catch (error: unknown) {
      setUploadStage("error");
      const err = error as { data?: { message?: string } };
      toast.error(err.data?.message || "Unable to upload. Please try again.");
    }
  };

  const isSubmitDisabled = !file || importing;

  const currentStageInfo =
    uploadStage !== "idle" ? uploadStages[uploadStage] : null;

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-4xl mx-auto py-8 px-4'>
        <Card className='max-w-4xl mx-auto'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileSpreadsheet className='h-5 w-5' />
              Import Stock (CSV / Excel)
            </CardTitle>
          </CardHeader>

          <CardContent className='space-y-6'>
            {/* File Upload Zone */}
            {uploadStage !== "success" && (
              <div className='space-y-2'>
                <Label>CSV / Excel File *</Label>
                <div
                  className={`
              border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
              ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }
              ${file ? "border-green-500 bg-green-50" : ""}
              ${validationError ? "border-destructive bg-destructive/5" : ""}
            `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='.csv,.xls,.xlsx'
                    onChange={handleInputChange}
                    className='hidden'
                    disabled={importing}
                  />

                  {file ? (
                    <div className='flex items-center justify-center gap-3'>
                      <CheckCircle2 className='h-8 w-8 text-green-600' />
                      <div className='text-left'>
                        <p className='font-medium text-green-700'>
                          {file.name}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFile();
                        }}
                        disabled={importing}
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className='h-10 w-10 text-muted-foreground mx-auto mb-3' />
                      <p className='font-medium mb-1'>
                        Drop CSV or Excel file here or click to select
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        Maximum file size: 5MB
                      </p>
                    </>
                  )}
                </div>

                {validationError && (
                  <Alert variant='destructive'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertDescription>{validationError}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Upload Progress */}
            {currentStageInfo && (
              <div className='space-y-3'>
                <div className='flex items-center gap-3'>
                  <currentStageInfo.icon
                    className={`h-5 w-5 ${
                      uploadStage === "success"
                        ? "text-green-600"
                        : uploadStage === "error"
                          ? "text-destructive"
                          : "text-primary animate-pulse"
                    }`}
                  />
                  <p className='text-sm font-medium'>{currentStageInfo.text}</p>
                </div>
                <Progress value={progress} className='h-2' />
              </div>
            )}

            {/* Import Result Summary */}
            {importResult?.data && uploadStage === "success" && (
              <Alert
                variant={
                  importResult.data.failureCount === 0
                    ? "default"
                    : "destructive"
                }
              >
                <AlertDescription>
                  <div className='space-y-1'>
                    <p>
                      Imported {importResult.data.successCount} of{" "}
                      {importResult.data.totalRows} records
                    </p>
                    {importResult.data.failureCount > 0 && (
                      <p className='text-sm'>
                        {importResult.data.failureCount} rows failed.
                      </p>
                    )}
                    <p className='text-xs text-muted-foreground'>
                      Batch ID: {importResult.data.batchId}
                    </p>
                    {redirectCountdown !== null && (
                      <p className='text-xs text-muted-foreground mt-2'>
                        Redirecting to CSV stocks in {redirectCountdown}{" "}
                        seconds...
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Duplicates Warning */}
            {duplicates.length > 0 && uploadStage === "success" && (
              <Alert variant='destructive'>
                <AlertTriangle className='h-4 w-4' />
                <AlertDescription>
                  <div className='space-y-3'>
                    <p className='font-semibold'>
                      Found {duplicates.length} duplicate
                      {duplicates.length > 1 ? "s" : ""}
                    </p>
                    <div className='max-h-60 overflow-y-auto'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className='w-20'>Row</TableHead>
                            <TableHead>Error</TableHead>
                            <TableHead>Data</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {duplicates.map((dup, idx) => (
                            <TableRow key={idx}>
                              <TableCell className='font-medium'>
                                {dup.row}
                              </TableCell>
                              <TableCell className='text-xs'>
                                {dup.error}
                              </TableCell>
                              <TableCell className='text-xs'>
                                <div className='space-y-1'>
                                  {Object.entries(dup.data).map(
                                    ([key, value]) => (
                                      <div key={key}>
                                        <span className='font-semibold'>
                                          {key}:
                                        </span>{" "}
                                        {String(value)}
                                      </div>
                                    )
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Manual continue — shown instead of auto-redirect when there were errors to review */}
            {uploadStage === "success" &&
              importResult?.data &&
              importResult.data.failureCount > 0 && (
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={() =>
                    navigate("/manager/forms/stock-concept-csv/view-uploads")
                  }
                >
                  Review complete — View Uploads
                </Button>
              )}

            {/* Error Message */}
            {uploadStage === "error" && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>
                  Unable to upload. Please check your file and try again.
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button - Hidden on Success */}
            {uploadStage !== "success" && (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className='w-full'
              >
                {importing ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className='h-4 w-4 mr-2' />
                    Import Stock
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadCSVForm;
