# HealthBytes Backend - FastAPI [Actualizarlo!]

REST API para HealthBytes usando FastAPI (Python), SQLAlchemy, y PostgreSQL.

**Servidor (dev):** http://localhost:3001
**API Docs:** http://localhost:3001/docs | http://localhost:3001/redoc

---

## 📁 Estructura Reorganizada

```
backend/
├── app/                      # Código principal
│   ├── api/v1/              # Endpoints versionados
│   ├── services/            # Business logic
│   ├── schemas/             # Pydantic models
│   ├── db/                  # Database models
│   ├── core/                # Security, exceptions
│   └── middleware/
├── tests/                   # Test suite
│   ├── test_api/           # Endpoint tests
│   ├── test_services/      # Service tests
│   └── conftest.py         # Pytest configuration
├── scripts/                # Utility scripts
├── migrations/             # Database migrations
└── [config files]
```

**Ejemplo de Estructura:**
```
c:\Users\benja\Proyects\Code\Work\HealthBytes-dev\backend\README.md
```

---

## 🚀 Inicio Rápido

### Windows (PowerShell)

```powershell
cd Backend
./start.ps1
```

Para volver a instalar dependencias:

```powershell
./start.ps1 -Force
```

Para solo ejecutar sin instalar:

```powershell
./start.ps1 -NoInstall
```

### Linux/macOS (Bash)

```bash
cd Backend
chmod +x start.sh
./start.sh
```

Sin reinstalar dependencias:

```bash
NO_INSTALL=1 ./start.sh
```

### Manual Setup

```bash
# Crear venv
python -m venv .venv

# Activar (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Activar (Linux/macOS)
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
python run_server.py
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Ejecutar todos los tests
pytest tests/

# Con reporte de cobertura
pytest tests/ --cov=app

# Tests de un archivo específico
pytest tests/test_api/test_auth.py -v

# Test específico
pytest tests/test_api/test_products.py::test_create_product -v

# Ver output en tiempo real (print statements, logs)
pytest tests/ -s

# Output detallado si hay errores
pytest tests/ --tb=short
```

### Setup de Testing

Requiere dependencias de desarrollo:

```bash
pip install -r requirements-dev.txt
```

### Estructura de Tests

```
tests/
├── README.md                    # 📖 Guía detallada de tests (leer primero!)
├── conftest.py                  # Fixtures y configuración de pytest
├── pytest.ini                   # Configuración de pytest
└── test_api/
    ├── test_auth.py            # Tests de autenticación (2)
    ├── test_health.py          # Tests de health check (1)
    ├── test_orders.py          # Tests de órdenes (2)
    └── test_products.py        # Tests de productos (3)
```

### Estado Actual de Tests

✅ **8/8 tests pasando**

- ✅ test_register_user - Registro de usuario
- ✅ test_login_user - Login de usuario
- ✅ test_health_check - Health check endpoint
- ✅ test_get_orders - Obtener órdenes
- ✅ test_create_order - Crear orden
- ✅ test_get_products - Listar productos
- ✅ test_get_product_by_id - Obtener producto por ID
- ✅ test_create_product - Crear producto

### 📖 Para Entender los Tests

**Leer:** [tests/README.md](tests/README.md) - Contiene:

- Explicación detallada de qué prueba cada test
- Cómo interpretar resultados (✅ vs ❌)
- Problemas comunes y soluciones
- Cómo debuggear tests fallidos
- Checklist antes de deployar

### Cobertura de Código

Generar reporte:

```bash
pytest tests/ --cov=app --cov-html=htmlcov
```

Abrir: `htmlcov/index.html` en navegador

**Cobertura por módulo:**

- `app/api/v1/auth.py`: 67% ✅
- `app/api/v1/products.py`: 41%
- `app/api/v1/orders.py`: 19%
- `app/core/security.py`: 71% ✅

### Agregar Nuevo Test

1. Crear archivo `tests/test_api/test_<feature>.py`
2. Importar fixture `client`:

```python
def test_my_feature(client):
    response = client.get("/api/v1/endpoint")
    assert response.status_code == 200
```

3. Ejecutar: `pytest tests/test_api/test_<feature>.py -v`

---

## 📋 API Endpoints

### Health Check

```
GET /
GET /health
```

### Products

```
GET    /api/v1/products           # List all
GET    /api/v1/products/{id}      # Get one
POST   /api/v1/products           # Create (auth required)
PUT    /api/v1/products/{id}      # Update (auth required)
DELETE /api/v1/products/{id}      # Delete (auth required)
```

### Authentication

```
POST /api/v1/auth/register        # Register new user
POST /api/v1/auth/login           # Login
```

### Users

```
GET    /api/v1/users/{id}         # Get user
PUT    /api/v1/users/{id}         # Update user
```

### Orders

```
GET    /api/v1/orders             # List user's orders
GET    /api/v1/orders/{id}        # Get order details
POST   /api/v1/orders             # Create order ⚠️ Validate prices
PUT    /api/v1/orders/{id}        # Update order status
```

### Stripe (Disabled - 503)

```
GET    /api/v1/stripe/keys
POST   /api/v1/stripe/payment-intent
POST   /api/v1/stripe/webhook
```

---

## 🔐 Autenticación

### JWT (Legacy)

Token incluido en header:

```
Authorization: Bearer <token>
```

### Clerk (Nuevo)

Valida contra Clerk JWKS endpoint.

**Migrando:** Soportamos ambos métodos simultáneamente.

---

## 🛠️ Desarrollo

### Code Quality

```bash
# Format code
black .

# Lint
ruff check .

# Type checking
mypy .
```

### Agregar Dependencia

```bash
pip install <package>
pip freeze > requirements.txt
```

### Crear Migration (Alembic)

```bash
alembic revision --autogenerate -m "Descripción del cambio"
alembic upgrade head
```

---

## 📝 Flujo de Trabajo - Agregar Feature

1. **Crear Pydantic schema** en `app/schemas/`
2. **Crear servicio** en `app/services/`
3. **Crear endpoint** en `app/api/v1/`
4. **Crear tests** en `tests/test_api/` y `tests/test_services/`
5. **Ejecutar tests** `pytest`
6. **Commit y push**

---

## 🐛 Problemas Comunes

### Error: "Module not found"

Asegúrate de estar en directorio `/Backend`:

```bash
cd Backend
python run_server.py  # ✅ Correcto
```

No desde `/Backend/app`:

```bash
cd Backend/app
python run_server.py  # ❌ Incorrecto
```

### Port 3001 en uso

```bash
# Windows - find process
netstat -ano | findstr :3001

# Linux/macOS - kill process
lsof -i :3001
kill -9 <PID>
```

### CORS errors

Verificar `app/config.py` - CORS debe permitir frontend origen:

```python
"http://localhost:8081"  # Expo dev
"http://localhost:3000"  # Web dev
```

### JWT signature error

Verifica que `JWT_SECRET` en `.env` es consistente con el token que envía el cliente.

---

## 📚 Referencias

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [SQLAlchemy](https://docs.sqlalchemy.org/)
- [Pydantic](https://docs.pydantic.dev/)
- [Pytest](https://docs.pytest.org/)
