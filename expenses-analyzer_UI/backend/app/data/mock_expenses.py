# =============================================================
# app/data/mock_expenses.py
#
# Temporary in-memory expense data for Phase 2.
#
# This acts as our "database" until we connect SQL Server in Phase 3.
# It is a Python list of dictionaries — similar to JSON objects.
#
# When Phase 3 arrives, we will:
#   1. Delete this file
#   2. Create a real SQL Server table
#   3. Use SQLAlchemy to query that table instead
# =============================================================

from datetime import datetime

# copy() is used in the service layer so callers get a snapshot,
# not a reference to the list that could be accidentally mutated.

MOCK_EXPENSES: list[dict] = [
    {
        "id": 1,
        "description": "Grocery Shopping",
        "amount": 850.00,
        "category": "Food",
        "date": "2026-09-15",
        "paymentMethod": "UPI",
        "notes": "Monthly grocery run at DMart",
        "createdAt": "2026-09-15T09:30:00",
        "updatedAt": "2026-09-15T09:30:00",
    },
    {
        "id": 2,
        "description": "Office Cab",
        "amount": 320.00,
        "category": "Travel",
        "date": "2026-09-16",
        "paymentMethod": "Card",
        "notes": "Ola cab to office",
        "createdAt": "2026-09-16T08:15:00",
        "updatedAt": "2026-09-16T08:15:00",
    },
    {
        "id": 3,
        "description": "New Clothes",
        "amount": 2400.00,
        "category": "Shopping",
        "date": "2026-09-16",
        "paymentMethod": "UPI",
        "notes": "Shirts and jeans from Myntra",
        "createdAt": "2026-09-16T15:00:00",
        "updatedAt": "2026-09-16T15:00:00",
    },
    {
        "id": 4,
        "description": "Movie Tickets",
        "amount": 600.00,
        "category": "Entertainment",
        "date": "2026-09-14",
        "paymentMethod": "Card",
        "notes": "Weekend movie with family",
        "createdAt": "2026-09-14T19:00:00",
        "updatedAt": "2026-09-14T19:00:00",
    },
    {
        "id": 5,
        "description": "Electricity Bill",
        "amount": 1200.00,
        "category": "Bills",
        "date": "2026-09-10",
        "paymentMethod": "Net Banking",
        "notes": "Monthly electricity payment",
        "createdAt": "2026-09-10T11:00:00",
        "updatedAt": "2026-09-10T11:00:00",
    },
    {
        "id": 6,
        "description": "Doctor Consultation",
        "amount": 500.00,
        "category": "Healthcare",
        "date": "2026-09-12",
        "paymentMethod": "Cash",
        "notes": "General checkup",
        "createdAt": "2026-09-12T10:30:00",
        "updatedAt": "2026-09-12T10:30:00",
    },
    {
        "id": 7,
        "description": "Restaurant Dinner",
        "amount": 1100.00,
        "category": "Food",
        "date": "2026-09-17",
        "paymentMethod": "UPI",
        "notes": "Team dinner at Barbeque Nation",
        "createdAt": "2026-09-17T21:00:00",
        "updatedAt": "2026-09-17T21:00:00",
    },
    {
        "id": 8,
        "description": "Metro Card Recharge",
        "amount": 200.00,
        "category": "Travel",
        "date": "2026-09-13",
        "paymentMethod": "UPI",
        "notes": None,
        "createdAt": "2026-09-13T07:45:00",
        "updatedAt": "2026-09-13T07:45:00",
    },
    {
        "id": 9,
        "description": "Internet Bill",
        "amount": 799.00,
        "category": "Bills",
        "date": "2026-09-05",
        "paymentMethod": "Net Banking",
        "notes": "Airtel broadband monthly bill",
        "createdAt": "2026-09-05T10:00:00",
        "updatedAt": "2026-09-05T10:00:00",
    },
    {
        "id": 10,
        "description": "Spotify Premium",
        "amount": 119.00,
        "category": "Entertainment",
        "date": "2026-09-01",
        "paymentMethod": "Card",
        "notes": "Monthly subscription",
        "createdAt": "2026-09-01T00:01:00",
        "updatedAt": "2026-09-01T00:01:00",
    },
    {
        "id": 11,
        "description": "Medicines",
        "amount": 380.00,
        "category": "Healthcare",
        "date": "2026-09-12",
        "paymentMethod": "Cash",
        "notes": "Pharmacy — post-doctor visit",
        "createdAt": "2026-09-12T11:30:00",
        "updatedAt": "2026-09-12T11:30:00",
    },
    {
        "id": 12,
        "description": "Stationery",
        "amount": 250.00,
        "category": "Other",
        "date": "2026-09-08",
        "paymentMethod": "Cash",
        "notes": "Notebook and pens",
        "createdAt": "2026-09-08T14:00:00",
        "updatedAt": "2026-09-08T14:00:00",
    },
]


def get_all_expenses() -> list[dict]:
    """
    Returns a copy of the full expense list.

    We return a copy (not the original list) so that callers cannot
    accidentally modify the global data directly.
    In Phase 3, this will be replaced by: db.query(Expense).all()
    """
    return MOCK_EXPENSES.copy()


def get_next_id() -> int:
    """
    Calculates the next available ID.
    Finds the maximum existing ID and adds 1.
    In Phase 3, SQL Server auto-increment handles this automatically.
    """
    if not MOCK_EXPENSES:
        return 1
    return max(expense["id"] for expense in MOCK_EXPENSES) + 1
