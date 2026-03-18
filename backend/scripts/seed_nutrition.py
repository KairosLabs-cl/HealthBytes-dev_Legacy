"""
Script to seed nutritional info for existing products.
Execute with: python scripts/seed_nutrition.py
"""

import asyncio
import sys
from pathlib import Path
import json
import random

# Add parent directory to path to allow imports
sys.path.append(str(Path(__file__).parent.parent))

from app.db.database import AsyncSessionLocal
from app.db.schemas import Product
from sqlalchemy import select, update

# Nutrition data templates per category (approximate values)
NUTRITION_TEMPLATES = {
    "snack": {"calories": 150, "protein": 5, "carbs": 20, "fat": 8},
    "beverage": {"calories": 80, "protein": 0, "carbs": 15, "fat": 0},
    "meal": {"calories": 450, "protein": 25, "carbs": 40, "fat": 15},
    "dessert": {"calories": 300, "protein": 3, "carbs": 35, "fat": 12},
    "default": {"calories": 200, "protein": 10, "carbs": 25, "fat": 10},
}


async def seed_nutrition():
    print("🌱 Seeding nutritional info...")

    async with AsyncSessionLocal() as db:
        try:
            # Fetch all products
            result = await db.execute(select(Product))
            products = result.scalars().all()

            updated_count = 0

            for product in products:
                # Determine category based on name (simple heuristic)
                name_lower = product.name.lower()
                category = "default"

                if "snack" in name_lower or "bar" in name_lower or "chips" in name_lower:
                    category = "snack"
                elif "drink" in name_lower or "juice" in name_lower or "tea" in name_lower:
                    category = "beverage"
                elif "meal" in name_lower or "bowl" in name_lower or "pasta" in name_lower:
                    category = "meal"
                elif "cookie" in name_lower or "cake" in name_lower or "sweet" in name_lower:
                    category = "dessert"

                # Get base template and add some randomness
                template = NUTRITION_TEMPLATES.get(category, NUTRITION_TEMPLATES["default"])

                nutrition_data = {
                    "calories": int(template["calories"] * random.uniform(0.9, 1.1)),
                    "protein": round(template["protein"] * random.uniform(0.9, 1.1), 1),
                    "carbs": round(template["carbs"] * random.uniform(0.9, 1.1), 1),
                    "fat": round(template["fat"] * random.uniform(0.9, 1.1), 1),
                }

                # Update product
                product.nutritional_info = json.dumps(nutrition_data)
                updated_count += 1

            await db.commit()
            print(f"✅ Successfully updated {updated_count} products with nutritional info!")

        except Exception as e:
            print(f"❌ Seeding failed: {e}")
            await db.rollback()


if __name__ == "__main__":
    import os

    if os.name == "nt":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed_nutrition())
