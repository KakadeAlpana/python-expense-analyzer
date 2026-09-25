# app/services/__init__.py
# Re-exports the expense_service module so routes can import it cleanly.
# Usage in routes: from app import services as svc  →  svc.expense_service.get_all_expenses()

from app.services import expense_service
