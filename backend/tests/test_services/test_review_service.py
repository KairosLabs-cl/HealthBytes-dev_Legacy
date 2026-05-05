from decimal import Decimal
from unittest.mock import MagicMock, patch

import pytest

from app.db.schemas import Order, OrderItem, Product, Review, User
from app.schemas.review import ReviewCreate
from app.services.review_service import create_review, get_product_reviews
from tests.conftest import MockAsyncSession


@pytest.fixture
def review_user(db_session):
    user = User(id=50, email="reviewer@example.com", password="hashed", role="customer")
    db_session.add(user)
    db_session.commit()
    return user


@pytest.fixture
def review_product(db_session):
    product = Product(
        id=50,
        name="Galletas sin gluten",
        price=Decimal("500.00"),
        stock=10,
    )
    db_session.add(product)
    db_session.commit()
    return product


@pytest.fixture
def purchased_order(db_session, review_user, review_product):
    order = Order(id=50, user_id=review_user.id, status="delivered", total=Decimal("500.00"))
    db_session.add(order)
    db_session.commit()
    item = OrderItem(
        id=50, order_id=order.id, product_id=review_product.id, quantity=1, price=Decimal("500.00")
    )
    db_session.add(item)
    db_session.commit()
    return order


@pytest.mark.asyncio
async def test_create_review_product_not_found(db_session):
    db = MockAsyncSession(db_session)
    review_in = ReviewCreate(rating=5, comment="Excelente")
    result = await create_review(db, user_id=1, product_id=9999, review_in=review_in)
    assert result is None


@pytest.mark.asyncio
async def test_create_review_no_purchase(db_session, review_user, review_product):
    db = MockAsyncSession(db_session)
    review_in = ReviewCreate(rating=4)
    with pytest.raises(ValueError, match="purchase"):
        await create_review(db, user_id=review_user.id, product_id=review_product.id, review_in=review_in)


@pytest.mark.asyncio
async def test_create_review_success(db_session, review_user, review_product, purchased_order):
    db = MockAsyncSession(db_session)
    review_in = ReviewCreate(rating=5, comment="Muy bueno")
    result = await create_review(db, user_id=review_user.id, product_id=review_product.id, review_in=review_in)
    assert result is not None
    assert result.rating == 5
    assert result.comment == "Muy bueno"
    assert result.user_id == review_user.id


@pytest.mark.asyncio
async def test_create_review_duplicate(db_session, review_user, review_product, purchased_order):
    db = MockAsyncSession(db_session)
    review_in = ReviewCreate(rating=3)
    await create_review(db, user_id=review_user.id, product_id=review_product.id, review_in=review_in)
    with pytest.raises(ValueError, match="already reviewed"):
        await create_review(db, user_id=review_user.id, product_id=review_product.id, review_in=review_in)


@pytest.mark.asyncio
async def test_get_product_reviews_empty(db_session, review_product):
    db = MockAsyncSession(db_session)
    reviews = await get_product_reviews(db, product_id=review_product.id)
    assert reviews == []


@pytest.mark.asyncio
async def test_get_product_reviews_with_data(db_session, review_user, review_product, purchased_order):
    db = MockAsyncSession(db_session)
    review_in = ReviewCreate(rating=4, comment="Buen producto")
    await create_review(db, user_id=review_user.id, product_id=review_product.id, review_in=review_in)
    reviews = await get_product_reviews(db, product_id=review_product.id)
    assert len(reviews) == 1
    assert reviews[0].rating == 4
