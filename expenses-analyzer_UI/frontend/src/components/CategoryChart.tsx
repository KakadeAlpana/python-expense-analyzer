// ============================================================
// src/components/CategoryChart.tsx
//
// Donut chart showing expense breakdown by category.
// Uses Recharts PieChart under the hood.
//
// Props:
//   data — array of CategorySummary (computed from expenses)
// ============================================================

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { CategorySummary } from '../types/expense';
import { CATEGORY_COLORS } from '../types/expense';
import { formatCurrency } from '../utils/formatters';

interface CategoryChartProps {
  data: CategorySummary[];
}

// Custom tooltip shown on hover over a chart slice
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const entry = payload[0];
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
        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          {entry.name}
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          {formatCurrency(entry.value)}
        </div>
      </div>
    );
  }
  return null;
}

export default function CategoryChart({ data }: CategoryChartProps) {
  const total = data.reduce((sum, d) => sum + d.total, 0);

  if (data.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <div className="chart-title">Category Breakdown</div>
            <div className="chart-subtitle">Spending by category</div>
          </div>
        </div>
        <div className="empty-state">
          <div className="empty-state-title">No data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <div className="chart-title">Category Breakdown</div>
          <div className="chart-subtitle">Spending by category</div>
        </div>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
          Total: {formatCurrency(total)}
        </div>
      </div>

      {/* Donut chart — innerRadius creates the hole */}
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell
                key={entry.category}
                fill={CATEGORY_COLORS[entry.category]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom legend below the chart */}
      <div className="category-legend">
        {data.map((entry) => {
          const pct = total > 0 ? ((entry.total / total) * 100).toFixed(1) : '0';
          return (
            <div key={entry.category} className="legend-item">
              <div className="legend-dot-label">
                <div
                  className="legend-dot"
                  style={{ backgroundColor: CATEGORY_COLORS[entry.category] }}
                />
                {entry.category}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {pct}%
                </span>
                <span className="legend-amount">{formatCurrency(entry.total)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
