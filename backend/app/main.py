from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from app.config import settings
from app.api.v1 import products, auth, orders, stripe, users, cart

# Create FastAPI application
app = FastAPI(
    title="HealthBytes API - FastAPI",
    version="2.0.0",
    description="FastAPI replica of Node.js Express API",
    docs_url="/docs" if settings.ENVIRONMENT == "dev" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "dev" else None
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers.setdefault(
        "Permissions-Policy",
        "geolocation=(), microphone=(), camera=()",
    )
    response.headers.setdefault("Cross-Origin-Resource-Policy", "same-site")
    if settings.ENVIRONMENT != "dev":
        response.headers.setdefault(
            "Strict-Transport-Security",
            "max-age=31536000; includeSubDomains",
        )
    return response


@app.middleware("http")
async def limit_request_body_size(request: Request, call_next):
    if settings.MAX_REQUEST_BODY_SIZE <= 0:
        return await call_next(request)

    content_length = request.headers.get("content-length")
    if content_length and content_length.isdigit():
        if int(content_length) > settings.MAX_REQUEST_BODY_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Request body too large",
            )
    elif content_length:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Request body too large",
        )

    body = await request.body()
    if len(body) > settings.MAX_REQUEST_BODY_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Request body too large",
        )
    return await call_next(request)

# CORS Configuration - Replica of Node.js CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://127.0.0.1:8082",
        "http://0.0.0.0:8081",      # Web (local)
        "http://10.89.51.33:8081", # Tu IP actual (Web/Expo)
        "exp://10.89.51.33:8081",  # Expo Protocol
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - Replica of '/' route from Node.js"""
    return {"message": "Hola curiosin 👋! Bienvenido a la API de HealthBytes con FastAPI."}


# Diagnostic endpoint for JWKS access
@app.get("/health/jwks")
async def check_jwks_health():
    """Check if the backend can access Clerk's JWKS endpoint"""
    import httpx
    from app.config import settings

    if settings.ENVIRONMENT != "dev" and not settings.ENABLE_DIAGNOSTIC_ENDPOINTS:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    
    result = {
        "status": "unknown",
        "jwks_url": None,
        "error": None,
        "details": {}
    }
    
    # Check if publishable key is set
    if not settings.CLERK_PUBLISHABLE_KEY:
        result["status"] = "error"
        result["error"] = "CLERK_PUBLISHABLE_KEY not configured"
        return result
    
    # Generate JWKS URL
    try:
        jwks_url = settings.clerk_jwks_url
        result["jwks_url"] = jwks_url
        result["details"]["publishable_key_prefix"] = settings.CLERK_PUBLISHABLE_KEY[:20] + "..."
    except Exception as e:
        result["status"] = "error"
        result["error"] = f"Failed to generate JWKS URL: {str(e)}"
        return result
    
    # Try to access JWKS endpoint
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(jwks_url)
            
            if response.status_code == 200:
                result["status"] = "success"
                jwks_data = response.json()
                if "keys" in jwks_data:
                    result["details"]["keys_count"] = len(jwks_data["keys"])
                    if jwks_data["keys"]:
                        first_key = jwks_data["keys"][0]
                        result["details"]["first_key"] = {
                            "kid": first_key.get("kid"),
                            "alg": first_key.get("alg"),
                            "kty": first_key.get("kty")
                        }
            else:
                result["status"] = "error"
                result["error"] = f"HTTP {response.status_code}: {response.text[:200]}"
    except httpx.ConnectError as e:
        result["status"] = "error"
        result["error"] = f"Connection error: {str(e)}"
        result["details"]["suggestion"] = "Check internet connection or firewall settings"
    except httpx.TimeoutException:
        result["status"] = "error"
        result["error"] = "Request timed out"
        result["details"]["suggestion"] = "JWKS endpoint is not responding"
    except Exception as e:
        result["status"] = "error"
        result["error"] = f"Unexpected error: {str(e)}"
    
    return result


# Include routers (equivalent to app.use() in Express)
app.include_router(products.router, prefix="/products", tags=["Products"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(orders.router, prefix="/orders", tags=["Orders"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(stripe.router, prefix="/stripe", tags=["Stripe"])
app.include_router(cart.router, prefix="/cart", tags=["Cart"])


# For local development
if __name__ == "__main__":
    import uvicorn
    import asyncio
    import sys
    
    # Fix for Windows: Use SelectorEventLoop for psycopg compatibility
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,  # Configured in config.py
        reload=True if settings.ENVIRONMENT == "dev" else False
    )


# For serverless deployment (AWS Lambda) - Equivalent to serverless-http
handler = Mangum(app)
