# ✅ Fix Summary: Test Infrastructure Issues

**Fecha**: 2026-01-22  
**Rama**: `jules-nplusone-fix`  
**Estado**: 🔧 En Progreso

---

## 🔧 Cambios Realizados

### 1. ✅ Bcrypt Compatibility Fix
**Problema**: `bcrypt==5.0.0` + `passlib==1.7.4` = incompatible  
**Solución**: Downgrade `bcrypt==3.2.2` que funciona con passlib 1.7.4

```bash
# En requirements.txt
- bcrypt==5.0.0
+ bcrypt==3.2.2
```

### 2. ✅ MockAsyncSession Completado
**Problema**: Faltaban métodos async que usa el código de producción  
**Solución**: Agregar `rollback()`, `flush()` a MockAsyncSession

```python
# En conftest.py
async def rollback(self):
    self.sync_session.rollback()

async def flush(self):
    self.sync_session.flush()
```

### 3. ✅ Helper para Crear Usuarios de Test
**Problema**: Tests creaban User con `password_hash` pero modelo usa `password`  
**Solución**: Crear función `create_test_user()` que usa campos correctos

```python
def create_test_user(
    db_session: Session,
    email: str = "test@example.com",
    password: str = "hashed_test_password",
    role: str = "customer",
    **kwargs
) -> User:
    """Usar 'password', no 'password_hash'"""
    user = User(
        email=email,
        password=password,  # ← Campo correcto
        role=role,
        name=kwargs.get("name", "Test User"),
        address=kwargs.get("address"),
        clerk_id=kwargs.get("clerk_id")
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user
```

---

## ⚠️ Problemas Remanentes

### Aún Falta Arreglar: Test Assertions

En `test_auth_service.py:29`, el test verifica:
```python
assert result.password_hash != "secure123"  # ← Campo no existe
```

Debería ser:
```python
assert result.password != "secure123"  # ← Campo correcto
```

### Por qué el Bcrypt sigue Fallando

El error real es:
```
ValueError: password cannot be longer than 72 bytes
```

Esto sucede porque **bcrypt tiene un límite de 72 bytes por contraseña**. En tests, si la contraseña es muy larga (ej: una contraseña hasheada previamente), falla.

**Solución**: Asegurarse que las contraseñas de test sean < 72 bytes:
```python
user_data = UserCreate(
    email="newuser@example.com",
    password="secure123"  # ✅ 8 bytes - OK
)
```

---

## 🎯 Próximos Pasos

1. [ ] Actualizar assertions en tests (password → password_hash en asserts)
2. [ ] Verificar que todas las contraseñas de test sean < 72 bytes
3. [ ] Ejecutar completa suite de auth tests
4. [ ] Ejecutar completa suite de órdenes (ya pasan)

---

## 📊 Estado Actual

```
✅ Bcrypt downgraded a 3.2.2
✅ MockAsyncSession completado
✅ Helper create_test_user() creado
⏳ Tests de auth siguen fallando por assertions obsoletas
✅ Tests de órdenes PASAN (2/2)
```

