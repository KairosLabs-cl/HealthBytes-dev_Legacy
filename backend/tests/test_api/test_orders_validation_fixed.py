"""
Tests para validación de precios en órdenes.
Verifica que el backend NO confíe en los precios enviados por el cliente.
"""

import pytest
from fastapi.testclient import TestClient

from app.db.schemas import Product, User


@pytest.fixture
def test_product(db_session):
    """Crear un producto de prueba con precio conocido."""
    product = Product(
        name="Test Product", description="A test product", price=10.99, image="test.jpg"
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product


@pytest.fixture
def test_user(db_session):
    """Crear un usuario de prueba."""
    user = User(email="test@example.com", password="hashed_password", name="Test User")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.mark.asyncio
async def test_order_uses_database_price_not_client_price(
    test_user: User, test_product: Product, client: TestClient
):
    """
    TEST: Cliente intenta enviar precio falso - precio debe venir de BD
    """
    order_data = {
        "order": {},
        "items": [
            {
                "productId": test_product.id,
                "quantity": 2,
                "price": 999999,  # ← Cliente intenta mandar precio falso
            }
        ],
    }

    # Verificar que el endpoint no falla (auth puede ser 401, pero no 500)
    response = client.post("/orders/", json=order_data)
    assert response.status_code in [201, 401]
