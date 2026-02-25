"""Tests for favorite_service - User favorites management"""

import pytest
from app.db.schemas import Product, UserFavorite
from app.services.favorite_service import (
    add_favorite,
    get_favorite_product_ids,
    get_user_favorites,
    is_favorite,
    remove_favorite,
)
from tests.conftest import MockAsyncSession, create_test_user


@pytest.fixture
def user(db_session):
    """Create a test user for favorite tests."""
    return create_test_user(db_session, email="fav_user@test.com")


@pytest.fixture
def product_a(db_session):
    """Create first test product."""
    product = Product(
        name="Gluten Free Bread",
        description="Delicious GF bread",
        price=5990.0,
        stock=50,
        image="https://example.com/bread.jpg",
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product


@pytest.fixture
def product_b(db_session):
    """Create second test product."""
    product = Product(
        name="Sugar Free Cookies",
        description="Healthy cookies",
        price=3490.0,
        stock=30,
        image="https://example.com/cookies.jpg",
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product


# --- add_favorite ---


@pytest.mark.asyncio
async def test_add_favorite_success(db_session, user, product_a):
    mock_db = MockAsyncSession(db_session)
    result = await add_favorite(mock_db, user.id, product_a.id)

    assert result is not None
    assert result.user_id == user.id
    assert result.product_id == product_a.id


@pytest.mark.asyncio
async def test_add_favorite_duplicate_raises(db_session, user, product_a):
    mock_db = MockAsyncSession(db_session)
    await add_favorite(mock_db, user.id, product_a.id)

    with pytest.raises(ValueError, match="Product already in favorites"):
        await add_favorite(mock_db, user.id, product_a.id)


@pytest.mark.asyncio
async def test_add_favorite_multiple_products(db_session, user, product_a, product_b):
    mock_db = MockAsyncSession(db_session)
    fav_a = await add_favorite(mock_db, user.id, product_a.id)
    fav_b = await add_favorite(mock_db, user.id, product_b.id)

    assert fav_a.product_id == product_a.id
    assert fav_b.product_id == product_b.id
    assert fav_a.id != fav_b.id


# --- remove_favorite ---


@pytest.mark.asyncio
async def test_remove_favorite_success(db_session, user, product_a):
    mock_db = MockAsyncSession(db_session)
    await add_favorite(mock_db, user.id, product_a.id)

    result = await remove_favorite(mock_db, user.id, product_a.id)
    assert result is True


@pytest.mark.asyncio
async def test_remove_favorite_not_found(db_session, user, product_a):
    mock_db = MockAsyncSession(db_session)
    result = await remove_favorite(mock_db, user.id, product_a.id)
    assert result is False


@pytest.mark.asyncio
async def test_remove_favorite_then_re_add(db_session, user, product_a):
    mock_db = MockAsyncSession(db_session)
    await add_favorite(mock_db, user.id, product_a.id)
    await remove_favorite(mock_db, user.id, product_a.id)

    # Should be able to re-add after removal
    result = await add_favorite(mock_db, user.id, product_a.id)
    assert result.product_id == product_a.id


# --- get_user_favorites ---


@pytest.mark.asyncio
async def test_get_user_favorites_empty(db_session, user):
    mock_db = MockAsyncSession(db_session)
    result = await get_user_favorites(mock_db, user.id)
    assert result == []


@pytest.mark.asyncio
async def test_get_user_favorites_returns_all(db_session, user, product_a, product_b):
    mock_db = MockAsyncSession(db_session)
    await add_favorite(mock_db, user.id, product_a.id)
    await add_favorite(mock_db, user.id, product_b.id)

    result = await get_user_favorites(mock_db, user.id)
    assert len(result) == 2

    product_ids = {f.product_id for f in result}
    assert product_a.id in product_ids
    assert product_b.id in product_ids


@pytest.mark.asyncio
async def test_get_user_favorites_pagination(db_session, user, product_a, product_b):
    mock_db = MockAsyncSession(db_session)
    await add_favorite(mock_db, user.id, product_a.id)
    await add_favorite(mock_db, user.id, product_b.id)

    result = await get_user_favorites(mock_db, user.id, skip=0, limit=1)
    assert len(result) == 1

    result_skip = await get_user_favorites(mock_db, user.id, skip=1, limit=1)
    assert len(result_skip) == 1


@pytest.mark.asyncio
async def test_get_user_favorites_isolation(db_session, product_a):
    """Different users should not see each other's favorites."""
    mock_db = MockAsyncSession(db_session)
    user1 = create_test_user(db_session, email="user1@test.com")
    user2 = create_test_user(db_session, email="user2@test.com")

    await add_favorite(mock_db, user1.id, product_a.id)

    user1_favs = await get_user_favorites(mock_db, user1.id)
    user2_favs = await get_user_favorites(mock_db, user2.id)

    assert len(user1_favs) == 1
    assert len(user2_favs) == 0


# --- is_favorite ---


@pytest.mark.asyncio
async def test_is_favorite_true(db_session, user, product_a):
    mock_db = MockAsyncSession(db_session)
    fav = await add_favorite(mock_db, user.id, product_a.id)

    result, fav_id = await is_favorite(mock_db, user.id, product_a.id)
    assert result is True
    assert fav_id == fav.id


@pytest.mark.asyncio
async def test_is_favorite_false(db_session, user, product_a):
    mock_db = MockAsyncSession(db_session)
    result, fav_id = await is_favorite(mock_db, user.id, product_a.id)
    assert result is False
    assert fav_id is None


# --- get_favorite_product_ids ---


@pytest.mark.asyncio
async def test_get_favorite_product_ids_empty(db_session, user):
    mock_db = MockAsyncSession(db_session)
    result = await get_favorite_product_ids(mock_db, user.id)
    assert result == []


@pytest.mark.asyncio
async def test_get_favorite_product_ids_returns_ids(db_session, user, product_a, product_b):
    mock_db = MockAsyncSession(db_session)
    await add_favorite(mock_db, user.id, product_a.id)
    await add_favorite(mock_db, user.id, product_b.id)

    result = await get_favorite_product_ids(mock_db, user.id)
    assert len(result) == 2
    assert product_a.id in result
    assert product_b.id in result


@pytest.mark.asyncio
async def test_get_favorite_product_ids_after_removal(db_session, user, product_a, product_b):
    mock_db = MockAsyncSession(db_session)
    await add_favorite(mock_db, user.id, product_a.id)
    await add_favorite(mock_db, user.id, product_b.id)
    await remove_favorite(mock_db, user.id, product_a.id)

    result = await get_favorite_product_ids(mock_db, user.id)
    assert len(result) == 1
    assert product_b.id in result
    assert product_a.id not in result
