// ============================================================
// src/components/ExpenseTable.tsx
//
// Full expense table with Edit and Delete actions per row.
//
// Props:
//   expenses  — the filtered list of expenses to display
//   onEdit    — called with the expense to edit
//   onDelete  — called with the expense to delete
// ============================================================

import { Pencil, Trash2, Receipt } from 'lucide-react';
import type { Expense } from '../types/expense';
import { CATEGORY_COLORS } from '../types/expense';
import { formatCurrency, formatDate } from '../utils/formatters';

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export default function ExpenseTable({ expenses, onEdit, onDelete }: ExpenseTableProps) {
  // Empty state — shown when no expenses match the current filters
  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <Receipt size={24} />
        </div>
        <div className="empty-state-title">No expenses found</div>
        <div className="empty-state-sub">
          Try adjusting your filters, or add a new expense.
        </div>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="expense-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Payment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              {/* Date */}
              <td style={{ whiteSpace: 'nowrap' }}>{formatDate(expense.date)}</td>

              {/* Description + optional notes tooltip */}
              <td className="description">
                <div>{expense.description}</div>
                {expense.notes && (
                  <div
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--text-muted)',
                      marginTop: 2,
                    }}
                  >
                    {expense.notes}
                  </div>
                )}
              </td>

              {/* Category badge */}
              <td>
                <span
                  className="category-badge"
                  style={{
                    backgroundColor: `${CATEGORY_COLORS[expense.category]}20`,
                    color: CATEGORY_COLORS[expense.category],
                    border: `1px solid ${CATEGORY_COLORS[expense.category]}40`,
                  }}
                >
                  {expense.category}
                </span>
              </td>

              {/* Amount */}
              <td className="amount">{formatCurrency(expense.amount)}</td>

              {/* Payment method */}
              <td>
                <span className="payment-badge">{expense.paymentMethod}</span>
              </td>

              {/* Action buttons */}
              <td className="actions">
                <button
                  className="btn-icon edit"
                  onClick={() => onEdit(expense)}
                  aria-label={`Edit ${expense.description}`}
                  title="Edit expense"
                >
                  <Pencil size={15} />
                </button>
                <button
                  className="btn-icon delete"
                  onClick={() => onDelete(expense)}
                  aria-label={`Delete ${expense.description}`}
                  title="Delete expense"
                >
                  <Trash2 size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
