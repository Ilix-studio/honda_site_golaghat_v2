import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardSpec } from "@/redux-store/services/ragApi.types";

const PIE_COLORS = ["#2563eb", "#7c3aed", "#d97706", "#059669", "#dc2626", "#0891b2"];

interface DashboardChartPreviewProps {
  spec: DashboardSpec;
  /** Compact = small inline chat bubble; full = Preview tab / Dashboards tab sizing. */
  compact?: boolean;
}

/**
 * Renders a DashboardSpec (bar/line/pie) with the axis/tooltip styling
 * already used by the static Parts chart. Shared by RagAssistant's inline
 * chat charts and the Preview tab so chart JSX isn't duplicated.
 */
export default function DashboardChartPreview({
  spec,
  compact = false,
}: DashboardChartPreviewProps) {
  const height = compact ? 160 : 280;

  return (
    <Card className='border border-gray-200 shadow-sm'>
      <CardHeader className={compact ? "py-3" : undefined}>
        <CardTitle className={compact ? "text-sm" : undefined}>{spec.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={height}>
          {spec.chartType === "bar" ? (
            <BarChart data={spec.data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
              <XAxis dataKey={spec.xKey} tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey={spec.yKey} fill='#2563eb' radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : spec.chartType === "line" ? (
            <LineChart data={spec.data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
              <XAxis dataKey={spec.xKey} tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
              <Tooltip />
              <Line type='monotone' dataKey={spec.yKey} stroke='#2563eb' strokeWidth={2} dot={false} />
            </LineChart>
          ) : (
            <PieChart>
              <Tooltip />
              <Pie
                data={spec.data}
                dataKey={spec.yKey}
                nameKey={spec.xKey}
                cx='50%'
                cy='50%'
                outerRadius={compact ? 55 : 90}
                label
              >
                {spec.data.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
