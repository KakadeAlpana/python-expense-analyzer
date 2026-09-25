// ============================================================
// src/pages/ReportsPage.tsx
//
// Reports page — full-width charts for deeper analysis.
//
// Phase 4 changes:
//   - Summary strip uses GET /api/expenses/summary
//   - Category chart uses GET /api/expenses/category-summary
//   - Monthly chart uses GET /api/expenses/monthly-summary
//   - expenses[] prop kept only for the "Transactions" count column
//     in the breakdown table (count per category from local list)
//
// What did NOT change:
//   - All JSX structure
//   - All CSS class names
//   - CategoryChart, MonthlyChart components
//   - formatCurrency usage
// ============================================================

import { useState, useEffect } from 'react';
import CategoryChart from '../components/CategoryChart';
import MonthlyChart from '../components/MonthlyChart';
import type { Expense, ExpenseSummary, CategorySummary, MonthlySummary } from '../types/expense';
import { formatCurrency } from '../utils/formatters';
import {
  getExpenseSummary,
  getCategorySummary,
  getMonthlySummary,
} from '../services/expenseApi';

interface ReportsPageProps {
  expenses: Expense[];  // used only for per-category transaction count
}

export default function ReportsPage({ expenses }: ReportsPageProps) {
  // ---- API-driven state ----
  const [summary, setSummary]               = useState<ExpenseSummary>({
    totalExpenses: 0,
    currentMonthExpenses: 0,
    highestCategory: null,
    numberOfTransactions: 0,
  });
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [monthlySummary, setMonthlySummary]   = useState<MonthlySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReportData() {
      setLoading(true);
      try {
        const [summaryData, categoryData, monthlyData] = await Promise.all([
          getExpenseSummary(),
          getCategorySummary(),
          getMonthlySummary(),
        ]);
        setSummary(summaryData);
        setCategorySummary(categoryData);
        setMonthlySummary(monthlyData);
      } catch (err) {
        console.error('Reports data fetch failed:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReportData();
  }, [expenses.length]); // re-fetch when expense list changes

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Reports</h2>
          <p className="page-subtitle">Visual analysis of your spending patterns</p>
        </div>
      </div>

      {/* Summary strip */}
      <div
        className="table-card"
        style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-5)', display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}
      >
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Spend</div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
            {loading ? '—' : formatCurrency(summary.totalExpenses)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>This Month</div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: '#22c55e', marginTop: 4 }}>
            {loading ? '—' : formatCurrency(summary.currentMonthExpenses)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Highest Category</div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: '#a855f7', marginTop: 4 }}>
            {loading ? '—' : (summary.highestCategory ?? '—')}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Transactions</div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>
            {loading ? '—' : summary.numberOfTransactions}
          </div>
        </div>
      </div>

      {/* Charts side by side */}
      <div className="charts-grid">
        <CategoryChart data={categorySummary} />
        <MonthlyChart data={monthlySummary} />
      </div>

      {/* Category breakdown table */}
      <div className="table-card" style={{ marginTop: 'var(--space-5)' }}>
        <div className="table-card-header">
          <span className="table-card-title">Category Breakdown</span>
        </div>
        <table className="expense-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Transactions</th>
              <th>Total Amount</th>
              <th>% of Total</th>
            </tr>
          </thead>
          <tbody>
            {categorySummary.length === 0 ? (
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
                  {loading ? 'Loading...' : 'No data available.'}
                </td>
              </tr>
            ) : (
              categorySummary.map((row) => {
                // Count from the local expenses prop (loaded from DB via App.tsx)
                const count = expenses.filter((e) => e.category === row.category).length;
                const pct = summary.totalExpenses > 0
                  ? ((row.total / summary.totalExpenses) * 100).toFixed(1)
                  : '0';
                return (
                  <tr key={row.category}>
                    <td className="description">{row.category}</td>
                    <td>{count}</td>
                    <td className="amount">{formatCurrency(row.total)}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{pct}%</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
