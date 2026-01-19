from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.database import get_db
from app.db.schemas import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.middleware.auth import verify_seller, get_current_user

router = APIRouter()


@router.get("/", response_model=List[ProductResponse])
async def list_products(db: AsyncSession = Depends(get_db)):
    """
    GET /products
    List all products
    Replica of listProducts from Node.js
    """
    try:
        result = await db.execute(select(Product))
        products = result.scalars().all()
        return products
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id}", response_model=ProductResponse)
async def get_product_by_id(id: int, db: AsyncSession = Depends(get_db)):
    """
    GET /products/:id
    Get product by ID
    Replica of getProductById from Node.js
    """
    try:
        result = await db.execute(select(Product).where(Product.id == id))
        product = result.scalar_one_or_none()
        
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
        # Convert Pydantic model to dict (cleanBody equivalent)
        product = Product(**product_data.dict())
        
        db.add(product)
        await db.commit()
        await db.refresh(product)
        
        return product
    except Exception as e:
        await db.rollback()
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
        result = await db.execute(select(Product).where(Product.id == id))
        product = result.scalar_one_or_none()
        
        if not product:
            raise HTTPException(
                status_code=404, 
                detail={"message": "Product was not found"}
            )
        
        # Update only provided fields (cleanBody equivalent)
        update_data = product_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(product, key, value)
        
        await db.commit()
        await db.refresh(product)
        
        return product
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
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
        result = await db.execute(select(Product).where(Product.id == id))
        product = result.scalar_one_or_none()
        
        if not product:
            raise HTTPException(
                status_code=404, 
                detail={"message": "Product was not found"}
            )
        
        await db.delete(product)
        await db.commit()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
