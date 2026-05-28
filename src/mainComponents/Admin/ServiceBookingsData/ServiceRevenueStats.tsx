import { useState } from "react";
import { useGetRevenueStatsQuery } from "@/redux-store/services/ServiceM/jobCardApi";
import { useGetBranchesQuery } from "@/redux-store/services/branchApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Receipt, IndianRupee, FileCheck } from "lucide-react";

function formatCurrency(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
}

function formatCurrencyFull(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];

const SELECT_CLS =
  "h-9 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 cursor-pointer";

export default function ServiceRevenueStats() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [branchId, setBranchId] = useState<string>("");

  const { data: revenueData, isLoading } = useGetRevenueStatsQuery({
    year,
    branchId: branchId || undefined,
  });

  const { data: branchData } = useGetBranchesQuery(undefined);

  const stats = revenueData?.data;

  const statCards = [
    {
      label: "Total Revenue",
      value: stats ? formatCurrencyFull(stats.totals.totalRevenue) : "—",
      icon: <IndianRupee className='w-5 h-5 text-red-600' />,
      bg: "bg-red-50",
    },
    {
      label: "Total Tax Collected",
      value: stats ? formatCurrencyFull(stats.totals.totalTax) : "—",
      icon: <TrendingUp className='w-5 h-5 text-blue-600' />,
      bg: "bg-blue-50",
    },
    {
      label: "Invoices Generated",
      value: stats?.totals.totalInvoices ?? "—",
      icon: <FileCheck className='w-5 h-5 text-green-600' />,
      bg: "bg-green-50",
    },
    {
      label: "Avg Invoice Value",
      value: stats ? formatCurrencyFull(stats.totals.avgInvoiceValue) : "—",
      icon: <Receipt className='w-5 h-5 text-purple-600' />,
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className='space-y-6 p-10'>
      {/* Filters */}
      <div className='flex items-center gap-3 flex-wrap'>
        <select
          value={String(year)}
          onChange={(e) => setYear(Number(e.target.value))}
          className={SELECT_CLS}
        >
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>

        <select
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          className={SELECT_CLS}
        >
          <option value=''>All Branches</option>
          {branchData?.data?.map((b: any) => (
            <option key={b._id} value={b._id}>
              {b.branchName}
            </option>
          ))}
        </select>
      </div>

      {/* Stat cards */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {statCards.map((card) => (
          <Card key={card.label} className='border border-gray-200 shadow-sm'>
            <CardContent className='pt-4 pb-4'>
              <div className={`inline-flex p-2 rounded-lg ${card.bg} mb-3`}>
                {card.icon}
              </div>
              <p className='text-xs text-gray-500 font-medium'>{card.label}</p>
              <p className='text-lg font-bold text-gray-900 mt-0.5'>
                {isLoading ? (
                  <span className='animate-pulse text-gray-300'>—</span>
                ) : (
                  card.value
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bar chart */}
      <Card className='border border-gray-200 shadow-sm'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-base font-semibold text-gray-900'>
            Monthly Revenue — {year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='h-56 flex items-center justify-center'>
              <p className='text-sm text-gray-400 animate-pulse'>
                Loading chart...
              </p>
            </div>
          ) : (
            <ResponsiveContainer width='100%' height={220}>
              <BarChart
                data={stats?.monthly}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis
                  dataKey='month'
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <Tooltip
                  formatter={(value: number) => [
                    formatCurrencyFull(value),
                    "Revenue",
                  ]}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Bar dataKey='revenue' fill='#dc2626' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Monthly breakdown table */}
      <Card className='border border-gray-200 shadow-sm'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-base font-semibold text-gray-900'>
            Monthly Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-gray-100 bg-gray-50'>
                  {["Month", "Invoices", "Subtotal", "GST", "Revenue"].map(
                    (h) => (
                      <th
                        key={h}
                        className='px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide'
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {stats?.monthly.map((row) => (
                  <tr
                    key={row.month}
                    className={`hover:bg-gray-50 transition-colors ${
                      row.revenue === 0 ? "opacity-40" : ""
                    }`}
                  >
                    <td className='px-4 py-2.5 font-medium text-gray-900'>
                      {row.month}
                    </td>
                    <td className='px-4 py-2.5 text-gray-600'>
                      {row.invoiceCount}
                    </td>
                    <td className='px-4 py-2.5 text-gray-600'>
                      {formatCurrencyFull(row.subtotal)}
                    </td>
                    <td className='px-4 py-2.5 text-gray-600'>
                      {formatCurrencyFull(row.taxTotal)}
                    </td>
                    <td className='px-4 py-2.5 font-semibold text-gray-900'>
                      {formatCurrencyFull(row.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
