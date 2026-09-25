# =============================================================
# app/services/expense_service.py
#
# Service Layer — business logic using SQLAlchemy + SQL Server.
#
# Phase 3 replaces all mock data operations with real database queries.
#
# Architecture:
#   Route → Service → SQLAlchemy ORM → SQL Server
#
# Each function receives a `db: Session` parameter.
# The session is created and closed by the get_db() dependency in
# database.py — routes don't manage the session lifecycle.
#
# SQLAlchemy ORM method reference:
#   db.query(Model).all()              → SELECT * FROM table
#   db.query(Model).filter(...).first() → SELECT ... WHERE ... (first result)
#   db.add(obj)                        → prepare INSERT
#   db.commit()                        → execute pending changes
#   db.refresh(obj)                    → reload obj from DB after INSERT/UPDATE
#   db.delete(obj)                     → prepare DELETE
# =============================================================

from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from fastapi import HTTPException, status

from app.models.expense_model import Expense
from app.schemas.expense_schema import (
    ExpenseCreate,
    ExpenseUpdate,
    VALID_CATEGORIES,
    VALID_PAYMENT_METHODS,
)


# =============================================================
# Helper: convert SQLAlchemy Expense object → dict for response
#
# Our API responses (Pydantic schemas) use camelCase field names
# (e.g. paymentMethod, expenseDate) matching the frontend.
# The SQLAlchemy model uses snake_case (e.g. payment_method, expense_date).
# This function bridges that gap.
# =============================================================
def _expense_to_dict(expense: Expense) -> dict:
    """
    Converts a SQLAlchemy Expense ORM object into a plain dictionary
    that matches our Pydantic ExpenseResponse schema.
    """
    return {
        "id": expense.id,
        "description": expense.description,
        "amount": float(expense.amount),        # Numeric → float for JSON
        "category": expense.category,
        "date": str(expense.expense_date),       # date → "YYYY-MM-DD" string
        "paymentMethod": expense.payment_method,
        "notes": expense.notes,
        "createdAt": expense.created_at.isoformat(timespec="seconds"),
        "updatedAt": expense.updated_at.isoformat(timespec="seconds"),
    }


# =============================================================
# READ Operations
# =============================================================

def get_all_expenses(
    db: Session,
    search: str | None = None,
    category: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
) -> list[dict]:
    """
    Returns all expenses from SQL Server with optional filters.

    SQLAlchemy builds the WHERE clause from the filter() calls.
    Equivalent SQL (with all filters active):
        SELECT * FROM Expenses
        WHERE (Description LIKE '%search%' OR Notes LIKE '%search%')
          AND Category = 'Food'
          AND ExpenseDate >= '2026-09-01'
          AND ExpenseDate <= '2026-09-30'
    """
    # Start a query — no WHERE clause yet
    query = db.query(Expense)

    # Apply search filter — ilike() is case-insensitive LIKE
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            Expense.description.ilike(search_pattern) |
            Expense.notes.ilike(search_pattern)
        )

    # Apply category filter — exact match
    if category:
        query = query.filter(Expense.category == category)

    # Apply date range filters
    if date_from:
        query = query.filter(Expense.expense_date >= date_from)

    if date_to:
        query = query.filter(Expense.expense_date <= date_to)

    # Execute query and get all results
    # .order_by() sorts newest expenses first
    expenses = query.order_by(Expense.expense_date.desc()).all()

    return [_expense_to_dict(e) for e in expenses]


def get_expense_by_id(db: Session, expense_id: int) -> dict:
    """
    Finds a single expense by primary key.

    db.get(Model, id) is the most efficient way to fetch by primary key —
    SQLAlchemy may use the session's identity map (in-memory cache)
    before hitting the database.

    Equivalent SQL: SELECT * FROM Expenses WHERE Id = :expense_id
    """
    expense = db.get(Expense, expense_id)

    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense with ID {expense_id} not found."
        )

    return _expense_to_dict(expense)


# =============================================================
# WRITE Operations
# =============================================================

def create_expense(db: Session, data: ExpenseCreate) -> dict:
    """
    Inserts a new expense into SQL Server.

    Steps:
      1. Validate category and payment method
      2. Create a SQLAlchemy Expense object
      3. db.add() — stage the INSERT
      4. db.commit() — execute the INSERT
      5. db.refresh() — reload the object (gets auto-generated id, timestamps)
      6. Return the new expense as a dict

    Equivalent SQL:
      INSERT INTO Expenses (Description, Amount, Category, ExpenseDate,
                            PaymentMethod, Notes, CreatedAt, UpdatedAt)
      VALUES (:description, :amount, :category, :date,
              :payment_method, :notes, GETDATE(), GETDATE())
    """
    if data.category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category '{data.category}'. Must be one of: {', '.join(VALID_CATEGORIES)}"
        )

    if data.paymentMethod not in VALID_PAYMENT_METHODS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid payment method '{data.paymentMethod}'. Must be one of: {', '.join(VALID_PAYMENT_METHODS)}"
        )

    now = datetime.now()

    # Create a new SQLAlchemy model instance — not yet saved to DB
    new_expense = Expense(
        description=data.description.strip(),
        amount=data.amount,
        category=data.category,
        expense_date=date.fromisoformat(data.date),    # "2026-09-19" → date object
        payment_method=data.paymentMethod,
        notes=data.notes,
        created_at=now,
        updated_at=now,
    )

    # Stage the INSERT — nothing written to DB yet
    db.add(new_expense)

    # Execute the INSERT and commit the transaction
    db.commit()

    # Reload the object from DB — this populates auto-generated fields
    # (id is assigned by SQL Server's IDENTITY column after INSERT)
    db.refresh(new_expense)

    return _expense_to_dict(new_expense)


def update_expense(db: Session, expense_id: int, data: ExpenseUpdate) -> dict:
    """
    Updates an existing expense by ID.

    model_dump(exclude_unset=True) returns only the fields the client sent.
    This allows partial updates — if the client only sends 'amount',
    only the amount column is updated.

    Equivalent SQL:
      UPDATE Expenses
      SET Amount = :amount, UpdatedAt = GETDATE()
      WHERE Id = :expense_id
    """
    expense = db.get(Expense, expense_id)

    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense with ID {expense_id} not found."
        )

    # Get only the fields that were actually sent in the request
    updates = data.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update."
        )

    # Validate if category or paymentMethod were included
    if "category" in updates and updates["category"] not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category '{updates['category']}'."
        )

    if "paymentMethod" in updates and updates["paymentMethod"] not in VALID_PAYMENT_METHODS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid payment method '{updates['paymentMethod']}'."
        )

    # Apply each update to the SQLAlchemy model object
    # setattr(obj, field_name, value) is Python's way of doing:
    #   obj.field_name = value
    # when the field name is a variable (not a literal string)
    field_map = {
        "description": "description",
        "amount": "amount",
        "category": "category",
        "date": "expense_date",           # API uses "date", model uses "expense_date"
        "paymentMethod": "payment_method",  # API camelCase → model snake_case
        "notes": "notes",
    }

    for api_field, model_field in field_map.items():
        if api_field in updates:
            value = updates[api_field]
            # Convert date string to Python date object
            if api_field == "date" and value:
                value = date.fromisoformat(value)
            setattr(expense, model_field, value)

    # Always update the timestamp
    expense.updated_at = datetime.now()

    # Commit the UPDATE to SQL Server
    db.commit()
    db.refresh(expense)

    return _expense_to_dict(expense)


def delete_expense(db: Session, expense_id: int) -> dict:
    """
    Deletes an expense from SQL Server.

    NOTE: This is a hard delete in Phase 3.
    If you want soft delete later, replace db.delete() with:
        expense.is_deleted = True
        db.commit()
    and add WHERE is_deleted = 0 to all SELECT queries.

    Equivalent SQL: DELETE FROM Expenses WHERE Id = :expense_id
    """
    expense = db.get(Expense, expense_id)

    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense with ID {expense_id} not found."
        )

    # Save a copy of the data before deleting (to return in response)
    expense_dict = _expense_to_dict(expense)

    # Stage the DELETE
    db.delete(expense)

    # Execute the DELETE
    db.commit()

    return expense_dict


# =============================================================
# Summary / Analytics
# =============================================================

def get_summary(db: Session) -> dict:
    """
    Computes the four dashboard summary metrics from SQL Server.

    Uses SQLAlchemy's func module for aggregate functions:
      func.sum() → SUM()
      func.count() → COUNT()
      func.max() → MAX()

    Equivalent SQL:
      SELECT
        SUM(Amount) AS totalExpense,
        COUNT(*) AS transactionCount
      FROM Expenses
    """
    from calendar import month_name as _month_name

    total = db.query(func.sum(Expense.amount)).scalar() or 0.0

    # Current month filter using Python date
    now = datetime.now()
    this_month_total = db.query(func.sum(Expense.amount)).filter(
        func.year(Expense.expense_date) == now.year,
        func.month(Expense.expense_date) == now.month,
    ).scalar() or 0.0

    count = db.query(func.count(Expense.id)).scalar() or 0

    # Find highest-spending category
    # GROUP BY Category, then get the one with the largest SUM
    category_result = (
        db.query(Expense.category, func.sum(Expense.amount).label("total"))
        .group_by(Expense.category)
        .order_by(func.sum(Expense.amount).desc())
        .first()
    )

    highest_category = category_result[0] if category_result else None

    return {
        "totalExpense": round(float(total), 2),
        "thisMonth": round(float(this_month_total), 2),
        "highestCategory": highest_category,
        "transactionCount": count,
    }


def get_category_summary(db: Session) -> dict[str, float]:
    """
    Returns total spend per category using GROUP BY.

    Equivalent SQL:
      SELECT Category, SUM(Amount) AS total
      FROM Expenses
      GROUP BY Category
      ORDER BY total DESC
    """
    results = (
        db.query(Expense.category, func.sum(Expense.amount).label("total"))
        .group_by(Expense.category)
        .order_by(func.sum(Expense.amount).desc())
        .all()
    )

    return {row.category: round(float(row.total), 2) for row in results}


def get_monthly_summary(db: Session) -> dict[str, float]:
    """
    Returns total spend per month using GROUP BY on year + month.

    Equivalent SQL:
      SELECT
        YEAR(ExpenseDate) AS yr,
        MONTH(ExpenseDate) AS mo,
        SUM(Amount) AS total
      FROM Expenses
      GROUP BY YEAR(ExpenseDate), MONTH(ExpenseDate)
      ORDER BY yr ASC, mo ASC
    """
    import calendar

    results = (
        db.query(
            func.year(Expense.expense_date).label("yr"),
            func.month(Expense.expense_date).label("mo"),
            func.sum(Expense.amount).label("total"),
        )
        .group_by(
            func.year(Expense.expense_date),
            func.month(Expense.expense_date),
        )
        .order_by(
            func.year(Expense.expense_date),
            func.month(Expense.expense_date),
        )
        .all()
    )

    monthly = {}
    for row in results:
        # Convert year + month number to "September 2026"
        month_label = f"{calendar.month_name[row.mo]} {row.yr}"
        monthly[month_label] = round(float(row.total), 2)

    return monthly
