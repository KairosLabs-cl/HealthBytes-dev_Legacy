"""
Extended tests for stock service.
Covers release_stock, update_stock, get_stock_info, bulk_check_availability.
"""

import pytest
from fastapi import HTTPException

from app.db.schemas import Product
from app.services.stock_service import StockService, StockStatus
from tests.conftest import MockAsyncSession


@pytest.fixture
def products(db_session):
    """Create test products."""
    p1 = Product(name="Stock Product A", description="A", price=100.0, stock=50)
    p2 = Product(name="Stock Product B", description="B", price=200.0, stock=3)
    p3 = Product(name="Stock Product C", description="C", price=50.0, stock=0)
    db_session.add_all([p1, p2, p3])
    db_session.commit()
    db_session.refresh(p1)
    db_session.refresh(p2)
    db_session.refresh(p3)
    return [p1, p2, p3]


@pytest.fixture
def async_db(db_session):
    """Wrap sync session in MockAsyncSession."""
    return MockAsyncSession(db_session)


class TestReleaseStock:
    """Tests for StockService.release_stock"""

    @pytest.mark.asyncio
    async def test_release_stock_success(self, async_db, products):
        """Test releasing stock adds quantity back."""
        product = products[0]  # stock=50
        result = await StockService.release_stock(async_db, product.id, 10)
        assert result.stock == 60

    @pytest.mark.asyncio
    async def test_release_stock_not_found(self, async_db):
        """Test releasing stock for non-existent product."""
        with pytest.raises(HTTPException) as exc_info:
            await StockService.release_stock(async_db, 99999, 5)
        assert exc_info.value.status_code == 404


class TestUpdateStock:
    """Tests for StockService.update_stock"""

    @pytest.mark.asyncio
    async def test_update_stock_success(self, async_db, products):
        """Test admin stock update."""
        product = products[0]
        result = await StockService.update_stock(async_db, product.id, 100, "admin_1")
        assert result.stock == 100

    @pytest.mark.asyncio
    async def test_update_stock_negative_rejected(self, async_db, products):
        """Test negative stock value is rejected."""
        with pytest.raises(HTTPException) as exc_info:
            await StockService.update_stock(async_db, products[0].id, -1, "admin_1")
        assert exc_info.value.status_code == 400

    @pytest.mark.asyncio
    async def test_update_stock_not_found(self, async_db):
        """Test updating stock for non-existent product."""
        with pytest.raises(HTTPException) as exc_info:
            await StockService.update_stock(async_db, 99999, 10, "admin_1")
        assert exc_info.value.status_code == 404

    @pytest.mark.asyncio
    async def test_update_stock_to_zero(self, async_db, products):
        """Test setting stock to zero."""
        result = await StockService.update_stock(async_db, products[0].id, 0, "admin_1")
        assert result.stock == 0


class TestGetStockInfo:
    """Tests for StockService.get_stock_info"""

    @pytest.mark.asyncio
    async def test_get_stock_info_in_stock(self, async_db, products):
        """Test stock info for product with plenty of stock."""
        info = await StockService.get_stock_info(async_db, products[0].id)
        assert info["stock"] == 50
        assert info["stock_status"] == StockStatus.IN_STOCK
        assert info["is_available"] is True
        assert info["is_low_stock"] is False

    @pytest.mark.asyncio
    async def test_get_stock_info_low_stock(self, async_db, products):
        """Test stock info for low stock product."""
        info = await StockService.get_stock_info(async_db, products[1].id)
        assert info["stock"] == 3
        assert info["stock_status"] == StockStatus.LOW_STOCK
        assert info["is_available"] is True
        assert info["is_low_stock"] is True

    @pytest.mark.asyncio
    async def test_get_stock_info_out_of_stock(self, async_db, products):
        """Test stock info for out of stock product."""
        info = await StockService.get_stock_info(async_db, products[2].id)
        assert info["stock"] == 0
        assert info["stock_status"] == StockStatus.OUT_OF_STOCK
        assert info["is_available"] is False

    @pytest.mark.asyncio
    async def test_get_stock_info_not_found(self, async_db):
        """Test stock info for non-existent product."""
        with pytest.raises(HTTPException) as exc_info:
            await StockService.get_stock_info(async_db, 99999)
        assert exc_info.value.status_code == 404


class TestBulkCheckAvailability:
    """Tests for StockService.bulk_check_availability"""

    @pytest.mark.asyncio
    async def test_bulk_check_all_available(self, async_db, products):
        """Test bulk check with all products available."""
        items = [(products[0].id, 5), (products[1].id, 1)]
        result = await StockService.bulk_check_availability(async_db, items)
        assert result[products[0].id]["is_available"] is True
        assert result[products[1].id]["is_available"] is True

    @pytest.mark.asyncio
    async def test_bulk_check_some_unavailable(self, async_db, products):
        """Test bulk check with one product out of stock."""
        items = [(products[0].id, 5), (products[2].id, 1)]
        result = await StockService.bulk_check_availability(async_db, items)
        assert result[products[0].id]["is_available"] is True
        assert result[products[2].id]["is_available"] is False

    @pytest.mark.asyncio
    async def test_bulk_check_product_not_found(self, async_db, products):
        """Test bulk check with non-existent product."""
        items = [(products[0].id, 1), (99999, 1)]
        result = await StockService.bulk_check_availability(async_db, items)
        assert result[products[0].id]["is_available"] is True
        assert result[99999]["is_available"] is False
        assert "error" in result[99999]

    @pytest.mark.asyncio
    async def test_bulk_check_insufficient_quantity(self, async_db, products):
        """Test bulk check requesting more than available."""
        items = [(products[1].id, 100)]  # stock=3, requesting 100
        result = await StockService.bulk_check_availability(async_db, items)
        assert result[products[1].id]["is_available"] is False
