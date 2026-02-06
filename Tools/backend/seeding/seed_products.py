#!/usr/bin/env python
"""Seed database with sample products"""

import asyncio
import selectors
import sys
from pathlib import Path
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Add parent directories to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "backend"))

from app.db.database import DATABASE_URL
from app.db.schemas import Product

async def seed_products():
    """Insert sample products"""
    
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    products = [
        {
            "name": "Harina de Almendra",
            "description": "Harina de almendra sin gluten. Perfecta para repostería y cocina saludable.",
            "price": 12990,
            "stock": 50,
            "image": "https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?w=500&auto=format&fit=crop"
        },
        {
            "name": "Pasta Sin Gluten",
            "description": "Pasta de trigo sarraceno sin gluten. Apta para celíacos.",
            "price": 4990,
            "stock": 100,
            "image": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&auto=format&fit=crop"
        },
        {
            "name": "Leche de Almendra",
            "description": "Bebida vegetal de almendra sin lactosa. 1 litro.",
            "price": 3490,
            "stock": 75,
            "image": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop"
        },
        {
            "name": "Pan Sin Gluten",
            "description": "Pan artesanal sin gluten, hecho con ingredientes naturales.",
            "price": 5990,
            "stock": 30,
            "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop"
        },
        {
            "name": "Chocolate Negro 85%",
            "description": "Chocolate sin lácteos, apto para intolerantes.",
            "price": 3990,
            "stock": 60,
            "image": "https://images.unsplash.com/photo-1511381939415-e44015466834?w=500&auto=format&fit=crop"
        },
        {
            "name": "Snack de Quinua",
            "description": "Barras de quinua sin azúcar. Paquete de 5 unidades.",
            "price": 7990,
            "stock": 45,
            "image": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500&auto=format&fit=crop"
        },
        {
            "name": "Aceite de Coco Virgen",
            "description": "Aceite de coco orgánico prensado en frío. 500ml.",
            "price": 14990,
            "stock": 40,
            "image": "https://images.unsplash.com/photo-1588413333412-82148535db53?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            "name": "Miel Orgánica",
            "description": "Miel pura sin procesar. Ideal para diabéticos (fructosa natural).",
            "price": 8990,
            "stock": 35,
            "image": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=500&auto=format&fit=crop"
        },
    ]
    
    async with async_session() as session:
        try:
            print("🌱 Seeding products...")
            for product_data in products:
                product = Product(**product_data)
                session.add(product)
                print(f"  ✓ Added: {product_data['name']} (Stock: {product_data['stock']})")
            
            await session.commit()
            print("\n✅ Products seeded successfully!")
            
        except Exception as e:
            await session.rollback()
            print(f"❌ Error seeding products: {e}")
            raise
    
    await engine.dispose()

if __name__ == "__main__":
    if hasattr(selectors, 'SelectSelector'):
        asyncio.run(seed_products(), loop_factory=asyncio.SelectorEventLoop)
    else:
        asyncio.run(seed_products())
