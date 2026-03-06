from unittest.mock import AsyncMock, patch

import pytest


@pytest.mark.unit
def test_product_error_leakage(client):
    """Test that internal error details are not leaked in API error responses."""
    with patch("app.services.product_service.list_products") as mock_list:
        sensitive_error = "Database Connection Failed: postgres://user:password@localhost:5432/db"
        mock_list.side_effect = Exception(sensitive_error)

        response = client.get("/products")

        assert response.status_code == 500
        assert response.json()["detail"] == "Internal Server Error"
        assert sensitive_error not in response.json()["detail"]


@pytest.mark.unit
def test_user_error_leakage(client):
    """Test leakage in user endpoints."""
    # Patching at the module level where the exception is raised
    # Since users.py does `await db.execute(...)`, we can patch the session.execute via dependency override
    # But `client` fixture already overrides get_db.
    # We can patch the MockAsyncSession.execute method on the instance used by the test.

    # Actually, simpler way: Patch the `select` function in users.py to raise exception?
    # No, that constructs the query. The exception usually happens at `db.execute`.

    # Let's try to simulate a failure in the router logic by patching `db.execute`
    # We can do this by mocking the dependency in the app overrides for this specific test

    from app.db.database import get_db

    async def mock_get_db_failure():
        mock_session = AsyncMock()
        sensitive_error = "User Table SQL Injection: SELECT password FROM users"
        mock_session.execute.side_effect = Exception(sensitive_error)
        yield mock_session

    # Override just for this test context
    client.app.dependency_overrides[get_db] = mock_get_db_failure

    # We also need to override auth to allow access
    from app.middleware.auth import verify_admin

    client.app.dependency_overrides[verify_admin] = lambda: {"id": 1, "role": "admin"}

    response = client.get("/users")

    # Clean up overrides
    del client.app.dependency_overrides[get_db]
    del client.app.dependency_overrides[verify_admin]

    assert response.status_code == 500

    # Check fix
    assert response.json()["detail"] == "Internal Server Error"
    sensitive_error = "User Table SQL Injection: SELECT password FROM users"
    assert sensitive_error not in response.json()["detail"]


@pytest.mark.unit
def test_order_error_leakage(client):
    """Test leakage in order endpoints."""
    from app.db.database import get_db
    from app.middleware.auth import get_current_user

    async def mock_get_db_failure():
        mock_session = AsyncMock()
        sensitive_error = "Order Table Deadlock: UPDATE orders SET..."
        mock_session.execute.side_effect = Exception(sensitive_error)
        yield mock_session

    client.app.dependency_overrides[get_db] = mock_get_db_failure

    # Mock user to pass auth
    mock_user = type("User", (), {"id": 1, "role": "user"})
    client.app.dependency_overrides[get_current_user] = lambda: mock_user

    response = client.get("/orders")

    del client.app.dependency_overrides[get_db]
    del client.app.dependency_overrides[get_current_user]

    assert response.status_code == 500

    # Check that sensitive error details are NOT leaked in the response body
    response_text = str(response.json())
    sensitive_error = "Order Table Deadlock: UPDATE orders SET..."
    assert sensitive_error not in response_text
