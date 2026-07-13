import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  useGetPartsStatsQuery,
  useGetPartsBatchesQuery,
} from "@/redux-store/services/partsApi";
import {
  useGetDatasetsQuery,
  useGetDatasetRowsQuery,
} from "@/redux-store/services/dataImportApi";
import {
  StatCard,
  type StatCardProps,
} from "@/mainComponents/Admin/AdminDash/StatCard";
import RagAssistant from "@/mainComponents/RAG/RagAssistant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  AlertTriangle,
  Layers,
  UploadCloud,
  Boxes,
  Wallet,
  ShoppingCart,
} from "lucide-react";

const YEARS = [2026, 2025, 2024];

export default function PartsAdminDashboard() {
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: statsData, isLoading: statsLoading } = useGetPartsStatsQuery({
    year,
  });
  const { data: batchesData } = useGetPartsBatchesQuery();

  const stats = statsData?.data;

  // Latest parts-stock import (from the generic DataImport module)
  const { data: stockBatches, isLoading: stockBatchesLoading } = useGetDatasetsQuery({
    datasetType: "parts-stock",
    page: 1,
    limit: 1,
  });
  const latestStockBatchId = stockBatches?.data?.[0]?.batchId;
  const { data: stockRows, isLoading: stockRowsLoading } = useGetDatasetRowsQuery(
    { batchId: latestStockBatchId as string, page: 1, limit: 1000 },
    { skip: !latestStockBatchId },
  );

  const stockKpis = useMemo(() => {
    const rows = stockRows?.data ?? [];
    const totalQuantity = rows.reduce(
      (sum, r) => sum + (Number(r.normalized?.quantity) || 0),
      0,
    );
    const totalStockValue = rows.reduce(
      (sum, r) => sum + (Number(r.normalized?.stockValue) || 0),
      0,
    );
    return { totalQuantity, totalStockValue };
  }, [stockRows]);

  // Parts sold (from invoice dataset)
  const { data: invoiceBatches, isLoading: invoiceBatchesLoading } = useGetDatasetsQuery({
    datasetType: "invoice",
    page: 1,
    limit: 1,
  });
  const latestInvoiceBatchId = invoiceBatches?.data?.[0]?.batchId;
  const { data: invoiceRows, isLoading: invoiceRowsLoading } = useGetDatasetRowsQuery(
    { batchId: latestInvoiceBatchId as string, page: 1, limit: 1000 },
    { skip: !latestInvoiceBatchId },
  );

  const partsSold = useMemo(() => {
    const rows = invoiceRows?.data ?? [];
    const totalAmount = rows.reduce(
      (sum, r) => sum + (Number(r.normalized?.totalAmount) || 0),
      0,
    );
    return { count: rows.length, totalAmount };
  }, [invoiceRows]);

  const kpis: Omit<StatCardProps, "index">[] = [
    {
      title: "Total Parts",
      value: stats?.totals.totalParts ?? "—",
      icon: Package,
      loading: statsLoading,
      description: "Rows imported (your branch)",
      accent: "#2563eb",
      action: { label: "View parts", href: "/part-admin/upload" },
    },
    {
      title: "Upload Batches",
      value: stats?.totals.totalBatches ?? "—",
      icon: Layers,
      loading: statsLoading,
      description: "Distinct report uploads",
      accent: "#7c3aed",
      action: { label: "Upload report", href: "/part-admin/upload" },
    },
    {
      title: "Needs Review",
      value: stats?.totals.reviewParts ?? "—",
      icon: AlertTriangle,
      loading: statsLoading,
      description: "Low-confidence PDF rows",
      accent: "#d97706",
      action: { label: "Upload report", href: "/part-admin/upload" },
    },
  ];

  const stockValueKpis: Omit<StatCardProps, "index">[] = [
    {
      title: "Stock Quantity",
      value: stockBatchesLoading || stockRowsLoading ? "—" : stockKpis.totalQuantity,
      icon: Boxes,
      loading: stockBatchesLoading || stockRowsLoading,
      description: latestStockBatchId
        ? `From batch ${latestStockBatchId}`
        : "No parts-stock import yet",
      accent: "#0891b2",
      action: { label: "Upload stock file", href: "/part-admin/data-import/upload" },
    },
    {
      title: "Stock Value",
      value:
        stockBatchesLoading || stockRowsLoading
          ? "—"
          : `₹${stockKpis.totalStockValue.toLocaleString("en-IN")}`,
      icon: Wallet,
      loading: stockBatchesLoading || stockRowsLoading,
      description: "Sum of stock value, latest batch",
      accent: "#16a34a",
      action: { label: "Upload stock file", href: "/part-admin/data-import/upload" },
    },
    {
      title: "Parts Sold",
      value:
        invoiceBatchesLoading || invoiceRowsLoading ? "—" : partsSold.count,
      icon: ShoppingCart,
      loading: invoiceBatchesLoading || invoiceRowsLoading,
      description: `₹${partsSold.totalAmount.toLocaleString("en-IN")} from invoices`,
      accent: "#db2777",
      action: { label: "Upload invoice", href: "/part-admin/data-import/upload" },
    },
  ];

  return (
    <div className='p-6 md:p-10 space-y-6'>
      <div className='flex items-center justify-between flex-wrap gap-3'>
        <div>
          <h1 className='text-2xl font-black text-gray-900'>
            Parts Admin Dashboard
          </h1>
          <p className='text-sm text-gray-500'>
            Parts report uploads & inventory KPIs for your branch.
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <select
            value={String(year)}
            onChange={(e) => setYear(Number(e.target.value))}
            className='h-9 rounded-md border border-gray-200 bg-white px-3 text-sm'
          >
            {YEARS.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
          <Link to='/part-admin/upload'>
            <Button className='bg-blue-600 hover:bg-blue-700'>
              <UploadCloud className='w-4 h-4 mr-2' />
              Upload Report
            </Button>
          </Link>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {kpis.map((kpi, i) => (
          <StatCard key={kpi.title} {...kpi} index={i} />
        ))}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {stockValueKpis.map((kpi, i) => (
          <StatCard key={kpi.title} {...kpi} index={i} />
        ))}
      </div>

      <Card className='border border-gray-200 shadow-sm'>
        <CardHeader>
          <CardTitle>Monthly Parts Imported — {year}</CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className='h-56 flex items-center justify-center'>
              <p className='text-sm text-gray-400 animate-pulse'>
                Loading chart...
              </p>
            </div>
          ) : (
            <ResponsiveContainer width='100%' height={240}>
              <BarChart
                data={stats?.monthly}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis
                  dataKey='month'
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey='partCount' fill='#2563eb' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className='border border-gray-200 shadow-sm'>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          {!batchesData?.data?.length ? (
            <p className='text-sm text-gray-400'>No uploads yet.</p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='text-gray-500 text-left'>
                  <tr>
                    <th className='py-2 pr-4'>File</th>
                    <th className='py-2 pr-4'>Format</th>
                    <th className='py-2 pr-4'>Rows</th>
                    <th className='py-2 pr-4'>Review</th>
                    <th className='py-2 pr-4'>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {batchesData.data.map((b) => (
                    <tr key={b.batchId} className='border-t border-gray-100'>
                      <td className='py-2 pr-4 font-medium text-gray-800'>
                        {b.fileName}
                      </td>
                      <td className='py-2 pr-4 uppercase text-gray-500'>
                        {b.sourceFormat}
                      </td>
                      <td className='py-2 pr-4 tabular-nums'>{b.totalParts}</td>
                      <td className='py-2 pr-4 tabular-nums'>{b.reviewParts}</td>
                      <td className='py-2 pr-4 text-gray-500'>
                        {new Date(b.importDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <RagAssistant
        title='Parts AI Assistant'
        subtitle='Ask questions about your branch parts data — answers are grounded in the uploaded reports.'
        sourceTypes={["parts"]}
        placeholder='e.g. Which month had the most parts imported?'
      />
    </div>
  );
}
