"""
Tests for Cart API endpoints
"""
import pytest
from fastapi import status
from app.db.schemas import User, Product, CartItem
from app.core.security import create_access_token
from tests.conftest import create_test_user


@pytest.fixture
def test_user(db_session):
    """Create a test user"""
    return create_test_user(db_session, email="cart_user@test.com", role="customer")


@pytest.fixture
def auth_headers(test_user):
    """Generate auth headers with JWT token"""
    token = create_access_token({"userId": test_user.id, "role": test_user.role})
    return {"Authorization": token}


@pytest.fixture
def test_products(db_session):
    """Create test products"""
    product1 = Product(
        name="Test Product 1",
        description="Description 1",
        price=10.0,
        stock=100,
        image="http://example.com/img1.jpg"
    )
    product2 = Product(
        name="Test Product 2",
        description="Description 2",
        price=20.0,
        stock=50,
        image="http://example.com/img2.jpg"
    )
    db_session.add(product1)
    db_session.add(product2)
    db_session.commit()
    db_session.refresh(product1)
    db_session.refresh(product2)
    return [product1, product2]


class TestGetCart:
    """Tests for GET /cart"""
    
    def test_get_empty_cart(self, client, auth_headers):
        """Should return empty cart for new user"""
        response = client.get("/cart", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0.0
    
    def test_get_cart_unauthorized(self, client):
        """Should return 401 without auth"""
        response = client.get("/cart")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_cart_with_items(self, client, db_session, test_user, test_products, auth_headers):
        """Should return cart with items and correct total"""
        # Add items to cart directly in DB
        cart_item = CartItem(
            user_id=test_user.id,
            product_id=test_products[0].id,
            quantity=2
        )
        db_session.add(cart_item)
        db_session.commit()
        
        response = client.get("/cart", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["quantity"] == 2
        assert data["items"][0]["product"]["name"] == "Test Product 1"
        assert data["total"] == 20.0  # 10.0 * 2


class TestAddToCart:
    """Tests for POST /cart/items"""
    
    def test_add_new_item(self, client, test_products, auth_headers):
        """Should add new item to cart"""
        payload = {
            "product_id": test_products[0].id,
            "quantity": 2
        }
        response = client.post("/cart/items", json=payload, headers=auth_headers)
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["product_id"] == test_products[0].id
        assert data["quantity"] == 2
        assert "product" in data
    
    def test_add_existing_item_increments_quantity(self, client, db_session, test_user, test_products, auth_headers):
        """Should increment quantity when adding existing item"""
        # Add item first
        cart_item = CartItem(
            user_id=test_user.id,
            product_id=test_products[0].id,
            quantity=1
        )
        db_session.add(cart_item)
        db_session.commit()
        
        # Add same item again
        payload = {
            "product_id": test_products[0].id,
            "quantity": 2
        }
        response = client.post("/cart/items", json=payload, headers=auth_headers)
        
        # Note: endpoint returns 201 even for updates (simplicity), but increments quantity
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["quantity"] == 3  # 1 + 2
    
    def test_add_nonexistent_product(self, client, auth_headers):
        """Should return 404 for nonexistent product"""
        payload = {
            "product_id": 9999,
            "quantity": 1
        }
        response = client.post("/cart/items", json=payload, headers=auth_headers)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_add_with_invalid_quantity(self, client, test_products, auth_headers):
        """Should reject quantity < 1"""
        payload = {
            "product_id": test_products[0].id,
            "quantity": 0
        }
        response = client.post("/cart/items", json=payload, headers=auth_headers)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestUpdateCartItem:
    """Tests for PUT /cart/items/{product_id}"""
    
    def test_update_item_quantity(self, client, db_session, test_user, test_products, auth_headers):
        """Shoul update quantity of existing item"""
        # Add item first
        cart_item = CartItem(
            user_id=test_user.id,
            product_id=test_products[0].id,
            quantity=2
        )
        db_session.add(cart_item)
        db_session.commit()
        
        # Update quantity
        payload = {"quantity": 5}
        response = client.put(
            f"/cart/items/{test_products[0].id}",
            json=payload,
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["quantity"] == 5
    
    def test_update_nonexistent_item(self, client, test_products, auth_headers):
        """Should return 404 for item not in cart"""
        payload = {"quantity": 3}
        response = client.put(
            f"/cart/items/{test_products[0].id}",
            json=payload,
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestRemoveFromCart:
    """Tests for DELETE /cart/items/{product_id}"""
    
    def test_remove_item(self, client, db_session, test_user, test_products, auth_headers):
        """Should remove item from cart"""
        # Add item first
        cart_item = CartItem(
            user_id=test_user.id,
            product_id=test_products[0].id,
            quantity=2
        )
        db_session.add(cart_item)
        db_session.commit()
        
        # Remove it
        response = client.delete(
            f"/cart/items/{test_products[0].id}",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify it's gone
        response = client.get("/cart", headers=auth_headers)
        data = response.json()
        assert len(data["items"]) == 0
    
    def test_remove_nonexistent_item(self, client, auth_headers):
        """Should return 404 for item not in cart"""
        response = client.delete("/cart/items/999", headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestClearCart:
    """Tests for DELETE /cart"""
    
    def test_clear_cart(self, client, db_session, test_user, test_products, auth_headers):
        """Should remove all items from cart"""
        # Add multiple items
        for product in test_products:
            cart_item = CartItem(
                user_id=test_user.id,
                product_id=product.id,
                quantity=1
            )
            db_session.add(cart_item)
        db_session.commit()
        
        # Clear cart
        response = client.delete("/cart", headers=auth_headers)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify empty
        response = client.get("/cart", headers=auth_headers)
        data = response.json()
        assert len(data["items"]) == 0


class TestMergeCart:
    """Tests for POST /cart/merge"""
    
    def test_merge_with_empty_server_cart(self, client, test_products, auth_headers):
        """Should add all local items to empty server cart"""
        payload = {
            "items": [
                {"product_id": test_products[0].id, "quantity": 2},
                {"product_id": test_products[1].id, "quantity": 1}
            ]
        }
        response = client.post("/cart/merge", json=payload, headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["items"]) == 2
    
    def test_merge_with_existing_items(self, client, db_session, test_user, test_products, auth_headers):
        """Should combine quantities for same products"""
        # Add item to server cart
        cart_item = CartItem(
            user_id=test_user.id,
            product_id=test_products[0].id,
            quantity=3
        )
        db_session.add(cart_item)
        db_session.commit()
        
        # Merge with local cart that has same product
        payload = {
            "items": [
                {"product_id": test_products[0].id, "quantity": 2},  # Should add to existing
                {"product_id": test_products[1].id, "quantity": 1}   # New product
            ]
        }
        response = client.post("/cart/merge", json=payload, headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["items"]) == 2
        
        # Find the merged item
        product1_item = next(item for item in data["items"] if item["product_id"] == test_products[0].id)
        assert product1_item["quantity"] == 5  # 3 + 2
    
    def test_merge_ignores_invalid_products(self, client, test_products, auth_headers):
        """Should skip products that don't exist"""
        payload = {
            "items": [
                {"product_id": test_products[0].id, "quantity": 1},
                {"product_id": 9999, "quantity": 2}  # Invalid
            ]
        }
        response = client.post("/cart/merge", json=payload, headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["items"]) == 1  # Only valid product
        assert data["items"][0]["product_id"] == test_products[0].id
