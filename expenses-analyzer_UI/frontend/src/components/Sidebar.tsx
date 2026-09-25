// ============================================================
// src/components/Sidebar.tsx
//
// Fixed left navigation sidebar.
// Uses NavLink from react-router-dom to highlight the active page.
// ============================================================

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  BarChart2,
  Settings,
  TrendingUp,
} from 'lucide-react';

// Each nav item has a path, label, and icon
const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/expenses', label: 'Expenses', icon: Receipt },
  { path: '/reports', label: 'Reports', icon: BarChart2 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="app-sidebar">
      {/* Logo / Brand */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <TrendingUp size={18} color="white" />
        </div>
        <div>
          <div className="sidebar-logo-text">ExpenseAnalyzer</div>
          <div className="sidebar-logo-sub">Finance Tracker</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Menu</div>

        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          // NavLink automatically adds "active" class when route matches
          <NavLink
            key={path}
            to={path}
            end={path === '/'}   // "end" ensures "/" only matches exact root
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
          v1.0.0 — Phase 1
        </div>
      </div>
    </aside>
  );
}
