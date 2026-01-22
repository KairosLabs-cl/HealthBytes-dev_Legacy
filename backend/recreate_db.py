#!/usr/bin/env python
"""Recreate database tables for development"""

import asyncio
import os
import selectors
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.db.database import Base, DATABASE_URL
from app.db.schemas import Product, User, Order, OrderItem

async def recreate_db():
    """Drop and recreate all tables"""
    
    # Create async engine
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    async with engine.begin() as conn:
        # Drop all tables
        print("🗑️ Dropping all tables...")
        await conn.run_sync(Base.metadata.drop_all)
        
        # Create all tables
        print("🔨 Creating all tables...")
        await conn.run_sync(Base.metadata.create_all)
        
        print("✅ Database recreated successfully!")
    
    await engine.dispose()

if __name__ == "__main__":
    # Use SelectorEventLoop on Windows to avoid Psycopg issues
    if hasattr(selectors, 'SelectSelector'):
        asyncio.run(recreate_db(), loop_factory=asyncio.SelectorEventLoop)
    else:
        asyncio.run(recreate_db())
