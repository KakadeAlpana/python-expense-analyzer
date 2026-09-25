// ============================================================
// src/components/FilterBar.tsx
//
// Search + filter controls for the Expenses page.
//
// Props:
//   search         — current search string
//   category       — selected category filter ("" = all)
//   dateFrom       — start date for date range filter
//   dateTo         — end date for date range filter
//   onSearchChange — callback when search text changes
//   onCategoryChange — callback when category filter changes
//   onDateFromChange — callback when start date changes
//   onDateToChange — callback when end date changes
//   onClear        — resets all filters
// ============================================================

import { Search, X } from 'lucide-react';
import { ALL_CATEGORIES } from '../types/expense';

interface FilterBarProps {
  search: string;
  category: string;
  dateFrom: string;
  dateTo: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClear: () => void;
}

export default function FilterBar({
  search,
  category,
  dateFrom,
  dateTo,
  onSearchChange,
  onCategoryChange,
  onDateFromChange,
  onDateToChange,
  onClear,
}: FilterBarProps) {
  // Determine if any filter is active (to show the Clear button)
  const hasActiveFilters = search || category || dateFrom || dateTo;

  return (
    <div className="filter-bar">
      {/* Search input */}
      <div className="search-input-wrap">
        <Search size={16} />
        <input
          id="expense-search"
          type="text"
          className="search-input"
          placeholder="Search by description..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Category dropdown */}
      <select
        id="filter-category"
        className="filter-select"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="">All Categories</option>
        {ALL_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Date from */}
      <input
        id="filter-date-from"
        type="date"
        className="filter-date"
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
        aria-label="From date"
      />

      {/* Date to */}
      <input
        id="filter-date-to"
        type="date"
        className="filter-date"
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
        aria-label="To date"
      />

      {/* Clear filters button — only shown when a filter is active */}
      {hasActiveFilters && (
        <button className="btn btn-secondary" onClick={onClear} id="clear-filters-btn">
          <X size={14} />
          Clear
        </button>
      )}
    </div>
  );
}
