# 🧪 Guía de Tests - Backend HealthBytes

## Descripción General

Este directorio contiene la suite de tests automatizados para el backend de HealthBytes. Los tests validan que todos los endpoints de la API funcionan correctamente y que la lógica de negocio se ejecuta como se espera.

## 📊 Estado Actual

- ✅ **8/8 tests pasando**
- ✅ Cobertura de código: 41%
- ✅ Todos los endpoints principales validados

## 🏗️ Estructura de Tests

```
tests/
├── README.md                 # Este archivo
├── conftest.py               # Configuración y fixtures de pytest
├── pytest.ini                # Configuración de pytest
├── test_api/
│   ├── test_auth.py         # Tests de autenticación
│   ├── test_health.py       # Health check endpoint
│   ├── test_orders.py       # Tests de órdenes
│   └── test_products.py     # Tests de productos
└── __pycache__/             # Cache de Python (ignorar)
```

## 🧬 Qué Prueban los Tests

### 1. **test_auth.py** - Autenticación
- ✅ `test_register_user`: Validar registro de nuevo usuario
  - Crea usuario con email, password y nombre
  - Verifica que se retorna token JWT
  - Valida que la contraseña se hashea correctamente

- ✅ `test_login_user`: Validar login de usuario
  - Verifica credenciales de usuario
  - Retorna token JWT válido
  - Manejo de errores en login fallido

### 2. **test_health.py** - Health Check
- ✅ `test_health_check`: Endpoint de salud de la API
  - Verifica que la API está corriendo
  - Retorna status 200 OK
  - Respuesta simple: `{"status": "ok"}`

### 3. **test_products.py** - Gestión de Productos
- ✅ `test_get_products`: Obtener lista de productos
  - Retorna lista de todos los productos
  - Formato: array de productos con id, nombre, precio, etc.

- ✅ `test_get_product_by_id`: Obtener producto específico
  - Busca producto por ID
  - Retorna detalles completos del producto
  - Maneja errores si producto no existe

- ✅ `test_create_product`: Crear nuevo producto
  - Validar que se puede crear un producto
  - Requiere: nombre, descripción, precio
  - Retorna producto creado con ID asignado

### 4. **test_orders.py** - Gestión de Órdenes
- ✅ `test_get_orders`: Obtener lista de órdenes
  - Retorna órdenes del usuario actual
  - Incluye items de la orden

- ✅ `test_create_order`: Crear nueva orden
  - Validar que se puede crear una orden
  - Requiere items (product_id, cantidad)
  - Calcula total automáticamente

## 🚀 Cómo Ejecutar los Tests

### Ejecutar todos los tests
```bash
cd Backend
python -m pytest tests/ -v
```

### Ejecutar tests de un archivo específico
```bash
python -m pytest tests/test_api/test_auth.py -v
python -m pytest tests/test_api/test_products.py -v
```

### Ejecutar un test específico
```bash
python -m pytest tests/test_api/test_auth.py::test_register_user -v
```

### Ejecutar con reporte de cobertura
```bash
python -m pytest tests/ -v --cov=app
```

### Ejecutar con output detallado (si hay errores)
```bash
python -m pytest tests/ -v --tb=short
```

## 📋 Qué Significan los Resultados

### ✅ Test Pasando (PASSED)
Significa que:
- El endpoint responde correctamente
- Los datos se procesan como se espera
- La base de datos se actualiza correctamente
- Las validaciones funcionan

**Ejemplo:**
```
tests/test_api/test_auth.py::test_register_user PASSED [ 12%]
```

### ❌ Test Fallando (FAILED)
Significa que:
- El endpoint no responde con el código de estado esperado
- La lógica de negocio tiene un error
- La base de datos no se actualiza correctamente
- Hay una excepción no manejada

**Ejemplo:**
```
tests/test_api/test_products.py::test_get_products FAILED
AssertionError: assert 500 in [200, 404]
```

En este caso, esperábamos un 200 (OK) o 404 (no encontrado), pero obtuvimos un 500 (error interno).

## 🔧 Configuración de Tests

### conftest.py - Fixtures Principales

#### `engine`
- Crea base de datos SQLite en memoria
- Se reutiliza en toda la sesión de tests
- Scope: `session`

#### `db_session`
- Proporciona una sesión de base de datos para cada test
- Usa transacciones que se revierten después de cada test
- Scope: `function` (nueva para cada test)

#### `client`
- Proporciona el cliente de prueba de FastAPI
- Inyecta la sesión de base de datos mockeada
- Permite hacer requests HTTP a los endpoints

#### Datos de Muestra
- `sample_product_data`: Producto de prueba
- `sample_user_data`: Usuario de prueba
- `sample_order_data`: Orden de prueba

### MockAsyncSession

Clase especial que convierte la sesión sincrónica a asincrónica para tests:
- FastAPI usa AsyncSession en producción
- TestClient es sincrónico
- MockAsyncSession hace que ambos sean compatibles

## ⚠️ Problemas Comunes y Soluciones

### Error: "ChunkedIteratorResult can't be used in 'await' expression"
**Causa:** Sesión de base de datos sincrónica en endpoint asincrónico
**Solución:** Ya está resuelta con MockAsyncSession en conftest.py

### Error: "NoneType can't be used in 'await' expression"
**Causa:** Fixture de base de datos no retorna sesión válida
**Solución:** Verificar que `get_db_override` retorna MockAsyncSession

### Tests lentos
**Causa:** Base de datos real o conexión lenta
**Solución:** Usar SQLite en memoria (ya configurado)

### Test falla con "404 Not Found"
**Verificar:**
- ¿Existe el recurso en la base de datos?
- ¿El endpoint está registrado correctamente en `main.py`?
- ¿Las rutas incluidas con `include_router`?

## 🔄 Workflow - Desarrollo y Testing

1. **Escribir código** en `app/api/v1/` o `app/services/`
2. **Crear test** en `tests/test_api/` que valide la funcionalidad
3. **Ejecutar test** con `pytest tests/`
4. **Si falla:** Debuggear y arreglar el código
5. **Si pasa:** Código listo para producción

## 📈 Cobertura de Código

Archivo coverage: `htmlcov/index.html`

Para generar reporte:
```bash
python -m pytest tests/ --cov=app --cov-html=htmlcov
```

Luego abrir `htmlcov/index.html` en el navegador.

**Cobertura por módulo:**
- `app/api/v1/auth.py`: 67% (bien cubierto)
- `app/api/v1/products.py`: 41% (necesita más tests)
- `app/api/v1/orders.py`: 19% (necesita más tests)
- `app/core/security.py`: 71% (bien cubierto)

## 🎯 Próximos Pasos

- [ ] Aumentar cobertura de orders.py
- [ ] Aumentar cobertura de products.py
- [ ] Agregar tests para casos de error
- [ ] Agregar tests de validación de datos
- [ ] Tests de autenticación con tokens inválidos
- [ ] Tests de permisos (si existen roles diferentes)

## 🐛 Debugging de Tests

### Ver logs detallados
```bash
python -m pytest tests/test_api/test_auth.py::test_register_user -v -s
```

El flag `-s` muestra print() statements y logs.

### Ver traceback completo
```bash
python -m pytest tests/test_api/test_auth.py::test_register_user -v --tb=long
```

### Ejecutar test interactivamente
```bash
python -m pytest tests/test_api/test_auth.py::test_register_user -v --pdb
```

Abre debugger si el test falla.

## 📚 Recursos Útiles

- [Documentación Pytest](https://docs.pytest.org/)
- [Documentación FastAPI Testing](https://fastapi.tiangolo.com/advanced/testing-dependencies/)
- [SQLAlchemy Testing](https://docs.sqlalchemy.org/en/20/faq/ormconfiguration.html#what-do-i-use-to-initialize-a-sqlalchemy-declarative-base-class)

## ✅ Checklist Antes de Deploy

- [ ] `pytest tests/ -v` retorna 8/8 tests pasando
- [ ] Ningún warning importante en output
- [ ] Cobertura por lo menos 50% en módulos principales
- [ ] No hay errores en logs
- [ ] Tests ejecutan en menos de 2 segundos

---

**Última actualización:** 18 de Enero 2026
**Estado:** ✅ Sistema completamente operativo
