// LeaveStatus.tsx — Super-Admin leave management

import { useState } from "react";
import toast from "react-hot-toast";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Search,
  ClipboardList,
  User,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { useGetBranchesQuery } from "@/redux-store/services/branchApi";

import {
  useGetAllLeavesQuery,
  useReviewLeaveMutation,
  type LeaveApplication,
  type GetAllLeavesParams,
} from "@/redux-store/services/NewFeatures/leaveApi";
import type { LeaveStatus, LeaveType } from "@/types/leave_types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReviewTarget {
  id: string;
  action: "Approved" | "Rejected";
  applicantName: string;
  leaveType: LeaveType;
  totalDays: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<LeaveStatus, { label: string; className: string }> =
  {
    Pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    Approved: {
      label: "Approved",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    Rejected: {
      label: "Rejected",
      className: "bg-red-100 text-red-800 border-red-200",
    },
    Cancelled: {
      label: "Cancelled",
      className: "bg-gray-100 text-gray-600 border-gray-200",
    },
  };

// Populated fields come back as objects; API types use union (string | object)
function resolveApplicant(
  applicantId: LeaveApplication["applicantId"],
): string {
  if (typeof applicantId === "object" && applicantId !== null) {
    return `${applicantId.name} (${applicantId.applicationId})`;
  }
  return applicantId as string;
}

function resolveBranch(branch: LeaveApplication["branch"]): string {
  if (typeof branch === "object" && branch !== null) {
    return (branch as { branchName: string }).branchName;
  }
  return branch as string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

// ─── Component ────────────────────────────────────────────────────────────────

const LeaveStatus: React.FC = () => {
  // ── Filters ──────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<GetAllLeavesParams>({
    page: 1,
    limit: 15,
    year: CURRENT_YEAR,
  });
  const [searchTerm, setSearchTerm] = useState("");

  // ── Review dialog state ───────────────────────────────────────────────
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  // ── Queries & mutations ───────────────────────────────────────────────
  const {
    data: leavesResponse,
    isLoading,
    isFetching,
  } = useGetAllLeavesQuery(filters);

  const { data: branchesData } = useGetBranchesQuery();

  const [reviewLeave, { isLoading: isReviewing }] = useReviewLeaveMutation();

  // ── Derived ───────────────────────────────────────────────────────────
  const leaves = leavesResponse?.data ?? [];
  const totalPages = leavesResponse?.pages ?? 1;
  const currentPage = leavesResponse?.page ?? 1;
  const branches = branchesData?.data ?? [];

  // Client-side search on applicant name (populated)
  const filtered = searchTerm.trim()
    ? leaves.filter((l) =>
        resolveApplicant(l.applicantId)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      )
    : leaves;

  // ── Filter helpers ────────────────────────────────────────────────────
  function setFilter<K extends keyof GetAllLeavesParams>(
    key: K,
    value: GetAllLeavesParams[K] | "all",
  ) {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      [key]: value === "all" ? undefined : value,
    }));
  }

  // ── Review handlers ───────────────────────────────────────────────────
  function openReviewDialog(
    leave: LeaveApplication,
    action: "Approved" | "Rejected",
  ) {
    setReviewTarget({
      id: leave._id,
      action,
      applicantName: resolveApplicant(leave.applicantId),
      leaveType: leave.leaveType,
      totalDays: leave.totalDays,
    });
    setReviewNote("");
  }

  async function handleConfirmReview() {
    if (!reviewTarget) return;
    try {
      await reviewLeave({
        id: reviewTarget.id,
        status: reviewTarget.action,
        reviewNote: reviewNote.trim() || undefined,
      }).unwrap();
      toast.success(
        `Leave ${reviewTarget.action.toLowerCase()} for ${reviewTarget.applicantName}`,
      );
      setReviewTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Review failed");
    }
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-blue-50 rounded-lg'>
              <ClipboardList className='h-6 w-6 text-blue-600' />
            </div>
            <div>
              <CardTitle className='text-xl'>Leave Applications</CardTitle>
              <CardDescription>
                Review and manage staff leave requests across all branches
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className='pt-5'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
            {/* Search */}
            <div className='relative lg:col-span-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Search applicant...'
                className='pl-9'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status */}
            <div>
              <Select
                value={filters.status ?? "all"}
                onValueChange={(v) =>
                  setFilter("status", v as LeaveStatus | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='All statuses' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='all'>All statuses</SelectItem>
                    <SelectItem value='Pending'>Pending</SelectItem>
                    <SelectItem value='Approved'>Approved</SelectItem>
                    <SelectItem value='Rejected'>Rejected</SelectItem>
                    <SelectItem value='Cancelled'>Cancelled</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Leave type */}
            <div>
              <Select
                value={filters.leaveType ?? "all"}
                onValueChange={(v) =>
                  setFilter("leaveType", v as LeaveType | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='All types' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='all'>All types</SelectItem>
                    <SelectItem value='Sick'>Sick</SelectItem>
                    <SelectItem value='Casual'>Casual</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Branch */}
            <div>
              <Select
                value={filters.branch ?? "all"}
                onValueChange={(v) => setFilter("branch", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='All branches' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='all'>All branches</SelectItem>
                    {branches.map((b) => (
                      <SelectItem key={b._id} value={b._id}>
                        {b.branchName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div>
              <Select
                value={String(filters.year ?? CURRENT_YEAR)}
                onValueChange={(v) => setFilter("year", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Year' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {YEAR_OPTIONS.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className='pt-4'>
          {isLoading ? (
            <div className='py-16 text-center text-sm text-gray-500'>
              Loading applications...
            </div>
          ) : filtered.length === 0 ? (
            <div className='py-16 text-center text-sm text-gray-500'>
              No leave applications found.
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className='text-center'>Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((leave) => {
                    const statusCfg = STATUS_BADGE[leave.status];
                    const isPending = leave.status === "Pending";
                    const isMutating = isReviewing;

                    return (
                      <TableRow key={leave._id} className='align-top'>
                        <TableCell>
                          <div className='flex items-start gap-2'>
                            <User className='h-4 w-4 mt-0.5 text-gray-400 shrink-0' />
                            <span className='text-sm font-medium text-gray-800'>
                              {resolveApplicant(leave.applicantId as string)}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className='flex items-center gap-1.5 text-sm text-gray-600'>
                            <Building2 className='h-3.5 w-3.5 text-gray-400' />
                            {resolveBranch(leave.branch)}
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className='text-sm text-gray-600'>
                            {leave.applicantRole}
                          </span>
                        </TableCell>

                        <TableCell>
                          <Badge variant='outline' className='text-xs'>
                            {leave.leaveType}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className='flex items-center gap-1.5 text-sm text-gray-600'>
                            <CalendarDays className='h-3.5 w-3.5 text-gray-400' />
                            <span>
                              {formatDate(leave.startDate)} →{" "}
                              {formatDate(leave.endDate)}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className='text-center'>
                          <span className='text-sm font-semibold text-gray-800'>
                            {leave.totalDays}
                          </span>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant='outline'
                            className={`text-xs ${statusCfg.className}`}
                          >
                            {statusCfg.label}
                          </Badge>
                          {leave.reviewNote && (
                            <p className='mt-1 text-xs text-gray-500 max-w-[160px] truncate'>
                              Note: {leave.reviewNote}
                            </p>
                          )}
                        </TableCell>

                        <TableCell>
                          <span className='text-sm text-gray-500'>
                            {formatDate(leave.createdAt)}
                          </span>
                        </TableCell>

                        <TableCell className='text-right'>
                          {isPending && (
                            <div className='flex justify-end gap-2'>
                              <Button
                                size='sm'
                                variant='outline'
                                className='h-8 border-green-300 text-green-700 hover:bg-green-50'
                                disabled={isMutating}
                                onClick={() =>
                                  openReviewDialog(leave, "Approved")
                                }
                              >
                                <CheckCircle2 className='h-3.5 w-3.5 mr-1' />
                                Approve
                              </Button>
                              <Button
                                size='sm'
                                variant='outline'
                                className='h-8 border-red-300 text-red-700 hover:bg-red-50'
                                disabled={isMutating}
                                onClick={() =>
                                  openReviewDialog(leave, "Rejected")
                                }
                              >
                                <XCircle className='h-3.5 w-3.5 mr-1' />
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex items-center justify-between mt-4 pt-4 border-t'>
              <span className='text-sm text-gray-500'>
                Page {currentPage} of {totalPages} —{" "}
                {leavesResponse?.total ?? 0} total
              </span>
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  disabled={currentPage <= 1 || isFetching}
                  onClick={() =>
                    setFilters((p) => ({ ...p, page: (p.page ?? 1) - 1 }))
                  }
                >
                  <ChevronLeft className='h-4 w-4' />
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  disabled={currentPage >= totalPages || isFetching}
                  onClick={() =>
                    setFilters((p) => ({ ...p, page: (p.page ?? 1) + 1 }))
                  }
                >
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Confirmation Dialog */}
      <Dialog
        open={reviewTarget !== null}
        onOpenChange={(open) => !open && setReviewTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewTarget?.action === "Approved"
                ? "Approve Leave"
                : "Reject Leave"}
            </DialogTitle>
            <DialogDescription>
              {reviewTarget?.applicantName} — {reviewTarget?.leaveType} leave,{" "}
              {reviewTarget?.totalDays} day(s)
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 py-2'>
            <Label htmlFor='review-note'>
              Review Note{" "}
              <span className='text-gray-400 font-normal'>(optional)</span>
            </Label>
            <Textarea
              id='review-note'
              placeholder='Add a note for the applicant...'
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              maxLength={300}
              rows={3}
            />
            <p className='text-xs text-gray-400 text-right'>
              {reviewNote.length}/300
            </p>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setReviewTarget(null)}
              disabled={isReviewing}
            >
              Cancel
            </Button>
            <Button
              variant={
                reviewTarget?.action === "Approved" ? "default" : "destructive"
              }
              onClick={handleConfirmReview}
              disabled={isReviewing}
            >
              {isReviewing
                ? "Submitting..."
                : `Confirm ${reviewTarget?.action}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveStatus;
