"""Tests for product search functionality.

Note: These tests run on SQLite (in-memory) for speed.
Full-text search (TSVECTOR + GIN index) only works on PostgreSQL.
These tests verify the fallback LIKE search behavior.
For FTS testing, run against PostgreSQL with migrations applied.
"""

import pytest

from app.db.schemas import Product


@pytest.mark.search
class TestProductSearch:
    """Test suite for product search functionality.

    WARNING: Tests use SQLite which doesn't support PostgreSQL TSVECTOR.
    The search_products() function has a fallback to LIKE search.
    These tests validate the LIKE search (fallback) behavior.

    For full-text search testing on PostgreSQL:
    1. Run migrations: psql -f Tools/backend/database/migrations/add_fulltext_search.sql
    2. Update conftest.py to use PostgreSQL instead of SQLite
    3. Re-run these tests
    """

    @pytest.fixture(autouse=True)
    def setup_test_products(self, db_session):
        """Create test products for search tests."""
        products = [
            Product(
                name="Galletas Sin Gluten",
                description="Deliciosas galletas sin gluten para celiacos",
                price=5.99,
                stock=50,
            ),
            Product(
                name="Pan Integral",
                description="Pan sin gluten y sin lactosa, apto para diabéticos",
                price=3.99,
                stock=30,
            ),
            Product(
                name="Chocolate Sin Azúcar",
                description="Chocolate negro sin azúcar refinado, vegano",
                price=4.99,
                stock=20,
            ),
            Product(
                name="Yogur de Almendra",
                description="Yogur sin lactosa hecho con leche de almendra",
                price=2.99,
                stock=40,
            ),
            Product(
                name="Pasta Integral",
                description="Pasta de trigo integral, sin aditivos",
                price=1.99,
                stock=100,
            ),
        ]

        for product in products:
            db_session.add(product)
        db_session.commit()

        for product in products:
            db_session.refresh(product)

    def test_search_by_product_name(self, client):
        """Test searching products by name (LIKE fallback on SQLite)."""
        response = client.get("/products?search=galletas")

        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)
        assert len(data) > 0
        # Should find "Galletas Sin Gluten"
        assert any("galletas" in product["name"].lower() for product in data)

    def test_search_by_description(self, client):
        """Test searching products by description (LIKE fallback)."""
        response = client.get("/products?search=sin+gluten")

        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)
        # Should find products with "sin gluten" in description
        assert len(data) >= 2

    def test_search_multiple_words(self, client):
        """Test searching with multiple words (LIKE fallback)."""
        response = client.get("/products?search=sin+lactosa")

        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)
        assert len(data) > 0

    def test_search_case_insensitive(self, client):
        """Test that search is case-insensitive."""
        response1 = client.get("/products?search=galletas")
        response2 = client.get("/products?search=GALLETAS")
        response3 = client.get("/products?search=GaLlEtAs")

        assert response1.status_code == 200
        assert response2.status_code == 200
        assert response3.status_code == 200

        data1 = response1.json()
        data2 = response2.json()
        data3 = response3.json()

        # All should return same number of results
        assert len(data1) == len(data2) == len(data3)

    def test_search_trims_whitespace(self, client):
        """Test that leading/trailing whitespace is ignored."""
        response_clean = client.get("/products?search=galletas")
        response_spaced = client.get("/products?search=%20%20galletas%20%20")

        assert response_clean.status_code == 200
        assert response_spaced.status_code == 200

        data_clean = response_clean.json()
        data_spaced = response_spaced.json()

        assert len(data_clean) == len(data_spaced)

    def test_search_empty_results(self, client):
        """Test search that returns no results."""
        response = client.get("/products?search=producto+inexistente+xyz")

        assert response.status_code == 200
        data = response.json()

        # Should return empty list, not error
        assert isinstance(data, list)
        assert len(data) == 0

    def test_search_empty_query(self, client):
        """Test empty search query returns all products."""
        response = client.get("/products?search=")

        assert response.status_code == 200
        data = response.json()

        # Empty search should return all products
        assert isinstance(data, list)
        assert len(data) == 5

    def test_search_without_param(self, client):
        """Test without search parameter returns all products."""
        response = client.get("/products")

        assert response.status_code == 200
        data = response.json()

        # No search param = list all
        assert isinstance(data, list)
        assert len(data) == 5

    def test_search_result_structure(self, client):
        """Test that search results have correct structure."""
        response = client.get("/products?search=chocolate")

        assert response.status_code == 200
        data = response.json()

        assert len(data) > 0

        # Verify response structure
        product = data[0]
        assert "id" in product
        assert "name" in product
        assert "description" in product
        assert "price" in product
        assert isinstance(product["price"], (int, float))

    def test_search_special_characters(self, client):
        """Test search with special characters is handled safely."""
        # These should not cause SQL injection or errors
        special_queries = [
            "galletas'; DROP TABLE products; --",
            'galletas" OR "1"="1',
            "galletas%",
            "galletas_",
        ]

        for query in special_queries:
            response = client.get(f"/products?search={query}")
            # Should not error, might return empty results
            assert response.status_code == 200
            assert isinstance(response.json(), list)


@pytest.mark.search
def test_search_performance_marker():
    """Marker test for search functionality.

    Run with: pytest -m search
    """
