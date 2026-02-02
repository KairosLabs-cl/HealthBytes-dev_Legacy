"""Product service - All product business logic."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Optional
import logging

from app.db.schemas import Product
from app.schemas.product import ProductCreate, ProductUpdate

logger = logging.getLogger(__name__)


async def list_products(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100
) -> List[Product]:
    """
    Get all products with pagination.
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of Product objects
    """
    # Ensure skip and limit are Python integers to avoid PostgreSQL cast issues
    skip = int(skip) if skip is not None else 0
    limit = int(limit) if limit is not None else 100
    
    result = await db.execute(
        select(Product)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def get_product(
    db: AsyncSession,
    product_id: int
) -> Optional[Product]:
    """
    Get product by ID.
    
    Args:
        db: Database session
        product_id: Product ID
        
    Returns:
        Product object or None if not found
    """
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    return result.scalar_one_or_none()


async def get_products_by_ids(
    db: AsyncSession,
    product_ids: List[int]
) -> List[Product]:
    """
    Get multiple products by IDs.

    Args:
        db: Database session
        product_ids: List of product IDs

    Returns:
        List of Product objects
    """
    result = await db.execute(
        select(Product).where(Product.id.in_(product_ids))
    )
    return result.scalars().all()


async def create_product(
    db: AsyncSession,
    product_in: ProductCreate
) -> Product:
    """
    Create new product.
    
    Args:
        db: Database session
        product_in: Product data to create
        
    Returns:
        Created Product object
    """
    db_product = Product(**product_in.model_dump())
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product


async def update_product(
    db: AsyncSession,
    product_id: int,
    product_in: ProductUpdate
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
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
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


async def delete_product(
    db: AsyncSession,
    product_id: int
) -> Optional[Product]:
    """
    Delete product by ID.
    
    Args:
        db: Database session
        product_id: Product ID to delete
        
    Returns:
        Deleted Product object or None if not found
    """
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    db_product = result.scalar_one_or_none()
    
    if not db_product:
        return None
    
    await db.delete(db_product)
    await db.commit()
    return db_product


async def search_products(
    db: AsyncSession,
    search_query: str,
    skip: int = 0,
    limit: int = 100
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
        return await list_products(db, skip, limit)
    
    try:
        # Create tsquery using plainto_tsquery (safe from SQL injection)
        # Supports 'spanish' language for proper stemming
        tsquery = func.plainto_tsquery('spanish', clean_query)
        
        # Execute FTS query with ranking
        # ts_rank_cd = weighted ranking (CD = cover dense)
        result = await db.execute(
            select(Product)
            .where(Product.search_vector.op('@@')(tsquery))
            .order_by(desc(func.ts_rank_cd(Product.search_vector, tsquery)))
            .offset(int(skip) if skip else 0)
            .limit(int(limit) if limit else 100)
        )
        
        return result.scalars().all()
    
    except Exception as e:
        # Log error and fallback to simple LIKE search
        logger.warning(f"Full-text search failed, falling back to LIKE: {str(e)}")
        
        # Fallback: simple LIKE search in name and description
        search_pattern = f"%{clean_query}%"
        result = await db.execute(
            select(Product)
            .where(
                (Product.name.ilike(search_pattern)) | 
                (Product.description.ilike(search_pattern))
            )
            .offset(int(skip) if skip else 0)
            .limit(int(limit) if limit else 100)
        )
        
        return result.scalars().all()
