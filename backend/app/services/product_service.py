"""Product service - All product business logic."""

import logging
from typing import List, Optional

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.schemas import DietaryTag, Product
from app.schemas.product import ProductCreate, ProductUpdate

logger = logging.getLogger(__name__)


async def list_products(
    db: AsyncSession,
    search: str = None,
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    dietary_tags: Optional[List[str]] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
) -> List[Product]:
    """
    Get all products with dynamic filtering and pagination.
    """
    # Eagerly load dietary_tags relationship
    query = select(Product).options(selectinload(Product.dietary_tags))

    # Apply search filter (name or description)
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            (Product.name.ilike(search_pattern)) | (Product.description.ilike(search_pattern))
        )

    # Apply category filter
    if category:
        query = query.where(Product.category == category)

    # Apply dietary tags filter using ANY operator on the relationship
    # This generates an EXISTS clause for the many-to-many relationship
    if dietary_tags:
        for tag in dietary_tags:
            query = query.where(Product.dietary_tags.any(DietaryTag.name == tag))

    # Apply price range filters
    if min_price is not None:
        query = query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)

    # Ensure skip and limit are Python integers
    skip = int(skip) if skip is not None else 0
    limit = int(limit) if limit is not None else 100

    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


async def get_featured_product(db: AsyncSession) -> Optional[Product]:
    """Return the newest in-stock product to use as hero banner."""
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.dietary_tags))
        .where(Product.stock > 0)
        .order_by(Product.id.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


async def get_product(db: AsyncSession, product_id: int) -> Optional[Product]:
    """
    Get product by ID with dietary tags loaded.

    Args:
        db: Database session
        product_id: Product ID

    Returns:
        Product object or None if not found
    """
    result = await db.execute(
        select(Product).options(selectinload(Product.dietary_tags)).where(Product.id == product_id)
    )
    return result.scalar_one_or_none()


async def get_products_by_ids(db: AsyncSession, product_ids: List[int]) -> List[Product]:
    """
    Get multiple products by IDs with dietary tags loaded.

    Args:
        db: Database session
        product_ids: List of product IDs

    Returns:
        List of Product objects
    """
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.dietary_tags))
        .where(Product.id.in_(product_ids))
    )
    return result.scalars().all()


async def create_product(db: AsyncSession, product_in: ProductCreate) -> Product:
    """
    Create new product.

    Args:
        db: Database session
        product_in: Product data to create

    Returns:
        Created Product object
    """
    db_product = Product(**product_in.model_dump(exclude={"dietary_tag_ids"}))
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product


async def update_product(
    db: AsyncSession, product_id: int, product_in: ProductUpdate
) -> Optional[Product]:
    """
    Update existing product.

    Args:
        db: Database session
        product_id: Product ID to update
        product_in: Product data to update

    Returns:
        Updated Product object or None if not found
    """
    result = await db.execute(select(Product).where(Product.id == product_id))
    db_product = result.scalar_one_or_none()

    if not db_product:
        return None

    # Update only provided fields
    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)

    await db.commit()
    await db.refresh(db_product)
    return db_product


async def delete_product(db: AsyncSession, product_id: int) -> Optional[Product]:
    """
    Delete product by ID.

    Args:
        db: Database session
        product_id: Product ID to delete

    Returns:
        Deleted Product object or None if not found
    """
    result = await db.execute(select(Product).where(Product.id == product_id))
    db_product = result.scalar_one_or_none()

    if not db_product:
        return None

    await db.delete(db_product)
    await db.commit()
    return db_product


async def search_products(
    db: AsyncSession, search_query: str, skip: int = 0, limit: int = 100
) -> List[Product]:
    """
    Search products using PostgreSQL Full-Text Search (FTS).
    Searches in product name and description with ranking by relevance.

    Args:
        db: Database session
        search_query: Text to search (e.g., "galletas sin gluten")
        skip: Pagination offset
        limit: Maximum number of results

    Returns:
        List of Product objects ordered by relevance (most relevant first)

    Raises:
        N/A - returns empty list if search fails
    """
    # Sanitize input: remove extra whitespace
    clean_query = search_query.strip()

    # If query is empty, return all products
    if not clean_query:
        return await list_products(db, skip=skip, limit=limit)

    try:
        # Create tsquery using plainto_tsquery (safe from SQL injection)
        # Supports 'spanish' language for proper stemming
        tsquery = func.plainto_tsquery("spanish", clean_query)

        # Execute FTS query with ranking
        # ts_rank_cd = weighted ranking (CD = cover dense)
        result = await db.execute(
            select(Product)
            .options(selectinload(Product.dietary_tags))
            .where(Product.search_vector.op("@@")(tsquery))
            .order_by(desc(func.ts_rank_cd(Product.search_vector, tsquery)))
            .offset(int(skip) if skip else 0)
            .limit(int(limit) if limit else 100)
        )

        return result.scalars().all()

    except Exception as e:
        # Log error and fallback to simple LIKE search
        logger.warning("Full-text search failed, falling back to LIKE: %s", type(e).__name__)

        # Fallback: simple LIKE search in name and description
        search_pattern = f"%{clean_query}%"
        result = await db.execute(
            select(Product)
            .options(selectinload(Product.dietary_tags))
            .where(
                (Product.name.ilike(search_pattern)) | (Product.description.ilike(search_pattern))
            )
            .offset(int(skip) if skip else 0)
            .limit(int(limit) if limit else 100)
        )

        return result.scalars().all()


# Redis cache wrapper for products
import json

from app.config import settings
from app.db.database import get_redis

_PRODUCTS_CACHE_KEY = (
    "products:list:search={search}:skip={skip}:limit={limit}:category={category}:tags={tags}"
)


async def get_products_cached(
    db: AsyncSession,
    search: str = None,
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    dietary_tags: Optional[List[str]] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
) -> List[Product]:
    """
    Wrapper for list_products with Redis cache.
    Gracefully degrades to DB-only if Redis is unavailable.
    """
    cache_key = _PRODUCTS_CACHE_KEY.format(
        search=search or "none",
        skip=skip,
        limit=limit,
        category=category or "none",
        tags=",".join(dietary_tags) if dietary_tags else "none",
    )

    # Try cache first
    try:
        redis = await get_redis()
        if redis:
            cached = await redis.get(cache_key)
            if cached:
                logger.info("Cache hit for products: %s", cache_key)
                return json.loads(cached)
    except Exception as e:
        logger.warning("Redis cache read failed, falling back to DB: %s", e)

    # Fetch from DB
    results = await list_products(
        db=db,
        search=search,
        skip=skip,
        limit=limit,
        category=category,
        dietary_tags=dietary_tags,
        min_price=min_price,
        max_price=max_price,
    )

    # Try to cache result
    try:
        redis = await get_redis()
        if redis:
            # Serialize products - handle SQLAlchemy objects
            products_data = []
            for p in results:
                products_data.append(
                    {
                        "id": p.id,
                        "name": p.name,
                        "description": p.description,
                        "price": float(p.price),
                        "stock": p.stock,
                        "category": p.category,
                        "image": p.image,
                    }
                )
            await redis.setex(
                cache_key, settings.REDIS_CACHE_TTL_SECONDS, json.dumps(products_data)
            )
            logger.info("Cached products: %s", cache_key)
    except Exception as e:
        logger.warning("Redis cache write failed: %s", e)

    return results
