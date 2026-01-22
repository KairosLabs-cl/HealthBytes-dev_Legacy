import pytest
from unittest.mock import patch


@pytest.mark.unit
def test_product_error_leakage(client):
    """
    Test that internal error details are leaked (checking vulnerability)
    or NOT leaked (verifying fix).
    """
    with patch("app.services.product_service.list_products") as mock_list:
        # Simulate a database error with sensitive info
        sensitive_error = (
            "Database Connection Failed: postgres://user:password@localhost:5432/db"
        )
        mock_list.side_effect = Exception(sensitive_error)

        response = client.get("/products/")

        assert response.status_code == 500

        # This is what we expect AFTER the fix (vulnerability fixed)
        assert response.json()["detail"] == "Internal Server Error"
        # Ensure sensitive info is NOT leaked
        assert sensitive_error not in response.json()["detail"]
