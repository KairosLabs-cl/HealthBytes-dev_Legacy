"""Seed or reset development discount data.

Dry-run by default:
    python scripts/seed_discounts.py

Apply sample discounts:
    python scripts/seed_discounts.py --apply

Reset seeded discounts:
    python scripts/seed_discounts.py --reset --apply
"""

import argparse
import asyncio
import selectors
import sys
from pathlib import Path

from sqlalchemy import text

sys.path.append(str(Path(__file__).parent.parent))

from app.db.database import AsyncSessionLocal  # noqa: E402

SAMPLE_DISCOUNTS = {
    1: 15,
    2: 25,
    5: 10,
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Seed discounts for local/dev testing.")
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Write changes. Without this flag the script only prints the plan.",
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Clear the sample discount percentages instead of setting them.",
    )
    return parser.parse_args()


async def main() -> None:
    args = parse_args()
    ids = tuple(SAMPLE_DISCOUNTS)

    async with AsyncSessionLocal() as db:
        rows = (
            await db.execute(
                text(
                    """
                    SELECT id, name, price, discount_percentage
                    FROM products
                    WHERE id = ANY(:ids)
                    ORDER BY id
                    """
                ),
                {"ids": list(ids)},
            )
        ).all()

        if not rows:
            print("No matching products found. Check DB and seed products first.")
            return

        action = "reset" if args.reset else "seed"
        mode = "APPLY" if args.apply else "DRY RUN"
        print(f"{mode}: discount {action}")

        for row in rows:
            next_discount = None if args.reset else SAMPLE_DISCOUNTS[row.id]
            print(
                f"[{row.id}] {row.name}: {row.discount_percentage} -> {next_discount}"
            )

        if not args.apply:
            print("No changes written. Re-run with --apply to update DB.")
            return

        try:
            if args.reset:
                await db.execute(
                    text(
                        """
                        UPDATE products
                        SET discount_percentage = NULL
                        WHERE id = ANY(:ids)
                        """
                    ),
                    {"ids": list(ids)},
                )
            else:
                for product_id, discount in SAMPLE_DISCOUNTS.items():
                    await db.execute(
                        text(
                            """
                            UPDATE products
                            SET discount_percentage = :discount
                            WHERE id = :product_id
                            """
                        ),
                        {"discount": discount, "product_id": product_id},
                    )
            await db.commit()
        except Exception:
            await db.rollback()
            raise

        discounted = (
            await db.execute(
                text(
                    """
                    SELECT id, name, discount_percentage
                    FROM products
                    WHERE discount_percentage IS NOT NULL
                      AND discount_percentage > 0
                    ORDER BY discount_percentage DESC
                    """
                )
            )
        ).all()
        print(f"Active discounted products: {len(discounted)}")
        for row in discounted:
            print(f"[{row.id}] {row.name}: {row.discount_percentage}%")


if __name__ == "__main__":
    asyncio.run(main(), loop_factory=lambda: asyncio.SelectorEventLoop(selectors.SelectSelector()))
