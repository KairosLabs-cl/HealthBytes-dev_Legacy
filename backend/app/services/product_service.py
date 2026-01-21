"""Product service - All product business logic."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.db.schemas import Product
from app.schemas.product import ProductCreate, ProductUpdate


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
) -> bool:
    """
    Delete product by ID.
    
    Args:
        db: Database session
        product_id: Product ID to delete
        
    Returns:
        True if deleted, False if not found
    """
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    db_product = result.scalar_one_or_none()
    
    if not db_product:
        return False
    
    await db.delete(db_product)
    await db.commit()
    return True
