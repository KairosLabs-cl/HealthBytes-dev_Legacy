# Notas de Configuración de Tests

## Problema Resuelto: Desajuste de Sesión Async/Sync

### El Problema
La aplicación FastAPI usa **AsyncSession** de SQLAlchemy (`AsyncSessionLocal` con `class_=AsyncSession`), pero el **TestClient** de FastAPI es **sincrónico** y no puede manejar inyección de dependencias asincrónicas directamente.

Esto causaba errores como:
```
TypeError: object ChunkedIteratorResult can't be used in 'await' expression
TypeError: object NoneType can't be used in 'await' expression
```

### La Solución: MockAsyncSession

Se creó una clase `MockAsyncSession` en `tests/conftest.py` que:
1. **Envuelve una Sesión sincrónica de SQLAlchemy** 
2. **Proporciona métodos asincrónico** (`async def execute()`, `async def commit()`, etc.)
3. **Internamente usa la sesión sincrónica** para operaciones reales de base de datos
4. **Retorna resultados directamente** (no esperables) que el manejo `await` de SQLAlchemy espera

### Código Clave
```python
class MockAsyncSession:
    """Mock AsyncSession que envuelve una Sesión sincrónica para testing."""
    
    def __init__(self, sync_session: Session):
        self.sync_session = sync_session
    
    async def execute(self, statement):
        """Ejecutar sentencia sincrónico y retornar resultado."""
        result = self.sync_session.execute(statement)
        return result
    
    async def commit(self):
        """Confirmar cambios."""
        self.sync_session.commit()
    
    # ... más métodos
```

### Resultados de Tests
- ✅ **8/8 tests pasando**
- ✅ test_register_user
- ✅ test_login_user
- ✅ test_health_check
- ✅ test_get_orders
- ✅ test_create_order
- ✅ test_get_products
- ✅ test_get_product_by_id
- ✅ test_create_product

### Cómo Funciona
1. El fixture `db_session` crea una **Sesión sincrónica de SQLAlchemy** con base de datos SQLite en memoria
2. El fixture `client` la envuelve en `MockAsyncSession` via `get_db_override`
3. FastAPI ve `MockAsyncSession` con métodos asincrónico y queda satisfecho
4. Internamente, las operaciones usan llamadas sincrónicas a base de datos (que funcionan bien)
5. TestClient puede llamar correctamente endpoints asincrónico sin problemas de event loop

### Ejecutar Tests
```bash
cd Backend
python -m pytest tests/ -v
```

### Notas
- Usa SQLite en memoria para velocidad (base de datos `:memory:`)
- Cada test obtiene una base de datos nueva (rollback de transacción por test)
- Cubre todos los endpoints principales: auth, products, orders, health
- Reporte de cobertura generado automáticamente en `htmlcov/`
