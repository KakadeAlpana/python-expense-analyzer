// ============================================================
// src/App.tsx
//
// Root component — owns all application state and routing.
//
// Phase 4 changes:
//   - expenses are fetched from FastAPI (GET /api/expenses)
//   - handleAdd calls POST /api/expenses
//   - handleUpdate calls PUT /api/expenses/{id}
//   - handleDelete calls DELETE /api/expenses/{id}
//   - loading + error state added
//   - mock data is no longer imported or used
//
// Architecture:
//   App.tsx owns the global expense list.
//   Pages receive expenses + handlers as props.
//   All API calls go through src/services/expenseApi.ts.
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import type { Expense, ExpenseFormData } from './types/expense';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from './services/expenseApi';

// ---- Page title mapping ----
const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/expenses': 'Expenses',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

// Inner layout component (needs useLocation hook, which requires BrowserRouter)
function AppLayout() {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Expense Analyzer';

  // ---- Global expense state ----
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Fetch all expenses on initial mount ----
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load expenses. Is the backend running?'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // ---- CRUD handlers — all call the API, then refresh the list ----

  const handleAdd = useCallback(async (data: ExpenseFormData) => {
    await createExpense(data);
    // Refresh the full list so the table and dashboard are in sync
    await fetchExpenses();
  }, [fetchExpenses]);

  const handleUpdate = useCallback(async (id: number, data: ExpenseFormData) => {
    await updateExpense(id, data);
    await fetchExpenses();
  }, [fetchExpenses]);

  const handleDelete = useCallback(async (id: number) => {
    await deleteExpense(id);
    await fetchExpenses();
  }, [fetchExpenses]);

  // ---- Loading screen ----
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '16px',
          color: 'var(--text-secondary)',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: '3px solid var(--border-default)',
            borderTopColor: 'var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        Loading expenses...
      </div>
    );
  }

  // ---- Error screen ----
  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '12px',
          color: 'var(--text-secondary)',
          fontSize: 'var(--font-size-sm)',
          padding: '32px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 32 }}>⚠️</div>
        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          Could not connect to the backend
        </div>
        <div style={{ color: 'var(--text-muted)', maxWidth: 400 }}>{error}</div>
        <button
          className="btn btn-primary"
          style={{ marginTop: 8 }}
          onClick={fetchExpenses}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Navbar pageTitle={pageTitle} />
        <main className="app-content">
          <Routes>
            <Route
              path="/"
              element={<DashboardPage expenses={expenses} />}
            />
            <Route
              path="/expenses"
              element={
                <ExpensesPage
                  expenses={expenses}
                  onAdd={handleAdd}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              }
            />
            <Route
              path="/reports"
              element={<ReportsPage expenses={expenses} />}
            />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Outer component wraps everything in BrowserRouter
export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
