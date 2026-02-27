"""
Test Stock Service Unit Tests
Unit tests for StockService methods
"""

import pytest
from unittest.mock import MagicMock, AsyncMock
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.stock_service import StockService, StockStatus
from app.db.schemas import Product


@pytest.mark.asyncio
async def test_calculate_stock_status():
    """Test stock status calculation"""
    assert StockService._calculate_stock_status(0) == StockStatus.OUT_OF_STOCK
    assert StockService._calculate_stock_status(1) == StockStatus.LOW_STOCK
    assert StockService._calculate_stock_status(4) == StockStatus.LOW_STOCK
    assert StockService._calculate_stock_status(5) == StockStatus.IN_STOCK
    assert StockService._calculate_stock_status(100) == StockStatus.IN_STOCK


@pytest.mark.asyncio
async def test_get_stock_info_product_not_found():
    """Test get_stock_info raises 404 for non-existent product"""
    mock_db = AsyncMock(spec=AsyncSession)
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    with pytest.raises(Exception) as exc_info:
        await StockService.get_stock_info(mock_db, 999)

    assert "404" in str(exc_info.value) or "not found" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_reserve_stock_success():
    """Test successful stock reservation"""
    mock_db = AsyncMock(spec=AsyncSession)

    # Mock product with sufficient stock
    mock_product = Product(id=1, name="Test Product", stock=10, price=100.0, description="Test")

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_product
    mock_db.execute.return_value = mock_result

    # Reserve 5 units
    result = await StockService.reserve_stock_atomic(mock_db, 1, 5)

    assert result.stock == 5  # 10 - 5
    assert result.id == 1


@pytest.mark.asyncio
async def test_reserve_stock_insufficient():
    """Test reserve fails when insufficient stock"""
    mock_db = AsyncMock(spec=AsyncSession)

    # Mock product with low stock
    mock_product = Product(id=1, name="Limited Product", stock=2, price=100.0, description="Test")

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_product
    mock_db.execute.return_value = mock_result

    # Try to reserve 5 units (more than available)
    with pytest.raises(Exception) as exc_info:
        await StockService.reserve_stock_atomic(mock_db, 1, 5)

    assert "insufficient" in str(exc_info.value).lower() or "400" in str(exc_info.value)


@pytest.mark.asyncio
async def test_reserve_stock_batch_success():
    """Test successful batch stock reservation"""
    mock_db = AsyncMock(spec=AsyncSession)

    # Mock products with sufficient stock
    mock_product1 = Product(id=1, name="Product 1", stock=10, price=100.0)
    mock_product2 = Product(id=2, name="Product 2", stock=20, price=50.0)

    mock_result = MagicMock()
    # scalars().all() should return list of products
    mock_result.scalars.return_value.all.return_value = [mock_product1, mock_product2]
    mock_db.execute.return_value = mock_result

    # Reserve batch
    items = [(1, 5), (2, 10)]
    result = await StockService.reserve_stock_batch(mock_db, items)

    assert len(result) == 2
    assert mock_product1.stock == 5  # 10 - 5
    assert mock_product2.stock == 10  # 20 - 10


@pytest.mark.asyncio
async def test_reserve_stock_batch_insufficient():
    """Test batch reservation fails when one item has insufficient stock"""
    mock_db = AsyncMock(spec=AsyncSession)

    # Mock products: one with enough stock, one without
    mock_product1 = Product(id=1, name="Product 1", stock=10, price=100.0)
    mock_product2 = Product(id=2, name="Product 2", stock=5, price=50.0)  # Only 5 available

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [mock_product1, mock_product2]
    mock_db.execute.return_value = mock_result

    # Try to reserve 5 of p1 (ok) and 10 of p2 (fails)
    items = [(1, 5), (2, 10)]

    with pytest.raises(Exception) as exc_info:
        await StockService.reserve_stock_batch(mock_db, items)

    assert "insufficient" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_reserve_stock_batch_product_not_found():
    """Test batch reservation fails when product missing"""
    mock_db = AsyncMock(spec=AsyncSession)

    # Mock only product 1 found
    mock_product1 = Product(id=1, name="Product 1", stock=10, price=100.0)

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [mock_product1]
    mock_db.execute.return_value = mock_result

    items = [(1, 5), (999, 1)]

    with pytest.raises(Exception) as exc_info:
        await StockService.reserve_stock_batch(mock_db, items)

    assert "not found" in str(exc_info.value).lower()
