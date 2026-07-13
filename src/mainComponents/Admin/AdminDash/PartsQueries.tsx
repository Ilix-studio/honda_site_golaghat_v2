import { useState } from "react";
import { useGetPartsStatsQuery } from "@/redux-store/services/partsApi";
import { StatCard, type StatCardProps } from "./StatCard";
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
import { Package, AlertTriangle, Layers, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PartsAiAssistant from "@/mainComponents/PartsM/PartsAiAssistant";

const YEARS = [2026, 2025, 2024];

/**
 * Super-Admin parts view: all-branches KPIs, monthly chart, and the AI panel.
 */
export default function PartsQueries() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, isLoading } = useGetPartsStatsQuery({ year });
  const stats = data?.data;

  const kpis: Omit<StatCardProps, "index">[] = [
    {
      title: "Total Parts",
      value: stats?.totals.totalParts ?? "—",
      icon: Package,
      loading: isLoading,
      description: "All branches",
      accent: "#2563eb",
      action: { label: "Details", href: "/admin/dashboard" },
    },
    {
      title: "Upload Batches",
      value: stats?.totals.totalBatches ?? "—",
      icon: Layers,
      loading: isLoading,
      description: "Report uploads",
      accent: "#7c3aed",
      action: { label: "Details", href: "/admin/dashboard" },
    },
    {
      title: "Needs Review",
      value: stats?.totals.reviewParts ?? "—",
      icon: AlertTriangle,
      loading: isLoading,
      description: "Flagged PDF rows",
      accent: "#d97706",
      action: { label: "Details", href: "/admin/dashboard" },
    },
  ];

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-end gap-3'>
        <Link to='/admin/branches/part-admins'>
          <Button variant='outline' size='sm'>
            <Users className='w-4 h-4 mr-2' />
            Manage Part Admins
          </Button>
        </Link>
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
          {isLoading ? (
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
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  allowDecimals={false}
                />
                <Tooltip />
                <Bar dataKey='partCount' fill='#2563eb' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <PartsAiAssistant />
    </div>
  );
}
