import { Link } from "react-router-dom";
import { ArrowLeft, Archive } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetDeletedCounterSaleBatchesQuery } from "@/redux-store/services/counterSaleApi";
import { inr } from "@/mainComponents/DataImport/SalesKpiCharts";
import { useAppSelector } from "@/hooks/redux";
import { selectAuth } from "@/redux-store/slices/authSlice";

const formatDateTime = (value?: string) =>
  value ? new Date(value).toLocaleString("en-IN") : "—";

export default function CounterSaleDeletedBatches() {
  const { isAuthenticated } = useAppSelector(selectAuth);
  const { data, isLoading } = useGetDeletedCounterSaleBatchesQuery(undefined, {
    skip: !isAuthenticated,
  });
  const batches = data?.data ?? [];

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 py-8'>
        <Link
          to='/admin/counter-sale'
          className='flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-4 w-fit'
        >
          <ArrowLeft className='h-4 w-4' /> Back to counter sale reports
        </Link>

        <div className='flex items-center gap-3 mb-6'>
          <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-gray-900 text-white'>
            <Archive className='h-5 w-5' />
          </div>
          <div>
            <h1 className='text-xl font-bold text-gray-900'>Deleted Counter Sale Batches</h1>
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
                  <TableHead>Total Invoice</TableHead>
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
                    <TableCell>{inr(b.totalInvoice)}</TableCell>
                    <TableCell>{b.deletedByRole ?? "—"}</TableCell>
                    <TableCell>{formatDateTime(b.deletedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
