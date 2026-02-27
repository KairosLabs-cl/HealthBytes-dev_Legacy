"""Unit tests for product_service dietary tag filtering."""

import pytest
from app.db.schemas import Product, DietaryTag
from app.services.product_service import list_products
from tests.conftest import MockAsyncSession


@pytest.mark.asyncio
async def test_list_products_with_dietary_tags(db_session):
    """Test listing products filtered by dietary tags."""
    mock_db = MockAsyncSession(db_session)

    # Base Tags
    vegan_tag = DietaryTag(name="vegan", display_name="Vegan", color="green")
    gluten_free_tag = DietaryTag(name="gluten_free", display_name="Gluten Free", color="blue")

    db_session.add(vegan_tag)
    db_session.add(gluten_free_tag)
    db_session.commit()

    # Create test products
    product1 = Product(
        id=1,
        name="Apple",
        description="Fresh apple",
        price=1.99,
    )
    product1.dietary_tags.append(vegan_tag)
    product1.dietary_tags.append(gluten_free_tag)

    product2 = Product(
        id=2,
        name="Wheat Bread",
        description="Whole wheat bread",
        price=2.99,
    )
    product2.dietary_tags.append(vegan_tag)

    product3 = Product(
        id=3,
        name="Beef Steak",
        description="Not vegan, not gluten free",
        price=12.99,
    )
    product3.dietary_tags.append(
        gluten_free_tag
    )  # Wait, let's say it's gluten free, but not vegan.

    product4 = Product(
        id=4,
        name="Normal Bread",
        description="Nothing special",
        price=1.99,
    )
    # No tags

    db_session.add_all([product1, product2, product3, product4])
    db_session.commit()

    # Test filtering by a single tag that exists on multiple products
    result_vegan = await list_products(mock_db, dietary_tags=["vegan"])
    assert len(result_vegan) == 2
    assert set([p.name for p in result_vegan]) == {"Apple", "Wheat Bread"}

    # Test filtering by multiple tags (should match products that have ANY of the tags, or depends on implementation?)
    # Wait, the implementation does:
    # for tag in dietary_tags: query = query.where(Product.dietary_tags.any(DietaryTag.name == tag))
    # This means ALL tags must be present (AND behavior)!
    result_both = await list_products(mock_db, dietary_tags=["vegan", "gluten_free"])
    assert len(result_both) == 1
    assert result_both[0].name == "Apple"

    # Test filtering with a non-existent tag
    result_none = await list_products(mock_db, dietary_tags=["non_existent_tag"])
    assert len(result_none) == 0

    # Test filtering when no dietary tags are provided
    result_all = await list_products(mock_db)
    assert len(result_all) == 4
