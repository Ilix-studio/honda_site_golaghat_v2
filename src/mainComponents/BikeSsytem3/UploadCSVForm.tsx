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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useGetBranchesQuery } from "@/redux-store/services/branchApi";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["text/csv", "application/vnd.ms-excel"];

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
  const [branchId, setBranchId] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadStage, setUploadStage] = useState<UploadStage>("idle");
  const [progress, setProgress] = useState(0);
  const [duplicates, setDuplicates] = useState<DuplicateError[]>([]);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(
    null
  );

  const { data: branchesResponse, isLoading: branchesLoading } =
    useGetBranchesQuery();
  const [importCSV, { isLoading: importing, data: importResult }] =
    useImportCSVStockMutation();

  const branches = branchesResponse?.data || [];

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
    if (uploadStage === "success" && importResult?.data) {
      const hasDuplicates =
        importResult.data.failureCount > 0 &&
        importResult.data.errors.some((err) =>
          err.error.toLowerCase().includes("duplicate")
        );

      const delay = hasDuplicates ? 10000 : 2000;
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
        navigate("/admin/get/csv");
      }, delay);

      return () => {
        clearTimeout(timer);
        clearInterval(countdownInterval);
      };
    }
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
    if (
      !ALLOWED_TYPES.includes(selectedFile.type) &&
      !selectedFile.name.endsWith(".csv")
    ) {
      return "Invalid file type. Only CSV files are allowed.";
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
    if (!file || !branchId) {
      toast.error("Please select a file and branch");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("defaultBranchId", branchId);

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

  const isSubmitDisabled = !file || !branchId || importing;

  const currentStageInfo =
    uploadStage !== "idle" ? uploadStages[uploadStage] : null;

  return (
    <Card className='max-w-4xl mx-auto'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <FileSpreadsheet className='h-5 w-5' />
          Import CSV Stock
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Branch Selection */}
        {uploadStage !== "success" && (
          <div className='space-y-2'>
            <Label htmlFor='branch'>Select Branch *</Label>
            <Select
              value={branchId}
              onValueChange={setBranchId}
              disabled={importing}
            >
              <SelectTrigger id='branch'>
                <SelectValue placeholder='Select a branch' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {branchesLoading ? (
                    <SelectItem value='loading' disabled>
                      Loading branches...
                    </SelectItem>
                  ) : branches.length === 0 ? (
                    <SelectItem value='none' disabled>
                      No branches available
                    </SelectItem>
                  ) : (
                    branches.map((branch) => (
                      <SelectItem key={branch._id} value={branch._id}>
                        {branch.branchName}
                      </SelectItem>
                    ))
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* File Upload Zone */}
        {uploadStage !== "success" && (
          <div className='space-y-2'>
            <Label>CSV File *</Label>
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
                accept='.csv'
                onChange={handleInputChange}
                className='hidden'
                disabled={importing}
              />

              {file ? (
                <div className='flex items-center justify-center gap-3'>
                  <CheckCircle2 className='h-8 w-8 text-green-600' />
                  <div className='text-left'>
                    <p className='font-medium text-green-700'>{file.name}</p>
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
                    Drop CSV file here or click to select
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
              importResult.data.failureCount === 0 ? "default" : "destructive"
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
                    Redirecting to CSV stocks in {redirectCountdown} seconds...
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
                          <TableCell className='text-xs'>{dup.error}</TableCell>
                          <TableCell className='text-xs'>
                            <div className='space-y-1'>
                              {Object.entries(dup.data).map(([key, value]) => (
                                <div key={key}>
                                  <span className='font-semibold'>{key}:</span>{" "}
                                  {String(value)}
                                </div>
                              ))}
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
                Import CSV
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadCSVForm;
