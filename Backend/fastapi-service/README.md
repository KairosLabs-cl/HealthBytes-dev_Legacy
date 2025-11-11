# HealthBytes FastAPI Service

Replica 1:1 de la API Node.js (Express) usando FastAPI, manteniendo mismos endpoints y lógica.

## 🚀 Inicio rápido

Servidor (dev): http://localhost:3001

Docs: http://localhost:3001/docs  |  ReDoc: http://localhost:3001/redoc

### Arranque recomendado

#### Windows (PowerShell)

```powershell
cd Backend\fastapi-service
./start.ps1
# Sólo arrancar (sin reinstalar deps)
./start.ps1 -NoInstall
```

Si ves error de ejecución de scripts:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

#### Unix / macOS (Bash/Zsh)

```bash
cd Backend/fastapi-service
chmod +x start.sh   # primera vez
./start.sh
# Sólo arrancar (sin instalar)
NO_INSTALL=1 ./start.sh
```

### Alternativa manual

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run_server.py
```

### uvicorn directo (evitando recargas ruidosas)

```powershell
uvicorn app.main:app --reload --port 3001 `
  --reload-exclude ".venv/*" --reload-exclude ".venv/**/*" `
  --reload-exclude "**/site-packages/*" --reload-dir app
```

```bash
uvicorn app.main:app --reload --port 3001 \
  --reload-exclude '.venv/*' --reload-exclude '.venv/**/*' \
  --reload-exclude '**/site-packages/*' --reload-dir app
```

---

## 📦 Project Structure

```
fastapi-service/
  ├── app/
  │   ├── main.py            # FastAPI app entrypoint
  │   ├── config.py          # Settings (pydantic-settings)
  │   ├── routers/           # Endpoints (products, auth, orders, stripe)
  │   ├── models/            # Pydantic schemas
  │   ├── db/                # DB connection & SQLAlchemy models
  │   ├── middleware/        # Auth/JWT middleware
  │   └── utils/             # Security, exceptions
  ├── run_server.py          # Dev runner (reload configurado)
  ├── start.ps1              # Windows bootstrap
  ├── start.sh               # Unix/macOS bootstrap
  ├── requirements.txt
  ├── .env.example
  └── README.md
```

### Variables (.env)

```env
***REDACTED_DATABASE_URL***
JWT_SECRET=your-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
ENVIRONMENT=dev
```

JWT_SECRET=your-secret│   │   ├── product.py

JWT_ALGORITHM=HS256│   │   ├── user.py

ACCESS_TOKEN_EXPIRE_MINUTES=43200│   │   └── order.py

ENVIRONMENT=dev│   ├── db/

```│

│   │   └── schemas.py       # SQLAlchemy models (Drizzle equivalent)

## 📦 Estructura│   ├── middleware/

│   │   └── auth.py          # JWT authentication

```│   └── utils/

app/│       ├── security.py      # JWT & password hashing

├── main.py           # Aplicación principal│       └── exceptions.py    # Custom exceptions

├── config.py         # Configuración├── requirements.txt

├── routers/          # Endpoints (products, auth, orders, stripe)├── .env.example

├── models/           # Schemas Pydantic└── README.md

├── db/               # Database (SQLAlchemy)```

│   ├── database.py   # Conexión async

│   └── schemas.py    # Modelos SQLAlchemy## 🚀 Setup Instructions

├── middleware/       # Auth JWT

└── utils/            # Seguridad & utilidades### 1. Create Virtual Environment

```

1

## 📋 API Endpoints# Windows PowerShell

cd Backend\fastapi-service

### Productspython -m venv venv

- `GET /products` - Listar productos.\venv\Scripts\Activate.ps1
- `GET /products/{id}` - Obtener producto```
- `POST /products` - Crear producto (seller)
- `PUT /products/{id}` - Actualizar producto (seller)### 2. Install Dependencies
- `DELETE /products/{id}` - Eliminar producto (seller)

```powershell

### Authenticationpip install -r requirements.txt

- `POST /auth/register` - Registrar usuario```

- `POST /auth/login` - Login (retorna JWT)

### 3. Configure Environment

### Orders

- `POST /orders/` - Crear orden (autenticado)```powershell

- `GET /orders/` - Listar órdenes (autenticado)# Copy example env file

- `GET /orders/{id}` - Detalle de orden (autenticado)cp .env.example .env

- `PUT /orders/{id}` - Actualizar estado (autenticado)

# Edit .env with your database credentials

### Stripe# ***REDACTED_DATABASE_URL***

- `GET /stripe/keys` - (503 - deshabilitado)# JWT_SECRET=your-secret  # Must match Node.js for JWT compatibility

- `POST /stripe/payment-intent` - (503 - deshabilitado)```

- `POST /stripe/webhook` - (503 - deshabilitado)

### 4. Run Development Server

## 🔐 Autenticación

```powershell

JWT compatible con la API Node.js:# Option 1: Using uvicorn directly

- Mismo secret: `your-secret`uvicorn app.main:app --reload --port 3001

- Mismo algoritmo: `HS256`

- Mismo payload: `{userId, role}`# Option 2: Using Python

- Expiración: 30 díaspython -m app.main
```

Los tokens son intercambiables entre ambas APIs.

Server will start at: **http://localhost:3001**

## 🗄️ Base de Datos

- API Docs (Swagger): http://localhost:3001/docs

Comparte la misma base de datos PostgreSQL con la API Node.js.- Alternative Docs (ReDoc): http://localhost:3001/redoc

Tablas:## 📋 API Endpoints

- `products` - Productos
- `users` - Usuarios### Products
- `orders` - Órdenes- `GET /products` - List all products
- `order_items` - Items de órdenes- `GET /products/{id}` - Get product by ID
- `POST /products` - Create product (seller only)

## 🔧 Desarrollo- `PUT /products/{id}` - Update product (seller only)

- `DELETE /products/{id}` - Delete product (seller only)

```powershell

# Ejecutar con auto-reload### Authentication

uvicorn app.main:app --reload --port 3001- `POST /auth/register` - Create user account

- `POST /auth/login` - Login and get JWT token

# O usar el script

python run_server.py### Orders

```- `POST /orders` - Create new order (authenticated)

- `GET /orders` - List all orders (authenticated)

## 📝 Notas- `GET /orders/{id}` - Get order details (authenticated)

- `PUT /orders/{id}` - Update order status (authenticated)

- Puerto 3001 (Node.js usa 3001)

- Windows: Usa `WindowsSelectorEventLoopPolicy` para compatibilidad con psycopg### Stripe

- Soporta formato de auth: `Authorization: <token>` y `Authorization: Bearer <token>`- `GET /stripe/keys` - Get Stripe keys (503 - disabled)

- `POST /stripe/payment-intent` - Create payment intent (503 - disabled)

---- `POST /stripe/webhook` - Stripe webhook handler (503 - disabled)



**Version**: 2.0.0  ## 🔄 Comparison with Node.js API

**Node.js API**: Backend/api/

| Feature | Node.js | FastAPI | Status |
|---------|---------|---------|--------|
| Port | 3001 | 3001 | ✅ Different ports |
| JWT Secret | `your-secret` | `your-secret` | ✅ Compatible |
| Token Expiration | 30 days | 30 days | ✅ Same |
| Password Hashing | bcrypt | bcrypt | ✅ Compatible |
| Database | PostgreSQL | PostgreSQL | ✅ Same DB |
| CORS Origins | Same | Same | ✅ Identical |
| Serverless | serverless-http | Mangum | ✅ Both AWS Lambda |

## 🧪 Testing

### Manual Testing

```powershell
# Test root endpoint
curl http://localhost:3001/

# Test products list
curl http://localhost:3001/products

# Test login
curl -X POST http://localhost:3001/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"password123"}'
```

### Run Unit Tests (if implemented)

```powershell
pytest tests/
```

## 🔐 Authentication

All JWT tokens are **compatible between Node.js and FastAPI** APIs because they use:

- Same secret: `your-secret`
- Same algorithm: `HS256`
- Same payload structure: `{userId, role}`

You can authenticate on one API and use the token on the other.

## 📝 Known Limitations & TODOs

### Orders

- ⚠️ **TODO**: Validate product IDs and take actual prices from DB (line 33 in `ordersController.ts`)
  - Currently using prices from client request (security issue)
  - Same behavior as Node.js API for consistency

### Stripe

- ❌ All endpoints return 503 (temporarily disabled)
- Same as Node.js implementation

### Future Enhancements

- [ ] Add product price validation in orders
- [ ] Enable Stripe integration
- [ ] Add role-based filtering for orders (admin/seller)
- [ ] Add unit tests
- [ ] Add integration tests

## 🐛 Troubleshooting

### Import Errors

If you see import errors in VSCode:

```powershell
# Select Python interpreter from venv
# Ctrl+Shift+P -> "Python: Select Interpreter" -> Choose venv
```

### Database Connection Issues

```powershell
# Test PostgreSQL connection
python -c "import asyncpg; print('asyncpg installed')"

# Check ***REDACTED_DATABASE_URL***
# Must be: postgresql://user:password@host:port/database
```

### Port Already in Use

```powershell
# Change port in app/main.py or run with custom port
uvicorn app.main:app --reload --port 3003
```

## 🚀 Deployment

### AWS Lambda (Serverless)

The app uses `Mangum` for AWS Lambda compatibility.

```yaml
# serverless.yml example
service: healthbytes-fastapi

provider:
  name: aws
  runtime: python3.11
  region: us-east-1

functions:
  api:
    handler: app.main.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
```

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [SQLAlchemy Async](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- [Mangum (AWS Lambda adapter)](https://mangum.io/)

## 🤝 Contributing

This is a direct replica of the Node.js API. Any changes should:

1. First be implemented in Node.js API
2. Then replicated here to maintain parity
3. Or be discussed as FastAPI-specific optimizations

---

**Version**: 2.0.0
**Last Updated**: 2025-11-06
**Node.js API Version**: 1.0.0
