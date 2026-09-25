// ============================================================
// src/types/expense.ts
//
// Central TypeScript type definitions for the Expense Analyzer.
//
// These types mirror the SQL Server database schema (Phase 3),
// so when we connect the backend (Phase 4), no changes needed.
// ============================================================

/**
 * Fixed set of expense categories.
 * Using a union type instead of an enum so it serializes cleanly to/from JSON.
 */
export type Category =
  | 'Food'
  | 'Travel'
  | 'Shopping'
  | 'Entertainment'
  | 'Bills'
  | 'Healthcare'
  | 'Other';

/**
 * Fixed set of payment methods.
 */
export type PaymentMethod = 'UPI' | 'Card' | 'Cash' | 'Net Banking' | 'Other';

/**
 * The core Expense entity — mirrors the DB Expenses table.
 */
export interface Expense {
  id: number;
  description: string;
  amount: number;           // stored in rupees, e.g. 500.00
  category: Category;
  date: string;             // ISO date: "2026-09-15"
  paymentMethod: PaymentMethod;
  notes?: string;           // optional field
  createdAt: string;        // ISO datetime: "2026-09-15T10:30:00"
  updatedAt: string;        // ISO datetime: "2026-09-15T10:30:00"
}

/**
 * Used when submitting the Add/Edit form.
 * We exclude id, createdAt, updatedAt — those are set by the backend (or mock logic).
 */
export type ExpenseFormData = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Dashboard summary statistics returned by GET /api/expenses/summary
 * (In Phase 1 we compute these from mock data; in Phase 4 from the API)
 */
export interface ExpenseSummary {
  totalExpenses: number;
  currentMonthExpenses: number;
  highestCategory: Category | null;
  numberOfTransactions: number;
}

/**
 * Category-wise expense total for the pie/donut chart.
 */
export interface CategorySummary {
  category: Category;
  total: number;
}

/**
 * Monthly expense total for the bar chart.
 */
export interface MonthlySummary {
  month: string;   // e.g. "Jan", "Feb"
  total: number;
}

/**
 * All available categories as a constant array.
 * Useful for populating dropdowns and chart colors.
 */
export const ALL_CATEGORIES: Category[] = [
  'Food',
  'Travel',
  'Shopping',
  'Entertainment',
  'Bills',
  'Healthcare',
  'Other',
];

/**
 * All available payment methods.
 */
export const ALL_PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Card',
  'Cash',
  'Net Banking',
  'Other',
];

/**
 * Color mapping for each category — used in charts and badges.
 */
export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#f97316',          // orange
  Travel: '#3b82f6',        // blue
  Shopping: '#a855f7',      // purple
  Entertainment: '#ec4899', // pink
  Bills: '#ef4444',         // red
  Healthcare: '#22c55e',    // green
  Other: '#94a3b8',         // slate
};
