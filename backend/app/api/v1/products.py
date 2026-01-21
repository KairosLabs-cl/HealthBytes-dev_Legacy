from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.database import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.middleware.auth import verify_seller, get_current_user
from app.services import product_service

router = APIRouter()


@router.get("/", response_model=List[ProductResponse])
async def list_products(db: AsyncSession = Depends(get_db)):
    """
    GET /products
    List all products
    Replica of listProducts from Node.js
    """
    try:
        return await product_service.list_products(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
            raise HTTPException(
                status_code=404, 
                detail={"message": "Product not found"}
            )
        
        return product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=ProductResponse, status_code=201)
async def create_product(
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(verify_seller)
):
    """
    POST /products
    Create a new product (seller only)
    Replica of createProduct from Node.js
    """
    try:
        return await product_service.create_product(db, product_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{id}", response_model=ProductResponse)
async def update_product(
    id: int,
    product_data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(verify_seller)
):
    """
    PUT /products/:id
    Update a product (seller only)
    Replica of updateProduct from Node.js
    """
    try:
        product = await product_service.update_product(db, id, product_data)
        
        if not product:
            raise HTTPException(
                status_code=404, 
                detail={"message": "Product was not found"}
            )
        
        return product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}", status_code=204)
async def delete_product(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(verify_seller)
):
    """
    DELETE /products/:id
    Delete a product (seller only)
    Replica of deleteProduct from Node.js
    """
    try:
        deleted = await product_service.delete_product(db, id)
        
        if not deleted:
            raise HTTPException(
                status_code=404, 
                detail={"message": "Product was not found"}
            )
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
