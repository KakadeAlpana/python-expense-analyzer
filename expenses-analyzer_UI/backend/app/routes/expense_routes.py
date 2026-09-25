from fastapi import APIRouter, Query, status, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.expense_schema import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseListResponse,
    ExpenseSingleResponse,
    SummaryResponse,
    CategorySummaryResponse,
    MonthlySummaryResponse,
)

from app import services as svc


router = APIRouter(
    prefix="/api/expenses",
    tags=["Expenses"],
)


# =============================================================
# Summary routes
# =============================================================

@router.get(
    "/summary",
    response_model=SummaryResponse,
    summary="Get dashboard summary metrics",
)
def get_summary(
    db: Session = Depends(get_db),
):
    data = svc.expense_service.get_summary(db)

    return data


@router.get(
    "/category-summary",
    response_model=CategorySummaryResponse,
    summary="Get total spend by category",
)
def get_category_summary(
    db: Session = Depends(get_db),
):
    data = svc.expense_service.get_category_summary(db)

    return CategorySummaryResponse(data=data)


@router.get(
    "/monthly-summary",
    response_model=MonthlySummaryResponse,
    summary="Get total spend by month",
)
def get_monthly_summary(
    db: Session = Depends(get_db),
):
    data = svc.expense_service.get_monthly_summary(db)

    return MonthlySummaryResponse(data=data)


# =============================================================
# Get all expenses
# =============================================================

@router.get(
    "",
    response_model=ExpenseListResponse,
    summary="Get all expenses with optional filters",
)
def get_all_expenses(
    search: str | None = Query(
        None,
        description="Search in description or notes",
    ),
    category: str | None = Query(
        None,
        description="Filter by exact category name",
    ),
    date_from: str | None = Query(
        None,
        description="Filter from date (YYYY-MM-DD)",
    ),
    date_to: str | None = Query(
        None,
        description="Filter to date (YYYY-MM-DD)",
    ),
    db: Session = Depends(get_db),
):
    expenses = svc.expense_service.get_all_expenses(
        db,
        search=search,
        category=category,
        date_from=date_from,
        date_to=date_to,
    )

    return ExpenseListResponse(
        data=expenses,
        total=len(expenses),
    )


# =============================================================
# Get expense by ID
# =============================================================

@router.get(
    "/{expense_id}",
    response_model=ExpenseSingleResponse,
    summary="Get a single expense by ID",
)
def get_expense_by_id(
    expense_id: int,
    db: Session = Depends(get_db),
):
    expense = svc.expense_service.get_expense_by_id(
        db,
        expense_id,
    )

    return ExpenseSingleResponse(
        data=expense,
    )


# =============================================================
# Create expense
# =============================================================

@router.post(
    "",
    response_model=ExpenseSingleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new expense",
)
def create_expense(
    expense_data: ExpenseCreate,
    db: Session = Depends(get_db),
):
    new_expense = svc.expense_service.create_expense(
        db,
        expense_data,
    )

    return ExpenseSingleResponse(
        data=new_expense,
        message="Expense created successfully.",
    )


# =============================================================
# Update expense
# =============================================================

@router.put(
    "/{expense_id}",
    response_model=ExpenseSingleResponse,
    summary="Update an existing expense",
)
def update_expense(
    expense_id: int,
    expense_data: ExpenseUpdate,
    db: Session = Depends(get_db),
):
    updated = svc.expense_service.update_expense(
        db,
        expense_id,
        expense_data,
    )

    return ExpenseSingleResponse(
        data=updated,
        message="Expense updated successfully.",
    )


# =============================================================
# Delete expense
# =============================================================

@router.delete(
    "/{expense_id}",
    response_model=ExpenseSingleResponse,
    summary="Delete an expense",
)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
):
    deleted = svc.expense_service.delete_expense(
        db,
        expense_id,
    )

    return ExpenseSingleResponse(
        data=deleted,
        message="Expense deleted successfully.",
    )