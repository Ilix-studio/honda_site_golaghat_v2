import { Archive } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetDeletedSalesReportBatchesQuery } from "@/redux-store/services/salesReportApi";
import { inr } from "@/mainComponents/DataImport/SalesKpiCharts";
import { useAppSelector } from "@/hooks/redux";
import { selectAuth } from "@/redux-store/slices/authSlice";

const formatDateTime = (value?: string) =>
  value ? new Date(value).toLocaleString("en-IN") : "—";

/** Super-Admin-only audit trail of soft-deleted SalesReport batches. */
export default function SalesReportDeletedBatches() {
  const { isAuthenticated } = useAppSelector(selectAuth);
  const { data, isLoading } = useGetDeletedSalesReportBatchesQuery(undefined, {
    skip: !isAuthenticated,
  });
  const batches = data?.data ?? [];

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3'>
        <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-gray-900 text-white'>
          <Archive className='h-5 w-5' />
        </div>
        <div>
          <h2 className='text-lg font-bold text-gray-900'>Deleted Sales Report Batches</h2>
          <p className='text-sm text-gray-500'>Audit trail — who deleted what and when</p>
        </div>
      </div>

      {isLoading ? (
        <p className='text-sm text-muted-foreground'>Loading...</p>
      ) : batches.length === 0 ? (
        <div className='text-center py-16 border rounded-lg bg-white'>
          <p className='text-sm text-muted-foreground'>No deleted batches.</p>
        </div>
      ) : (
        <div className='rounded-md border overflow-x-auto bg-white'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Total Payment</TableHead>
                <TableHead>Deleted By Role</TableHead>
                <TableHead>Deleted At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((b) => (
                <TableRow key={b.batchId}>
                  <TableCell className='font-mono text-xs'>{b.batchId}</TableCell>
                  <TableCell>{formatDateTime(b.importDate)}</TableCell>
                  <TableCell>{b.totalRecords}</TableCell>
                  <TableCell>{inr(b.totalPayment)}</TableCell>
                  <TableCell>{b.deletedByRole ?? "—"}</TableCell>
                  <TableCell>{formatDateTime(b.deletedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
