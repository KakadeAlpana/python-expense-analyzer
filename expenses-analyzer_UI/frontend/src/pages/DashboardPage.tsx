// ============================================================
// src/pages/DashboardPage.tsx
//
// The main landing page — shows summary cards and charts.
//
// Phase 4 changes:
//   - Summary cards use GET /api/expenses/summary
//   - Category chart uses GET /api/expenses/category-summary
//   - Monthly chart uses GET /api/expenses/monthly-summary
//   - The "Recent Expenses" preview still uses expenses[] prop (last 5 rows)
//
// What did NOT change:
//   - All JSX structure
//   - All CSS class names
//   - DashboardCard, CategoryChart, MonthlyChart components
//   - formatCurrency usage
// ============================================================

import { useState, useEffect } from 'react';
import {
  IndianRupee,
  CalendarDays,
  Tag,
  Receipt,
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import CategoryChart from '../components/CategoryChart';
import MonthlyChart from '../components/MonthlyChart';
import type { Expense, ExpenseSummary, CategorySummary, MonthlySummary } from '../types/expense';
import { formatCurrency } from '../utils/formatters';
import {
  getExpenseSummary,
  getCategorySummary,
  getMonthlySummary,
} from '../services/expenseApi';

interface DashboardPageProps {
  expenses: Expense[];  // used only for "Recent Expenses" preview table (last 5)
}

export default function DashboardPage({ expenses }: DashboardPageProps) {
  // ---- API-driven state ----
  const [summary, setSummary] = useState<ExpenseSummary>({
    totalExpenses: 0,
    currentMonthExpenses: 0,
    highestCategory: null,
    numberOfTransactions: 0,
  });
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [monthlySummary, setMonthlySummary]   = useState<MonthlySummary[]>([]);
  const [loadingCharts, setLoadingCharts]     = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoadingCharts(true);
      try {
        // All three requests run in parallel for performance
        const [summaryData, categoryData, monthlyData] = await Promise.all([
          getExpenseSummary(),
          getCategorySummary(),
          getMonthlySummary(),
        ]);
        setSummary(summaryData);
        setCategorySummary(categoryData);
        setMonthlySummary(monthlyData);
      } catch (err) {
        // Dashboard still renders; data will just show zeroes/empty charts
        console.error('Dashboard data fetch failed:', err);
      } finally {
        setLoadingCharts(false);
      }
    }

    fetchDashboardData();
  }, [
    // Re-fetch whenever the global expense list changes (after add/edit/delete)
    // We use expenses.length as a lightweight signal that the DB changed
    expenses.length,
  ]);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Your expense overview at a glance</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-grid">
        <DashboardCard
          label="Total Expenses"
          value={loadingCharts ? '—' : formatCurrency(summary.totalExpenses)}
          subLabel={`${summary.numberOfTransactions} transactions`}
          icon={IndianRupee}
          accentColor="#3b82f6"
        />
        <DashboardCard
          label="This Month"
          value={loadingCharts ? '—' : formatCurrency(summary.currentMonthExpenses)}
          subLabel="Current month spending"
          icon={CalendarDays}
          accentColor="#22c55e"
        />
        <DashboardCard
          label="Highest Category"
          value={loadingCharts ? '—' : (summary.highestCategory ?? '—')}
          subLabel="Top spending category"
          icon={Tag}
          accentColor="#a855f7"
        />
        <DashboardCard
          label="Transactions"
          value={loadingCharts ? '—' : String(summary.numberOfTransactions)}
          subLabel="Total number of entries"
          icon={Receipt}
          accentColor="#f59e0b"
        />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <CategoryChart data={categorySummary} />
        <MonthlyChart data={monthlySummary} />
      </div>

      {/* Recent Expenses Preview — uses expenses[] prop (last 5, sorted by date) */}
      <div className="table-card">
        <div className="table-card-header">
          <span className="table-card-title">Recent Expenses</span>
          <span className="table-count">Last 5</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="expense-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      padding: '24px',
                      fontSize: 'var(--font-size-sm)',
                    }}
                  >
                    No expenses yet.
                  </td>
                </tr>
              ) : (
                [...expenses]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 5)
                  .map((expense) => (
                    <tr key={expense.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {new Date(expense.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="description">{expense.description}</td>
                      <td>
                        <span
                          className="category-badge"
                          style={{
                            backgroundColor: `${'#888'}20`,
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {expense.category}
                        </span>
                      </td>
                      <td className="amount">{formatCurrency(expense.amount)}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
