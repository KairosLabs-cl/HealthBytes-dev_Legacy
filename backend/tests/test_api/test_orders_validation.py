"""
Tests para validación de precios en órdenes.
Verifica que el backend NO confíe en los precios enviados por el cliente.
"""

import pytest
import pytest_asyncio
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.schemas import Product, User, Order, OrderItem
from app.schemas.order import OrderCreate, OrderItemCreate
from app.api.v1.orders import create_order

# Helper Mock Class (same as in conftest.py)
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

    async def get(self, entity, ident):
        """Get by ID."""
        return self.sync_session.get(entity, ident)

    async def flush(self):
        self.sync_session.flush()

    async def rollback(self):
        self.sync_session.rollback()

    async def close(self):
        """Close session."""
        self.sync_session.close()

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

@pytest.fixture
def async_session(db_session):
    return MockAsyncSession(db_session)

@pytest_asyncio.fixture
async def test_product(async_session):
    """Crear un producto de prueba con precio conocido."""
    product = Product(
        name="Test Product",
        description="A test product",
        price=10.99,
        image="test.jpg"
    )
    async_session.add(product)
    await async_session.commit()
    await async_session.refresh(product)
    return product


@pytest_asyncio.fixture
async def test_user(async_session):
    """Crear un usuario de prueba."""
    user = User(
        email="test@example.com",
        password="hashed_password",
        name="Test User"
    )
    async_session.add(user)
    await async_session.commit()
    await async_session.refresh(user)
    return user


@pytest.mark.asyncio
async def test_order_uses_database_price_not_client_price(
    async_session,
    test_user: User,
    test_product: Product
):
    """
    TEST: Cliente intenta enviar precio falso
    
    Escenario:
    - Producto real tiene precio: $10.99
    - Cliente envía en orden: $999999
    
    Esperado:
    - La orden se crea con precio REAL: $10.99
    - NUNCA con el precio falso: $999999
    """
    # Preparar datos
    client_price = 999999  # Precio falso que intenta enviar el cliente
    real_price = test_product.price  # Precio real en BD
    
    # Cliente intenta enviar orden con precio falso
    order_data = OrderCreate(
        order={},
        items=[
            OrderItemCreate(
                productId=test_product.id,
                quantity=2,
                price=client_price  # ← Cliente manda $999999
            )
        ]
    )
    
    # Crear orden (esta función debe validar)
    result = await create_order(order_data, async_session, test_user)
    
    # Verificar que la orden se creó
    assert result.id is not None
    assert len(result.items) == 1
    
    # CRÍTICO: Verificar que se usó el precio REAL, no el falso
    assert result.items[0].price == real_price, \
        f"❌ INSEGURO: Se usó precio {result.items[0].price} en lugar de {real_price}"
    
    assert result.items[0].price != client_price, \
        f"❌ CRÍTICO: Se aceptó precio falso del cliente: {client_price}"
    
    print(f"✅ SEGURO: Orden creada con precio correcto ${real_price}")


@pytest.mark.asyncio
async def test_order_rejects_nonexistent_product(
    async_session,
    test_user: User
):
    """
    TEST: Cliente intenta comprar producto que no existe
    
    Escenario:
    - Producto ID 99999 no existe en BD
    - Cliente envía orden con ese producto
    
    Esperado:
    - Error 404
    - Orden NO se crea
    - BD se mantiene consistente
    """
    order_data = OrderCreate(
        order={},
        items=[
            OrderItemCreate(
                productId=99999,  # No existe
                quantity=1,
                price=100
            )
        ]
    )
    
    # Intentar crear orden debe fallar
    from fastapi import HTTPException
    
    with pytest.raises(HTTPException) as exc_info:
        await create_order(order_data, async_session, test_user)
    
    # Verificar que el error es 404
    assert exc_info.value.status_code == 404
    assert "no encontrado" in exc_info.value.detail.lower()
    
    # Verificar que NO se creó la orden
    orders = await async_session.execute(select(Order))
    assert len(orders.scalars().all()) == 0
    
    print(f"✅ SEGURO: Producto inexistente rechazado con 404")


@pytest.mark.asyncio
async def test_order_multiple_items_validation(
    async_session,
    test_user: User,
    test_product: Product
):
    """
    TEST: Orden con múltiples items
    
    Escenario:
    - Crear 2 productos más
    - Orden con 3 items (precios falsos en todos)
    
    Esperado:
    - Todos los items usan precios reales de BD
    """
    # Crear productos adicionales
    product2 = Product(name="Product 2", price=20.00, description="", image="")
    product3 = Product(name="Product 3", price=15.50, description="", image="")
    async_session.add(product2)
    async_session.add(product3)
    await async_session.commit()
    await async_session.refresh(product2)
    await async_session.refresh(product3)
    
    # Cliente intenta mandar precios falsos para todos
    order_data = OrderCreate(
        order={},
        items=[
            OrderItemCreate(productId=test_product.id, quantity=1, price=999),
            OrderItemCreate(productId=product2.id, quantity=2, price=888),
            OrderItemCreate(productId=product3.id, quantity=3, price=777),
        ]
    )
    
    result = await create_order(order_data, async_session, test_user)
    
    # Verificar que TODOS los items tienen precios reales
    assert result.items[0].price == test_product.price
    assert result.items[1].price == product2.price
    assert result.items[2].price == product3.price
    
    print(f"✅ SEGURO: Todos los items creados con precios reales")


@pytest.mark.asyncio
async def test_order_with_correct_quantity(
    async_session,
    test_user: User,
    test_product: Product
):
    """
    TEST: Cantidad se guarda correctamente
    
    La cantidad SÍ viene del cliente (es información de UX)
    El precio NO debe venir del cliente (es información de seguridad/negocio)
    """
    order_data = OrderCreate(
        order={},
        items=[
            OrderItemCreate(
                productId=test_product.id,
                quantity=5,  # Cliente puede mandar cualquier cantidad
                price=999999  # Pero el precio debe ignorarse
            )
        ]
    )
    
    result = await create_order(order_data, async_session, test_user)
    
    # Cantidad sí debe venir del cliente
    assert result.items[0].quantity == 5
    
    # Pero precio NO
    assert result.items[0].price == test_product.price
    
    print(f"✅ Cantidad: {result.items[0].quantity}, Precio: ${result.items[0].price}")
