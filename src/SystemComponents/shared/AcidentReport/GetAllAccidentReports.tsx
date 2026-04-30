// mainComponents/Admin/AccidentReports/GetAllAccidentReports.tsx
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Shield,
  ShieldOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
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

import {
  AccidentReportFilters,
  ReportStatus,
  useGetAllAccidentReportsQuery,
} from "@/redux-store/services/accidentReportApi";
import { useGetBranchesQuery } from "@/redux-store/services/branchApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<ReportStatus, { label: string; className: string }> =
  {
    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
    reviewed: {
      label: "Reviewed",
      className: "bg-blue-100 text-blue-700 border-blue-200",
    },
    closed: {
      label: "Closed",
      className: "bg-green-100 text-green-700 border-green-200",
    },
  };

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const TableSkeleton = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: 7 }).map((__, j) => (
          <TableCell key={j}>
            <div className='h-4 bg-gray-100 rounded animate-pulse' />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

// ─── Component ────────────────────────────────────────────────────────────────

const GetAllAccidentReports = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<AccidentReportFilters>({
    page: 1,
    limit: 15,
  });
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching, error, refetch } =
    useGetAllAccidentReportsQuery(filters);

  const { data: branchesRes } = useGetBranchesQuery();
  const branches = branchesRes?.data ?? [];

  const reports = data?.data ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;
  const page = data?.page ?? 1;

  const setFilter = useCallback(
    (
      key: keyof AccidentReportFilters,
      value: string | number | boolean | undefined
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    },
    []
  );

  // Client-side search filter (by reportId / location / title)
  const filtered = search.trim()
    ? reports.filter((r) => {
        const q = search.toLowerCase();
        return (
          r.reportId.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q)
        );
      })
    : reports;

  return (
    <div className='p-6 space-y-5'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center'>
            <AlertTriangle className='h-5 w-5 text-red-600' />
          </div>
          <div>
            <h1 className='text-xl font-bold text-gray-900'>
              Accident Reports
            </h1>
            <p className='text-xs text-gray-500'>
              {total} total report{total !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1.5 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className='border-gray-100'>
        <CardContent className='p-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
            {/* Search */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Search ID, title, location...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-9 text-sm'
              />
            </div>

            {/* Status */}
            <Select
              value={filters.status ?? "all"}
              onValueChange={(v) =>
                setFilter(
                  "status",
                  v === "all" ? undefined : (v as ReportStatus)
                )
              }
            >
              <SelectTrigger className='text-sm'>
                <Filter className='h-4 w-4 mr-2 text-gray-400' />
                <SelectValue placeholder='All Statuses' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Statuses</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
                <SelectItem value='reviewed'>Reviewed</SelectItem>
                <SelectItem value='closed'>Closed</SelectItem>
              </SelectContent>
            </Select>

            {/* Branch */}
            <Select
              value={filters.branchId ?? "all"}
              onValueChange={(v) =>
                setFilter("branchId", v === "all" ? undefined : v)
              }
            >
              <SelectTrigger className='text-sm'>
                <SelectValue placeholder='All Branches' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Branches</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b._id} value={b._id}>
                    {b.branchName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Insurance */}
            <Select
              value={
                filters.isInsuranceAvailable === undefined
                  ? "all"
                  : String(filters.isInsuranceAvailable)
              }
              onValueChange={(v) =>
                setFilter(
                  "isInsuranceAvailable",
                  v === "all" ? undefined : v === "true"
                )
              }
            >
              <SelectTrigger className='text-sm'>
                <SelectValue placeholder='Insurance' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All</SelectItem>
                <SelectItem value='true'>Insurance Available</SelectItem>
                <SelectItem value='false'>No Insurance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className='border-gray-100'>
        <CardHeader className='pb-0 px-6 pt-5'>
          <CardTitle className='text-base font-semibold text-gray-800'>
            Reports
          </CardTitle>
        </CardHeader>
        <CardContent className='p-0'>
          {error ? (
            <div className='flex flex-col items-center justify-center py-16 text-gray-400'>
              <AlertTriangle className='h-8 w-8 mb-2 text-red-400' />
              <p className='text-sm'>Failed to load reports</p>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => refetch()}
                className='mt-2'
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-gray-50/60'>
                    <TableHead className='text-xs font-semibold text-gray-500'>
                      Report ID
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-gray-500'>
                      Title
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-gray-500'>
                      Date & Time
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-gray-500'>
                      Location
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-gray-500'>
                      Insurance
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-gray-500'>
                      Status
                    </TableHead>
                    <TableHead className='text-xs font-semibold text-gray-500 text-right'>
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableSkeleton />
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className='text-center py-16 text-gray-400 text-sm'
                      >
                        No reports found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((report) => (
                      <motion.tr
                        key={report._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className='border-b border-gray-50 hover:bg-gray-50/50 transition-colors'
                      >
                        <TableCell className='font-mono text-xs text-red-600 font-medium'>
                          {report.reportId}
                        </TableCell>
                        <TableCell className='text-sm text-gray-800 max-w-[180px] truncate'>
                          {report.title}
                        </TableCell>
                        <TableCell className='text-xs text-gray-500 whitespace-nowrap'>
                          {formatDate(report.date)}
                          <span className='block text-gray-400'>
                            {report.time}
                          </span>
                        </TableCell>
                        <TableCell className='text-xs text-gray-600 max-w-[140px] truncate'>
                          {report.location}
                        </TableCell>
                        <TableCell>
                          {report.isInsuranceAvailable ? (
                            <span className='flex items-center gap-1 text-xs text-green-600 font-medium'>
                              <Shield className='h-3.5 w-3.5' /> Yes
                            </span>
                          ) : (
                            <span className='flex items-center gap-1 text-xs text-gray-400'>
                              <ShieldOff className='h-3.5 w-3.5' /> No
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant='outline'
                            className={`text-xs ${
                              STATUS_BADGE[report.status].className
                            }`}
                          >
                            {STATUS_BADGE[report.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          <Button
                            variant='ghost'
                            size='icon'
                            aria-label='Submit'
                            onClick={() =>
                              navigate(`/admin/accident-reports/${report._id}`)
                            }
                            className='h-8 w-8 p-0 hover:bg-red-50'
                          >
                            View
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pages > 1 && (
        <div className='flex items-center justify-between'>
          <p className='text-xs text-gray-500'>
            Showing {(page - 1) * (filters.limit ?? 15) + 1}–
            {Math.min(page * (filters.limit ?? 15), total)} of {total}
          </p>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={page === 1 || isFetching}
              onClick={() => setFilters((p) => ({ ...p, page: p.page! - 1 }))}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <span className='text-sm text-gray-600'>
              {page} / {pages}
            </span>
            <Button
              variant='outline'
              size='sm'
              disabled={page === pages || isFetching}
              onClick={() => setFilters((p) => ({ ...p, page: p.page! + 1 }))}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetAllAccidentReports;
