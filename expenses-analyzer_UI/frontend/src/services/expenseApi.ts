// ============================================================
// src/services/expenseApi.ts
//
// Central API service — the ONLY place the frontend talks to FastAPI.
//
// All components call functions from here.
// No component should ever construct its own fetch() URL.
//
// Backend base URL comes from the .env file:
//   VITE_API_BASE_URL=http://127.0.0.1:8000
//
// Response shape notes (why we transform some responses):
//   - /summary          → field names differ from frontend types → we map them
//   - /category-summary → returns a dict  { "Food": 850 }       → we convert to array
//   - /monthly-summary  → returns a dict  { "September 2026": 5320 } → we convert to array
//   - /expenses list    → wrapped in { success, data, total }   → we unwrap .data
// ============================================================

import type {
  Expense,
  ExpenseFormData,
  ExpenseSummary,
  CategorySummary,
  MonthlySummary,
  Category,
} from '../types/expense';

// ---- Base URL -------------------------------------------------------
// Read from Vite environment variable (set in .env)
// Falls back to 127.0.0.1:8000 for safety
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

// ---- Internal helper: handle HTTP errors ----------------------------

/**
 * Thin wrapper around fetch that:
 *   1. Adds Content-Type header for POST/PUT
 *   2. Throws a descriptive Error for non-2xx responses
 *   3. Returns the parsed JSON body
 */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    // Try to extract a message from the FastAPI error response
    let message = `Server error: ${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.json();
      // FastAPI validation errors come as { detail: [...] }
      if (errorBody.detail) {
        if (typeof errorBody.detail === 'string') {
          message = errorBody.detail;
        } else if (Array.isArray(errorBody.detail)) {
          // Pydantic validation errors: extract first message
          message = errorBody.detail[0]?.msg ?? message;
        }
      } else if (errorBody.message) {
        message = errorBody.message;
      }
    } catch {
      // Could not parse body — use the default message above
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

// ============================================================
// Shape of raw API responses (before transformation)
// ============================================================

// Backend wrapper for list responses
interface RawListResponse {
  success: boolean;
  data: Expense[];
  total: number;
}

// Backend wrapper for single-expense responses
interface RawSingleResponse {
  success: boolean;
  data: Expense;
  message?: string;
}

// Backend summary — field names differ from the frontend type
interface RawSummaryResponse {
  totalExpense: number;       // ← maps to totalExpenses
  thisMonth: number;          // ← maps to currentMonthExpenses
  highestCategory: string | null;
  transactionCount: number;   // ← maps to numberOfTransactions
}

// Backend category-summary — dict, not array
interface RawCategorySummaryResponse {
  data: Record<string, number>;  // e.g. { "Food": 850, "Travel": 320 }
}

// Backend monthly-summary — dict, not array
interface RawMonthlySummaryResponse {
  data: Record<string, number>;  // e.g. { "September 2026": 5320 }
}

// ============================================================
// Exported API functions
// ============================================================

// ----------------------------------------------------------
// GET /api/expenses
// Supports optional query parameters for server-side filtering.
// ----------------------------------------------------------
export async function getExpenses(params?: {
  search?: string;
  category?: string;
  date_from?: string;
  date_to?: string;
}): Promise<Expense[]> {
  // Build query string — only include non-empty values
  const query = new URLSearchParams();
  if (params?.search)    query.set('search',    params.search);
  if (params?.category)  query.set('category',  params.category);
  if (params?.date_from) query.set('date_from', params.date_from);
  if (params?.date_to)   query.set('date_to',   params.date_to);

  const queryString = query.toString();
  const path = `/api/expenses${queryString ? `?${queryString}` : ''}`;

  const raw = await apiFetch<RawListResponse>(path);
  return raw.data;
}

// ----------------------------------------------------------
// GET /api/expenses/{id}
// ----------------------------------------------------------
export async function getExpenseById(id: number): Promise<Expense> {
  const raw = await apiFetch<RawSingleResponse>(`/api/expenses/${id}`);
  return raw.data;
}

// ----------------------------------------------------------
// POST /api/expenses
// Creates a new expense. Returns the created expense from DB.
// ----------------------------------------------------------
export async function createExpense(data: ExpenseFormData): Promise<Expense> {
  const raw = await apiFetch<RawSingleResponse>('/api/expenses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return raw.data;
}

// ----------------------------------------------------------
// PUT /api/expenses/{id}
// Updates an existing expense. Returns the updated expense.
// ----------------------------------------------------------
export async function updateExpense(
  id: number,
  data: ExpenseFormData
): Promise<Expense> {
  const raw = await apiFetch<RawSingleResponse>(`/api/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return raw.data;
}

// ----------------------------------------------------------
// DELETE /api/expenses/{id}
// Deletes an expense from the database.
// ----------------------------------------------------------
export async function deleteExpense(id: number): Promise<void> {
  await apiFetch<RawSingleResponse>(`/api/expenses/${id}`, {
    method: 'DELETE',
  });
}

// ----------------------------------------------------------
// GET /api/expenses/summary
//
// Backend returns:  { totalExpense, thisMonth, highestCategory, transactionCount }
// Frontend expects: { totalExpenses, currentMonthExpenses, highestCategory, numberOfTransactions }
//
// We map the field names here so the frontend types stay clean.
// ----------------------------------------------------------
export async function getExpenseSummary(): Promise<ExpenseSummary> {
  const raw = await apiFetch<RawSummaryResponse>('/api/expenses/summary');

  return {
    totalExpenses:          raw.totalExpense,
    currentMonthExpenses:   raw.thisMonth,
    highestCategory:        raw.highestCategory as Category | null,
    numberOfTransactions:   raw.transactionCount,
  };
}

// ----------------------------------------------------------
// GET /api/expenses/category-summary
//
// Backend returns:  { "data": { "Food": 850, "Travel": 320 } }
// Frontend expects: [{ category: "Food", total: 850 }, ...]
//
// We convert the dict → sorted array here.
// ----------------------------------------------------------
export async function getCategorySummary(): Promise<CategorySummary[]> {
  const raw = await apiFetch<RawCategorySummaryResponse>(
    '/api/expenses/category-summary'
  );

  return Object.entries(raw.data)
    .map(([category, total]) => ({
      category: category as Category,
      total,
    }))
    .sort((a, b) => b.total - a.total); // descending by spend
}

// ----------------------------------------------------------
// GET /api/expenses/monthly-summary
//
// Backend returns:  { "data": { "September 2026": 5320.0, "August 2026": 1800.0 } }
// Frontend expects: [{ month: "Sep", total: 5320 }, ...]
//
// We convert the dict → chronologically-sorted array with short month labels.
// ----------------------------------------------------------
export async function getMonthlySummary(): Promise<MonthlySummary[]> {
  const raw = await apiFetch<RawMonthlySummaryResponse>(
    '/api/expenses/monthly-summary'
  );

  // Parse "September 2026" → Date object for sorting
  const entries = Object.entries(raw.data).map(([monthLabel, total]) => {
    const date = new Date(`${monthLabel}`); // "September 2026" is parseable
    return { monthLabel, total, date };
  });

  // Sort chronologically (oldest first)
  entries.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Take last 6 months and produce short label ("Sep")
  return entries.slice(-6).map(({ date, total }) => ({
    month: date.toLocaleString('en-IN', { month: 'short' }), // "Sep"
    total,
  }));
}
