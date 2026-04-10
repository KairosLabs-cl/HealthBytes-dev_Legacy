import time
import pytest
from app.core.security import get_password_hash

@pytest.mark.unit
@pytest.mark.security
def test_api_register_timing(client):
    """
    Test that register API response time is consistent regardless of email existence.
    """
    email = "register_timing@example.com"
    password = "password123"

    # Register user first time (use a unique IP to avoid rate limits from other tests)
    unique_ip = "192.168.100.1"
    res = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password,
            "name": "Timing Test",
            "address": "123 Test St",
        },
        headers={"X-Forwarded-For": unique_ip},
    )
    assert res.status_code == 201

    # Measure: Existing User (same IP, this is the 2nd request, limit is 5)
    start = time.perf_counter()
    existing_response = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password,
            "name": "Timing Test",
            "address": "123 Test St",
        },
        headers={"X-Forwarded-For": unique_ip},
    )
    existing_time = time.perf_counter() - start

    # Measure: New User (same IP, 3rd request, limit is 5)
    new_email = "new_register_timing@example.com"
    start = time.perf_counter()
    new_response = client.post(
        "/auth/register",
        json={
            "email": new_email,
            "password": password,
            "name": "Timing Test",
            "address": "123 Test St",
        },
        headers={"X-Forwarded-For": unique_ip},
    )
    new_time = time.perf_counter() - start

    assert existing_response.status_code == 400
    assert new_response.status_code == 201

    diff = abs(existing_time - new_time)

    # Assert difference is negligible (< 300ms)
    assert (
        diff < 0.3
    ), f"Timing difference too large: {diff:.4f}s (Existing: {existing_time:.4f}s, New: {new_time:.4f}s)"
