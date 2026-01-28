from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, TIMESTAMP, func, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.database import Base


class Product(Base):
    """Products table - Replica of productsTable from Drizzle"""
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image = Column(String(255), nullable=True)
    price = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False, default=0)


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


class Order(Base):
    """Orders table - Replica of ordersTable from Drizzle"""
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    status = Column(String(50), nullable=False, default="New")
    total = Column(Float, nullable=False, default=0.0)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stripe_payment_intent_id = Column(String(255), nullable=True)

    items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    """Order items table - Replica of orderItemsTable from Drizzle"""
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")


class CartItem(Base):
    """Cart items table - Stores shopping cart items per user"""
    __tablename__ = "cart_items"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="cart_items")
    product = relationship("Product")
    
    # Constraint: one user can't have the same product duplicated in cart
    __table_args__ = (
        UniqueConstraint('user_id', 'product_id', name='uq_user_product_cart'),
    )
