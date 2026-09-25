# =============================================================
# app/models/expense_model.py
#
# SQLAlchemy ORM model for the Expenses table.
#
# This Python class is the bridge between Python code and
# the SQL Server database table.
#
# How it works:
#   - The class inherits from Base (defined in database.py)
#   - Each class attribute is a mapped_column() that maps to
#     a column in the SQL Server Expenses table
#   - SQLAlchemy uses this class to build INSERT, SELECT,
#     UPDATE, and DELETE SQL statements automatically
#
# Comparison:
#   SQL Server:    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY
#   SQLAlchemy:    id = mapped_column(Integer, primary_key=True, autoincrement=True)
#
# Important: The column names here MUST match the SQL Server table.
# If you rename a column here, queries will break.
# =============================================================

from datetime import datetime, date
from sqlalchemy import Integer, String, Numeric, Date, DateTime, Text
from sqlalchemy.orm import mapped_column, Mapped
from typing import Optional

from app.database.database import Base


class Expense(Base):
    """
    SQLAlchemy model for the dbo.Expenses table in ExpenseAnalyzerDB.

    Field mapping (Python → SQL Server):
      id            → Id              INT IDENTITY(1,1) PRIMARY KEY
      description   → Description     NVARCHAR(200) NOT NULL
      amount        → Amount          DECIMAL(10,2) NOT NULL
      category      → Category        NVARCHAR(50) NOT NULL
      expense_date  → ExpenseDate     DATE NOT NULL
      payment_method → PaymentMethod  NVARCHAR(50) NOT NULL
      notes         → Notes           NVARCHAR(500) NULL
      created_at    → CreatedAt       DATETIME2 NOT NULL
      updated_at    → UpdatedAt       DATETIME2 NOT NULL
    """

    # __tablename__ tells SQLAlchemy which table this class maps to
    __tablename__ = "Expenses"

    # -----------------------------------------------------------------
    # Primary Key
    #
    # primary_key=True — this is the table's primary key
    # autoincrement=True — SQL Server handles incrementing (IDENTITY)
    # Mapped[int] — tells Python type checkers this is always an int
    # -----------------------------------------------------------------
    id: Mapped[int] = mapped_column(
        "Id",                      # "Id" = the actual SQL Server column name
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    # -----------------------------------------------------------------
    # Description — required, max 200 chars
    # String(200) maps to NVARCHAR(200) via pyodbc
    # -----------------------------------------------------------------
    description: Mapped[str] = mapped_column(
        "Description",
        String(200),
        nullable=False,
    )

    # -----------------------------------------------------------------
    # Amount — required, decimal
    # Numeric(10, 2) maps to DECIMAL(10, 2) — exact decimal arithmetic
    # NEVER use Float for money — floating point imprecision causes bugs
    # -----------------------------------------------------------------
    amount: Mapped[float] = mapped_column(
        "Amount",
        Numeric(10, 2),
        nullable=False,
    )

    # -----------------------------------------------------------------
    # Category — required
    # -----------------------------------------------------------------
    category: Mapped[str] = mapped_column(
        "Category",
        String(50),
        nullable=False,
    )

    # -----------------------------------------------------------------
    # ExpenseDate — the date of the expense (date only, no time)
    # Date maps to SQL Server DATE type
    # Python type: datetime.date  (not datetime.datetime)
    # -----------------------------------------------------------------
    expense_date: Mapped[date] = mapped_column(
        "ExpenseDate",
        Date,
        nullable=False,
    )

    # -----------------------------------------------------------------
    # PaymentMethod — UPI, Card, Cash, Net Banking, Other
    # -----------------------------------------------------------------
    payment_method: Mapped[str] = mapped_column(
        "PaymentMethod",
        String(50),
        nullable=False,
    )

    # -----------------------------------------------------------------
    # Notes — optional, may be None/NULL
    # Optional[str] tells Python type checkers this can be None
    # -----------------------------------------------------------------
    notes: Mapped[Optional[str]] = mapped_column(
        "Notes",
        String(500),
        nullable=True,
    )

    # -----------------------------------------------------------------
    # CreatedAt — set once when the record is first created
    # default=datetime.now — SQLAlchemy sets this on INSERT
    # (SQL Server also has DEFAULT GETDATE() as a fallback)
    # -----------------------------------------------------------------
    created_at: Mapped[datetime] = mapped_column(
        "CreatedAt",
        DateTime,
        nullable=False,
        default=datetime.now,
    )

    # -----------------------------------------------------------------
    # UpdatedAt — updated every time the record is modified
    # default=datetime.now — set on INSERT
    # onupdate=datetime.now — automatically updated on UPDATE
    # -----------------------------------------------------------------
    updated_at: Mapped[datetime] = mapped_column(
        "UpdatedAt",
        DateTime,
        nullable=False,
        default=datetime.now,
        onupdate=datetime.now,
    )

    def __repr__(self) -> str:
        """String representation for debugging — shown in logs/console."""
        return (
            f"<Expense id={self.id} "
            f"description='{self.description}' "
            f"amount={self.amount} "
            f"category='{self.category}'>"
        )
