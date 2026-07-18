import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IndianRupee, Layers, TrendingUp } from "lucide-react";
import { StatCard, type StatCardProps } from "./StatCard";
import { useGetStockBatchReportsQuery } from "@/redux-store/services/BikeSystemApi3/csvStockApi";

const formatCurrency = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

/**
 * Per-upload-batch investment/revenue report for Stock-Inventory files:
 * how much was invested (total cost price) versus how much has come back
 * (vehicle sale + VAS + parts revenue on that batch's vehicles).
 */
export default function StockInvestmentDashboard() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetStockBatchReportsQuery({
    page,
    limit: 10,
  });

  const batches = data?.data ?? [];
  const pagination = data?.pagination;

  const totals = useMemo(
    () =>
      batches.reduce(
        (acc, b) => ({
          investment: acc.investment + b.totalCostPrice,
          revenue: acc.revenue + b.totalRevenue,
        }),
        { investment: 0, revenue: 0 }
      ),
    [batches]
  );

  const kpis: Omit<StatCardProps, "index">[] = [
    {
      title: "Total Investment (this page)",
      value: isLoading ? "—" : formatCurrency(totals.investment),
      icon: IndianRupee,
      loading: isLoading,
      description: "Sum of cost price across uploaded batches",
      action: { label: "Uploads", href: "/manager/get/csv" },
    },
    {
      title: "Total Revenue (this page)",
      value: isLoading ? "—" : formatCurrency(totals.revenue),
      icon: TrendingUp,
      loading: isLoading,
      description: "Vehicle sales + VAS + parts",
      action: { label: "Uploads", href: "/manager/get/csv" },
    },
    {
      title: "Upload Batches",
      value: isLoading ? "—" : (pagination?.total ?? 0),
      icon: Layers,
      loading: isLoading,
      description: "Stock-inventory file uploads",
      action: { label: "Uploads", href: "/manager/get/csv" },
    },
  ];

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {kpis.map((kpi, i) => (
          <StatCard key={kpi.title} {...kpi} index={i} />
        ))}
      </div>

      <Card size='sm' className='border border-gray-200 shadow-sm'>
        <CardHeader>
          <CardTitle>Stock-Inventory Upload Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className='h-40 flex items-center justify-center'>
              <p className='text-sm text-gray-400 animate-pulse'>
                Loading reports...
              </p>
            </div>
          )}

          {!isLoading && batches.length === 0 && (
            <div className='text-center py-12 text-sm text-gray-500'>
              No stock-inventory uploads yet.
            </div>
          )}

          {!isLoading && batches.length > 0 && (
            <div className='rounded-md border overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File / Uploaded</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead className='text-right'>Total Fields</TableHead>
                    <TableHead className='text-right'>Assigned</TableHead>
                    <TableHead className='text-right'>Left</TableHead>
                    <TableHead className='text-right'>Investment</TableHead>
                    <TableHead className='text-right'>Sales Revenue</TableHead>
                    <TableHead className='text-right'>VAS Revenue</TableHead>
                    <TableHead className='text-right'>Parts Revenue</TableHead>
                    <TableHead className='text-right'>Total Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((b) => (
                    <TableRow key={b.batchId}>
                      <TableCell>
                        <div className='font-medium text-sm max-w-[220px] truncate'>
                          {b.fileName}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          {formatDate(b.uploadDate)}
                        </div>
                      </TableCell>
                      <TableCell className='text-sm'>{b.branchName}</TableCell>
                      <TableCell className='text-right'>
                        {b.totalVehicles}
                      </TableCell>
                      <TableCell className='text-right'>
                        {b.assignedCount}
                      </TableCell>
                      <TableCell className='text-right'>
                        {b.leftCount}
                      </TableCell>
                      <TableCell className='text-right font-medium'>
                        {formatCurrency(b.totalCostPrice)}
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(b.salesRevenue)}
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(b.vasRevenue)}
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(b.partsRevenue)}
                      </TableCell>
                      <TableCell className='text-right font-semibold text-emerald-700'>
                        {formatCurrency(b.totalRevenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {pagination && pagination.pages > 1 && (
            <div className='flex items-center justify-between mt-4'>
              <p className='text-sm text-muted-foreground'>
                Page {pagination.page} of {pagination.pages}
              </p>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={page === pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
