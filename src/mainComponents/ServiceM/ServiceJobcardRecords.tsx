import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Package, Search } from "lucide-react";
import { skipToken } from "@reduxjs/toolkit/query";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  useGetAllServiceJobcardsQuery,
  useGetServiceJobcardsByDateQuery,
} from "@/redux-store/services/serviceJobcardApi";

const qualityBadge = (changeType?: "added" | "changed") => {
  if (changeType === "added") {
    return (
      <Badge variant='outline' className='text-xs bg-green-50 text-green-700 border-green-200'>
        New
      </Badge>
    );
  }
  if (changeType === "changed") {
    return (
      <Badge variant='outline' className='text-xs bg-amber-50 text-amber-700 border-amber-200'>
        Changed
      </Badge>
    );
  }
  return <span className='text-muted-foreground'>—</span>;
};

const RECORDS_PAGE_SIZE = 25;

export interface ServiceJobcardRecordsProps {
  batchId?: string;
  date?: Date;
}

const ServiceJobcardRecords = ({ batchId, date }: ServiceJobcardRecordsProps) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const dateKey = date ? format(date, "yyyy-MM-dd") : undefined;

  const batchQuery = useGetAllServiceJobcardsQuery(
    batchId ? { batchId, page: 1, limit: 1000 } : undefined,
  );
  const dateQuery = useGetServiceJobcardsByDateQuery(
    dateKey ? { date: dateKey, page: 1, limit: 1000 } : skipToken,
  );

  const data = dateKey ? dateQuery.data : batchQuery.data;
  const isLoading = dateKey ? dateQuery.isLoading : batchQuery.isLoading;

  const rows = data?.data ?? [];

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const n = r.normalized || {};
      return [n.jobCardNumber, n.customerName, n.customerMobile, n.frameNumber]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q));
    });
  }, [rows, search]);

  useEffect(() => {
    setPage(1);
  }, [search, batchId, dateKey]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / RECORDS_PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * RECORDS_PAGE_SIZE;
    return filteredRows.slice(start, start + RECORDS_PAGE_SIZE);
  }, [filteredRows, page]);

  return (
    <div className='space-y-4'>
      <div className='relative max-w-md'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Search by job card #, customer name, mobile, or frame number'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='pl-10'
        />
      </div>

      {isLoading ? (
        <p className='text-sm text-muted-foreground'>Loading records...</p>
      ) : filteredRows.length === 0 ? (
        <div className='text-center py-12 border rounded-lg'>
          <Package className='h-12 w-12 mx-auto mb-3 text-muted-foreground' />
          <h3 className='font-semibold mb-1'>No records found</h3>
          <p className='text-sm text-muted-foreground'>
            {search ? "Try adjusting your search." : "This batch has no rows."}
          </p>
        </div>
      ) : (
        <>
          <div className='rounded-md border overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='min-w-[120px]'>Job Card #</TableHead>
                  <TableHead className='min-w-[160px]'>Customer</TableHead>
                  <TableHead className='min-w-[120px]'>Mobile</TableHead>
                  <TableHead className='min-w-[140px]'>Frame Number</TableHead>
                  <TableHead className='min-w-[140px]'>Model</TableHead>
                  <TableHead className='min-w-[100px]'>Service Type</TableHead>
                  <TableHead className='min-w-[100px]'>Current KMs</TableHead>
                  <TableHead className='min-w-[120px]'>Parts Revenue</TableHead>
                  <TableHead className='min-w-[120px]'>Lubes Revenue</TableHead>
                  <TableHead className='min-w-[130px]'>Total Revenue</TableHead>
                  <TableHead className='min-w-[120px]'>Technician</TableHead>
                  <TableHead className='min-w-[110px]'>Closed Date</TableHead>
                  <TableHead className='min-w-[100px]'>Quality</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.map((r) => {
                  const n = r.normalized || {};
                  return (
                    <TableRow key={r._id}>
                      <TableCell className='font-mono text-xs'>
                        {n.jobCardNumber ?? "—"}
                      </TableCell>
                      <TableCell className='font-medium'>
                        {n.customerName ?? "—"}
                      </TableCell>
                      <TableCell>{n.customerMobile ?? "—"}</TableCell>
                      <TableCell className='font-mono text-xs'>
                        {n.frameNumber ?? "—"}
                      </TableCell>
                      <TableCell>
                        {[n.modelName, n.modelVariant].filter(Boolean).join(" ") || "—"}
                      </TableCell>
                      <TableCell>{n.serviceType ?? "—"}</TableCell>
                      <TableCell>{n.currentKms ?? "—"}</TableCell>
                      <TableCell>
                        {n.partsRevenue != null ? `₹${Number(n.partsRevenue).toLocaleString("en-IN")}` : "—"}
                      </TableCell>
                      <TableCell>
                        {n.lubesRevenue != null ? `₹${Number(n.lubesRevenue).toLocaleString("en-IN")}` : "—"}
                      </TableCell>
                      <TableCell className='font-semibold'>
                        {n.totalJobCardRevenue != null
                          ? `₹${Number(n.totalJobCardRevenue).toLocaleString("en-IN")}`
                          : "—"}
                      </TableCell>
                      <TableCell>{n.technicianName ?? "—"}</TableCell>
                      <TableCell>
                        {n.jobCardClosedDate
                          ? new Date(n.jobCardClosedDate).toLocaleDateString("en-IN")
                          : "—"}
                      </TableCell>
                      <TableCell>{qualityBadge(r.changeType)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className='flex items-center justify-between pt-1'>
            <p className='text-xs text-muted-foreground'>
              Showing {(page - 1) * RECORDS_PAGE_SIZE + 1}–
              {Math.min(page * RECORDS_PAGE_SIZE, filteredRows.length)} of{" "}
              {filteredRows.length} rows
            </p>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='h-8 px-2'
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className='w-4 h-4' />
              </Button>
              <span className='text-xs text-muted-foreground'>
                Page {page} of {totalPages}
              </span>
              <Button
                variant='outline'
                size='sm'
                className='h-8 px-2'
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceJobcardRecords;
