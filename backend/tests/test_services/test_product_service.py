"""Unit tests for product_service"""

import pytest
from sqlalchemy import select
from app.services.product_service import (
    list_products,
    get_product,
    create_product,
    update_product,
    delete_product,
    search_products,
)
from app.schemas.product import ProductCreate, ProductUpdate
from app.db.schemas import Product
from tests.conftest import MockAsyncSession


@pytest.mark.asyncio
async def test_list_products_empty(db_session):
    """Test listing products when table is empty"""
    mock_db = MockAsyncSession(db_session)
    
    result = await list_products(mock_db)
    
    assert result == []


@pytest.mark.asyncio
async def test_list_products_with_data(db_session):
    """Test listing products with sample data"""
    mock_db = MockAsyncSession(db_session)
    
    # Create test products
    product1 = Product(
        id=1,
        name="Test Product 1",
        description="Description 1",
        price=9.99,
        image="https://example.com/img1.jpg"
    )
    product2 = Product(
        id=2,
        name="Test Product 2",
        description="Description 2",
        price=19.99,
        image="https://example.com/img2.jpg"
    )
    db_session.add(product1)
    db_session.add(product2)
    db_session.commit()
    
    # Call service
    result = await list_products(mock_db)
    
    assert len(result) == 2
    assert result[0].name == "Test Product 1"
    assert result[1].name == "Test Product 2"


@pytest.mark.asyncio
async def test_list_products_with_pagination(db_session):
    """Test listing products with skip and limit"""
    mock_db = MockAsyncSession(db_session)
    
    # Create 5 test products
    for i in range(1, 6):
        product = Product(
            id=i,
            name=f"Product {i}",
            description=f"Description {i}",
            price=float(i * 10),
            image=f"https://example.com/img{i}.jpg"
        )
        db_session.add(product)
    db_session.commit()
    
    # Test skip=0, limit=2
    result = await list_products(mock_db, skip=0, limit=2)
    assert len(result) == 2
    assert result[0].id == 1
    assert result[1].id == 2
    
    # Test skip=2, limit=2
    result = await list_products(mock_db, skip=2, limit=2)
    assert len(result) == 2
    assert result[0].id == 3
    assert result[1].id == 4


@pytest.mark.asyncio
async def test_get_product_existing(db_session):
    """Test getting an existing product"""
    mock_db = MockAsyncSession(db_session)
    
    # Create test product
    product = Product(
        id=99,
        name="Test Product",
        description="Test Description",
        price=29.99,
        image="https://example.com/test.jpg"
    )
    db_session.add(product)
    db_session.commit()
    
    # Call service
    result = await get_product(mock_db, 99)
    
    assert result is not None
    assert result.id == 99
    assert result.name == "Test Product"
    assert result.price == 29.99


@pytest.mark.asyncio
async def test_get_product_not_found(db_session):
    """Test getting a non-existent product"""
    mock_db = MockAsyncSession(db_session)
    
    result = await get_product(mock_db, 999)
    
    assert result is None


@pytest.mark.asyncio
async def test_create_product(db_session):
    """Test creating a new product"""
    mock_db = MockAsyncSession(db_session)
    
    product_data = ProductCreate(
        name="New Product",
        description="New Description",
        price=39.99,
        image="https://example.com/new.jpg"
    )
    
    result = await create_product(mock_db, product_data)
    
    assert result is not None
    assert result.name == "New Product"
    assert result.description == "New Description"
    assert result.price == 39.99
    assert result.image == "https://example.com/new.jpg"


@pytest.mark.asyncio
async def test_create_product_validates_data(db_session):
    """Test that create_product handles data correctly"""
    mock_db = MockAsyncSession(db_session)
    
    product_data = ProductCreate(
        name="Product with Special Name",
        description="A product with special chars: @#$%",
        price=99.99,
        image="https://example.com/special.jpg"
    )
    
    result = await create_product(mock_db, product_data)
    
    assert result.name == "Product with Special Name"
    assert "@#$%" in result.description


@pytest.mark.asyncio
async def test_update_product_existing(db_session):
    """Test updating an existing product"""
    mock_db = MockAsyncSession(db_session)
    
    # Create initial product
    product = Product(
        id=50,
        name="Original Name",
        description="Original Description",
        price=49.99,
        image="https://example.com/original.jpg"
    )
    db_session.add(product)
    db_session.commit()
    
    # Update product
    update_data = ProductUpdate(
        name="Updated Name",
        price=59.99
    )
    
    result = await update_product(mock_db, 50, update_data)
    
    assert result is not None
    assert result.name == "Updated Name"
    assert result.price == 59.99
    assert result.description == "Original Description"  # Unchanged


@pytest.mark.asyncio
async def test_update_product_not_found(db_session):
    """Test updating a non-existent product"""
    mock_db = MockAsyncSession(db_session)
    
    update_data = ProductUpdate(name="Updated Name")
    
    result = await update_product(mock_db, 999, update_data)
    
    assert result is None


@pytest.mark.asyncio
async def test_update_product_partial(db_session):
    """Test partial update (only some fields)"""
    mock_db = MockAsyncSession(db_session)
    
    # Create initial product
    product = Product(
        id=60,
        name="Original",
        description="Original Description",
        price=49.99,
        image="https://example.com/original.jpg"
    )
    db_session.add(product)
    db_session.commit()
    
    # Update only name
    update_data = ProductUpdate(name="New Name")
    result = await update_product(mock_db, 60, update_data)
    
    assert result.name == "New Name"
    assert result.price == 49.99  # Unchanged


@pytest.mark.asyncio
async def test_delete_product_existing(db_session):
    """Test deleting an existing product"""
    mock_db = MockAsyncSession(db_session)
    
    # Create product
    product = Product(
        id=70,
        name="To Delete",
        description="Will be deleted",
        price=9.99,
        image="https://example.com/delete.jpg"
    )
    db_session.add(product)
    db_session.commit()
    
    # Delete it
    result = await delete_product(mock_db, 70)
    
    assert result is not None
    
    # Verify it's deleted
    deleted = await get_product(mock_db, 70)
    assert deleted is None


@pytest.mark.asyncio
async def test_delete_product_not_found(db_session):
    """Test deleting a non-existent product"""
    mock_db = MockAsyncSession(db_session)
    
    result = await delete_product(mock_db, 999)
    assert result is None


@pytest.mark.asyncio
async def test_search_products_empty_query_returns_all(db_session):
    """Test search returns all products on empty query"""
    mock_db = MockAsyncSession(db_session)

    product1 = Product(
        id=101,
        name="Galletas Sin Gluten",
        description="Deliciosas galletas sin gluten",
        price=5.99,
    )
    product2 = Product(
        id=102,
        name="Pan Integral",
        description="Pan integral sin lactosa",
        price=3.99,
    )
    db_session.add(product1)
    db_session.add(product2)
    db_session.commit()

    result = await search_products(mock_db, "   ")

    assert len(result) == 2


@pytest.mark.asyncio
async def test_search_products_fallback_like_on_sqlite(db_session):
    """Test search falls back to LIKE on SQLite and finds matches"""
    mock_db = MockAsyncSession(db_session)

    product1 = Product(
        id=201,
        name="Galletas Sin Gluten",
        description="Para celiacos",
        price=5.99,
    )
    product2 = Product(
        id=202,
        name="Chocolate Sin Azúcar",
        description="Vegano",
        price=4.99,
    )
    db_session.add(product1)
    db_session.add(product2)
    db_session.commit()

    result = await search_products(mock_db, "galletas")

    assert len(result) == 1
    assert result[0].name == "Galletas Sin Gluten"


@pytest.mark.asyncio
async def test_search_products_case_insensitive_like(db_session):
    """Test search is case-insensitive via LIKE fallback"""
    mock_db = MockAsyncSession(db_session)

    product = Product(
        id=301,
        name="Yogur de Almendra",
        description="Sin lactosa",
        price=2.99,
    )
    db_session.add(product)
    db_session.commit()

    result_lower = await search_products(mock_db, "yogur")
    result_upper = await search_products(mock_db, "YOGUR")

    assert len(result_lower) == 1
    assert len(result_upper) == 1
    assert result_lower[0].id == result_upper[0].id
