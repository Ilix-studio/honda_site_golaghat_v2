import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Package,
  RefreshCw,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  useGetServiceJobcardBatchesQuery,
  useGetServiceJobcardStatusQuery,
  useRerunServiceJobcardRegistrationMutation,
  useDeleteServiceJobcardBatchMutation,
  type ServiceJobcardBatchDTO,
} from "@/redux-store/services/serviceJobcardApi";
import FolderCard, {
  type FolderCardTone,
} from "@/mainComponents/shared/FolderCard";
import ServiceJobcardRecords from "./ServiceJobcardRecords";
import { useAppSelector } from "@/hooks/redux";
import { selectAuth } from "@/redux-store/slices/authSlice";

const toneForStatus = (
  status: ServiceJobcardBatchDTO["status"],
): FolderCardTone => {
  if (status === "failed") return "danger";
  if (status === "completed_with_errors") return "warning";
  return "default";
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const diffSubLabel = (batch: ServiceJobcardBatchDTO): string | undefined => {
  const parts: string[] = [];
  if (batch.addedRows) parts.push(`+${batch.addedRows} new`);
  if (batch.changedRows) parts.push(`${batch.changedRows} corrected`);
  if (batch.revenueDelta) {
    const sign = batch.revenueDelta > 0 ? "+" : "-";
    parts.push(
      `${sign}₹${Math.abs(batch.revenueDelta).toLocaleString("en-IN")}`,
    );
  }
  if (batch.autoRegistration?.nameMismatches) {
    parts.push(`${batch.autoRegistration.nameMismatches} name mismatch(es)`);
  }
  return parts.length > 0 ? parts.join(" · ") : "No changes";
};

const getBranchId = (branchId: ServiceJobcardBatchDTO["branchId"]) =>
  typeof branchId === "string" ? branchId : branchId._id;

const ServiceJobcardFolderDashboard = () => {
  const { user } = useAppSelector(selectAuth);
  const [selectedBatch, setSelectedBatch] =
    useState<ServiceJobcardBatchDTO | null>(null);

  const { data, isLoading, refetch } = useGetServiceJobcardBatchesQuery();
  const { data: statusData, isLoading: statusLoading } =
    useGetServiceJobcardStatusQuery();
  const status = statusData?.data;

  const [deleteBatch, { isLoading: isDeleting }] =
    useDeleteServiceJobcardBatchMutation();

  const canDelete = (branchId: ServiceJobcardBatchDTO["branchId"]) =>
    user?.role === "Super-Admin" || user?.branch?._id === getBranchId(branchId);

  const handleDelete = async (batchId: string) => {
    try {
      await deleteBatch(batchId).unwrap();
      toast.success(`Batch ${batchId} deleted`);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to delete batch");
    }
  };

  const [rerunRegistration, { isLoading: isRerunning }] =
    useRerunServiceJobcardRegistrationMutation();
  const [registrationStatus, setRegistrationStatus] = useState<
    "idle" | "done" | "error"
  >("idle");

  useEffect(() => {
    setRegistrationStatus("idle");
  }, [selectedBatch?.batchId]);

  const handleRerunRegistration = async () => {
    if (!selectedBatch) return;
    try {
      const result = await rerunRegistration(selectedBatch.batchId).unwrap();
      const a = result.data.autoRegistration;
      toast.success(
        `Processed ${result.data.rowCount} row(s): ${a.customerCreatedVehicleCreated} customer(s) created, ${a.customersRepaired} customer link(s) repaired, ${a.customerMatchedVehicleCreated + a.vehicleMatchedServiceUpdated} vehicle(s) matched/updated, ${a.conflicts} conflict(s), ${a.skipped} skipped`,
      );
      setRegistrationStatus("done");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to re-run registration");
      setRegistrationStatus("error");
    }
  };

  const batches = data?.data ?? [];
  const sortedBatches = [...batches].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (selectedBatch) {
    return (
      <div className='max-w-7xl mx-auto p-6'>
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between gap-3'>
              <div className='flex items-center gap-3'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setSelectedBatch(null)}
                >
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Back to Folders
                </Button>
                <div>
                  <CardTitle>{selectedBatch.fileName}</CardTitle>
                  <p className='text-sm text-muted-foreground'>
                    {selectedBatch.importedRows} rows imported • Imported{" "}
                    {formatDate(selectedBatch.createdAt)}
                  </p>
                </div>
              </div>
              <Button
                variant={
                  registrationStatus === "done"
                    ? "secondary"
                    : registrationStatus === "error"
                      ? "destructive"
                      : "outline"
                }
                size='sm'
                disabled={isRerunning || registrationStatus === "done"}
                onClick={handleRerunRegistration}
              >
                {isRerunning ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Registering...
                  </>
                ) : registrationStatus === "done" ? (
                  <>
                    <CheckCircle2 className='h-4 w-4 mr-2' />
                    Finish Registering
                  </>
                ) : registrationStatus === "error" ? (
                  <>
                    <AlertCircle className='h-4 w-4 mr-2' />
                    Error
                  </>
                ) : (
                  <>
                    <UserPlus className='h-4 w-4 mr-2' />
                    Create Customers & Vehicles
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ServiceJobcardRecords batchId={selectedBatch.batchId} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container py-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>
          Imported Service Job Card Reports
        </h2>
        <Button variant='outline' size='sm' onClick={() => refetch()}>
          <RefreshCw className='h-4 w-4 mr-2' />
          Refresh
        </Button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <p className='text-xs text-muted-foreground'>Current Job Cards</p>
            <p className='text-xl font-semibold'>
              {statusLoading
                ? "—"
                : (status?.totalItems ?? 0).toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <p className='text-xs text-muted-foreground'>Total Revenue</p>
            <p className='text-xl font-semibold text-emerald-700'>
              {statusLoading
                ? "—"
                : `₹${(status?.totalRevenue ?? 0).toLocaleString("en-IN")}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {isLoading && (
        <div className='text-center py-12'>
          <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-3 text-primary' />
          <p className='text-muted-foreground'>Loading imports...</p>
        </div>
      )}

      {!isLoading && sortedBatches.length > 0 && (
        <div className='flex flex-wrap gap-x-10 gap-y-12'>
          {sortedBatches.map((batch) => (
            <div key={batch.batchId} className='relative group'>
              <FolderCard
                title={batch.fileName}
                countLabel={`${batch.importedRows} rows`}
                subLabel={diffSubLabel(batch)}
                tone={toneForStatus(batch.status)}
                onOpen={() => setSelectedBatch(batch)}
              />
              {canDelete(batch.branchId) && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className='absolute top-0 right-0 p-1 rounded-md bg-white/90 border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50'
                      aria-label={`Delete batch ${batch.fileName}`}
                    >
                      <Trash2 className='h-2.5 w-2.5 text-red-600' />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this batch?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This removes {batch.importedRows} row(s) from{" "}
                        <span className='font-mono'>{batch.fileName}</span>. It
                        can be re-imported later; the deletion is logged for
                        Super-Admin review.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={isDeleting}
                        onClick={() => handleDelete(batch.batchId)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          ))}
        </div>
      )}

      {!isLoading && sortedBatches.length === 0 && (
        <div className='text-center py-12 border rounded-lg'>
          <Package className='h-12 w-12 mx-auto mb-3 text-muted-foreground' />
          <h3 className='font-semibold mb-1'>
            No service job card reports found
          </h3>
          <p className='text-sm text-muted-foreground'>
            Upload a service job card report to create your first import batch
          </p>
        </div>
      )}
    </div>
  );
};

export default ServiceJobcardFolderDashboard;
