// ============================================================
// src/services/expenseApi.ts
//
// Expense API service.
//
// DEMO MODE:
// The frontend can run independently without FastAPI/SQL Server.
// Data is stored in browser localStorage.
//
// REAL API MODE:
// Set VITE_USE_DEMO_DATA=false and provide VITE_API_BASE_URL.
// ============================================================

import type {
  Expense,
  ExpenseFormData,
  ExpenseSummary,
  CategorySummary,
  MonthlySummary,
  Category,
} from '../types/expense';
import { mockExpenses } from '../data/mockExpenses';

// ============================================================
// Configuration
// ============================================================

// Standalone mode: default to true unless VITE_USE_DEMO_DATA is explicitly set to 'false'
const DEMO_MODE =
  import.meta.env.VITE_USE_DEMO_DATA !== 'false';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

const STORAGE_KEY = 'expense-analyzer-demo-expenses';

// ============================================================
// DEMO DATA
// ============================================================

const INITIAL_EXPENSES: Expense[] = mockExpenses;

// ============================================================
// DEMO STORAGE HELPERS
// ============================================================

function getDemoExpenses(): Expense[] {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(INITIAL_EXPENSES)
    );

    return INITIAL_EXPENSES;
  }

  try {
    return JSON.parse(stored) as Expense[];
  } catch {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(INITIAL_EXPENSES)
    );

    return INITIAL_EXPENSES;
  }
}

function saveDemoExpenses(expenses: Expense[]): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(expenses)
  );
}

export function resetDemoExpenses(): Expense[] {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(INITIAL_EXPENSES)
  );
  return INITIAL_EXPENSES;
}

// ============================================================
// REAL API HELPER
// ============================================================

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Server error: ${response.status} ${response.statusText}`;

    try {
      const errorBody = await response.json();

      if (errorBody.detail) {
        if (typeof errorBody.detail === 'string') {
          message = errorBody.detail;
        } else if (Array.isArray(errorBody.detail)) {
          message = errorBody.detail[0]?.msg ?? message;
        }
      } else if (errorBody.message) {
        message = errorBody.message;
      }
    } catch {
      // Use default error message
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

interface RawListResponse {
  success: boolean;
  data: Expense[];
  total: number;
}

interface RawSingleResponse {
  success: boolean;
  data: Expense;
  message?: string;
}

interface RawSummaryResponse {
  totalExpense: number;
  thisMonth: number;
  highestCategory: string | null;
  transactionCount: number;
}

interface RawCategorySummaryResponse {
  data: Record<string, number>;
}

interface RawMonthlySummaryResponse {
  data: Record<string, number>;
}

// ============================================================
// GET EXPENSES
// ============================================================

export async function getExpenses(params?: {
  search?: string;
  category?: string;
  date_from?: string;
  date_to?: string;
}): Promise<Expense[]> {

  // -----------------------------
  // DEMO MODE
  // -----------------------------

  if (DEMO_MODE) {
    let expenses = getDemoExpenses();

    if (params?.search) {
      const search = params.search.toLowerCase();

      expenses = expenses.filter((expense) =>
        expense.description
          .toLowerCase()
          .includes(search)
      );
    }

    if (params?.category) {
      expenses = expenses.filter(
        (expense) =>
          expense.category === params.category
      );
    }

    if (params?.date_from) {
      expenses = expenses.filter(
        (expense) =>
          expense.date >= params.date_from!
      );
    }

    if (params?.date_to) {
      expenses = expenses.filter(
        (expense) =>
          expense.date <= params.date_to!
      );
    }

    return expenses.sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );
  }

  // -----------------------------
  // REAL API MODE
  // -----------------------------

  const query = new URLSearchParams();

  if (params?.search) {
    query.set('search', params.search);
  }

  if (params?.category) {
    query.set('category', params.category);
  }

  if (params?.date_from) {
    query.set('date_from', params.date_from);
  }

  if (params?.date_to) {
    query.set('date_to', params.date_to);
  }

  const queryString = query.toString();

  const path =
    `/api/expenses${queryString ? `?${queryString}` : ''}`;

  const raw =
    await apiFetch<RawListResponse>(path);

  return raw.data;
}

// ============================================================
// GET EXPENSE BY ID
// ============================================================

export async function getExpenseById(
  id: number
): Promise<Expense> {

  if (DEMO_MODE) {
    const expense = getDemoExpenses().find(
      (item) => item.id === id
    );

    if (!expense) {
      throw new Error('Expense not found');
    }

    return expense;
  }

  const raw =
    await apiFetch<RawSingleResponse>(
      `/api/expenses/${id}`
    );

  return raw.data;
}

// ============================================================
// CREATE EXPENSE
// ============================================================

export async function createExpense(
  data: ExpenseFormData
): Promise<Expense> {

  if (DEMO_MODE) {
    const expenses = getDemoExpenses();

    const now = new Date().toISOString();

    const newExpense: Expense = {
      ...data,
      id:
        expenses.length > 0
          ? Math.max(...expenses.map((e) => e.id)) + 1
          : 1,
      createdAt: now,
      updatedAt: now,
    };

    saveDemoExpenses([
      newExpense,
      ...expenses,
    ]);

    return newExpense;
  }

  const raw =
    await apiFetch<RawSingleResponse>(
      '/api/expenses',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

  return raw.data;
}

// ============================================================
// UPDATE EXPENSE
// ============================================================

export async function updateExpense(
  id: number,
  data: ExpenseFormData
): Promise<Expense> {

  if (DEMO_MODE) {
    const expenses = getDemoExpenses();

    const index = expenses.findIndex(
      (expense) => expense.id === id
    );

    if (index === -1) {
      throw new Error('Expense not found');
    }

    const updatedExpense: Expense = {
      ...expenses[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    expenses[index] = updatedExpense;

    saveDemoExpenses(expenses);

    return updatedExpense;
  }

  const raw =
    await apiFetch<RawSingleResponse>(
      `/api/expenses/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );

  return raw.data;
}

// ============================================================
// DELETE EXPENSE
// ============================================================

export async function deleteExpense(
  id: number
): Promise<void> {

  if (DEMO_MODE) {
    const expenses = getDemoExpenses();

    const filtered = expenses.filter(
      (expense) => expense.id !== id
    );

    saveDemoExpenses(filtered);

    return;
  }

  await apiFetch<RawSingleResponse>(
    `/api/expenses/${id}`,
    {
      method: 'DELETE',
    }
  );
}

// ============================================================
// SUMMARY
// ============================================================

export async function getExpenseSummary():
  Promise<ExpenseSummary> {

  if (DEMO_MODE) {
    const expenses = getDemoExpenses();

    const totalExpenses = expenses.reduce(
      (sum, expense) =>
        sum + expense.amount,
      0
    );

    const now = new Date();

    const currentMonthExpenses =
      expenses
        .filter((expense) => {
          const date = new Date(expense.date);

          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        })
        .reduce(
          (sum, expense) =>
            sum + expense.amount,
          0
        );

    const categoryTotals =
      expenses.reduce(
        (acc, expense) => {
          acc[expense.category] =
            (acc[expense.category] ?? 0) +
            expense.amount;

          return acc;
        },
        {} as Record<string, number>
      );

    const highestCategory =
      Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])[0]?.[0]
      ?? null;

    return {
      totalExpenses,
      currentMonthExpenses,
      highestCategory:
        highestCategory as Category | null,
      numberOfTransactions:
        expenses.length,
    };
  }

  const raw =
    await apiFetch<RawSummaryResponse>(
      '/api/expenses/summary'
    );

  return {
    totalExpenses: raw.totalExpense,
    currentMonthExpenses: raw.thisMonth,
    highestCategory:
      raw.highestCategory as Category | null,
    numberOfTransactions:
      raw.transactionCount,
  };
}

// ============================================================
// CATEGORY SUMMARY
// ============================================================

export async function getCategorySummary():
  Promise<CategorySummary[]> {

  if (DEMO_MODE) {
    const expenses = getDemoExpenses();

    const totals: Record<string, number> = {};

    expenses.forEach((expense) => {
      totals[expense.category] =
        (totals[expense.category] ?? 0) +
        expense.amount;
    });

    return Object.entries(totals)
      .map(([category, total]) => ({
        category: category as Category,
        total,
      }))
      .sort(
        (a, b) =>
          b.total - a.total
      );
  }

  const raw =
    await apiFetch<RawCategorySummaryResponse>(
      '/api/expenses/category-summary'
    );

  return Object.entries(raw.data)
    .map(([category, total]) => ({
      category: category as Category,
      total,
    }))
    .sort(
      (a, b) =>
        b.total - a.total
    );
}

// ============================================================
// MONTHLY SUMMARY
// ============================================================

export async function getMonthlySummary():
  Promise<MonthlySummary[]> {

  if (DEMO_MODE) {
    const expenses = getDemoExpenses();

    const monthlyTotals: Record<string, number> = {};

    expenses.forEach((expense) => {
      const date = new Date(expense.date);

      const key =
        `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, '0')}`;

      monthlyTotals[key] =
        (monthlyTotals[key] ?? 0) +
        expense.amount;
    });

    return Object.entries(monthlyTotals)
      .sort(([a], [b]) =>
        a.localeCompare(b)
      )
      .slice(-6)
      .map(([key, total]) => {
        const [year, month] =
          key.split('-').map(Number);

        const date =
          new Date(year, month - 1, 1);

        return {
          month:
            date.toLocaleString(
              'en-IN',
              { month: 'short' }
            ),
          total,
        };
      });
  }

  const raw =
    await apiFetch<RawMonthlySummaryResponse>(
      '/api/expenses/monthly-summary'
    );

  const entries =
    Object.entries(raw.data).map(
      ([monthLabel, total]) => {
        const date =
          new Date(monthLabel);

        return {
          monthLabel,
          total,
          date,
        };
      }
    );

  entries.sort(
    (a, b) =>
      a.date.getTime() -
      b.date.getTime()
  );

  return entries
    .slice(-6)
    .map(({ date, total }) => ({
      month:
        date.toLocaleString(
          'en-IN',
          { month: 'short' }
        ),
      total,
    }));
}