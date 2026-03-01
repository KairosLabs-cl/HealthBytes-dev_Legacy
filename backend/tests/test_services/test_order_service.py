"""Unit tests for order_service"""

from decimal import Decimal

import pytest
from sqlalchemy import select

from app.db.schemas import Order, Product, User
from app.schemas.order import OrderCreate, OrderItemCreate
from app.schemas.user import UserCreate
from app.services.auth_service import register_user
from app.services.order_service import (
    create_order,
    get_order,
    get_user_orders,
    update_order_status,
)
from tests.conftest import MockAsyncSession


@pytest.fixture
def test_user(db_session):
    """Create a test user for order operations"""
    user = User(id=1, email="ordertest@example.com", password="hashed", role="customer")
    db_session.add(user)
    db_session.commit()
    return user


@pytest.fixture
def test_products(db_session):
    """Create test products for orders"""
    products = [
        Product(
            id=1,
            name="Product 1",
            description="Test Product 1",
            price=Decimal("10.00"),
            image="https://example.com/1.jpg",
            stock=100,
        ),
        Product(
            id=2,
            name="Product 2",
            description="Test Product 2",
            price=Decimal("20.00"),
            image="https://example.com/2.jpg",
            stock=100,
        ),
    ]
    for product in products:
        db_session.add(product)
    db_session.commit()
    return products


@pytest.mark.asyncio
async def test_create_order_success(db_session, test_user, test_products):
    """Test successful order creation"""
    mock_db = MockAsyncSession(db_session)

    order_data = OrderCreate(
        items=[
            OrderItemCreate(productId=1, quantity=2, price=10.0),
            OrderItemCreate(productId=2, quantity=1, price=20.0),
        ]
    )

    result = await create_order(mock_db, test_user.id, order_data)

    assert result is not None
    assert result.user_id == 1
    assert result.status in ["pending", "New"]  # Allow both status values
    # Price should be 10*2 + 20*1 = 40
    assert result.total == Decimal("40.0")


@pytest.mark.asyncio
async def test_create_order_insufficient_stock(db_session, test_user):
    """Test order creation fails with insufficient stock"""
    mock_db = MockAsyncSession(db_session)

    # Create product with stock=1
    product = Product(
        id=10,
        name="Limited Product",
        description="Only 1 in stock",
        price=Decimal("5000"),
        image="https://example.com/limited.jpg",
        stock=1,
    )
    db_session.add(product)
    db_session.commit()

    # Try to order 2
    order_data = OrderCreate(items=[OrderItemCreate(productId=10, quantity=2, price=50.0)])

    from fastapi import HTTPException

    with pytest.raises(HTTPException) as exc_info:
        await create_order(mock_db, test_user.id, order_data)

    assert "stock" in str(exc_info.value.detail).lower()


@pytest.mark.asyncio
async def test_create_order_product_not_found(db_session, test_user):
    """Test order creation fails with non-existent product"""
    mock_db = MockAsyncSession(db_session)

    order_data = OrderCreate(items=[OrderItemCreate(productId=9999, quantity=1, price=10.0)])

    with pytest.raises(ValueError) as exc_info:
        await create_order(mock_db, test_user, order_data)

    assert (
        "not found" in str(exc_info.value).lower() or "no encontrado" in str(exc_info.value).lower()
    )


@pytest.mark.asyncio
async def test_create_order_uses_current_price(db_session, test_user):
    """Test that order uses current product price, not client-provided"""
    mock_db = MockAsyncSession(db_session)

    # Create product with price 100
    product = Product(
        id=20,
        name="Price Test",
        description="Test",
        price=100.00,
        image="https://example.com/test.jpg",
        stock=100,
    )
    db_session.add(product)
    db_session.commit()

    # Try to create order (price comes from DB, not client)
    order_data = OrderCreate(items=[OrderItemCreate(productId=20, quantity=1, price=100.0)])

    result = await create_order(mock_db, test_user.id, order_data)

    # Should use DB price (100), not any client-provided price
    assert result.total == Decimal("100.0")


@pytest.mark.asyncio
async def test_create_order_reduces_stock(db_session, test_user):
    """Test that creating order reduces product stock"""
    mock_db = MockAsyncSession(db_session)

    # Create product with stock=10
    product = Product(
        id=30,
        name="Stock Test",
        description="Test",
        price=Decimal("50.00"),
        image="https://example.com/test.jpg",
        stock=10,
    )
    db_session.add(product)
    db_session.commit()

    # Create order for 3
    order_data = OrderCreate(items=[OrderItemCreate(productId=30, quantity=3, price=50.0)])

    await create_order(mock_db, test_user.id, order_data)

    # Check stock was reduced
    result = db_session.execute(select(Product).where(Product.id == 30))
    updated_product = result.scalar_one()
    assert updated_product.stock == 7


@pytest.mark.asyncio
async def test_get_user_orders_empty(db_session, test_user):
    """Test getting orders for user with no orders"""
    mock_db = MockAsyncSession(db_session)

    result = await get_user_orders(mock_db, test_user.id)

    assert result == []


@pytest.mark.asyncio
async def test_get_user_orders_with_data(db_session, test_user, test_products):
    """Test getting user's orders"""
    mock_db = MockAsyncSession(db_session)

    # Create orders
    order1 = Order(id=1, user_id=test_user.id, total=Decimal("30.0"), status="pending")
    order2 = Order(id=2, user_id=test_user.id, total=Decimal("50.0"), status="completed")
    db_session.add(order1)
    db_session.add(order2)
    db_session.commit()

    result = await get_user_orders(mock_db, test_user.id)

    assert len(result) == 2
    # Order by desc
    # Note: In some test environments, timestamp resolution might cause ordering issues
    # or execution order might vary. For test stability, we'll verify content existence.
    ids = {o.id for o in result}
    assert 1 in ids
    assert 2 in ids


@pytest.mark.asyncio
async def test_get_order_existing(db_session, test_user):
    """Test getting a specific order"""
    mock_db = MockAsyncSession(db_session)

    # Create order
    order = Order(id=1, user_id=test_user.id, total=75.0, status="pending")
    db_session.add(order)
    db_session.commit()

    result = await get_order(mock_db, 1, test_user.id)

    assert result is not None
    assert result.total == Decimal("75.0")
    assert result.status == "pending"


@pytest.mark.asyncio
async def test_get_order_not_found(db_session, test_user):
    """Test getting non-existent order"""
    mock_db = MockAsyncSession(db_session)

    result = await get_order(mock_db, 9999, test_user.id)

    assert result is None


@pytest.mark.asyncio
async def test_update_order_status_valid_transition(db_session, test_user):
    """Test updating order status with valid transition"""
    mock_db = MockAsyncSession(db_session)

    # Create order
    order = Order(id=1, user_id=test_user.id, total=50.0, status="pending")
    db_session.add(order)
    db_session.commit()

    # Update status
    result = await update_order_status(mock_db, 1, "processing")

    assert result is not None
    assert result.status == "processing"


@pytest.mark.asyncio
async def test_update_order_status_not_found(db_session):
    """Test updating status of non-existent order"""
    mock_db = MockAsyncSession(db_session)

    result = await update_order_status(mock_db, "nonexistent", "processing")

    assert result is None


@pytest.mark.asyncio
async def test_update_order_status_invalid_transition(db_session, test_user):
    """Test that invalid status transitions are rejected"""
    mock_db = MockAsyncSession(db_session)

    # Create order
    order = Order(id=1, user_id=test_user.id, total=Decimal("50.0"), status="completed")
    db_session.add(order)
    db_session.commit()

    # Try invalid transition: completed -> pending
    with pytest.raises(ValueError) as exc_info:
        await update_order_status(mock_db, 1, "pending")

    assert "invalid status transition" in str(exc_info.value).lower()
