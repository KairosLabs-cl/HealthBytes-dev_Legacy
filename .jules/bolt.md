# Performance Learnings

## Unbounded Query Optimization (Users List)
*   **Issue**: The user list endpoint allowed fetching an unlimited number of records, posing a risk of OOM and slow responses.
*   **Solution**: Implemented pagination using `limit` and `offset` (skip) in the SQLAlchemy query.
*   **Validation**: Added FastAPI `Query` validation to enforce `limit <= 100` and `skip >= 0`. This ensures that even if a client requests `limit=1000000`, the API will reject it with a 422 Unprocessable Entity error (or clamp it if implemented that way, but validation is safer).
*   **Impact**:
    *   Prevents fetching the entire users table.
    *   Reduces memory usage per request.
    *   Improves scalability as the user base grows.
