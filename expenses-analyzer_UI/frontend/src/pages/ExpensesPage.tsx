// ============================================================
// src/pages/ExpensesPage.tsx
//
// Full expense management page.
// Includes: FilterBar, ExpenseTable, Add/Edit Modal, Delete Confirm.
//
// Phase 4 changes:
//   - Filtering is now done on the backend (GET /api/expenses?search=...)
//   - onAdd/onUpdate/onDelete are async (they call the API in App.tsx)
//   - Added loading and error states
//   - onRefresh prop allows filter changes to re-fetch from backend
//
// What did NOT change:
//   - FilterBar component and props (identical)
//   - Modal structure (identical)
//   - ExpenseForm usage (identical)
//   - Delete confirmation dialog (identical)
//   - All CSS class names (identical)
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import FilterBar from '../components/FilterBar';
import ExpenseTable from '../components/ExpenseTable';
import Modal from '../components/Modal';
import ExpenseForm from '../components/ExpenseForm';
import type { Expense, ExpenseFormData } from '../types/expense';
import { formatCurrency } from '../utils/formatters';
import { getExpenses } from '../services/expenseApi';

interface ExpensesPageProps {
  expenses: Expense[];          // full unfiltered list from App.tsx (used for total count)
  onAdd: (data: ExpenseFormData) => Promise<void>;
  onUpdate: (id: number, data: ExpenseFormData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function ExpensesPage({
  expenses,
  onAdd,
  onUpdate,
  onDelete,
}: ExpensesPageProps) {
  // ---- Filter state ----
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // ---- Filtered expenses (fetched from backend) ----
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>(expenses);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- Modal state ----
  type ModalMode = 'add' | 'edit' | 'delete' | null;
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ---- Backend filtering ----
  // Debounce ref: avoids sending a request on every keystroke for the search field
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchFiltered = useCallback(async (
    searchVal: string,
    categoryVal: string,
    dateFromVal: string,
    dateToVal: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExpenses({
        search:    searchVal   || undefined,
        category:  categoryVal || undefined,
        date_from: dateFromVal || undefined,
        date_to:   dateToVal   || undefined,
      });
      setFilteredExpenses(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load expenses.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch when any filter value changes (with 300ms debounce for search)
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchFiltered(search, category, dateFrom, dateTo);
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search, category, dateFrom, dateTo, fetchFiltered]);

  // When App.tsx refreshes the global list (after add/edit/delete),
  // also re-fetch the filtered view so the table stays in sync.
  // We track the expenses array length to detect a refresh.
  const prevExpensesLength = useRef(expenses.length);
  useEffect(() => {
    if (prevExpensesLength.current !== expenses.length) {
      prevExpensesLength.current = expenses.length;
      fetchFiltered(search, category, dateFrom, dateTo);
    }
  }, [expenses.length, search, category, dateFrom, dateTo, fetchFiltered]);

  // ---- Handlers ----
  function handleAdd() {
    setSubmitError(null);
    setSelectedExpense(null);
    setModalMode('add');
  }

  function handleEdit(expense: Expense) {
    setSubmitError(null);
    setSelectedExpense(expense);
    setModalMode('edit');
  }

  function handleDeleteClick(expense: Expense) {
    setSubmitError(null);
    setSelectedExpense(expense);
    setModalMode('delete');
  }

  async function handleFormSubmit(data: ExpenseFormData) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (modalMode === 'add') {
        await onAdd(data);
      } else if (modalMode === 'edit' && selectedExpense) {
        await onUpdate(selectedExpense.id, data);
      }
      // After successful API call, App.tsx has refreshed expenses.
      // We also re-fetch the filtered view:
      await fetchFiltered(search, category, dateFrom, dateTo);
      setModalMode(null);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to save expense.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!selectedExpense) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onDelete(selectedExpense.id);
      await fetchFiltered(search, category, dateFrom, dateTo);
      setModalMode(null);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to delete expense.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleCloseModal() {
    setModalMode(null);
    setSelectedExpense(null);
    setSubmitError(null);
  }

  function handleClearFilters() {
    setSearch('');
    setCategory('');
    setDateFrom('');
    setDateTo('');
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Expenses</h2>
          <p className="page-subtitle">
            {filteredExpenses.length} of {expenses.length} transactions
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd} id="add-expense-btn">
          <Plus size={16} />
          Add Expense
        </button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        search={search}
        category={category}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onClear={handleClearFilters}
      />

      {/* Expense Table */}
      <div className="table-card">
        <div className="table-card-header">
          <span className="table-card-title">All Expenses</span>
          <span className="table-count">{filteredExpenses.length} entries</span>
        </div>

        {/* Loading state */}
        {loading && (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            Loading...
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            style={{
              padding: '32px',
              textAlign: 'center',
              color: 'var(--danger)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <ExpenseTable
            expenses={filteredExpenses}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        )}
      </div>

      {/* Add / Edit Modal */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <Modal
          isOpen
          onClose={handleCloseModal}
          title={modalMode === 'add' ? 'Add New Expense' : 'Edit Expense'}
        >
          {/* Show API error if form submission failed */}
          {submitError && (
            <div
              style={{
                margin: '0 var(--space-5)',
                marginTop: 'var(--space-4)',
                padding: 'var(--space-3) var(--space-4)',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid var(--danger)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              ⚠️ {submitError}
            </div>
          )}
          <ExpenseForm
            initialData={
              modalMode === 'edit' && selectedExpense
                ? {
                    description:   selectedExpense.description,
                    amount:        selectedExpense.amount,
                    category:      selectedExpense.category,
                    date:          selectedExpense.date,
                    paymentMethod: selectedExpense.paymentMethod,
                    notes:         selectedExpense.notes,
                  }
                : undefined
            }
            onSubmit={handleFormSubmit}
            onCancel={handleCloseModal}
            submitting={submitting}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {modalMode === 'delete' && selectedExpense && (
        <Modal isOpen onClose={handleCloseModal} title="Delete Expense">
          <div className="confirm-dialog">
            <div className="confirm-icon">
              <AlertTriangle size={26} />
            </div>
            <div className="confirm-title">Delete this expense?</div>
            <div className="confirm-subtitle">
              <strong style={{ color: 'var(--text-primary)' }}>
                {selectedExpense.description}
              </strong>{' '}
              — {formatCurrency(selectedExpense.amount)}
              <br />
              This action cannot be undone.
            </div>
            {submitError && (
              <div
                style={{
                  color: 'var(--danger)',
                  fontSize: 'var(--font-size-sm)',
                  marginTop: 8,
                }}
              >
                ⚠️ {submitError}
              </div>
            )}
            <div className="confirm-actions">
              <button
                className="btn btn-secondary"
                onClick={handleCloseModal}
                id="cancel-delete-btn"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{
                  backgroundColor: 'var(--danger)',
                  borderColor: 'var(--danger)',
                  opacity: submitting ? 0.7 : 1,
                }}
                onClick={handleConfirmDelete}
                id="confirm-delete-btn"
                disabled={submitting}
              >
                {submitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
