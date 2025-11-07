"""
Script para iniciar el servidor FastAPI con el event loop correcto para Windows
"""
import sys
import asyncio

# CRITICAL: Fix para Windows - psycopg requiere SelectorEventLoop
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

if __name__ == "__main__":
    import uvicorn
    
    print("="*70)
    print("Iniciando HealthBytes FastAPI Server")
    print("="*70)
    print(f"Servidor: http://127.0.0.1:3002")
    print(f"Docs: http://127.0.0.1:3002/docs")
    print(f"ReDoc: http://127.0.0.1:3002/redoc")
    print("="*70)
    print("\nPresiona CTRL+C para detener el servidor\n")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=3002,
        reload=True,
        log_level="info"
    )
