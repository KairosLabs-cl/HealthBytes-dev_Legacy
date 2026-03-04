import asyncio, selectors, sys

sys.path.insert(0, ".")


async def main():
    import app.db.models.product, app.db.models.user, app.db.models.order
    import app.db.models.address, app.db.models.payment
    from app.db.database import AsyncSessionLocal
    from sqlalchemy import text

    vendors = {
        1: "Bio Mundo",
        2: "Schar Chile",
        3: "Alpro",
        4: "Don Gluten",
        5: "Mapsa Cacao",
        6: "Inti Natural",
        7: "Copra",
        8: "Del Panal",
    }

    async with AsyncSessionLocal() as db:
        for pid, vendor in vendors.items():
            await db.execute(
                text("UPDATE products SET vendor_name=:v WHERE id=:id"), {"v": vendor, "id": pid}
            )
        await db.commit()
        rows = (
            await db.execute(text("SELECT id, name, vendor_name FROM products ORDER BY id"))
        ).all()
        for r in rows:
            print(f"[{r.id}] {r.name:30s} -> {r.vendor_name}")


asyncio.run(main(), loop_factory=lambda: asyncio.SelectorEventLoop(selectors.SelectSelector()))
