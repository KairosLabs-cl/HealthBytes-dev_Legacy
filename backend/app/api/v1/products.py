import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.middleware.auth import verify_seller
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services import product_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("", response_model=List[ProductResponse])
async def list_products(
    search: Optional[str] = Query(None, max_length=100, description="Search term"),
    category: Optional[str] = None,
    dietary: Optional[str] = None,  # Comma-separated tags: "vegano,sin-gluten"
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    skip: int = 0,
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    GET /products
    GET /products?search=galletas
    GET /products?category=Snacks&dietary=vegano,sin-gluten&min_price=1000
    """
    try:
        # Parse dietary tags string into a list
        dietary_tags = [t.strip() for t in dietary.split(",") if t.strip()] if dietary else None

        # Normalize search: treat whitespace-only as no search
        clean_search = search.strip() if search else None

        # Always apply all filters together (search + category + dietary + price)
        return await product_service.list_products(
            db,
            search=clean_search or None,
            skip=skip,
            limit=limit,
            category=category,
            dietary_tags=dietary_tags,
            min_price=min_price,
            max_price=max_price,
        )
    except Exception as e:
        logger.error("Error listing/searching products: %s", type(e).__name__)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.get("/featured", response_model=ProductResponse)
async def get_featured_product(db: AsyncSession = Depends(get_db)):
    """
    GET /products/featured
    Get the newest in-stock product for the hero banner.
    """
    product = await product_service.get_featured_product(db)
    if not product:
        raise HTTPException(status_code=404, detail="No featured product available")
    return product


@router.get("/batch", response_model=List[ProductResponse])
async def get_products_by_ids(ids: str, db: AsyncSession = Depends(get_db)):
    """
    GET /products/batch?ids=1,2,3
    Get multiple products by IDs
    Useful for recently viewed or cart items
    """
    try:
        # Parse comma-separated IDs, # Convierte "1,2,3" en [1, 2, 3]
        id_list = [int(id.strip()) for id in ids.split(",") if id.strip()]

        if not id_list:
            return []

        if len(id_list) > 50:
            raise HTTPException(status_code=400, detail="Máximo 50 IDs por consulta batch")

        return await product_service.get_products_by_ids(db, id_list)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    except Exception as e:
        logger.error("Error getting products batch: %s", type(e).__name__)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.get("/{id}", response_model=ProductResponse)
async def get_product_by_id(id: int, db: AsyncSession = Depends(get_db)):
    """
    GET /products/:id
    Get product by ID
    Replica of getProductById from Node.js
    """
    try:
        product = await product_service.get_product(db, id)

        if not product:
            raise HTTPException(status_code=404, detail={"message": "Product not found"})

        return product
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting product %s: %s", id, type(e).__name__)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("", response_model=ProductResponse, status_code=201)
async def create_product(
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(verify_seller),
):
    """
    POST /products
    Create a new product (seller only)
    Replica of createProduct from Node.js
    """
    try:
        return await product_service.create_product(db, product_data)
    except Exception as e:
        logger.error("Error creating product: %s", type(e).__name__)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.put("/{id}", response_model=ProductResponse)
async def update_product(
    id: int,
    product_data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(verify_seller),
):
    """
    PUT /products/:id
    Update a product (seller only)
    Replica of updateProduct from Node.js
    """
    try:
        product = await product_service.update_product(db, id, product_data)

        if not product:
            raise HTTPException(status_code=404, detail={"message": "Product was not found"})

        return product
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error updating product %s: %s", id, type(e).__name__)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.delete("/{id}", status_code=204)
async def delete_product(
    id: int, db: AsyncSession = Depends(get_db), current_user=Depends(verify_seller)
):
    """
    DELETE /products/:id
    Delete a product (seller only)
    Replica of deleteProduct from Node.js
    """
    try:
        deleted = await product_service.delete_product(db, id)

        if not deleted:
            raise HTTPException(status_code=404, detail={"message": "Product was not found"})

        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error deleting product %s: %s", id, type(e).__name__)
        raise HTTPException(status_code=500, detail="Internal Server Error")
