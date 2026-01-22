#!/usr/bin/env python
"""Seed database with sample products"""

import asyncio
import selectors
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
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
            "price": 12.99,
            "stock": 50,
            "image": "https://images.unsplash.com/photo-1611859266236-9a0e3c4c4c4c?w=500&h=500&fit=crop"
        },
        {
            "name": "Pasta Sin Gluten",
            "description": "Pasta de trigo sarraceno sin gluten. Apta para celíacos.",
            "price": 4.99,
            "stock": 100,
            "image": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&h=500&fit=crop"
        },
        {
            "name": "Leche de Almendra",
            "description": "Bebida vegetal de almendra sin lactosa. 1 litro.",
            "price": 3.49,
            "stock": 75,
            "image": "https://images.unsplash.com/photo-1551462147-8589703c1c44?w=500&h=500&fit=crop"
        },
        {
            "name": "Pan Sin Gluten",
            "description": "Pan artesanal sin gluten, hecho con ingredientes naturales.",
            "price": 5.99,
            "stock": 30,
            "image": "https://images.unsplash.com/photo-1474979266404-7ea0b0c8c8b8?w=500&h=500&fit=crop"
        },
        {
            "name": "Chocolate Negro 85%",
            "description": "Chocolate sin lácteos, apto para intolerantes.",
            "price": 3.99,
            "stock": 60,
            "image": "https://images.unsplash.com/photo-1599599810694-b5ac4dd37b1b?w=500&h=500&fit=crop"
        },
        {
            "name": "Snack de Quinua",
            "description": "Barras de quinua sin azúcar. Paquete de 5 unidades.",
            "price": 7.99,
            "stock": 45,
            "image": "https://images.unsplash.com/photo-1599599810013-b9b5cff57406?w=500&h=500&fit=crop"
        },
        {
            "name": "Aceite de Coco Virgen",
            "description": "Aceite de coco orgánico prensado en frío. 500ml.",
            "price": 14.99,
            "stock": 40,
            "image": "https://images.unsplash.com/photo-1599599810632-b5c7b4d5c5c5?w=500&h=500&fit=crop"
        },
        {
            "name": "Miel Orgánica",
            "description": "Miel pura sin procesar. Ideal para diabéticos (fructosa natural).",
            "price": 8.99,
            "stock": 35,
            "image": "https://images.unsplash.com/photo-1599599810641-5c6b8b8c5c5c?w=500&h=500&fit=crop"
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
