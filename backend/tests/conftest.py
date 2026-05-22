"""Pytest configuration and fixtures for backend tests."""

from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db

# Import app components
from app.main import app

# Database setup for testing - Use SQLite for tests
DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="session", autouse=True)
def disable_rate_limits():
    """Disable rate limiting for the test suite."""
    from app.core.limiter import limiter
    limiter.enabled = False
    yield



@pytest.fixture(scope="session")
def engine():
    """Create test database engine using SQLite in-memory."""
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture(scope="function")
def db_session(engine) -> Generator[Session, None, None]:
    """Provide a database session for each test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = sessionmaker(autocommit=False, autoflush=False, bind=connection)()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


class MockAsyncSession:
    """Mock AsyncSession that wraps sync Session for testing."""

    def __init__(self, sync_session: Session):
        self.sync_session = sync_session

    async def execute(self, statement):
        """Execute a statement synchronously and return result."""
        result = self.sync_session.execute(statement)
        return result

    def add(self, instance):
        """Add instance to session."""
        self.sync_session.add(instance)

    async def delete(self, instance):
        """Delete instance from session."""
        self.sync_session.delete(instance)

    async def commit(self):
        """Commit changes."""
        self.sync_session.commit()

    async def refresh(self, instance):
        """Refresh instance."""
        self.sync_session.refresh(instance)

    async def rollback(self):
        """Rollback transaction."""
        self.sync_session.rollback()

    async def flush(self):
        """Flush session."""
        self.sync_session.flush()

    async def close(self):
        """Close session."""
        self.sync_session.close()

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()


@pytest.fixture(scope="function")
def client(db_session: Session) -> TestClient:
    """Provide a FastAPI test client with mocked database."""

    # Create async generator that yields mock async session
    async def get_db_override() -> Generator[MockAsyncSession, None, None]:
        mock_session = MockAsyncSession(db_session)
        yield mock_session

    app.dependency_overrides[get_db] = get_db_override
    test_client = TestClient(app)
    yield test_client
    app.dependency_overrides.clear()


# Sample data fixtures
@pytest.fixture
def sample_product_data():
    """Sample product data for testing."""
    return {
        "name": "Test Product",
        "description": "A test product",
        "price": 9.99,
        "image": "https://example.com/image.jpg",
    }


@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        "email": "test@example.com",
        "password": "short_pwd_1234",  # Max 72 bytes for bcrypt
        "name": "Test User",
    }


def create_test_user(
    db_session: Session,
    email: str = "test@example.com",
    password: str = "hashed_test_password",
    role: str = "customer",
    **kwargs,
) -> object:
    """
    Helper to create test user with correct field names.

    Args:
        db_session: Database session
        email: User email
        password: Password (will be hashed)
        role: User role (customer, seller, admin)
        **kwargs: Additional fields (name, clerk_id, address)

    Returns:
        Created User instance
    """
    from app.db.schemas import User

    user = User(
        email=email,
        password=password,  # Field is 'password', not 'password_hash'
        role=role,
        name=kwargs.get("name", "Test User"),
        address=kwargs.get("address"),
        clerk_id=kwargs.get("clerk_id"),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def sample_order_data():
    """Sample order data for testing."""
    return {"items": [{"product_id": 1, "quantity": 2}]}


# Order and Payment fixtures for testing


@pytest.fixture
def test_user(db_session):
    """Create a test user for order/payment tests."""
    return create_test_user(
        db_session=db_session,
        email="payment_test@example.com",
        password="test_password",
        role="customer",
        name="Payment Test User",
    )


@pytest.fixture
def test_product(db_session):
    """Create a test product for order tests."""
    from app.db.schemas import Product

    product = Product(
        name="Test Product for Payment",
        description="Payment testing product",
        price=25000.00,
        stock=100,
        image="https://example.com/test.jpg",
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product


@pytest.fixture
def test_order(db_session, test_user, test_product):
    """Create a test order for payment tests."""
    from app.db.schemas import Order, OrderItem

    order = Order(
        user_id=test_user.id,
        status="New",
        total=25000.00,
    )
    db_session.add(order)
    db_session.commit()
    db_session.refresh(order)

    # Add order item
    order_item = OrderItem(
        order_id=order.id,
        product_id=test_product.id,
        quantity=1,
        price=25000.00,
    )
    db_session.add(order_item)
    db_session.commit()

    return order


@pytest.fixture
def test_payment(db_session, test_order):
    """Create a test payment for tests."""
    from decimal import Decimal

    from app.db.models.payment import Payment, PaymentProvider, PaymentStatus

    payment = Payment(
        order_id=test_order.id,
        amount=Decimal("25000.00"),
        currency="CLP",
        provider=PaymentProvider.MERCADO_PAGO,
        status=PaymentStatus.PENDING,
    )
    db_session.add(payment)
    db_session.commit()
    db_session.refresh(payment)
    return payment
