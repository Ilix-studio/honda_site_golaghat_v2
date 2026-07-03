import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useGetPartsStatsQuery,
  useGetPartsBatchesQuery,
} from "@/redux-store/services/partsApi";
import {
  StatCard,
  type StatCardProps,
} from "@/mainComponents/Admin/AdminDash/StatCard";
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
import { Package, AlertTriangle, Layers, UploadCloud } from "lucide-react";

const YEARS = [2026, 2025, 2024];

export default function PartsAdminDashboard() {
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: statsData, isLoading: statsLoading } = useGetPartsStatsQuery({
    year,
  });
  const { data: batchesData } = useGetPartsBatchesQuery();

  const stats = statsData?.data;

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
    </div>
  );
}
