# 🧪 Database Tools

Scripts para gestionar la base de datos de HealthBytes.

## 📋 Scripts Disponibles

### `run_migration.py`
Ejecuta la migración de búsqueda de texto completo.

```bash
python run_migration.py
```

**Qué hace**:
- ✅ Crea columna `search_vector` en tabla `products`
- ✅ Crea índice GIN para búsqueda rápida
- ✅ Crea trigger para auto-actualizar search_vector
- ✅ Verifica que todo fue creado correctamente

### `recreate_db.py`
Borra y recrea TODAS las tablas de la base de datos.

```bash
python recreate_db.py
```

**⚠️ CUIDADO**: Esto borra TODOS los datos. Solo para desarrollo.

**Qué hace**:
- 🗑️ Elimina todas las tablas
- 🔨 Recrea todas las tablas desde los modelos

### `create_cart_table.py`
Crea específicamente la tabla de carrito.

```bash
python create_cart_table.py
```

**Qué hace**:
- ✅ Crea tabla `cart_items` si no existe
- Estructura: user_id, product_id, quantity, etc.

---

## 🌍 Configuración de Base de Datos

Los scripts usan `***REDACTED_DATABASE_URL***

```python
# backend/app/db/database.py
from app.config import settings

***REDACTED_DATABASE_URL***
```

Verifica tu `.env` en `backend/.env`:

```env
***REDACTED_DATABASE_URL***
```

---

**Última actualización**: 2026-02-04
