// ============================================================
// src/components/ExpenseForm.tsx
//
// Add / Edit expense form rendered inside the Modal.
//
// Key concepts used:
//   - Controlled inputs: value + onChange make React own the input state
//   - Simple form validation before submit
//   - TypeScript: ExpenseFormData ensures all fields match the Expense type
//
// Props:
//   initialData  — pre-fills fields when editing an existing expense
//   onSubmit     — called with validated form data
//   onCancel     — called when Cancel is clicked
// ============================================================

import { useState } from 'react';
import type { ExpenseFormData } from '../types/expense';
import { ALL_CATEGORIES, ALL_PAYMENT_METHODS } from '../types/expense';

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => void;
  onCancel: () => void;
  /** When true, the Save button is disabled and shows 'Saving...' */
  submitting?: boolean;
}

// Empty form state — also used to reset the form
const EMPTY_FORM: ExpenseFormData = {
  description: '',
  amount: 0,
  category: 'Food',
  date: new Date().toISOString().split('T')[0], // today's date in "yyyy-MM-dd"
  paymentMethod: 'UPI',
  notes: '',
};

export default function ExpenseForm({ initialData, onSubmit, onCancel, submitting = false }: ExpenseFormProps) {
  // Merge initialData (for edit mode) over the empty defaults
  const [formData, setFormData] = useState<ExpenseFormData>({
    ...EMPTY_FORM,
    ...initialData,
  });

  // Field-level validation error messages
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormData, string>>>({});

  // Generic change handler — works for all input/select fields
  // "keyof ExpenseFormData" ensures only valid field names are accepted
  function handleChange(
    field: keyof ExpenseFormData,
    value: string | number
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear the error for this field as soon as the user edits it
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  // Validate all required fields before submitting
  function validate(): boolean {
    const newErrors: Partial<Record<keyof ExpenseFormData, string>> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required.';
    }
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than ₹0.';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required.';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required.';
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required.';
    }

    setErrors(newErrors);
    // Returns true only if there are zero errors
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // prevent browser page reload
    if (validate()) {
      onSubmit(formData);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="modal-body">
        <div className="form-grid">

          {/* Description */}
          <div className="form-group full-width">
            <label htmlFor="expense-description" className="form-label">
              Description <span className="required">*</span>
            </label>
            <input
              id="expense-description"
              type="text"
              className={`form-input ${errors.description ? 'error' : ''}`}
              placeholder="e.g. Grocery Shopping"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              maxLength={200}
            />
            {errors.description && (
              <span className="form-error">{errors.description}</span>
            )}
          </div>

          {/* Amount */}
          <div className="form-group">
            <label htmlFor="expense-amount" className="form-label">
              Amount (₹) <span className="required">*</span>
            </label>
            <input
              id="expense-amount"
              type="number"
              className={`form-input ${errors.amount ? 'error' : ''}`}
              placeholder="0"
              min="1"
              step="0.01"
              value={formData.amount || ''}
              onChange={(e) =>
                handleChange('amount', parseFloat(e.target.value) || 0)
              }
            />
            {errors.amount && (
              <span className="form-error">{errors.amount}</span>
            )}
          </div>

          {/* Date */}
          <div className="form-group">
            <label htmlFor="expense-date" className="form-label">
              Date <span className="required">*</span>
            </label>
            <input
              id="expense-date"
              type="date"
              className={`form-input ${errors.date ? 'error' : ''}`}
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
            />
            {errors.date && (
              <span className="form-error">{errors.date}</span>
            )}
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="expense-category" className="form-label">
              Category <span className="required">*</span>
            </label>
            <select
              id="expense-category"
              className={`form-select ${errors.category ? 'error' : ''}`}
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="form-error">{errors.category}</span>
            )}
          </div>

          {/* Payment Method */}
          <div className="form-group">
            <label htmlFor="expense-payment" className="form-label">
              Payment Method <span className="required">*</span>
            </label>
            <select
              id="expense-payment"
              className={`form-select ${errors.paymentMethod ? 'error' : ''}`}
              value={formData.paymentMethod}
              onChange={(e) => handleChange('paymentMethod', e.target.value)}
            >
              {ALL_PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            {errors.paymentMethod && (
              <span className="form-error">{errors.paymentMethod}</span>
            )}
          </div>

          {/* Notes (optional) */}
          <div className="form-group full-width">
            <label htmlFor="expense-notes" className="form-label">
              Notes <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              id="expense-notes"
              className="form-textarea"
              placeholder="Any additional details..."
              value={formData.notes ?? ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

        </div>
      </div>

      {/* Footer with Cancel / Save */}
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          id="cancel-expense-btn"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          id="save-expense-btn"
          disabled={submitting}
          style={{ opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? 'Saving...' : 'Save Expense'}
        </button>
      </div>
    </form>
  );
}
