"""
Script to verify JWKS access from Clerk
Run this to check if the backend can connect to Clerk's JWKS endpoint
"""

import os
import sys

import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def get_jwks_url():
    """Get Clerk JWKS URL from publishable key"""
    publishable_key = os.getenv("CLERK_PUBLISHABLE_KEY")
    if not publishable_key:
        print("❌ CLERK_PUBLISHABLE_KEY not found in environment variables")
        return None

    try:
        import base64
        import re

        # Extract frontend API from publishable key
        # pk_test_xxx -> xxx is base64 of frontend API
        key_clean = publishable_key.strip()
        key_part = key_clean.split("_")[-1]
        # Remove trailing $ if present
        if key_part.endswith("$"):
            key_part = key_part[:-1]
        frontend_api = base64.b64decode(key_part).decode("utf-8")
        # Clean the domain: remove any trailing $, whitespace, or invalid characters
        frontend_api = frontend_api.rstrip("$").strip()
        # Remove any non-domain characters from the end
        frontend_api = re.sub(r"[^a-zA-Z0-9.\-]+$", "", frontend_api)
        jwks_url = f"https://{frontend_api}/.well-known/jwks.json"
        return jwks_url
    except Exception as e:
        print(f"❌ Error extracting JWKS URL from publishable key: {e}")
        return None


def check_jwks_access():
    """Check if we can access Clerk's JWKS endpoint"""
    print("=" * 60)
    print("Checking Clerk JWKS Access")
    print("=" * 60)

    # Check environment variables
    print("\n1. Checking environment variables...")
    publishable_key = os.getenv("CLERK_PUBLISHABLE_KEY")
    secret_key = os.getenv("***REDACTED_CLERK_SECRET_KEY***

    if publishable_key:
        print(f"   ✅ CLERK_PUBLISHABLE_KEY: {publishable_key[:20]}...")
    else:
        print("   ❌ CLERK_PUBLISHABLE_KEY: Not set")
        return False

    if secret_key:
        print(f"   ✅ ***REDACTED_CLERK_SECRET_KEY***
    else:
        print("   ⚠️  ***REDACTED_CLERK_SECRET_KEY***

    # Get JWKS URL
    print("\n2. Generating JWKS URL...")
    jwks_url = get_jwks_url()
    if not jwks_url:
        return False

    print(f"   JWKS URL: {jwks_url}")

    # Try to access JWKS endpoint
    print("\n3. Testing JWKS endpoint access...")
    try:
        response = httpx.get(jwks_url, timeout=10.0)
        if response.status_code == 200:
            print(f"   ✅ Success! Status code: {response.status_code}")
            print(f"   ✅ Response length: {len(response.text)} bytes")

            # Try to parse JSON
            try:
                jwks_data = response.json()
                if "keys" in jwks_data:
                    print(f"   ✅ Found {len(jwks_data['keys'])} key(s) in JWKS")
                    print("\n   Sample key info:")
                    if jwks_data["keys"]:
                        first_key = jwks_data["keys"][0]
                        print(f"      - Key ID: {first_key.get('kid', 'N/A')}")
                        print(f"      - Algorithm: {first_key.get('alg', 'N/A')}")
                        print(f"      - Key Type: {first_key.get('kty', 'N/A')}")
                else:
                    print("   ⚠️  JWKS response doesn't contain 'keys' field")
            except Exception as e:
                print(f"   ⚠️  Could not parse JSON response: {e}")

            return True
        else:
            print(f"   ❌ Failed! Status code: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
    except httpx.ConnectError as e:
        print(f"   ❌ Connection error: {e}")
        print("   This usually means:")
        print("   - No internet connection")
        print("   - Firewall blocking the connection")
        print("   - DNS resolution failed")
        return False
    except httpx.TimeoutException:
        print("   ❌ Request timed out")
        print("   The JWKS endpoint is not responding")
        return False
    except Exception as e:
        print(f"   ❌ Unexpected error: {e}")
        return False


def main():
    """Main function"""
    success = check_jwks_access()

    print("\n" + "=" * 60)
    if success:
        print("✅ JWKS access check PASSED")
        print("   Your backend can connect to Clerk's JWKS endpoint")
    else:
        print("❌ JWKS access check FAILED")
        print("\n   Troubleshooting steps:")
        print("   1. Check your internet connection")
        print("   2. Verify CLERK_PUBLISHABLE_KEY is correct")
        print("   3. Check firewall/proxy settings")
        print("   4. Try accessing the JWKS URL manually in a browser")
        print("   5. For development, the code will fallback to")
        print("      decoding tokens without verification")
    print("=" * 60)

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
