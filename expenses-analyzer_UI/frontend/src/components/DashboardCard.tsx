// ============================================================
// src/components/DashboardCard.tsx
//
// Reusable metric card for the dashboard summary row.
//
// Props:
//   label     — card heading (e.g. "Total Expense")
//   value     — main displayed value (string for flexibility)
//   subLabel  — secondary text below the value
//   icon      — a Lucide React icon component
//   accentColor — color used for the icon background + top border accent
// ============================================================

import type { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  label: string;
  value: string;
  subLabel?: string;
  icon: LucideIcon;
  accentColor: string;
}

export default function DashboardCard({
  label,
  value,
  subLabel,
  icon: Icon,
  accentColor,
}: DashboardCardProps) {
  return (
    // CSS custom property --card-accent is used by the ::before pseudo-element
    // in index.css to draw the colored top border on hover
    <div
      className="dashboard-card"
      style={{ '--card-accent': accentColor } as React.CSSProperties}
    >
      <div className="card-header">
        <span className="card-label">{label}</span>
        {/* Icon box with transparent tinted background */}
        <div
          className="card-icon"
          style={{
            backgroundColor: `${accentColor}20`, // 20 = 12% opacity in hex
          }}
        >
          <Icon size={20} color={accentColor} />
        </div>
      </div>

      <div className="card-value">{value}</div>
      {subLabel && <div className="card-sub">{subLabel}</div>}
    </div>
  );
}
