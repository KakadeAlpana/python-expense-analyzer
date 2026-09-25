# =============================================================
# app/database/database.py
#
# SQLAlchemy database configuration.
#
# This file is responsible for:
#   1. Reading the DATABASE_URL from the .env file
#   2. Creating the SQLAlchemy engine (connection pool)
#   3. Creating SessionLocal (factory for DB sessions)
#   4. Creating Base (parent class for all models)
#   5. Providing get_db() — a dependency that routes use
#
# Nothing in this file talks to the database yet —
# it only sets up the configuration. The actual connection
# happens when a route is called and get_db() is invoked.
# =============================================================

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# -------------------------------------------------------------
# Load environment variables from .env file
#
# load_dotenv() reads the .env file and puts each variable
# into os.environ so we can read them with os.getenv().
#
# Without this, os.getenv("DATABASE_URL") would return None.
# -------------------------------------------------------------
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. "
        "Please create a .env file based on .env.example."
    )

# -------------------------------------------------------------
# SQLAlchemy Engine
#
# The engine is the core of SQLAlchemy — it manages the
# connection pool to the database.
#
# Think of it as the "phone operator" that:
#   - Maintains a pool of open connections (so we don't
#     open a new connection on every request — expensive!)
#   - Translates Python method calls into SQL statements
#   - Sends those statements to SQL Server
#   - Returns results back to Python
#
# create_engine() does NOT immediately connect to the DB.
# It just sets up the configuration. The connection happens
# when a query is first executed.
#
# echo=False — set to True during debugging to see raw SQL printed
# -------------------------------------------------------------
engine = create_engine(
    DATABASE_URL,
    echo=False,
)

# -------------------------------------------------------------
# SessionLocal — Session Factory
#
# A Session is a single unit of work with the database.
# One HTTP request = one Session.
#
# sessionmaker() creates a factory (a class) that produces
# Session objects configured with our engine.
#
# autocommit=False — we manually call db.commit() to save changes
#                    This gives us control: on error we can rollback
# autoflush=False  — changes aren't sent to DB until we commit
#                    Prevents partial writes during validation logic
# -------------------------------------------------------------
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# -------------------------------------------------------------
# Base — Parent class for all SQLAlchemy models
#
# Every model (e.g. Expense) must inherit from Base.
# SQLAlchemy uses Base to discover all model classes and
# know which Python classes map to which database tables.
#
# When we call Base.metadata.create_all(engine), SQLAlchemy
# looks at all classes that inherit from Base and creates
# the corresponding tables if they don't exist.
# -------------------------------------------------------------
class Base(DeclarativeBase):
    pass


# -------------------------------------------------------------
# get_db() — Database Session Dependency
#
# This is a FastAPI "dependency" — a function that FastAPI
# runs automatically before your route handler.
#
# Usage in a route:
#   def my_route(db: Session = Depends(get_db)):
#
# What happens:
#   1. FastAPI calls get_db() before the route function runs
#   2. get_db() creates a new Session and yields it to the route
#   3. The route uses the db session to query the database
#   4. After the route finishes (or crashes), the finally block
#      closes the session — preventing connection leaks
#
# This is called a "generator dependency" — the yield keyword
# means "give this value to the caller, then resume here
# when the caller is done" (like a finally block).
# -------------------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db          # route gets the session here
    finally:
        db.close()        # always runs — even if there's an error


# -------------------------------------------------------------
# Test the connection — useful for startup diagnostics
# -------------------------------------------------------------
def test_connection() -> bool:
    """
    Attempts a simple SELECT 1 to verify SQL Server connectivity.
    Returns True on success, False on failure.
    Called in main.py at startup.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"[DB] Connection test failed: {e}")
        return False
