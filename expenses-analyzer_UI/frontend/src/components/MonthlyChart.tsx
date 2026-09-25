// ============================================================
// src/components/MonthlyChart.tsx
//
// Bar chart showing total expenses per month (last 6 months).
// Uses Recharts BarChart.
//
// Props:
//   data — array of MonthlySummary (month label + total)
// ============================================================

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { MonthlySummary } from '../types/expense';
import { formatCurrency } from '../utils/formatters';

interface MonthlyChartProps {
  data: MonthlySummary[];
}

// Custom tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          {formatCurrency(payload[0].value)}
        </div>
      </div>
    );
  }
  return null;
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <div className="chart-title">Monthly Expenses</div>
          <div className="chart-subtitle">Last 6 months trend</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barSize={32} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
          {/* Grid lines — only horizontal */}
          <CartesianGrid
            vertical={false}
            stroke="var(--border-default)"
            strokeDasharray="4 4"
          />

          {/* X Axis — month labels */}
          <XAxis
            dataKey="month"
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          {/* Y Axis — rupee amounts */}
          <YAxis
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={50}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />

          {/* The actual bars */}
          <Bar
            dataKey="total"
            fill="var(--accent-primary)"
            radius={[6, 6, 0, 0]}  // rounded top corners
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
