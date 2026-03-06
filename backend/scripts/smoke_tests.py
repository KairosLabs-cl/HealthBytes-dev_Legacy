#!/usr/bin/env python3
"""
Post-deploy smoke tests for HealthBytes backend.
Validates critical endpoints return expected status codes.
Usage: python scripts/smoke_tests.py [base_url]
"""
import sys
import urllib.request
import urllib.error


def check(url: str, expected: int, name: str) -> bool:
    try:
        req = urllib.request.urlopen(url, timeout=10)
        status = req.status
    except urllib.error.HTTPError as e:
        status = e.code
    except Exception as e:
        print(f"  FAIL  {name}: {e}")
        return False

    ok = status == expected
    icon = "  OK  " if ok else "  FAIL"
    print(f"{icon}  {name}: expected {expected}, got {status}")
    return ok


def main() -> int:
    base = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3001"
    print(f"Smoke testing: {base}\n")

    tests = [
        (f"{base}/health",              200, "Health check"),
        (f"{base}/docs",                200, "Swagger UI"),
        (f"{base}/api/v1/products",     200, "Products list (public)"),
        (f"{base}/api/v1/cart",         401, "Cart (requires auth → 401)"),
        (f"{base}/api/v1/orders",       401, "Orders (requires auth → 401)"),
        (f"{base}/api/v1/auth/profile", 401, "Profile (requires auth → 401)"),
        (f"{base}/api/v1/addresses",    401, "Addresses (requires auth → 401)"),
        (f"{base}/api/v1/favorites",    401, "Favorites (requires auth → 401)"),
    ]

    results = [check(url, expected, name) for url, expected, name in tests]
    passed = sum(results)
    total = len(results)
    print(f"\n{passed}/{total} checks passed")
    return 0 if all(results) else 1


if __name__ == "__main__":
    sys.exit(main())
