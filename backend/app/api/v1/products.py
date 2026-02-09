import logging
from typing import List, Optional

from app.db.database import get_db
from app.middleware.auth import verify_seller
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services import product_service
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=List[ProductResponse])
async def list_products(
    search: Optional[str] = None,
    filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    GET /products
    GET /products?search=galletas+sin+gluten
    GET /products?filter=gluten_free,vegan

    List all products or search/filter products.
    - If search parameter is provided, performs full-text search.
    - If filter parameter is provided, filters by dietary tags (comma-separated).
    - Otherwise returns all products.

    Replica of listProducts from Node.js with FTS and filter enhancement
    """
    try:
        # Parse comma-separated dietary tag filters
        dietary_tags = None
        if filter:
            dietary_tags = [tag.strip() for tag in filter.split(",") if tag.strip()]

        if search:
            # Use full-text search when search term is provided
            return await product_service.search_products(db, search)
        else:
            # Return products with optional dietary tag filter
            return await product_service.list_products(db, dietary_tags=dietary_tags)
    except Exception as e:
        logger.error(f"Error listing/searching products: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


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

        return await product_service.get_products_by_ids(db, id_list)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    except Exception as e:
        logger.error(f"Error getting products batch: {str(e)}")
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
        logger.error(f"Error getting product {id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("/", response_model=ProductResponse, status_code=201)
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
        logger.error(f"Error creating product: {str(e)}")
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
        logger.error(f"Error updating product {id}: {str(e)}")
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
        logger.error(f"Error deleting product {id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
