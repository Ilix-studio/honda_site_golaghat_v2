import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  Granularity,
  SalesTimeseriesPoint,
} from "@/redux-store/services/dataImport.types";

const GRANULARITIES: { value: Granularity; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

const formatCurrency = (v: number) =>
  v >= 100000
    ? `₹${(v / 100000).toFixed(1)}L`
    : `₹${v.toLocaleString("en-IN")}`;

interface SalesTrendChartProps {
  granularity: Granularity;
  onGranularityChange: (g: Granularity) => void;
  data: SalesTimeseriesPoint[];
  loading?: boolean;
}

export default function SalesTrendChart({
  granularity,
  onGranularityChange,
  data,
  loading,
}: SalesTrendChartProps) {
  return (
    <>
      <Card className='border border-gray-200 shadow-sm mt-1' size='sm'>
        <CardHeader className='flex flex-row items-center justify-between flex-wrap gap-3'>
          <CardTitle>Revenue Trend</CardTitle>
          <div className='inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1'>
            {GRANULARITIES.map((g) => (
              <button
                key={g.value}
                onClick={() => onGranularityChange(g.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  granularity === g.value
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='h-64 flex items-center justify-center'>
              <p className='text-sm text-gray-400 animate-pulse'>
                Loading chart...
              </p>
            </div>
          ) : !data.length ? (
            <div className='h-64 flex items-center justify-center'>
              <p className='text-sm text-gray-400'>
                No sales data for this range yet.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width='100%' height={280}>
              <LineChart
                data={data}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis
                  dataKey='bucket'
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
                    formatCurrency(value),
                    "Revenue",
                  ]}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Line
                  type='monotone'
                  dataKey='totalRevenue'
                  stroke='#dc2626'
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className='border border-gray-200 shadow-sm'>
        <CardHeader>
          <CardTitle>Revenue Mix</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='h-56 flex items-center justify-center'>
              <p className='text-sm text-gray-400 animate-pulse'>
                Loading chart...
              </p>
            </div>
          ) : !data.length ? (
            <div className='h-56 flex items-center justify-center'>
              <p className='text-sm text-gray-400'>No data yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width='100%' height={240}>
              <BarChart
                data={data}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis
                  dataKey='bucket'
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
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey='labourRevenue'
                  stackId='mix'
                  name='Labour'
                  fill='#2563eb'
                />
                <Bar
                  dataKey='partsRevenue'
                  stackId='mix'
                  name='Parts'
                  fill='#7c3aed'
                />
                <Bar
                  dataKey='lubesRevenue'
                  stackId='mix'
                  name='Lubes'
                  fill='#d97706'
                />
                <Bar
                  dataKey='accessoriesRevenue'
                  stackId='mix'
                  name='Accessories'
                  fill='#059669'
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </>
  );
}
