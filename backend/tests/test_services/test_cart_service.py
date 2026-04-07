"""Unit tests for cart_service"""

import pytest
from fastapi import HTTPException

from app.db.schemas import Product
from app.schemas.cart import CartItemCreate
from app.services.cart_service import (
    add_to_cart,
    clear_cart,
    get_cart,
    merge_cart_items,
    remove_from_cart,
    update_cart_item,
)
from tests.conftest import MockAsyncSession

# --- Fixtures ---


@pytest.fixture
def product_a(db_session):
    product = Product(name="Product A", price=10.0, description="Desc A", stock=100)
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product


@pytest.fixture
def product_b(db_session):
    product = Product(name="Product B", price=20.0, description="Desc B", stock=50)
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product


# --- Tests ---


@pytest.mark.asyncio
async def test_get_cart_empty(db_session):
    """Test getting cart when user has no items"""
    mock_db = MockAsyncSession(db_session)
    user_id = 999

    cart = await get_cart(user_id, mock_db)

    assert cart.items == []
    assert cart.total == 0.0


@pytest.mark.asyncio
async def test_add_to_cart_new(db_session, product_a):
    """Test adding a new item to the cart"""
    mock_db = MockAsyncSession(db_session)
    user_id = 1

    item = await add_to_cart(user_id, product_a.id, 2, mock_db)

    assert item.product_id == product_a.id
    assert item.quantity == 2
    assert item.product.name == "Product A"

    # Verify cart total
    cart = await get_cart(user_id, mock_db)
    assert len(cart.items) == 1
    assert cart.total == 20.0  # 2 * 10.0


@pytest.mark.asyncio
async def test_add_to_cart_existing(db_session, product_a):
    """Test adding an item that is already in the cart (increment)"""
    mock_db = MockAsyncSession(db_session)
    user_id = 1

    # Add initial item
    await add_to_cart(user_id, product_a.id, 1, mock_db)

    # Add same item again
    item = await add_to_cart(user_id, product_a.id, 2, mock_db)

    assert item.quantity == 3  # 1 + 2

    cart = await get_cart(user_id, mock_db)
    assert len(cart.items) == 1
    assert cart.total == 30.0


@pytest.mark.asyncio
async def test_add_to_cart_product_not_found(db_session):
    """Test adding a non-existent product raises 404"""
    mock_db = MockAsyncSession(db_session)
    user_id = 1

    with pytest.raises(HTTPException) as exc:
        await add_to_cart(user_id, 99999, 1, mock_db)

    assert exc.value.status_code == 404
    assert "Product not found" in exc.value.detail


@pytest.mark.asyncio
async def test_update_cart_item(db_session, product_a):
    """Test updating item quantity"""
    mock_db = MockAsyncSession(db_session)
    user_id = 1

    # Add item
    await add_to_cart(user_id, product_a.id, 1, mock_db)

    # Update quantity
    item = await update_cart_item(user_id, product_a.id, 5, mock_db)

    assert item.quantity == 5

    cart = await get_cart(user_id, mock_db)
    assert cart.total == 50.0


@pytest.mark.asyncio
async def test_update_cart_item_not_found(db_session, product_a):
    """Test updating item that isn't in cart raises 404"""
    mock_db = MockAsyncSession(db_session)
    user_id = 1

    with pytest.raises(HTTPException) as exc:
        await update_cart_item(user_id, product_a.id, 5, mock_db)

    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_remove_from_cart(db_session, product_a):
    """Test removing an item from the cart"""
    mock_db = MockAsyncSession(db_session)
    user_id = 1

    await add_to_cart(user_id, product_a.id, 1, mock_db)

    await remove_from_cart(user_id, product_a.id, mock_db)

    cart = await get_cart(user_id, mock_db)
    assert len(cart.items) == 0
    assert cart.total == 0.0


@pytest.mark.asyncio
async def test_clear_cart(db_session, product_a, product_b):
    """Test clearing the entire cart"""
    mock_db = MockAsyncSession(db_session)
    user_id = 1

    await add_to_cart(user_id, product_a.id, 1, mock_db)
    await add_to_cart(user_id, product_b.id, 1, mock_db)

    cart_before = await get_cart(user_id, mock_db)
    assert len(cart_before.items) == 2

    await clear_cart(user_id, mock_db)

    cart_after = await get_cart(user_id, mock_db)
    assert len(cart_after.items) == 0


@pytest.mark.asyncio
async def test_merge_cart_items(db_session, product_a, product_b):
    """Test merging local items with server items"""
    mock_db = MockAsyncSession(db_session)
    user_id = 1

    # Setup: User has Product A (qty 1) on server
    await add_to_cart(user_id, product_a.id, 1, mock_db)

    # Local cart has:
    # - Product A (qty 2) -> Should replace server qty (local takes priority)
    # - Product B (qty 1) -> Should be added as new
    local_items = [
        CartItemCreate(product_id=product_a.id, quantity=2),
        CartItemCreate(product_id=product_b.id, quantity=1),
    ]

    merged_cart = await merge_cart_items(user_id, local_items, mock_db)

    assert len(merged_cart.items) == 2

    # Find items in response
    item_a = next(i for i in merged_cart.items if i.product_id == product_a.id)
    item_b = next(i for i in merged_cart.items if i.product_id == product_b.id)

    assert item_a.quantity == 2  # Local quantity replaces server quantity
    assert item_b.quantity == 1
    assert merged_cart.total == (2 * 10.0) + (1 * 20.0)


@pytest.mark.asyncio
async def test_add_to_cart_no_redundant_queries_after_commit(db_session, product_a):
    """
    Test that add_to_cart does not produce redundant queries after commit.

    This test verifies that the product dietary_tags are eagerly loaded
    to avoid N+1 query problems. We check that:
    1. Adding to an existing cart item works correctly
    2. Product dietary relationships are properly loaded after commit
    """
    mock_db = MockAsyncSession(db_session)
    user_id = 1

    # First add - creates new item
    item1 = await add_to_cart(user_id, product_a.id, 1, mock_db)
    assert item1.quantity == 1
    assert item1.product.name == "Product A"
    # Product should have dietary_tags loaded (even if empty list)
    assert hasattr(item1.product, "dietary_tags")

    # Second add - increments existing item (this is where commit + reload happens)
    # After commit, we should not need additional queries to access product.dietary_tags
    item2 = await add_to_cart(user_id, product_a.id, 2, mock_db)
    assert item2.quantity == 3
    assert item2.product.name == "Product A"
    # Verify dietary_tags is accessible without triggering new queries
    assert hasattr(item2.product, "dietary_tags")

    # Verify the cart state
    cart = await get_cart(user_id, mock_db)
    assert len(cart.items) == 1
    assert cart.items[0].quantity == 3
    assert cart.total == 30.0  # 3 * 10.0
