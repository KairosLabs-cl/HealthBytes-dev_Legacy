"""Pytest configuration and fixtures for backend tests."""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from typing import Generator
from unittest.mock import AsyncMock, MagicMock
from contextlib import asynccontextmanager

# Import app components
from app.main import app
from app.db.database import Base, get_db


# Database setup for testing - Use SQLite for tests
DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="session")
def engine():
    """Create test database engine using SQLite in-memory."""
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


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
        "image": "https://example.com/image.jpg"
    }


@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        "email": "test@example.com",
        "password": "short_pwd_1234",  # Max 72 bytes for bcrypt
        "name": "Test User"
    }


def create_test_user(
    db_session: Session,
    email: str = "test@example.com",
    password: str = "hashed_test_password",
    role: str = "customer",
    **kwargs
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
        clerk_id=kwargs.get("clerk_id")
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def sample_order_data():
    """Sample order data for testing."""
    return {
        "items": [
            {"product_id": 1, "quantity": 2}
        ]
    }
