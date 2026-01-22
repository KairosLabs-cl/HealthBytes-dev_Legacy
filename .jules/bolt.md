# Performance Learnings

## Unbounded Query Optimization (Users List)
*   **Issue**: The user list endpoint allowed fetching an unlimited number of records, posing a risk of OOM and slow responses.
*   **Solution**: The endpoint already used pagination via `limit` and `offset` (skip) in the SQLAlchemy query, and this behavior was preserved to avoid unbounded result sets.
*   **Validation**: This change added FastAPI `Query` parameter validation to enforce `limit <= 100` and `skip >= 0`. This ensures that even if a client requests `limit=1000000`, the API will reject it with a 422 Unprocessable Entity error (validation is safer than clamping).
*   **Impact**:
    *   Prevents fetching the entire users table.
    *   Reduces memory usage per request.
    *   Improves scalability as the user base grows.
    *   Explicit parameter validation at the API layer prevents invalid requests early.
