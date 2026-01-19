# 🛠️ PLAN DE ACCIÓN - HealthBytes

**Documento Vivo para priorizar y rastrear mejoras**  
**Última actualización:** 18 Enero 2026

---

## FASE 1: ARREGLOS CRÍTICOS (Esta Semana - 5 horas)

### ✅ 1. Validación de Precios en Órdenes
**Archivo:** `Backend/fastapi-service/app/routers/orders.py`  
**Línea:** ~46  
**Problema:** Cliente puede enviar precios falsos

**Código Actual:**
```python
# TODO: validate products ids, and take their actual price from db
order_item = OrderItem(
    product_id=item.product_id,
    quantity=item.quantity,
    price=item.price  # ← INSEGURO: confía en cliente
)
```

**Código Corregido:**
```python
# Validar producto existe y obtener precio real
product = await db.get(Product, item.product_id)
if not product:
    raise HTTPException(status_code=404, detail=f"Producto {item.product_id} no encontrado")

# Usar SIEMPRE el precio de DB, no del cliente
order_item = OrderItem(
    product_id=item.product_id,
    quantity=item.quantity,
    price=product.price  # ✅ PRECIO REAL DE DB
)
```

**Prueba Manual:**
```bash
curl -X POST http://localhost:3001/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"product_id": 1, "quantity": 1, "price": 999999}  # Cliente manda precio falso
    ]
  }'

# Esperado: Order guardado con product.price real (no 999999)
```

**Estimado:** 30 min

---

### ✅ 2. Reescribir Backend FastAPI README
**Archivo:** `Backend/fastapi-service/README.md`  
**Estado:** Corrupto (caracteres especiales rotos)

**Acciones:**
- [ ] Backup del actual (copiar contenido válido)
- [ ] Reescribir con estructura limpia
- [ ] Incluir:
  - Setup paso a paso (venv, deps, .env)
  - Endpoints documentados
  - Troubleshooting
  - Links a docs

**Estimado:** 1 hora

---

### ✅ 3. Completar `.env.example`
**Archivo:** `Backend/fastapi-service/.env.example`

**Contenido Sugerido:**
```env
# ========================================
# DATABASE
# ========================================
# Obtén la URL de tu PostgreSQL
# Formato: postgresql://user:password@host:port/database
***REDACTED_DATABASE_URL***

# ========================================
# AUTHENTICATION - CLERK (Nueva)
# ========================================
# Obtén keys en https://dashboard.clerk.com
CLERK_PUBLISHABLE_KEY=pk_test_XXX
***REDACTED_CLERK_SECRET_KEY***

# ========================================
# AUTHENTICATION - JWT (Legacy)
# ========================================
# Usa algo aleatorio: `python -c "import secrets; print(secrets.token_hex(32))"`
JWT_SECRET=tu_secret_aqui_minimo_32_caracteres
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200  # 30 días

# ========================================
# STRIPE (Deshabilitado hasta integrar)
# ========================================
STRIPE_SECRET_KEY=sk_test_XXX
STRIPE_WEBHOOK_SECRET=whsec_XXX

# ========================================
# ENVIRONMENT
# ========================================
ENVIRONMENT=dev  # O: production
HOST=0.0.0.0
PORT=3001
```

**Estimado:** 30 min

---

### ✅ 4. Decidir sobre `assets/products.json`
**Archivo:** `Frontend/shop/assets/products.json` (VACÍO)

**Preguntas:**
- ¿Se usa este archivo? Buscar en el código...
- ¿Es legacy de versión anterior?
- ¿Debería seeding de productos venir del backend?

**Acción Recomendada:**
```bash
# 1. Buscar referencias
grep -r "products.json" Frontend/shop/

# 2. Si no se usa:
rm Frontend/shop/assets/products.json

# 3. Si se usa: Documentar qué contiene
```

**Estimado:** 15 min

---

## FASE 2: FEATURES PRINCIPALES (2-3 Semanas - 40 horas)

### 🔍 5. Agregar Filtros a Productos

#### 5.1 Extender Database Schema
**Archivo:** `Backend/fastapi-service/app/db/schemas.py`

```python
from sqlalchemy import Column, String, JSON, Boolean, ARRAY

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image = Column(String(255), nullable=True)
    price = Column(Float, nullable=False)
    
    # 🆕 Nuevos campos para filtros
    category = Column(String(50), nullable=False, index=True)  # food, supplement, medicine
    allergens = Column(JSON, nullable=True)  # ["gluten", "nuts", "dairy"]
    ingredients = Column(JSON, nullable=True)
    dietary_tags = Column(JSON, nullable=True)  # ["vegan", "keto", "low-sodium"]
    
    # Para medicamentos
    requires_prescription = Column(Boolean, default=False, index=True)
    active_ingredients = Column(JSON, nullable=True)
    contraindications = Column(JSON, nullable=True)
    
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
```

#### 5.2 Actualizar Modelos Pydantic
**Archivo:** `Backend/fastapi-service/app/models/product.py`

```python
from typing import Optional, List
from pydantic import BaseModel, Field

class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    image: Optional[str] = None
    price: float
    category: str
    allergens: Optional[List[str]] = None
    ingredients: Optional[List[str]] = None
    dietary_tags: Optional[List[str]] = None
    requires_prescription: bool = False
    active_ingredients: Optional[List[str]] = None
    
    class Config:
        from_attributes = True
```

#### 5.3 Implementar Endpoint con Filtros
**Archivo:** `Backend/fastapi-service/app/routers/products.py`

```python
from fastapi import Query

@router.get("/", response_model=List[ProductResponse])
async def list_products(
    db: AsyncSession = Depends(get_db),
    # Búsqueda
    search: Optional[str] = Query(None, description="Buscar por nombre"),
    # Categoría
    category: Optional[str] = Query(None, description="food | supplement | medicine"),
    # Filtros dietéticos
    allergen_free: Optional[str] = Query(None, description="Alérgeno a evitar: gluten, nuts, dairy"),
    dietary: Optional[str] = Query(None, description="vegan, keto, low-sodium"),
    # Medicamentos
    requires_prescription: Optional[bool] = Query(None),
    # Paginación
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
):
    """Lista productos con filtros"""
    query = select(Product)
    
    # Búsqueda
    if search:
        query = query.where(
            Product.name.ilike(f"%{search}%") | 
            Product.description.ilike(f"%{search}%")
        )
    
    # Categoría
    if category:
        query = query.where(Product.category == category)
    
    # Alérgenos (JSON contains)
    if allergen_free:
        query = query.where(
            ~Product.allergens.contains([allergen_free])
        )
    
    # Dietético
    if dietary:
        query = query.where(
            Product.dietary_tags.contains([dietary])
        )
    
    # Medicamentos
    if requires_prescription is not None:
        query = query.where(Product.requires_prescription == requires_prescription)
    
    # Paginación
    result = await db.execute(
        query.offset(skip).limit(limit)
    )
    return result.scalars().all()
```

#### 5.4 Actualizar Frontend API Client
**Archivo:** `Frontend/shop/api/products.ts`

```typescript
interface ProductFilters {
  search?: string;
  category?: 'food' | 'supplement' | 'medicine';
  allergen_free?: string;
  dietary?: string;
  requires_prescription?: boolean;
  skip?: number;
  limit?: number;
}

export async function listProducts(filters?: ProductFilters) {
  const params = new URLSearchParams();
  
  if (filters?.search) params.append('search', filters.search);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.allergen_free) params.append('allergen_free', filters.allergen_free);
  if (filters?.dietary) params.append('dietary', filters.dietary);
  if (filters?.requires_prescription !== undefined) {
    params.append('requires_prescription', String(filters.requires_prescription));
  }
  params.append('skip', String(filters?.skip ?? 0));
  params.append('limit', String(filters?.limit ?? 10));
  
  const url = `${API_URL}/products?${params.toString()}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error fetching products');
  
  return (await res.json()) as Product[];
}
```

**Estimado:** 8-10 horas

---

### 💾 6. Persistencia del Carrito

**Archivo:** `Frontend/shop/store/cartStore.ts`

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_STORAGE_KEY = '@healthbytes_cart';

type CartState = {
  items: CartItem[];
  addProduct: (product: Product) => Promise<void>;
  removeProduct: (productId: string | number) => Promise<void>;
  updateQuantity: (productId: string | number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
};

export const useCart = create<CartState>()(
  (set) => ({
    items: [],
    
    loadCart: async () => {
      try {
        const saved = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
          set({ items: JSON.parse(saved) });
        }
      } catch (e) {
        console.error('Error loading cart:', e);
      }
    },
    
    addProduct: async (product) => {
      set((state) => {
        const existingItem = state.items.find(
          (item) => item.product.id === product.id
        );
        
        let newItems;
        if (existingItem) {
          newItems = state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          newItems = [...state.items, { product, quantity: 1 }];
        }
        
        // Persistir
        AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
        return { items: newItems };
      });
    },
    
    removeProduct: async (productId) => {
      set((state) => {
        const newItems = state.items.filter(
          (item) => item.product.id !== productId
        );
        AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
        return { items: newItems };
      });
    },
    
    updateQuantity: async (productId, quantity) => {
      set((state) => {
        const newItems = state.items.map((item) =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        );
        AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
        return { items: newItems };
      });
    },
    
    clearCart: async () => {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
      set({ items: [] });
    },
  })
);
```

**Uso en componentes:**
```typescript
// En _layout.tsx o App root
useEffect(() => {
  useCart.getState().loadCart();
}, []);
```

**Estimado:** 4-6 horas

---

### 🧪 7. Implementar Testing

#### Backend (pytest)
**Archivo:** `Backend/fastapi-service/tests/conftest.py`

```python
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.db.database import Base, get_db
from app.main import app

@pytest.fixture
async def test_db():
    """Create test database"""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    TestingSessionLocal = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async def override_get_db():
        async with TestingSessionLocal() as session:
            yield session
    
    app.dependency_overrides[get_db] = override_get_db
    yield
    await engine.dispose()

@pytest.fixture
async def client(test_db):
    """Create test client"""
    from httpx import AsyncClient
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
```

**Tests ejemplo:**
```python
@pytest.mark.asyncio
async def test_list_products(client):
    response = await client.get("/products")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_create_order_validates_prices(client, test_db):
    # Crear producto con precio $10
    # Enviar orden con precio $999999
    # Verificar que se guarde con precio $10
    pass
```

**Estimado:** 12-15 horas (inicial, luego añadir más cobertura)

---

## FASE 3: FEATURES SECUNDARIAS (1 mes)

### 🛒 8. Checkout Completo
- [ ] Formulario de envío (dirección, teléfono)
- [ ] Validación de domicilio
- [ ] Integración Stripe Payment Intent
- [ ] Confirmación visual
- [ ] Email de confirmación

**Estimado:** 15-20 horas

---

### 🏗️ 9. BackOffice (Admin Dashboard)
- [ ] Crear ruta `/admin`
- [ ] Gestión de productos (CRUD)
- [ ] Ordenes (ver, cambiar status)
- [ ] Usuarios (roles, moderación)
- [ ] Reportes básicos

**Estimado:** 20-25 horas

---

### 🤖 10. Recomendador (ML Service)
- [ ] Crear `Backend/py-services/recommender/`
- [ ] Entrenamiento con historial de compras
- [ ] API `/recommendations/{user_id}`
- [ ] Mostrar en frontend

**Estimado:** 30-40 horas

---

## 📋 CHECKLIST PARA CADA TASK

```markdown
- [ ] Código escrito y testeado
- [ ] README/documentación actualizado
- [ ] Tested en dev (Windows/Mac/Linux)
- [ ] Code review (si es posible)
- [ ] Commit en git con mensaje descriptivo
- [ ] Pushed a rama de feature
- [ ] PR creado
```

---

## 🎯 TIMELINE REALISTA

```
Semana 1:  Fase 1 (críticos) + Filtros iniciado
Semana 2:  Filtros + Carrito persistente
Semana 3:  Testing + README completo
Semana 4:  Checkout iniciado
Semana 5-6: Checkout + BackOffice iniciado
Mes 2:    BackOffice completo + optimizaciones
Mes 3:    Recomendador + otros nice-to-haves
```

---

## 🚀 SIGUIENTE PASO

**¿Quieres que empecemos con alguno de estos items?**

Recomendación: Comenzar con **#2 (Validar precios)** que es crítico y rápido, luego **#3 (README)** para que otros puedan contribuir.

