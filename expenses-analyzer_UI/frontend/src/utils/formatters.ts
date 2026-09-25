// ============================================================
// src/utils/formatters.ts
//
// Utility (helper) functions used across the application.
//
// Keeping formatting logic here means if the format changes,
// you only update one file instead of many components.
// ============================================================

import { format, parseISO, isThisMonth } from 'date-fns';
import type {
  Expense,
  Category,
  CategorySummary,
  MonthlySummary,
  ExpenseSummary,
} from '../types/expense';

// ----------------------------------------------------------
// Currency formatting
// ----------------------------------------------------------

/**
 * Formats a number as Indian Rupees.
 * Example: 1500 → "₹1,500"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ----------------------------------------------------------
// Date formatting
// ----------------------------------------------------------

/**
 * Formats an ISO date string for display in the expense table.
 * Example: "2026-09-15" → "15 Sep 2026"
 */
export function formatDate(isoDate: string): string {
  return format(parseISO(isoDate), 'dd MMM yyyy');
}

/**
 * Formats an ISO date string to short month name.
 * Example: "2026-09-15" → "Sep"
 */
export function formatMonth(isoDate: string): string {
  return format(parseISO(isoDate), 'MMM');
}

/**
 * Formats an ISO date string to "yyyy-MM" for grouping by month.
 * Example: "2026-09-15" → "2026-09"
 */
export function getMonthKey(isoDate: string): string {
  return format(parseISO(isoDate), 'yyyy-MM');
}

/**
 * Returns "Mon yyyy" label for a "yyyy-MM" key.
 * Example: "2026-09" → "Sep 2026"
 */
export function formatMonthLabel(monthKey: string): string {
  return format(parseISO(`${monthKey}-01`), 'MMM yyyy');
}

// ----------------------------------------------------------
// Expense calculation helpers
// ----------------------------------------------------------

/**
 * Computes the four summary metrics shown on the dashboard cards.
 * In Phase 4, this will be replaced by the /api/expenses/summary endpoint.
 */
export function computeSummary(expenses: Expense[]): ExpenseSummary {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const thisMonthTotal = expenses
    .filter((e) => isThisMonth(parseISO(e.date)))
    .reduce((sum, e) => sum + e.amount, 0);

  // Find the category with the highest cumulative spend
  const categoryTotals = computeCategorySummary(expenses);
  const highest =
    categoryTotals.length > 0
      ? categoryTotals.reduce((prev, curr) =>
          curr.total > prev.total ? curr : prev
        )
      : null;

  return {
    totalExpenses: total,
    currentMonthExpenses: thisMonthTotal,
    highestCategory: highest ? highest.category : null,
    numberOfTransactions: expenses.length,
  };
}

/**
 * Groups expenses by category and returns totals sorted descending.
 * Used for the donut chart.
 */
export function computeCategorySummary(expenses: Expense[]): CategorySummary[] {
  const totals: Partial<Record<Category, number>> = {};

  for (const expense of expenses) {
    totals[expense.category] = (totals[expense.category] ?? 0) + expense.amount;
  }

  return Object.entries(totals)
    .map(([cat, total]) => ({ category: cat as Category, total: total ?? 0 }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Groups expenses by month (last 6 months) and returns monthly totals.
 * Used for the bar chart.
 */
export function computeMonthlySummary(expenses: Expense[]): MonthlySummary[] {
  const totals: Record<string, number> = {};

  for (const expense of expenses) {
    const key = getMonthKey(expense.date);
    totals[key] = (totals[key] ?? 0) + expense.amount;
  }

  // Sort chronologically and take last 6 months
  return Object.entries(totals)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, total]) => ({
      month: format(parseISO(`${key}-01`), 'MMM'),
      total,
    }));
}

/**
 * Generates the next available ID for a mock expense list.
 * Not needed after Phase 4 (the DB handles IDs).
 */
export function generateNextId(expenses: Expense[]): number {
  if (expenses.length === 0) return 1;
  return Math.max(...expenses.map((e) => e.id)) + 1;
}
