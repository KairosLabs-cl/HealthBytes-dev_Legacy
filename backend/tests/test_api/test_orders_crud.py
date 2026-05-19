"""
Tests for orders CRUD API endpoints.
Covers create, list, get, update, delete with auth and role checks.
"""

import pytest

from app.db.schemas import Order, OrderItem, Product
from app.main import app
from app.middleware.auth import get_current_user
from tests.conftest import create_test_user


@pytest.fixture
def customer_user(db_session):
    """Create a customer user."""
    return create_test_user(
        db_session, email="orders_customer@test.com", role="customer", name="Customer"
    )


@pytest.fixture
def admin_user(db_session):
    """Create an admin user."""
    return create_test_user(db_session, email="orders_admin@test.com", role="admin", name="Admin")


@pytest.fixture
def seller_user(db_session):
    """Create a seller user."""
    return create_test_user(
        db_session, email="orders_seller@test.com", role="seller", name="Seller"
    )


@pytest.fixture
def products(db_session):
    """Create test products."""
    p1 = Product(name="Product A", description="Desc A", price=5000.0, stock=50)
    p2 = Product(name="Product B", description="Desc B", price=3000.0, stock=20)
    db_session.add_all([p1, p2])
    db_session.commit()
    db_session.refresh(p1)
    db_session.refresh(p2)
    return [p1, p2]


@pytest.fixture
def order_with_items(db_session, customer_user, products):
    """Create an order with items for the customer user."""
    order = Order(user_id=customer_user.id, status="unpaid", total=13000.0)
    db_session.add(order)
    db_session.commit()
    db_session.refresh(order)

    item1 = OrderItem(order_id=order.id, product_id=products[0].id, quantity=2, price=5000.0)
    item2 = OrderItem(order_id=order.id, product_id=products[1].id, quantity=1, price=3000.0)
    db_session.add_all([item1, item2])
    db_session.commit()
    return order


class TestCreateOrder:
    """Tests for POST /orders/"""

    def test_create_order_success(self, client, db_session, customer_user, products):
        """Test successful order creation."""
        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            order_data = {
                "items": [
                    {"productId": products[0].id, "quantity": 1, "price": 5000.0},
                ]
            }
            response = client.post("/orders", json=order_data)
            assert response.status_code == 201
            data = response.json()
            assert data["user_id"] == customer_user.id
            assert data["status"] == "unpaid"
            assert len(data["items"]) == 1
            assert data["items"][0]["product_id"] == products[0].id
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_create_order_requires_auth(self, client):
        """Test that creating order requires authentication."""
        response = client.post(
            "/orders", json={"items": [{"productId": 1, "quantity": 1, "price": 10}]}
        )
        assert response.status_code == 401

    def test_create_order_product_not_found(self, client, db_session, customer_user):
        """Test creating order with non-existent product returns error."""
        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            order_data = {
                "items": [
                    {"productId": 99999, "quantity": 1, "price": 100.0},
                ]
            }
            response = client.post("/orders", json=order_data)
            # May return 404 or 422 depending on validation path
            assert response.status_code in [404, 422]
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_create_order_empty_items(self, client, db_session, customer_user):
        """Test creating order with no items returns 422."""
        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            response = client.post("/orders", json={"items": []})
            assert response.status_code == 422
        finally:
            app.dependency_overrides.pop(get_current_user, None)


class TestListOrders:
    """Tests for GET /orders/"""

    def test_list_orders_customer(self, client, db_session, customer_user, order_with_items):
        """Test customer sees only their orders."""
        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            response = client.get("/orders")
            assert response.status_code == 200
            data = response.json()
            assert len(data) >= 1
            for order in data:
                assert order["user_id"] == customer_user.id
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_list_orders_admin_sees_all(self, client, db_session, admin_user, order_with_items):
        """Test admin sees all orders."""
        app.dependency_overrides[get_current_user] = lambda: admin_user
        try:
            response = client.get("/orders")
            assert response.status_code == 200
            data = response.json()
            assert len(data) >= 1
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_list_orders_seller(self, client, db_session, seller_user, order_with_items):
        """Test seller sees orders (currently all, TODO: filter by seller products)."""
        app.dependency_overrides[get_current_user] = lambda: seller_user
        try:
            response = client.get("/orders")
            assert response.status_code == 200
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_list_orders_requires_auth(self, client):
        """Test listing orders requires authentication."""
        response = client.get("/orders")
        assert response.status_code == 401


class TestGetOrder:
    """Tests for GET /orders/{id}"""

    def test_get_order_success(self, client, db_session, customer_user, order_with_items):
        """Test getting own order by ID."""
        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            response = client.get(f"/orders/{order_with_items.id}")
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == order_with_items.id
            assert data["user_id"] == customer_user.id
            assert len(data["items"]) == 2
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_get_order_not_found(self, client, db_session, customer_user):
        """Test getting non-existent order."""
        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            response = client.get("/orders/99999")
            assert response.status_code == 404
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_get_order_other_user_forbidden(self, client, db_session, order_with_items):
        """Test that customer can't see another user's order."""
        other_user = create_test_user(
            db_session, email="other_user@test.com", role="customer", name="Other"
        )
        app.dependency_overrides[get_current_user] = lambda: other_user
        try:
            response = client.get(f"/orders/{order_with_items.id}")
            assert response.status_code == 404  # Filtered out by user_id
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_get_order_admin_can_see_any(self, client, db_session, admin_user, order_with_items):
        """Test that admin can see any order."""
        app.dependency_overrides[get_current_user] = lambda: admin_user
        try:
            response = client.get(f"/orders/{order_with_items.id}")
            assert response.status_code == 200
            assert response.json()["id"] == order_with_items.id
        finally:
            app.dependency_overrides.pop(get_current_user, None)


class TestUpdateOrder:
    """Tests for PUT /orders/{id}"""

    def test_update_order_admin_success(self, client, db_session, admin_user, order_with_items):
        """Test admin can update order status."""
        app.dependency_overrides[get_current_user] = lambda: admin_user
        try:
            response = client.put(f"/orders/{order_with_items.id}", json={"status": "processing"})
            assert response.status_code == 200
            assert response.json()["status"] == "processing"
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_update_order_customer_forbidden(
        self, client, db_session, customer_user, order_with_items
    ):
        """Test customer cannot update order."""
        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            response = client.put(f"/orders/{order_with_items.id}", json={"status": "shipped"})
            assert response.status_code == 403
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_update_order_not_found(self, client, db_session, admin_user):
        """Test updating non-existent order."""
        app.dependency_overrides[get_current_user] = lambda: admin_user
        try:
            response = client.put("/orders/99999", json={"status": "shipped"})
            assert response.status_code == 404
        finally:
            app.dependency_overrides.pop(get_current_user, None)


class TestDeleteOrder:
    """Tests for DELETE /orders/{id}"""

    def test_delete_order_admin_success(self, client, db_session, admin_user, customer_user):
        """Test admin can delete order (without items to avoid FK constraint)."""
        order = Order(user_id=customer_user.id, status="New", total=0.0)
        db_session.add(order)
        db_session.commit()
        db_session.refresh(order)

        app.dependency_overrides[get_current_user] = lambda: admin_user
        try:
            response = client.delete(f"/orders/{order.id}")
            assert response.status_code == 204
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_delete_order_customer_forbidden(
        self, client, db_session, customer_user, order_with_items
    ):
        """Test customer cannot delete order."""
        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            response = client.delete(f"/orders/{order_with_items.id}")
            assert response.status_code == 403
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_delete_order_not_found(self, client, db_session, admin_user):
        """Test deleting non-existent order."""
        app.dependency_overrides[get_current_user] = lambda: admin_user
        try:
            response = client.delete("/orders/99999")
            assert response.status_code == 404
        finally:
            app.dependency_overrides.pop(get_current_user, None)
