# =============================================================
# app/main.py
#
# FastAPI application entry point.
#
# This file:
#   1. Creates the FastAPI app instance
#   2. Configures CORS (so React frontend can call the API)
#   3. Registers the expense router
#   4. Defines the root health-check endpoint
#
# Run command:
#   python -m uvicorn app.main:app --reload
#
# URLs:
#   API:     http://127.0.0.1:8000
#   Swagger: http://127.0.0.1:8000/docs
#   OpenAPI: http://127.0.0.1:8000/openapi.json
# =============================================================

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routes.expense_routes import router as expense_router


# -------------------------------------------------------------
# Create the FastAPI application
#
# title, description, version appear in the Swagger UI
# -------------------------------------------------------------
app = FastAPI(
    title="Expense Analyzer API",
    description="""
## Expense Analyzer REST API

A Python FastAPI backend for the Expense Analyzer application.

### Current Phase
**Phase 2** — In-memory mock data (SQL Server will be added in Phase 3)

### Tech Stack
- **Framework**: FastAPI
- **Validation**: Pydantic
- **Server**: Uvicorn
- **Future DB**: SQLAlchemy + Microsoft SQL Server
    """,
    version="1.0.0",
    contact={
        "name": "Alpana Kakade",
    },
)


# -------------------------------------------------------------
# CORS Configuration
#
# CORS = Cross-Origin Resource Sharing
#
# Problem: Your React app runs on http://localhost:5173
#          Your FastAPI runs on  http://localhost:8000
#          These are DIFFERENT origins (different port = different origin)
#
# By default, browsers BLOCK requests from one origin to another
# for security (called the Same-Origin Policy).
#
# Solution: We configure the FastAPI server to send special HTTP headers
# that tell the browser: "it's OK, I allow requests from localhost:5173"
#
# allow_origins: list of URLs allowed to make requests
# allow_methods: which HTTP methods are allowed (GET, POST, PUT, DELETE)
# allow_headers: which headers are allowed in requests
# allow_credentials: whether to allow cookies/auth headers
# -------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",                                    # Vite dev server
        "http://127.0.0.1:5173",                                   # Vite dev (alt)
        "https://python-expense-analyzer-frontend.onrender.com",   # Render deployment
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------------------
# Register routers
#
# By including expense_router here, all routes defined in
# expense_routes.py become part of this application.
#
# The routes already have prefix="/api/expenses" defined in the router.
# -------------------------------------------------------------
app.include_router(expense_router)


# -------------------------------------------------------------
# Global exception handler for RuntimeError
#
# When get_db() raises RuntimeError (because DATABASE_URL is not
# set), FastAPI would normally return a plain 500 with no CORS
# headers — the browser reports this as a "CORS error" which is
# misleading.
#
# This handler intercepts RuntimeError and returns a proper JSON
# response with status 503. Because FastAPI exception handlers
# run inside the middleware stack, the CORS middleware will still
# add the Access-Control-Allow-Origin header to this response.
# -------------------------------------------------------------
@app.exception_handler(RuntimeError)
async def runtime_error_handler(request: Request, exc: RuntimeError):
    return JSONResponse(
        status_code=503,
        content={
            "success": False,
            "message": str(exc),
        },
    )


# -------------------------------------------------------------
# Root endpoint — health check
#
# GET /
# Use this to quickly verify the server is running.
# -------------------------------------------------------------
@app.get("/", tags=["Health"])
def root():
    """
    Health check endpoint.
    Returns a simple message confirming the API is running.
    """
    return {
        "message": "Expense Analyzer API is running",
        "version": "1.0.0",
        "phase": "Phase 2 — In-memory data",
        "docs": "http://127.0.0.1:8000/docs",
    }


# -------------------------------------------------------------
# API Info endpoint
# -------------------------------------------------------------
@app.get("/api", tags=["Health"])
def api_info():
    """Returns information about available API endpoints."""
    return {
        "message": "Expense Analyzer API",
        "endpoints": {
            "expenses": "/api/expenses",
            "get_by_id": "/api/expenses/{id}",
            "summary": "/api/expenses/summary",
            "category_summary": "/api/expenses/category-summary",
            "monthly_summary": "/api/expenses/monthly-summary",
        },
    }
