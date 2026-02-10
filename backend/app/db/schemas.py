from app.db.database import Base
from sqlalchemy import (
    ARRAY,
    TIMESTAMP,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    TypeDecorator,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship


# Custom type that works with both PostgreSQL and SQLite
class SearchVector(TypeDecorator):
    """A custom type that represents PostgreSQL tsvector but falls back to Text for other databases."""

    impl = Text
    cache_ok = True

    def type_descriptor(self, typeobj):
        return Text()


class Product(Base):
    """Products table - Replica of productsTable from Drizzle"""

    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    image = Column(String(255), nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    category = Column(String(100), nullable=True, index=True)
    dietary_tags = Column(ARRAY(String), nullable=True, default=[])
    
    # Full-text search column
    # PostgreSQL: TSVECTOR with GIN index, populated by trigger
    # SQLite (tests): Text fallback
    # NOTE: search_vector is populated automatically by database trigger on INSERT/UPDATE
    # Do NOT set this column in Python - let the database trigger handle it
    search_vector = Column(SearchVector, nullable=True)

    # Many-to-many relationship with DietaryTag
    dietary_tags = relationship(
        "DietaryTag", secondary="product_dietary_tags", back_populates="products"
    )

    # GIN index for PostgreSQL full-text search (ignored in SQLite)
    __table_args__ = (Index("idx_product_search", "search_vector", postgresql_using="gin"),)


# Association table for Product <-> DietaryTag many-to-many
product_dietary_tags = Base.metadata.tables.get("product_dietary_tags")
if product_dietary_tags is None:
    from sqlalchemy import Table

    product_dietary_tags = Table(
        "product_dietary_tags",
        Base.metadata,
        Column(
            "product_id", Integer, ForeignKey("products.id", ondelete="CASCADE"), primary_key=True
        ),
        Column(
            "dietary_tag_id",
            Integer,
            ForeignKey("dietary_tags.id", ondelete="CASCADE"),
            primary_key=True,
        ),
    )


class DietaryTag(Base):
    """Dietary tags table - Stores dietary restriction tags (gluten-free, vegan, etc.)"""

    __tablename__ = "dietary_tags"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(
        String(50), unique=True, nullable=False, index=True
    )  # e.g., "gluten_free", "vegan"
    display_name = Column(String(100), nullable=False)  # e.g., "Sin gluten", "Vegano"
    color = Column(String(20), nullable=True)  # e.g., "green", "blue" for badge styling

    # Back-reference to products
    products = relationship(
        "Product", secondary="product_dietary_tags", back_populates="dietary_tags"
    )


class User(Base):
    """Users table - Replica of usersTable from Drizzle"""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=True)  # Nullable for Clerk users
    role = Column(String(255), nullable=False, default="user")
    name = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    clerk_id = Column(String(255), unique=True, nullable=True, index=True)  # Clerk user ID
    
    # Relationship with favorites
    favorites = relationship("UserFavorite", back_populates="user", cascade="all, delete-orphan")


class UserFavorite(Base):
    """User favorites table - Many-to-many relationship between users and products"""
    __tablename__ = "user_favorites"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="favorites")
    product = relationship("Product")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('user_id', 'product_id', name='unique_user_product_favorite'),
    )


class Order(Base):
    """Orders table - Replica of ordersTable from Drizzle"""

    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    status = Column(String(50), nullable=False, default="New")
    total = Column(Numeric(10, 2), nullable=False, default=0.0)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    stripe_payment_intent_id = Column(String(255), nullable=True)

    items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    """Order items table - Replica of orderItemsTable from Drizzle"""

    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)

    order = relationship("Order", back_populates="items")


class CartItem(Base):
    """Cart items table - Stores shopping cart items per user"""

    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", backref="cart_items")
    product = relationship("Product")

    # Constraint: one user can't have the same product duplicated in cart
    __table_args__ = (UniqueConstraint("user_id", "product_id", name="uq_user_product_cart"),)
