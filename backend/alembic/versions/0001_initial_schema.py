"""initial schema — all tables for clean environments

Revision ID: 0001_initial
Revises: (none — this is the root migration)
Create Date: 2026-03-02 18:00:00.000000

Creates every table that the HealthBytes ORM defines:
  products, dietary_tags, product_dietary_tags, users, user_favorites,
  orders, order_items, cart_items, addresses, payments

All columns and indexes match the current SQLAlchemy models so that
``alembic upgrade head`` works on an empty database without relying on
external SQL scripts.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ------------------------------------------------------------------
    # 1. products
    # ------------------------------------------------------------------
    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image", sa.String(length=255), nullable=True),
        sa.Column("price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("stock", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("category", sa.String(length=100), nullable=True),
        sa.Column("nutritional_info", sa.Text(), nullable=True),
        sa.Column("search_vector", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_products_id"), "products", ["id"], unique=False)
    op.create_index(op.f("ix_products_name"), "products", ["name"], unique=False)
    op.create_index(op.f("ix_products_category"), "products", ["category"], unique=False)
    op.create_index(
        "idx_product_search",
        "products",
        ["search_vector"],
        unique=False,
        postgresql_using="gin",
    )

    # ------------------------------------------------------------------
    # 2. dietary_tags
    # ------------------------------------------------------------------
    op.create_table(
        "dietary_tags",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("display_name", sa.String(length=100), nullable=False),
        sa.Column("color", sa.String(length=20), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_dietary_tags_id"), "dietary_tags", ["id"], unique=False)
    op.create_index(op.f("ix_dietary_tags_name"), "dietary_tags", ["name"], unique=True)

    # ------------------------------------------------------------------
    # 3. product_dietary_tags (many-to-many association)
    # ------------------------------------------------------------------
    op.create_table(
        "product_dietary_tags",
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("dietary_tag_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["dietary_tag_id"], ["dietary_tags.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("product_id", "dietary_tag_id"),
    )

    # ------------------------------------------------------------------
    # 4. users
    # ------------------------------------------------------------------
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password", sa.String(length=255), nullable=True),
        sa.Column("role", sa.String(length=255), nullable=False, server_default="user"),
        sa.Column("name", sa.String(length=255), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("clerk_id", sa.String(length=255), nullable=True),
        sa.Column("dietary_preferences", sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("clerk_id"),
    )
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_clerk_id"), "users", ["clerk_id"], unique=True)

    # ------------------------------------------------------------------
    # 5. user_favorites
    # ------------------------------------------------------------------
    op.create_table(
        "user_favorites",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "product_id", name="unique_user_product_favorite"),
    )
    op.create_index(op.f("ix_user_favorites_id"), "user_favorites", ["id"], unique=False)
    op.create_index(op.f("ix_user_favorites_user_id"), "user_favorites", ["user_id"], unique=False)
    op.create_index(
        op.f("ix_user_favorites_product_id"), "user_favorites", ["product_id"], unique=False
    )

    # ------------------------------------------------------------------
    # 6. addresses
    # ------------------------------------------------------------------
    op.create_table(
        "addresses",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("label", sa.String(length=50), nullable=True),
        sa.Column("street", sa.String(length=255), nullable=False),
        sa.Column("street_number", sa.String(length=20), nullable=True),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("region", sa.String(length=100), nullable=False),
        sa.Column("postal_code", sa.String(length=20), nullable=False),
        sa.Column("country", sa.String(length=2), server_default="CL", nullable=True),
        sa.Column("recipient_name", sa.String(length=100), nullable=True),
        sa.Column("phone", sa.String(length=20), nullable=True),
        sa.Column("is_default", sa.Boolean(), server_default="false", nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_addresses_id"), "addresses", ["id"], unique=False)
    op.create_index(op.f("ix_addresses_user_id"), "addresses", ["user_id"], unique=False)

    # ------------------------------------------------------------------
    # 7. orders
    # ------------------------------------------------------------------
    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="pending"),
        sa.Column("total", sa.Numeric(precision=10, scale=2), nullable=False, server_default="0"),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("address_id", sa.Integer(), nullable=True),
        sa.Column(
            "payment_method", sa.String(length=50), nullable=True, server_default="mercado_pago"
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["address_id"], ["addresses.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_orders_id"), "orders", ["id"], unique=False)
    op.create_index(op.f("ix_orders_user_id"), "orders", ["user_id"], unique=False)
    op.create_index(op.f("ix_orders_address_id"), "orders", ["address_id"], unique=False)
    op.create_index("idx_order_status", "orders", ["status"], unique=False)
    op.create_index("idx_order_created_at", "orders", ["created_at"], unique=False)

    # ------------------------------------------------------------------
    # 8. order_items
    # ------------------------------------------------------------------
    op.create_table(
        "order_items",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"]),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_order_items_id"), "order_items", ["id"], unique=False)
    op.create_index(op.f("ix_order_items_order_id"), "order_items", ["order_id"], unique=False)
    op.create_index(op.f("ix_order_items_product_id"), "order_items", ["product_id"], unique=False)

    # ------------------------------------------------------------------
    # 9. cart_items
    # ------------------------------------------------------------------
    op.create_table(
        "cart_items",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "product_id", name="uq_user_product_cart"),
    )
    op.create_index(op.f("ix_cart_items_id"), "cart_items", ["id"], unique=False)
    op.create_index(op.f("ix_cart_items_user_id"), "cart_items", ["user_id"], unique=False)

    # ------------------------------------------------------------------
    # 10. payments (with PostgreSQL enums)
    # ------------------------------------------------------------------
    # Create enum types for PostgreSQL; SQLite ignores these
    paymentcurrency = sa.Enum("CLP", "USD", name="paymentcurrency", create_type=False)
    paymentstatus = sa.Enum(
        "PENDING",
        "PROCESSING",
        "COMPLETED",
        "FAILED",
        "REFUNDED",
        "CANCELLED",
        name="paymentstatus",
        create_type=False,
    )
    paymentprovider = sa.Enum("MERCADO_PAGO", name="paymentprovider", create_type=False)

    # Create enums explicitly (safe no-op on SQLite)
    paymentcurrency.create(op.get_bind(), checkfirst=True)
    paymentstatus.create(op.get_bind(), checkfirst=True)
    paymentprovider.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "payments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("currency", paymentcurrency, nullable=False, server_default="CLP"),
        sa.Column("status", paymentstatus, nullable=False, server_default="PENDING"),
        sa.Column("provider", paymentprovider, nullable=False),
        sa.Column("provider_payment_id", sa.String(length=255), nullable=True),
        sa.Column("provider_reference", sa.String(length=255), nullable=True),
        sa.Column("error_message", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(), nullable=False),
        sa.Column("completed_at", sa.TIMESTAMP(), nullable=True),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_payments_id"), "payments", ["id"], unique=False)
    op.create_index(op.f("ix_payments_order_id"), "payments", ["order_id"], unique=False)
    op.create_index(op.f("ix_payments_status"), "payments", ["status"], unique=False)
    op.create_index(op.f("ix_payments_provider"), "payments", ["provider"], unique=False)
    op.create_index(
        op.f("ix_payments_provider_payment_id"),
        "payments",
        ["provider_payment_id"],
        unique=False,
    )


def downgrade() -> None:
    # Drop in reverse dependency order
    op.drop_table("payments")
    op.execute("DROP TYPE IF EXISTS paymentcurrency")
    op.execute("DROP TYPE IF EXISTS paymentstatus")
    op.execute("DROP TYPE IF EXISTS paymentprovider")

    op.drop_table("cart_items")
    op.drop_table("order_items")
    op.drop_table("orders")
    op.drop_table("addresses")
    op.drop_table("user_favorites")
    op.drop_table("product_dietary_tags")
    op.drop_table("dietary_tags")
    op.drop_table("products")
    op.drop_table("users")
