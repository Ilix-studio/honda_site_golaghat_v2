import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Package, Search } from "lucide-react";
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

import { useGetAllPartsQuery } from "@/redux-store/services/partsApi";

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

export interface PartsDatasetRecordsProps {
  batchId: string;
}

const PartsDatasetRecords = ({ batchId }: PartsDatasetRecordsProps) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetAllPartsQuery({
    batchId,
    page: 1,
    limit: 1000,
  });

  const rows = data?.data ?? [];

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const n = r.normalized || {};
      return [n.description, n.partNumber, n.inventoryLocationName]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q));
    });
  }, [rows, search]);

  useEffect(() => {
    setPage(1);
  }, [search, batchId]);

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
          placeholder='Search by description, part number, or location'
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
                  <TableHead className='min-w-[140px]'>Part Number</TableHead>
                  <TableHead className='min-w-[220px]'>Description</TableHead>
                  <TableHead className='min-w-[100px]'>Quantity</TableHead>
                  <TableHead className='min-w-[120px]'>Unit Price</TableHead>
                  <TableHead className='min-w-[160px]'>Location</TableHead>
                  <TableHead className='min-w-[110px]'>Quality</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.map((r) => {
                  const n = r.normalized || {};
                  return (
                    <TableRow key={r._id}>
                      <TableCell className='font-mono text-xs'>
                        {n.partNumber ?? "—"}
                      </TableCell>
                      <TableCell className='font-medium'>
                        {n.description ?? "—"}
                      </TableCell>
                      <TableCell>{n.quantity ?? "—"}</TableCell>
                      <TableCell>
                        {n.unitPrice != null
                          ? `₹${Number(n.unitPrice).toLocaleString("en-IN")}`
                          : "—"}
                      </TableCell>
                      <TableCell>{n.inventoryLocationName ?? "—"}</TableCell>
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

export default PartsDatasetRecords;
