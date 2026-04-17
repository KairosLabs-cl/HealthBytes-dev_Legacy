"""
Script para iniciar el servidor FastAPI con el event loop correcto para Windows
"""

import asyncio
import sys
import warnings

# Suprimir deprecation warnings de asyncio en Python 3.14+
warnings.filterwarnings(
    "ignore", category=DeprecationWarning, message=".*WindowsSelectorEventLoopPolicy.*"
)
warnings.filterwarnings("ignore", category=DeprecationWarning, message=".*set_event_loop_policy.*")

# CRITICAL: Fix para Windows - psycopg requiere SelectorEventLoop
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

if __name__ == "__main__":
    from pathlib import Path

    import uvicorn

    print("=" * 70)
    print("Iniciando HealthBytes FastAPI Server")
    print("=" * 70)
    print("Servidor: http://127.0.0.1:3001")
    print("Docs: http://127.0.0.1:3001/docs")
    print("ReDoc: http://127.0.0.1:3001/redoc")
    print("=" * 70)
    print("\nPresiona CTRL+C para detener el servidor\n")

    project_root = Path(__file__).parent
    app_dir = project_root / "app"

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=3001,
        reload=True,
        log_level="info",
        # Ignorar el entorno virtual y solo observar código propio
        reload_excludes=[".venv/*", ".venv/**/*", "**/site-packages/*"],
        reload_dirs=[str(app_dir)],
    )
