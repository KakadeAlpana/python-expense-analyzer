// ============================================================
// src/pages/SettingsPage.tsx
//
// Settings page — placeholder for Phase 6+ features.
// (Security settings, preferences, account details)
// ============================================================

import { useState } from 'react';
import { Settings, User, Bell, Shield, Database, RefreshCw, Check } from 'lucide-react';
import { resetDemoExpenses } from '../services/expenseApi';

const SETTINGS_SECTIONS = [
  {
    icon: User,
    title: 'Profile',
    description: 'Update your name, email, and profile picture.',
    badge: 'Coming in Phase 6',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Configure expense alerts and monthly summary emails.',
    badge: 'Coming in Phase 6',
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Manage passwords, 2FA, and session settings.',
    badge: 'Coming in Phase 6',
  },
  {
    icon: Database,
    title: 'Data & Export',
    description: 'Export expenses to CSV or Excel for offline analysis.',
    badge: 'Coming in Phase 6',
  },
];

export default function SettingsPage() {
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetData = () => {
    resetDemoExpenses();
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      window.location.reload();
    }, 1200);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Application preferences and account settings</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Reset Mock Data Action Card */}
        <div
          className="dashboard-card"
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}
        >
          <div
            className="card-icon"
            style={{ backgroundColor: 'var(--bg-elevated)', flexShrink: 0 }}
          >
            <RefreshCw size={20} color="var(--accent-primary)" />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              Reset Mock Data
            </div>
            <div
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-secondary)',
                marginTop: 2,
              }}
            >
              Restore initial hardcoded sample expenses in localStorage.
            </div>
          </div>
          <button
            className="btn btn-secondary"
            onClick={handleResetData}
            disabled={resetSuccess}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {resetSuccess ? (
              <>
                <Check size={16} color="var(--accent-success)" />
                Reset Complete!
              </>
            ) : (
              <>
                <RefreshCw size={14} />
                Reset Data
              </>
            )}
          </button>
        </div>

        {SETTINGS_SECTIONS.map(({ icon: Icon, title, description, badge }) => (
          <div
            key={title}
            className="dashboard-card"
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', cursor: 'default' }}
          >
            <div
              className="card-icon"
              style={{ backgroundColor: 'var(--bg-elevated)', flexShrink: 0 }}
            >
              <Icon size={20} color="var(--text-secondary)" />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                  marginTop: 2,
                }}
              >
                {description}
              </div>
            </div>
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-muted)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                whiteSpace: 'nowrap',
              }}
            >
              {badge}
            </span>
          </div>
        ))}
      </div>

      {/* Standalone info box */}
      <div
        style={{
          marginTop: 'var(--space-6)',
          background: 'var(--accent-primary-subtle)',
          border: '1px solid rgba(59,130,246,0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-5)',
          display: 'flex',
          gap: 'var(--space-4)',
          alignItems: 'flex-start',
        }}
      >
        <Settings size={20} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              color: 'var(--accent-primary)',
              marginBottom: 4,
            }}
          >
            Standalone Frontend Mode Active
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            The app is currently running live without requiring any backend server or database.
            All CRUD actions (add, edit, filter, delete, summaries, charts) work offline using browser local storage and preloaded mock data.
          </div>
        </div>
      </div>
    </div>
  );
}
