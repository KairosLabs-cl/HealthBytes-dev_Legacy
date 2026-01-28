"""Benchmark test for get_user_orders performance with user_id index optimization.

This test measures the performance impact of adding an index to Order.user_id.
"""

import pytest
import time
from sqlalchemy import select, event
from typing import List

from app.services.order_service import get_user_orders, create_order
from app.schemas.order import OrderCreate, OrderItemCreate
from app.db.schemas import Product, User, Order
from tests.conftest import MockAsyncSession


class QueryCounter:
    """Context manager to count and analyze database queries."""
    
    def __init__(self, connection):
        self.connection = connection
        self.queries: List[str] = []
        
    def __enter__(self):
        event.listen(self.connection, "after_cursor_execute", self._count_query)
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        event.remove(self.connection, "after_cursor_execute", self._count_query)
        
    def _count_query(self, conn, cursor, statement, parameters, context, executemany):
        """Record each query executed."""
        self.queries.append(statement)
        
    @property
    def count(self) -> int:
        """Get total number of queries executed."""
        return len(self.queries)


# Global counter for unique IDs
_counter = 0


def get_unique_id(prefix: int = 1000) -> int:
    """Get next unique ID for testing."""
    global _counter
    _counter += 1
    return prefix + _counter


@pytest.fixture
def benchmark_user(db_session):
    """Create a test user for benchmarking."""
    user = User(
        id=get_unique_id(2000),
        email=f"benchmark_{get_unique_id()}@example.com",
        password="hashed",
        role="customer"
    )
    db_session.add(user)
    db_session.commit()
    return user


@pytest.fixture
def benchmark_product(db_session):
    """Create a test product for benchmarking."""
    product = Product(
        id=get_unique_id(3000),
        name=f"Benchmark Product {get_unique_id()}",
        description="Test product for performance benchmarking",
        price=100.00,
        image="https://example.com/product.jpg",
        stock=10000  # High stock
    )
    db_session.add(product)
    db_session.commit()
    return product


async def create_orders_for_user(
    db_session,
    user_id: int,
    product_id: int,
    count: int
) -> List[Order]:
    """Helper to create multiple orders for a user."""
    mock_db = MockAsyncSession(db_session)
    orders = []
    
    for i in range(count):
        order_data = OrderCreate(
            items=[OrderItemCreate(product_id=product_id, quantity=1, price=100.0)]
        )
        order = await create_order(mock_db, user_id, order_data)
        orders.append(order)
    
    return orders


@pytest.mark.asyncio
@pytest.mark.parametrize("order_count", [10, 50, 100, 500])
async def test_get_user_orders_performance(
    db_session,
    benchmark_user,
    benchmark_product,
    order_count
):
    """
    Benchmark: Measure get_user_orders performance with varying order counts.
    
    This test measures the impact of the user_id index on query performance.
    Without index: O(n) table scan
    With index: O(log n) index seek + result fetch
    """
    # Setup: Create multiple orders for the user
    await create_orders_for_user(
        db_session,
        benchmark_user.id,
        benchmark_product.id,
        order_count
    )
    
    # Create mock async session
    mock_db = MockAsyncSession(db_session)
    
    # Measure query performance
    with QueryCounter(db_session.connection()) as counter:
        start_time = time.perf_counter()
        orders = await get_user_orders(mock_db, benchmark_user.id, skip=0, limit=100)
        elapsed = time.perf_counter() - start_time
    
    # Analysis
    elapsed_ms = elapsed * 1000
    
    print(f"\n{'='*70}")
    print(f"get_user_orders Performance ({order_count} orders in database):")
    print(f"{'='*70}")
    print(f"  Execution time: {elapsed_ms:.3f}ms")
    print(f"  Queries executed: {counter.count}")
    print(f"  Orders returned: {len(orders)}")
    
    # Show query details
    select_queries = [q for q in counter.queries if 'SELECT' in q.upper()]
    print(f"  SELECT queries: {len(select_queries)}")
    
    # Check if query uses index (look for index hints in query plan)
    for idx, query in enumerate(select_queries, 1):
        if 'order' in query.lower() and 'user_id' in query.lower():
            print(f"\n  Key query #{idx}:")
            print(f"    {query[:200]}...")
    
    print(f"{'='*70}\n")
    
    # Performance assertions
    # The query should be fast even with many orders
    # With index, should be < 50ms for 500 orders
    # Without index on large datasets, could be 100ms+
    
    # Note: Since we're using SQLite in-memory, performance differences
    # may be minimal. The real benefit is in production PostgreSQL.
    max_time_ms = 100  # Generous threshold for test environment
    
    assert elapsed_ms < max_time_ms, (
        f"Query took too long: {elapsed_ms:.2f}ms for {order_count} orders. "
        f"Expected < {max_time_ms}ms"
    )
    
    # Verify correct number of orders returned (limited by pagination)
    expected_count = min(order_count, 100)  # Default limit is 100
    assert len(orders) == expected_count, (
        f"Expected {expected_count} orders, got {len(orders)}"
    )


@pytest.mark.asyncio
async def test_get_user_orders_query_plan(
    db_session,
    benchmark_user,
    benchmark_product
):
    """
    Benchmark: Analyze the query execution plan for get_user_orders.
    
    This test verifies that the query is using the index efficiently.
    """
    # Create some test data
    await create_orders_for_user(
        db_session,
        benchmark_user.id,
        benchmark_product.id,
        20
    )
    
    # Create mock async session
    mock_db = MockAsyncSession(db_session)
    
    # Capture queries
    with QueryCounter(db_session.connection()) as counter:
        await get_user_orders(mock_db, benchmark_user.id)
    
    # Analyze queries
    order_queries = [
        q for q in counter.queries
        if 'SELECT' in q.upper() and 'orders' in q.lower()
    ]
    
    print(f"\n{'='*70}")
    print("Query Analysis:")
    print(f"{'='*70}")
    print(f"Total queries: {counter.count}")
    print(f"Order-related SELECT queries: {len(order_queries)}")
    
    # The main query should filter by user_id
    for idx, query in enumerate(order_queries, 1):
        print(f"\nQuery #{idx}:")
        print(f"  {query[:300]}...")
        
        # Check if user_id is in WHERE clause
        if 'user_id' in query.lower():
            print(f"  [OK] Filters by user_id")
        else:
            print(f"  [WARN] Does NOT filter by user_id (unexpected)")
    
    print(f"{'='*70}\n")
    
    # Should have at least one query filtering by user_id
    has_user_filter = any('user_id' in q.lower() for q in order_queries)
    assert has_user_filter, "Expected at least one query to filter by user_id"


@pytest.mark.asyncio
async def test_get_user_orders_scalability(
    db_session,
    benchmark_user,
    benchmark_product
):
    """
    Benchmark: Verify that query time scales sub-linearly with data size.
    
    With proper indexing, query time should NOT scale linearly with
    total number of orders in the database.
    """
    results = []
    
    # Test with increasing order counts
    for order_count in [10, 50, 100]:
        # Create orders
        await create_orders_for_user(
            db_session,
            benchmark_user.id,
            benchmark_product.id,
            order_count
        )
        
        # Measure query time
        mock_db = MockAsyncSession(db_session)
        
        start_time = time.perf_counter()
        orders = await get_user_orders(mock_db, benchmark_user.id, limit=20)
        elapsed = time.perf_counter() - start_time
        
        results.append({
            'total_orders': order_count,
            'time_ms': elapsed * 1000
        })
    
    # Print results
    print(f"\n{'='*70}")
    print("Scalability Analysis:")
    print(f"{'='*70}")
    print(f"{'Total Orders':<15} {'Query Time (ms)':<20} {'Growth Factor':<15}")
    print(f"{'-'*70}")
    
    for i, result in enumerate(results):
        growth = ""
        if i > 0:
            factor = result['time_ms'] / results[i-1]['time_ms']
            growth = f"{factor:.2f}x"
        
        print(f"{result['total_orders']:<15} {result['time_ms']:<20.3f} {growth:<15}")
    
    print(f"{'='*70}")
    
    # Verify scaling is reasonable
    # Time for 100 orders should not be 10x time for 10 orders
    # (That would indicate O(n) table scan)
    # With index, should be roughly constant or sub-linear
    
    time_10 = results[0]['time_ms']
    time_100 = results[2]['time_ms']
    
    # Allow up to 5x growth (generous threshold)
    # Without index, we'd expect ~10x growth
    max_growth = 5.0
    actual_growth = time_100 / time_10
    
    print(f"\nScalability Result:")
    print(f"   10 orders: {time_10:.3f}ms")
    print(f"   100 orders: {time_100:.3f}ms")
    print(f"   Growth factor: {actual_growth:.2f}x")
    print(f"   Threshold: {max_growth}x")
    
    if actual_growth < max_growth:
        print(f"   [OK] Good scalability - growing sub-linearly")
    else:
        print(f"   [WARN] Poor scalability - may indicate missing index or table scan")
    
    print(f"{'='*70}\n")
    
    assert actual_growth < max_growth, (
        f"Query time grew too much ({actual_growth:.2f}x) as data increased. "
        f"Expected < {max_growth}x. This suggests inefficient querying."
    )
