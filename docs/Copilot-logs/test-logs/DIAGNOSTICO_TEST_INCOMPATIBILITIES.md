# 🔍 Diagnóstico: Incompatibilidades en Tests

**Fecha**: 2026-01-22  
**Rama**: `jules-nplusone-fix`  
**Estado**: ⚠️ 4 problemas críticos identificados

---

## 📋 Problemas Identificados

### 1️⃣ **Bcrypt Versión Incompatible (CRÍTICO)**

#### Problema
```
ValueError: password cannot be longer than 72 bytes, truncate manually 
if necessary (e.g. my_password[:72])
```

#### Raíz del Problema
- **Paquete**: `passlib==1.7.4` + `bcrypt==5.0.0`
- **Incompatibilidad**: `passlib` v1.7.4 es **MUY antigua** (última v2.x.x)
- **Bcrypt v5.0.0** tiene un bug de detección de versión que rompe con `passlib` viejo

#### Detalles Técnicos
```
passlib/handlers/bcrypt.py:622: (trapped) error reading bcrypt version
AttributeError: module 'bcrypt' has no attribute '__about__'
```

Esto indica que bcrypt cambió su estructura interna y passlib antiguo no puede leerla.

#### Solución Recomendada
**Actualizar `passlib` a v2.x.x**:
```bash
pip install --upgrade passlib
```

**En `requirements.txt`**, cambiar:
```diff
- passlib[bcrypt]==1.7.4
+ passlib[bcrypt]==2.4.2
```

#### Por Qué No Afecta a Producción (Ahora)
- ✅ En producción se usa **Clerk OAuth** (no JWT+bcrypt)
- ⚠️ JWT legacy está disponible pero **no se usa en producción**
- 🔴 **Riesgo futuro**: Si alguien activa legacy JWT o agrega más auth, romperá

---

### 2️⃣ **MockAsyncSession Falta `rollback()`**

#### Problema
```
AttributeError: 'MockAsyncSession' object has no attribute 'rollback'
```

#### Dónde Ocurre
En `test_api/test_auth.py`:
```python
@router.post("/register", response_model=UserWithToken, status_code=201)
async def register_user(...):
    try:
        # ... código ...
    except Exception as e:
        await db.rollback()  # ← MockAsyncSession no tiene este método
        raise HTTPException(...)
```

#### Raíz del Problema
El código en `api/v1/auth.py` llamaba a `await db.rollback()`, pero `MockAsyncSession` en `conftest.py` no implementaba ese método.

#### Solución
**Agregar método `rollback()` a `MockAsyncSession`**:

En `tests/conftest.py`, línea 59, agregar:
```python
async def rollback(self):
    """Rollback transaction."""
    self.sync_session.rollback()
```

#### Por Qué Afecta
- 🔴 **Crítico**: Si el código de producción llama `db.rollback()` en error handlers, tests fallarán
- Tests ahora mockean parcialmente el comportamiento de `AsyncSession`

---

### 3️⃣ **User Model: Campo `password` vs `password_hash`**

#### Problema
```
TypeError: 'password_hash' is an invalid keyword argument for User
```

#### Análisis
**Definición en `db/schemas.py` (la CORRECTA - SQLAlchemy)**:
```python
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, ...)
    email = Column(String(255), ...)
    password = Column(String(255), nullable=True)  # ← Campo se llama "password"
    role = Column(String(255), ...)
```

**Pero los tests usan** `password_hash`:
```python
# tests/test_services/test_user_service.py
user = User(
    id=1,
    email="test@example.com",
    password_hash="hashed_password",  # ← INCORRECTO: no existe este campo
    role="customer"
)
```

#### Raíz del Problema
- Tests fueron escritos esperando un modelo diferente
- Posible confusión con Pydantic schema (que tiene `password`)
- O legacy de un refactor anterior

#### Solución
**Actualizar tests para usar el nombre correcto**:
```python
user = User(
    id=1,
    email="test@example.com",
    password="hashed_password",  # ✅ Correcto
    role="customer"
)
```

#### Por Qué Afecta
- 🔴 **Crítico para tests de User/Auth**: 10+ tests fallan
- ✅ **Producción**: La API no crea User directamente con passwordHash, usa JWT

---

### 4️⃣ **`order_service.get_order()` Firma Inconsistente**

#### Problema
```
TypeError: get_order() missing 1 required positional argument: 'user_id'
```

#### Análisis
**En `order_service.py` (línea 143)**:
```python
async def get_order(
    db: AsyncSession,
    order_id: int,
    user_id: int  # ← REQUIERE user_id para verificar ownership
) -> Optional[Order]:
```

**Pero test llama sin `user_id`**:
```python
# tests/test_services/test_order_service.py
result = await get_order(mock_db, "nonexistent_order")
# Missing: user_id parámetro
```

#### Raíz del Problema
- Test fue escrito sin entender que la función verifica **ownership**
- Seguridad feature: un usuario no puede ver órdenes de otros

#### Solución
**Actualizar test para pasar `user_id`**:
```python
result = await get_order(
    mock_db, 
    order_id="nonexistent_order",
    user_id=current_user.id
)
```

#### Por Qué Afecta
- ⚠️ **Tests**: 1 test fallaba
- ✅ **Producción**: Endpoint usa `get_current_user` para obtener `user_id`

---

## 🎯 Matriz de Impacto

| Problema | Severidad | Produce | Tests Fallidos | Riesgo Producción |
|----------|-----------|---------|----------------|------------------|
| Bcrypt versión | 🔴 CRÍTICO | Install | 11 tests auth | MEDIO (legacy JWT) |
| MockAsyncSession.rollback | 🔴 CRÍTICO | Test mock | 1 test auth | ALTO (error handling) |
| User password_hash | 🟠 ALTO | Test fixtures | 6 tests user | BAJO (no se usa) |
| get_order signature | 🟡 MEDIO | Test setup | 1 test order | BAJO (feature/security) |

---

## 🛠️ Plan de Acción (Priorizado)

### 1. **Inmediato (Bloquea Tests)**

```bash
# Actualizar passlib
pip install --upgrade passlib
pip freeze | grep passlib >> requirements.txt
```

### 2. **Antes de Merge** 

Agregar a `conftest.py`:
```python
async def rollback(self):
    self.sync_session.rollback()
```

### 3. **Antes de Release**

Corregir tests:
- `test_user_service.py`: Cambiar `password_hash` → `password`
- `test_order_service.py`: Agregar parámetro `user_id`

### 4. **Documentación**

Crear `docs/copilot-logs/test-logs/TEST_FIXTURES_GUIDE.md`:
- Cómo crear fixtures correctas
- Nombres de campos correctos
- Ejemplos de llamadas a servicios

---

## 🔐 Prevención Futura

### En `conftest.py`, crear función helper:

```python
def create_test_user(
    db_session: Session,
    email: str = "test@example.com",
    password: str = "hashed_test",
    **kwargs
) -> User:
    """Create test user with correct field names."""
    user = User(
        email=email,
        password=password,  # ← Correcto, no password_hash
        role=kwargs.get("role", "customer"),
        name=kwargs.get("name", "Test User"),
        clerk_id=kwargs.get("clerk_id")
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user
```

### En `MockAsyncSession`, implementar todos los métodos:

```python
class MockAsyncSession:
    """Complete mock that matches AsyncSession interface."""
    
    async def rollback(self):
    async def flush(self):
    async def close(self):
    async def expire_all(self):
    # ... todos los métodos que se usan en servicios
```

---

## 📊 Resumen Técnico

```
TESTS AHORA:       19 failed, 24 passed (35% coverage)
TESTS ESPERADOS:   50+ passed (70%+ coverage)

BLOQUEADORES:
  ✗ Passlib version incompatible con bcrypt 5.0.0
  ✗ MockAsyncSession incompleto
  ✗ Test fixtures usan nombres de campos incorrectos
  ✗ Tests no respetan signatures de funciones
```

---

## ✅ Checklist para Mantener Esto a Raya

- [ ] Actualizar passlib a 2.4.2+
- [ ] Agregar `rollback()` a MockAsyncSession
- [ ] Crear helper `create_test_user()` en conftest
- [ ] Revisar todas las llamadas a servicios en tests
- [ ] Documentar en `TEST_FIXTURES_GUIDE.md`
- [ ] Hacer que passlib sea pinned en requirements (no `==1.7.4`)
- [ ] Agregar test para verificar MockAsyncSession tiene todos los métodos

