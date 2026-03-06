"""Unit tests for Redis caching in product_service.get_products_cached()."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from app.db.schemas import Product
from app.services.product_service import _serialize_product, get_products_cached
from tests.conftest import MockAsyncSession


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _make_mock_product(id: int, name: str = "Test", price: float = 9.99) -> MagicMock:
    """Create a MagicMock that quacks like a Product ORM object."""
    p = MagicMock(spec=Product)
    p.id = id
    p.name = name
    p.description = "desc"
    p.price = price
    p.stock = 10
    p.category = "Snacks"
    p.image = "https://example.com/img.jpg"
    p.vendor_name = None
    p.nutritional_info = None
    p.dietary_tags = []
    return p


# ---------------------------------------------------------------------------
# _serialize_product
# ---------------------------------------------------------------------------


def test_serialize_product_basic():
    p = _make_mock_product(1, "Galletas", 5.99)
    data = _serialize_product(p)
    assert data["id"] == 1
    assert data["name"] == "Galletas"
    assert data["price"] == 5.99
    assert data["dietary_tags"] == []


def test_serialize_product_with_dietary_tag():
    tag = MagicMock()
    tag.id = 7
    tag.name = "vegano"
    tag.display_name = "Vegano"
    tag.color = "#00FF00"

    p = _make_mock_product(2, "Barra")
    p.dietary_tags = [tag]

    data = _serialize_product(p)
    assert len(data["dietary_tags"]) == 1
    assert data["dietary_tags"][0]["name"] == "vegano"


# ---------------------------------------------------------------------------
# get_products_cached — cache MISS (Redis None / no REDIS_URL)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_cache_miss_no_redis(db_session):
    """When Redis is unavailable, falls through to DB transparently."""
    mock_db = MockAsyncSession(db_session)

    product = Product(
        id=1001,
        name="Cache Test Product",
        description="For cache testing",
        price=12.50,
        stock=5,
    )
    db_session.add(product)
    db_session.commit()

    with patch("app.services.product_service.get_redis", new_callable=AsyncMock) as mock_redis:
        mock_redis.return_value = None  # Redis unavailable

        results = await get_products_cached(mock_db)

    assert any(p.id == 1001 for p in results)


# ---------------------------------------------------------------------------
# get_products_cached — cache HIT
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_cache_hit_returns_cached_data(db_session):
    """Second call with warm cache should return cached data without hitting DB."""
    mock_db = MockAsyncSession(db_session)

    cached_payload = json.dumps(
        [
            {
                "id": 42,
                "name": "Cached Product",
                "description": "From cache",
                "price": 7.77,
                "stock": 3,
                "category": "Bebidas",
                "image": None,
                "vendor_name": None,
                "nutritional_info": None,
                "dietary_tags": [],
            }
        ]
    )

    mock_redis_client = AsyncMock()
    mock_redis_client.get = AsyncMock(return_value=cached_payload)
    mock_redis_client.setex = AsyncMock()

    with patch("app.services.product_service.get_redis", new_callable=AsyncMock) as mock_redis:
        mock_redis.return_value = mock_redis_client

        results = await get_products_cached(mock_db)

    # Should return the cached dict list (not ORM objects)
    assert len(results) == 1
    assert results[0]["id"] == 42
    assert results[0]["name"] == "Cached Product"
    # setex should NOT have been called since we had a hit
    mock_redis_client.setex.assert_not_called()


# ---------------------------------------------------------------------------
# get_products_cached — writes to cache on MISS
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_cache_miss_writes_to_redis(db_session):
    """On a cache miss, the result should be stored in Redis with setex."""
    mock_db = MockAsyncSession(db_session)

    product = Product(
        id=2001,
        name="Write-Through Product",
        description="Should be written to cache",
        price=19.99,
        stock=20,
    )
    db_session.add(product)
    db_session.commit()

    mock_redis_client = AsyncMock()
    mock_redis_client.get = AsyncMock(return_value=None)  # cache miss
    mock_redis_client.setex = AsyncMock()

    with patch("app.services.product_service.get_redis", new_callable=AsyncMock) as mock_redis:
        mock_redis.return_value = mock_redis_client

        results = await get_products_cached(mock_db)

    # setex must have been called exactly once
    mock_redis_client.setex.assert_called_once()
    call_args = mock_redis_client.setex.call_args
    key, ttl, payload = call_args[0]

    assert "products:list" in key
    assert ttl > 0
    parsed = json.loads(payload)
    assert any(item["id"] == 2001 for item in parsed)


# ---------------------------------------------------------------------------
# get_products_cached — graceful degradation on Redis read error
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_cache_redis_read_error_falls_back_to_db(db_session):
    """If Redis raises on get(), the service falls back to DB without crashing."""
    mock_db = MockAsyncSession(db_session)

    product = Product(
        id=3001,
        name="Fallback Product",
        description="DB fallback",
        price=5.00,
        stock=1,
    )
    db_session.add(product)
    db_session.commit()

    mock_redis_client = AsyncMock()
    mock_redis_client.get = AsyncMock(side_effect=ConnectionError("Redis down"))
    mock_redis_client.setex = AsyncMock()

    with patch("app.services.product_service.get_redis", new_callable=AsyncMock) as mock_redis:
        mock_redis.return_value = mock_redis_client

        # Should NOT raise — graceful degradation
        results = await get_products_cached(mock_db)

    assert any(p.id == 3001 for p in results)


# ---------------------------------------------------------------------------
# get_products_cached — graceful degradation on Redis write error
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_cache_redis_write_error_does_not_crash(db_session):
    """If Redis raises on setex(), the service returns DB results without crashing."""
    mock_db = MockAsyncSession(db_session)

    product = Product(
        id=4001,
        name="Write Error Product",
        description="Write fails silently",
        price=3.50,
        stock=8,
    )
    db_session.add(product)
    db_session.commit()

    mock_redis_client = AsyncMock()
    mock_redis_client.get = AsyncMock(return_value=None)  # cache miss
    mock_redis_client.setex = AsyncMock(side_effect=ConnectionError("write failed"))

    with patch("app.services.product_service.get_redis", new_callable=AsyncMock) as mock_redis:
        mock_redis.return_value = mock_redis_client

        results = await get_products_cached(mock_db)

    # DB results still returned despite write failure
    assert any(p.id == 4001 for p in results)


# ---------------------------------------------------------------------------
# get_products_cached — cache key includes all filter params
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_cache_key_includes_all_params(db_session):
    """Different filter combos produce different cache keys."""
    mock_db = MockAsyncSession(db_session)

    captured_keys: list[str] = []

    mock_redis_client = AsyncMock()
    mock_redis_client.get = AsyncMock(return_value=None)

    async def capture_setex(key, ttl, value):
        captured_keys.append(key)

    mock_redis_client.setex = AsyncMock(side_effect=capture_setex)

    with patch("app.services.product_service.get_redis", new_callable=AsyncMock) as mock_redis:
        mock_redis.return_value = mock_redis_client

        await get_products_cached(mock_db, skip=0, limit=10)
        await get_products_cached(mock_db, skip=0, limit=10, category="Bebidas")
        await get_products_cached(mock_db, skip=0, limit=10, min_price=5.0)

    assert len(captured_keys) == 3
    assert len(set(captured_keys)) == 3, "Each filter combo must produce a unique cache key"
