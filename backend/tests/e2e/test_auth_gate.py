"""
E2E tests — AuthGate regression suite.
All protected endpoints must return 401 without a valid token.

This suite is the canonical verification that the infinite-loop fix
in checkout-v2.tsx did not break backend auth, and that the AuthGate
middleware is applied consistently.

Uses httpx.AsyncClient with ASGITransport to exercise the full ASGI stack
(middleware chain included) without spinning up a real server.
"""

import httpx
import pytest
from httpx import ASGITransport
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
from app.main import app

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(scope="module")
def _sqlite_engine():
    """In-memory SQLite engine shared across the module."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture(autouse=True)
def _override_db(_sqlite_engine):
    """
    Replace the real async DB dependency with a lightweight in-memory
    SQLite session so public endpoints (e.g. /products) can return 200
    without a live database connection.
    """
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_sqlite_engine)

    async def get_db_override():
        from tests.conftest import MockAsyncSession

        session = SessionLocal()
        mock = MockAsyncSession(session)
        try:
            yield mock
        finally:
            session.close()

    app.dependency_overrides[get_db] = get_db_override
    yield
    app.dependency_overrides.pop(get_db, None)


@pytest.fixture
def anyio_backend():
    return "asyncio"


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------


async def _get(path: str) -> httpx.Response:
    """Issue an unauthenticated GET request through the full ASGI stack."""
    async with httpx.AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        return await client.get(path)


# ---------------------------------------------------------------------------
# Tests — protected endpoints must reject unauthenticated requests
# ---------------------------------------------------------------------------


@pytest.mark.anyio
async def test_cart_requires_auth():
    """Cart endpoint requires authentication."""
    response = await _get("/cart")
    assert response.status_code == 401


@pytest.mark.anyio
async def test_addresses_requires_auth():
    """
    Regression: the infinite /addresses loop fix — endpoint must
    return 401 before executing any DB logic.
    """
    response = await _get("/addresses")
    assert response.status_code == 401


@pytest.mark.anyio
async def test_orders_requires_auth():
    """Orders endpoint requires authentication."""
    response = await _get("/orders")
    assert response.status_code == 401


@pytest.mark.anyio
async def test_profile_requires_auth():
    """
    User profile endpoint requires authentication.
    GET /users lists all users (admin-only) — returns 401 for anonymous requests.
    """
    response = await _get("/users")
    assert response.status_code == 401


@pytest.mark.anyio
async def test_favorites_requires_auth():
    """Favorites endpoint requires authentication."""
    response = await _get("/favorites")
    assert response.status_code == 401


# ---------------------------------------------------------------------------
# Tests — public endpoints must be accessible without a token
# ---------------------------------------------------------------------------


@pytest.mark.anyio
async def test_products_is_public():
    """Product catalog must be publicly accessible — no auth required."""
    response = await _get("/products")
    assert response.status_code == 200


@pytest.mark.anyio
async def test_health_is_public():
    """Health check endpoint must be publicly accessible."""
    response = await _get("/health")
    assert response.status_code == 200
