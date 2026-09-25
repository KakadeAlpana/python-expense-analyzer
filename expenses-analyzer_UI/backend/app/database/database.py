# =============================================================
# app/database/database.py
#
# SQLAlchemy database configuration.
# =============================================================

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# -------------------------------------------------------------
# Load environment variables
# -------------------------------------------------------------
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# -------------------------------------------------------------
# SQLAlchemy Engine
#
# The engine is created only when DATABASE_URL is available.
# This allows FastAPI to start on Render without a database
# connection.
# -------------------------------------------------------------
engine = None

if DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        echo=False,
    )

# -------------------------------------------------------------
# SessionLocal
# -------------------------------------------------------------
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# -------------------------------------------------------------
# Base
# -------------------------------------------------------------
class Base(DeclarativeBase):
    pass

# -------------------------------------------------------------
# get_db()
# -------------------------------------------------------------
def get_db():
    if engine is None:
        raise RuntimeError(
            "DATABASE_URL is not configured. "
            "Database operations are currently unavailable."
        )

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

# -------------------------------------------------------------
# Test database connection
# -------------------------------------------------------------
def test_connection() -> bool:
    """
    Attempts a simple SELECT 1 to verify SQL Server connectivity.
    Returns True on success, False on failure.
    """

    if engine is None:
        print("[DB] DATABASE_URL is not configured.")
        return False

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))

        return True

    except Exception as e:
        print(f"[DB] Connection test failed: {e}")
        return False