# 🛠️ Task — nojustbenja (CTO / Backend)

**Tarea:** Push-Token Registration Backend  
**Branch:** `feat/push-token-registration`  
**ID:** `task-20260608-nojustbenja-push-token-backend`  
**Tipo:** `feat` — release readiness P1

---

## Objetivo

Implementar endpoint backend para que el frontend pueda registrar Expo push tokens después del login. Este es un **bloqueador crítico** para push notifications en producción.

---

## Archivos a tocar

| Acción | Archivo |
|---|---|
| **Modificar** | `backend/app/db/models/user.py` (agregar campo `push_token`) |
| **Crear/modificar** | `backend/app/api/v1/users.py` (endpoint PATCH) |
| **Modificar** | `backend/app/services/notification_service.py` (lógica validación) |
| **Crear** | `backend/app/schemas/notification.py` (schema Pydantic) |
| **Crear** | `backend/tests/test_push_token.py` (tests completos) |
| **Revisar** | `backend/alembic/versions/` (migración automática) |

---

## Comportamiento esperado

### Endpoint a implementar:
```
PATCH /api/v1/users/me/push-token
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

### Response exitosa:
```json
{
  "message": "Push token registered successfully",
  "push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

### Validaciones:
- ✅ Token debe tener formato `ExponentPushToken[...]`
- ✅ Usuario debe estar autenticado (JWT válido)
- ✅ Si el usuario ya tiene push_token, actualizar (no error)
- ✅ Si push_token es `null` o vacío, remover el token existente

---

## Schema Pydantic

```python
# backend/app/schemas/notification.py
from pydantic import BaseModel, field_validator
import re

class PushTokenRequest(BaseModel):
    push_token: str | None

    @field_validator('push_token')
    @classmethod
    def validate_expo_token(cls, v: str | None) -> str | None:
        if v is None or v == "":
            return None
        
        pattern = r'^ExponentPushToken\[[a-zA-Z0-9_-]+\]$'
        if not re.match(pattern, v):
            raise ValueError('Invalid Expo push token format')
        
        return v

class PushTokenResponse(BaseModel):
    message: str
    push_token: str | None
```

---

## Modificación del modelo User

```python
# backend/app/db/models/user.py
class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # ... otros campos existentes ...
    
    # Agregar este campo:
    push_token = Column(String(200), nullable=True, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

---

## Endpoint

```python
# backend/app/api/v1/users.py
from app.schemas.notification import PushTokenRequest, PushTokenResponse
from app.services.notification_service import register_push_token

@router.patch("/me/push-token", response_model=PushTokenResponse)
async def update_push_token(
    request: PushTokenRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Register or update Expo push token for authenticated user.
    
    - **push_token**: Expo push token in format ExponentPushToken[...]
    - Pass null or empty string to remove existing token
    """
    result = await register_push_token(db, current_user.id, request.push_token)
    return result
```

---

## Service

```python
# backend/app/services/notification_service.py
async def register_push_token(
    db: AsyncSession,
    user_id: UUID,
    push_token: str | None
) -> dict:
    """
    Register or update push token for user.
    Returns dict with message and push_token.
    """
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.push_token = push_token
    await db.commit()
    await db.refresh(user)
    
    message = "Push token removed" if push_token is None else "Push token registered successfully"
    
    return {
        "message": message,
        "push_token": user.push_token
    }
```

---

## Tests

```python
# backend/tests/test_push_token.py
import pytest
from httpx import AsyncClient

VALID_TOKEN = "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
INVALID_TOKEN = "not-a-valid-token"

@pytest.mark.asyncio
async def test_register_push_token_success(client: AsyncClient, auth_headers):
    response = await client.patch(
        "/api/v1/users/me/push-token",
        json={"push_token": VALID_TOKEN},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["push_token"] == VALID_TOKEN
    assert "successfully" in data["message"]

@pytest.mark.asyncio
async def test_register_push_token_invalid_format(client: AsyncClient, auth_headers):
    response = await client.patch(
        "/api/v1/users/me/push-token",
        json={"push_token": INVALID_TOKEN},
        headers=auth_headers
    )
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_update_existing_push_token(client: AsyncClient, auth_headers):
    # Primer registro
    await client.patch(
        "/api/v1/users/me/push-token",
        json={"push_token": VALID_TOKEN},
        headers=auth_headers
    )
    
    # Actualización
    new_token = "ExponentPushToken[yyyyyyyyyyyyyyyyyyyy]"
    response = await client.patch(
        "/api/v1/users/me/push-token",
        json={"push_token": new_token},
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["push_token"] == new_token

@pytest.mark.asyncio
async def test_remove_push_token(client: AsyncClient, auth_headers):
    # Registrar primero
    await client.patch(
        "/api/v1/users/me/push-token",
        json={"push_token": VALID_TOKEN},
        headers=auth_headers
    )
    
    # Remover
    response = await client.patch(
        "/api/v1/users/me/push-token",
        json={"push_token": None},
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["push_token"] is None

@pytest.mark.asyncio
async def test_push_token_requires_auth(client: AsyncClient):
    response = await client.patch(
        "/api/v1/users/me/push-token",
        json={"push_token": VALID_TOKEN}
    )
    assert response.status_code == 401
```

---

## Criterios de aceptación

- [ ] Campo `push_token` agregado al modelo `User` con migración automática
- [ ] Endpoint `PATCH /api/v1/users/me/push-token` implementado y funcional
- [ ] Validación de formato Expo token correcta
- [ ] Actualización de token existente funciona sin errores
- [ ] Remover token (pasar `null`) funciona correctamente
- [ ] Todos los tests pasan: `pytest backend/tests/test_push_token.py -v`
- [ ] Swagger actualizado y documentado
- [ ] Sin errores de TypeScript en schemas

---

## Verificación

```bash
cd backend

# Crear migración (si no se genera automáticamente)
alembic revision --autogenerate -m "add push_token to users"
alembic upgrade head

# Tests
pytest tests/test_push_token.py -v

# Test manual
uvicorn app.main:app --reload
# Abrir http://localhost:3001/docs
# Probar endpoint PATCH /users/me/push-token
```

---

## Commits esperados

```
feat(users): add push_token field to User model with migration
feat(notifications): implement PATCH /users/me/push-token endpoint
test(notifications): add comprehensive push token registration tests
docs(api): update swagger docs for push token endpoint
```

---

## Impacto

Este endpoint desbloquea el flujo completo de push notifications:
1. Usuario se loguea → frontend obtiene token de Expo
2. Frontend llama a este endpoint → backend guarda el token
3. Backend puede enviar notificaciones push usando `NotificationService`

**Bloqueador de:** `task-20260603-expo-go-push-warning` (frontend side)

---

> [!IMPORTANT]
> Este es P1 de release readiness. Sin esto, no hay push notifications en producción.
