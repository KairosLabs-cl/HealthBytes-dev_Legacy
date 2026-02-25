import time
import pytest
from app.core.security import (
    verify_password,
    verify_password_mock,
    get_password_hash,
    DUMMY_PASSWORD_HASH,
)


@pytest.mark.unit
@pytest.mark.security
def test_password_verification_timing():
    """
    Test that verify_password_mock() takes approximately the same time
    as verify_password() with a real hash.
    """
    # Create a real hash
    real_password = "password123"
    real_hash = get_password_hash(real_password)

    # Warm up
    verify_password("wrong_password", real_hash)
    verify_password_mock()

    # Measure real verification
    start = time.perf_counter()
    verify_password("wrong_password", real_hash)
    real_duration = time.perf_counter() - start

    # Measure mock verification
    start = time.perf_counter()
    verify_password_mock()
    mock_duration = time.perf_counter() - start

    # Calculate difference
    diff = abs(real_duration - mock_duration)

    # Assert difference is negligible (e.g. < 100ms)
    # Note: bcrypt takes ~300ms, so 100ms is acceptable variance for CI environments
    assert (
        diff < 0.1
    ), f"Timing difference too large: {diff:.4f}s (Real: {real_duration:.4f}s, Mock: {mock_duration:.4f}s)"


@pytest.mark.unit
@pytest.mark.security
def test_dummy_hash_validity():
    """Ensure DUMMY_PASSWORD_HASH is a valid bcrypt hash structure."""
    assert DUMMY_PASSWORD_HASH.startswith("$2b$")
    assert len(DUMMY_PASSWORD_HASH) == 60


@pytest.mark.unit
@pytest.mark.security
def test_api_login_timing(client):
    """
    Test that login API response time is consistent regardless of user existence.
    """
    email = "timing_test@example.com"
    password = "password123"

    # Register user
    client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password,
            "name": "Timing Test",
            "address": "123 Test St",
        },
    )

    # Warm up
    client.post("/auth/login", json={"email": email, "password": "wrong_password"})
    client.post(
        "/auth/login", json={"email": "non_existent@example.com", "password": "any_password"}
    )

    # Measure: Valid User (Wrong Password)
    start = time.perf_counter()
    client.post("/auth/login", json={"email": email, "password": "wrong_password"})
    valid_user_time = time.perf_counter() - start

    # Measure: Invalid User
    start = time.perf_counter()
    client.post(
        "/auth/login", json={"email": "non_existent@example.com", "password": "any_password"}
    )
    invalid_user_time = time.perf_counter() - start

    diff = abs(valid_user_time - invalid_user_time)

    # Assert difference is negligible (e.g. < 100ms)
    assert (
        diff < 0.1
    ), f"Timing difference too large: {diff:.4f}s (Valid: {valid_user_time:.4f}s, Invalid: {invalid_user_time:.4f}s)"
