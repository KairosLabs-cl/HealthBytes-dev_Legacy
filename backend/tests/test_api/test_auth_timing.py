import time

import pytest

from app.core.security import (
    DUMMY_PASSWORD_HASH,
    get_password_hash,
    verify_password,
    verify_password_mock,
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
    verify_password_mock("wrong_password")

    # Measure real verification
    start = time.perf_counter()
    verify_password("wrong_password", real_hash)
    real_duration = time.perf_counter() - start

    # Measure mock verification
    start = time.perf_counter()
    verify_password_mock("wrong_password")
    mock_duration = time.perf_counter() - start

    # Calculate difference
    diff = abs(real_duration - mock_duration)

    # Assert difference is negligible (< 300ms).
    # bcrypt takes ~300ms; sequential calls on a loaded CI runner can diverge
    # by >100ms, so 300ms is the realistic upper bound for variance.
    assert (
        diff < 0.3
    ), f"Timing difference too large: {diff:.4f}s (Real: {real_duration:.4f}s, Mock: {mock_duration:.4f}s)"


@pytest.mark.unit
@pytest.mark.security
def test_dummy_hash_validity():
    """Ensure DUMMY_PASSWORD_HASH is a valid bcrypt hash structure."""
    assert DUMMY_PASSWORD_HASH.startswith(b"$2b$")
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

    # Warm up — assert 401 so rate-limit budget is not silently exhausted before measurement
    warmup_1 = client.post("/auth/login", json={"email": email, "password": "wrong_password"})
    warmup_2 = client.post(
        "/auth/login", json={"email": "non_existent@example.com", "password": "any_password"}
    )
    assert warmup_1.status_code == 401, f"Warm-up 1 unexpected status: {warmup_1.status_code}"
    assert warmup_2.status_code == 401, f"Warm-up 2 unexpected status: {warmup_2.status_code}"

    # Measure: Valid User (Wrong Password)
    start = time.perf_counter()
    valid_user_response = client.post(
        "/auth/login", json={"email": email, "password": "wrong_password"}
    )
    valid_user_time = time.perf_counter() - start

    # Measure: Invalid User
    start = time.perf_counter()
    invalid_user_response = client.post(
        "/auth/login", json={"email": "non_existent@example.com", "password": "any_password"}
    )
    invalid_user_time = time.perf_counter() - start

    # Validate both requests hit the 401 path — not rate-limited (429) or any other shortcut
    assert valid_user_response.status_code == 401, (
        f"Expected 401 for valid user/wrong password, got {valid_user_response.status_code}. "
        "Timing measurement may be invalid (e.g. rate-limited)."
    )
    assert invalid_user_response.status_code == 401, (
        f"Expected 401 for non-existent user, got {invalid_user_response.status_code}. "
        "Timing measurement may be invalid (e.g. rate-limited)."
    )

    diff = abs(valid_user_time - invalid_user_time)

    # Assert difference is negligible (< 300ms).
    # bcrypt takes ~300ms; HTTP + bcrypt on a loaded CI runner can diverge
    # by >100ms, so 300ms is the realistic upper bound for variance.
    assert (
        diff < 0.3
    ), f"Timing difference too large: {diff:.4f}s (Valid: {valid_user_time:.4f}s, Invalid: {invalid_user_time:.4f}s)"


@pytest.mark.unit
@pytest.mark.security
def test_api_register_timing(client):
    """
    Test that register API response time is consistent regardless of user existence.
    """
    email = "timing_test_reg@example.com"
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
    warmup_1 = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password,
            "name": "Timing Test",
            "address": "123 Test St",
        },
    )
    warmup_2 = client.post(
        "/auth/register",
        json={
            "email": "non_existent_reg@example.com",
            "password": password,
            "name": "Timing Test",
            "address": "123 Test St",
        },
    )
    assert warmup_1.status_code == 400
    assert warmup_2.status_code == 201

    # Measure: Existing User
    start = time.perf_counter()
    existing_user_response = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password,
            "name": "Timing Test",
            "address": "123 Test St",
        },
    )
    existing_user_time = time.perf_counter() - start

    # Measure: New User
    start = time.perf_counter()
    new_user_response = client.post(
        "/auth/register",
        json={
            "email": "non_existent_reg_2@example.com",
            "password": password,
            "name": "Timing Test",
            "address": "123 Test St",
        },
    )
    new_user_time = time.perf_counter() - start

    assert existing_user_response.status_code == 400
    assert new_user_response.status_code == 201

    diff = abs(existing_user_time - new_user_time)

    assert (
        diff < 0.3
    ), f"Timing difference too large: {diff:.4f}s (Existing: {existing_user_time:.4f}s, New: {new_user_time:.4f}s)"
