"""
Create cart_items table migration
Run this script to add the cart_items table to your database
"""
import asyncio
import sys

# Add parent directory to path for imports
sys.path.insert(0, '..')

from app.db.database import engine
from app.db.schemas import Base, CartItem  # noqa: F401 - CartItem is imported to register the model with SQLAlchemy metadata


async def create_cart_table():
    """Create cart_items table if it doesn't exist"""
    print("Creating cart_items table...")
    
    async with engine.begin() as conn:
        # Create only the cart_items table
        await conn.run_sync(
            lambda sync_conn: CartItem.__table__.create(sync_conn, checkfirst=True)
        )
    
    print("✅ Cart table created successfully!")
    print("\nTable structure:")
    print("- id (PK)")
    print("- user_id (FK to users.id)")
    print("- product_id (FK to products.id)")
    print("- quantity")
    print("- created_at")
    print("- updated_at")
    print("- UNIQUE constraint on (user_id, product_id)")


if __name__ == "__main__":
    # Fix for Windows: Use SelectorEventLoop
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    asyncio.run(create_cart_table())

