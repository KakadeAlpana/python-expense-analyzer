# =============================================================
# app/schemas/expense_schema.py
#
# Pydantic models (schemas) for the Expense API.
#
# These are different from database models (Phase 3).
# Schemas define the SHAPE of data that goes IN and OUT of the API:
#   - Request body validation  (what the client sends)
#   - Response serialization   (what the API returns)
#
# Pydantic automatically:
#   1. Validates field types (e.g. amount must be a number, not a string)
#   2. Returns a clear 422 error if required fields are missing
#   3. Converts Python objects to JSON for the response
#
# Comparison with the TypeScript frontend:
#   TypeScript:  interface Expense { id: number; description: string; ... }
#   Python:      class ExpenseResponse(BaseModel): id: int; description: str
# =============================================================

from pydantic import BaseModel, Field
from typing import Optional


# Valid categories — matches the frontend TypeScript union type exactly
VALID_CATEGORIES = [
    "Food",
    "Travel",
    "Shopping",
    "Entertainment",
    "Bills",
    "Healthcare",
    "Other",
]

# Valid payment methods
VALID_PAYMENT_METHODS = [
    "UPI",
    "Card",
    "Cash",
    "Net Banking",
    "Other",
]


# -------------------------------------------------------------
# ExpenseCreate — used for POST /api/expenses (creating)
#
# The client sends this. Notice: no id, createdAt, updatedAt.
# Those are set by the server (or database in Phase 3).
# -------------------------------------------------------------
class ExpenseCreate(BaseModel):
    # Field(...) means required — the "..." is Python's way of saying "no default"
    # gt=0 means "greater than 0" — Pydantic enforces this automatically
    description: str = Field(..., min_length=1, max_length=200, description="Expense description")
    amount: float = Field(..., gt=0, description="Amount in rupees, must be greater than 0")
    category: str = Field(..., description="Expense category")
    date: str = Field(..., description="Expense date in YYYY-MM-DD format")
    paymentMethod: str = Field(..., description="Payment method used")

    # Optional[str] means this field can be a string OR None
    # The default is None — so the client does not need to send it
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")


# -------------------------------------------------------------
# ExpenseUpdate — used for PUT /api/expenses/{id} (updating)
#
# All fields are Optional here because the client may only
# want to update some fields, not all of them.
# -------------------------------------------------------------
class ExpenseUpdate(BaseModel):
    description: Optional[str] = Field(None, min_length=1, max_length=200)
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = None
    date: Optional[str] = None
    paymentMethod: Optional[str] = None
    notes: Optional[str] = Field(None, max_length=500)


# -------------------------------------------------------------
# ExpenseResponse — shape of each expense returned by the API
#
# This is what the API sends back to the client (React frontend).
# It matches the TypeScript Expense interface in the frontend exactly.
# -------------------------------------------------------------
class ExpenseResponse(BaseModel):
    id: int
    description: str
    amount: float
    category: str
    date: str
    paymentMethod: str
    notes: Optional[str] = None
    createdAt: str
    updatedAt: str


# -------------------------------------------------------------
# Standard API response wrappers
#
# Instead of returning raw data, we wrap responses in a consistent
# structure. This makes error handling easier on the frontend.
#
# Success:  { "success": true, "data": [...] }
# Error:    { "success": false, "message": "Expense not found" }
# -------------------------------------------------------------
class ApiResponse(BaseModel):
    """Generic success response wrapper."""
    success: bool = True
    message: Optional[str] = None


class ExpenseListResponse(ApiResponse):
    """Response for GET /api/expenses — returns a list of expenses."""
    data: list[ExpenseResponse]
    total: int  # total count of expenses returned


class ExpenseSingleResponse(ApiResponse):
    """Response for GET /api/expenses/{id} — returns one expense."""
    data: ExpenseResponse


# -------------------------------------------------------------
# Summary schemas — for the dashboard summary endpoint
# -------------------------------------------------------------
class SummaryResponse(BaseModel):
    totalExpense: float
    thisMonth: float
    highestCategory: Optional[str]
    transactionCount: int


class CategorySummaryResponse(BaseModel):
    """Maps category name to total amount. e.g. {"Food": 800.0, "Travel": 320.0}"""
    data: dict[str, float]


class MonthlySummaryResponse(BaseModel):
    """Maps month name to total amount. e.g. {"September": 5320.0}"""
    data: dict[str, float]
