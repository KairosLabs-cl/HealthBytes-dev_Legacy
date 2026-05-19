"""
Tests for users CRUD API endpoints.
Covers list, get, update, delete with auth and role checks.
"""

import pytest

from app.main import app
from app.middleware.auth import get_current_user, verify_admin
from tests.conftest import create_test_user


@pytest.fixture
def customer_user(db_session):
    """Create a customer user."""
    return create_test_user(
        db_session, email="users_customer@test.com", role="customer", name="Customer User"
    )


@pytest.fixture
def admin_user(db_session):
    """Create an admin user."""
    return create_test_user(
        db_session, email="users_admin@test.com", role="admin", name="Admin User"
    )


class TestListUsers:
    """Tests for GET /users/"""

    def test_list_users_admin_success(self, client, db_session, admin_user):
        """Test admin can list all users."""
        app.dependency_overrides[get_current_user] = lambda: admin_user
        app.dependency_overrides[verify_admin] = lambda: admin_user
        try:
            response = client.get("/users")
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
            assert len(data) >= 1
            assert any(u["email"] == admin_user.email for u in data)
        finally:
            app.dependency_overrides.pop(get_current_user, None)
            app.dependency_overrides.pop(verify_admin, None)

    def test_list_users_requires_admin(self, client, db_session, customer_user):
        """Test non-admin cannot list users."""
        # No override for verify_admin, so it will check role
        response = client.get("/users")
        assert response.status_code == 401


class TestGetUserById:
    """Tests for GET /users/{id}"""

    def test_get_own_profile(self, client, db_session, customer_user):
        """Test user can get their own profile."""
        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            response = client.get(f"/users/{customer_user.id}")
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == customer_user.id
            assert data["email"] == customer_user.email
            assert data["name"] == customer_user.name
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_get_other_user_forbidden(self, client, db_session, customer_user, admin_user):
        """Test customer can't access another user's profile."""
        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            response = client.get(f"/users/{admin_user.id}")
            assert response.status_code == 403
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_admin_get_any_user(self, client, db_session, admin_user, customer_user):
        """Test admin can access any user's profile."""
        app.dependency_overrides[get_current_user] = lambda: admin_user
        try:
            response = client.get(f"/users/{customer_user.id}")
            assert response.status_code == 200
            assert response.json()["id"] == customer_user.id
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_get_user_not_found(self, client, db_session, admin_user):
        """Test getting non-existent user returns 404."""
        app.dependency_overrides[get_current_user] = lambda: admin_user
        try:
            response = client.get("/users/99999")
            assert response.status_code == 404
        finally:
            app.dependency_overrides.pop(get_current_user, None)


class TestUpdateUser:
    """Tests for PUT /users/{id}"""

    def test_update_own_profile(self, client, db_session, customer_user):
        """Test user can update their own profile."""
        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            response = client.put(
                f"/users/{customer_user.id}",
                json={"name": "Updated Name"},
            )
            assert response.status_code == 200
            assert response.json()["name"] == "Updated Name"
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_update_other_user_forbidden(self, client, db_session, customer_user, admin_user):
        """Test customer can't update another user."""
        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            response = client.put(
                f"/users/{admin_user.id}",
                json={"name": "Hacked Name"},
            )
            assert response.status_code == 403
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_admin_update_any_user(self, client, db_session, admin_user, customer_user):
        """Test admin can update any user."""
        app.dependency_overrides[get_current_user] = lambda: admin_user
        try:
            response = client.put(
                f"/users/{customer_user.id}",
                json={"name": "Admin Updated"},
            )
            assert response.status_code == 200
            assert response.json()["name"] == "Admin Updated"
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_update_user_not_found(self, client, db_session, admin_user):
        """Test updating non-existent user returns 404."""
        app.dependency_overrides[get_current_user] = lambda: admin_user
        try:
            response = client.put("/users/99999", json={"name": "Ghost"})
            assert response.status_code == 404
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_update_user_with_password(self, client, db_session, customer_user):
        """Test user can update their password."""
        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            response = client.put(
                f"/users/{customer_user.id}",
                json={"password": "new_secure_pass_123"},
            )
            assert response.status_code == 200
        finally:
            app.dependency_overrides.pop(get_current_user, None)


class TestDeleteUser:
    """Tests for DELETE /users/{id}"""

    def test_delete_user_admin_success(self, client, db_session, admin_user):
        """Test admin can delete a user."""
        user_to_delete = create_test_user(db_session, email="delete_me@test.com", role="customer")
        app.dependency_overrides[get_current_user] = lambda: admin_user
        app.dependency_overrides[verify_admin] = lambda: admin_user
        try:
            response = client.delete(f"/users/{user_to_delete.id}")
            assert response.status_code == 204
        finally:
            app.dependency_overrides.pop(get_current_user, None)
            app.dependency_overrides.pop(verify_admin, None)

    def test_delete_user_not_found(self, client, db_session, admin_user):
        """Test deleting non-existent user returns 404."""
        app.dependency_overrides[get_current_user] = lambda: admin_user
        app.dependency_overrides[verify_admin] = lambda: admin_user
        try:
            response = client.delete("/users/99999")
            assert response.status_code == 404
        finally:
            app.dependency_overrides.pop(get_current_user, None)
            app.dependency_overrides.pop(verify_admin, None)

    def test_delete_user_requires_admin(self, client, db_session):
        """Test non-admin cannot delete users."""
        response = client.delete("/users/1")
        assert response.status_code == 401
