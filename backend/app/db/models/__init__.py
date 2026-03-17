"""SQLAlchemy model package.

This package intentionally avoids eager imports to prevent circular import issues
between core ORM models defined in app.db.schemas and auxiliary models in this
directory (e.g., address and payment).
"""

__all__ = []
