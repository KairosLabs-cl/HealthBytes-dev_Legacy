# ¿QUÉ DICEN LOS TESTS? - Guía Mañana

## 📌 Resumen Ejecutivo

Los tests validan que el backend funciona correctamente. Si los 8 tests pasan = **código está bien**. Si uno falla = **hay un bug**.

---

## 🔍 Los 8 Tests Explicados

### 1. **test_register_user** ✅
**¿Qué prueba?** 
- Crear usuario nuevo con email y password
- Sistema hashea password correctamente (no se guarda en plano)
- API retorna JWT token para login

**¿Qué significa si falla?**
- Bug en registro de usuarios
- Problema con hash de contraseña
- Problema con generación de token

**¿En dónde está?** `tests/test_api/test_auth.py`

---

### 2. **test_login_user** ✅
**¿Qué prueba?**
- Login con email + password correctos
- API retorna JWT token válido
- Login fallido retorna error

**¿Qué significa si falla?**
- Bug en validación de credenciales
- Token JWT no se genera correctamente
- Problema con base de datos

**¿En dónde está?** `tests/test_api/test_auth.py`

---

### 3. **test_health_check** ✅
**¿Qué prueba?**
- API está corriendo y responde
- Endpoint `/health` retorna 200 OK
- Respuesta: `{"status": "ok"}`

**¿Qué significa si falla?**
- API no está corriendo
- Hay error fatal en startup
- Endpoint no está registrado

**¿En dónde está?** `tests/test_api/test_health.py`

---

### 4. **test_get_products** ✅
**¿Qué prueba?**
- Endpoint `/api/v1/products` retorna lista de productos
- Cada producto tiene: id, name, price, description
- Respuesta es array JSON

**¿Qué significa si falla?**
- Problema con endpoint GET products
- Problema con base de datos (no hay productos)
- Schema de respuesta incorrecto

**¿En dónde está?** `tests/test_api/test_products.py`

---

### 5. **test_get_product_by_id** ✅
**¿Qué prueba?**
- Endpoint `/api/v1/products/{id}` retorna producto específico
- Si product_id = 1, retorna producto con id=1
- Si no existe, retorna 404

**¿Qué significa si falla?**
- Problema con búsqueda por ID
- SQL query incorrecto
- Producto no existe en BD

**¿En dónde está?** `tests/test_api/test_products.py`

---

### 6. **test_create_product** ✅
**¿Qué prueba?**
- Crear nuevo producto con: name, description, price
- Retorna producto creado con ID auto-generado
- Producto se guarda en base de datos

**¿Qué significa si falla?**
- Problema con validación de datos
- Problema con auto-increment de ID
- Problema guardando en base de datos

**¿En dónde está?** `tests/test_api/test_products.py`

---

### 7. **test_get_orders** ✅
**¿Qué prueba?**
- Endpoint `/api/v1/orders` retorna órdenes del usuario
- Cada orden tiene: id, user_id, items[], total, status
- Respuesta es array JSON

**¿Qué significa si falla?**
- Problema con endpoint GET orders
- Problema con relación usuario-órdenes
- Problema con cálculo de total

**¿En dónde está?** `tests/test_api/test_orders.py`

---

### 8. **test_create_order** ✅
**¿Qué prueba?**
- Crear orden con items: [{product_id, quantity}]
- Sistema calcula total automáticamente
- Orden se guarda en base de datos

**¿Qué significa si falla?**
- Problema con validación de items
- Problema con cálculo de total
- Problema guardando orden en BD

**¿En dónde está?** `tests/test_api/test_orders.py`

---

## 📊 Interpretando Resultados

### ✅ PASSED (Test Pasó)
```
tests/test_api/test_auth.py::test_register_user PASSED [ 12%]
```

**Significa:**
- Endpoint funciona correctamente ✅
- Base de datos actualiza correctamente ✅
- Respuesta tiene formato correcto ✅
- No hay excepciones no manejadas ✅

**Acción:** Nada, todo bien

---

### ❌ FAILED (Test Falló)
```
FAILED tests/test_api/test_products.py::test_get_products
AssertionError: assert 500 in [200, 404]
```

**Significa:**
- Endpoint retornó error 500 (Internal Server Error) ❌
- Esperábamos 200 (OK) o 404 (no encontrado)
- Hay un bug en el código

**Acción:**
1. Ver detalle del error: `pytest tests/test_api/test_products.py::test_get_products -v --tb=short`
2. Leer el traceback
3. Arreglar el bug
4. Ejecutar test nuevamente

---

## 🚨 Errores Comunes y Qué Significan

### Error: "ChunkedIteratorResult can't be used in 'await' expression"
**Causa:** Base de datos sincrónica en endpoint asincrónico
**Solución:** Ya está arreglado en conftest.py (MockAsyncSession)

### Error: "404 Not Found"
**Causa:** Recurso no existe en base de datos
**Solución:** Verificar que los datos de prueba están creados

### Error: "ConnectionError"
**Causa:** Base de datos no está disponible
**Solución:** Verificar que PostgreSQL está corriendo

### Error: "JWT signature doesn't match"
**Causa:** Token inválido o expirado
**Solución:** Regenerar token, verificar JWT_SECRET en .env

---

## 🔄 Flujo de Trabajo

```
Escribo código
       ↓
Ejecuto: pytest tests/ -v
       ↓
   ¿Todos PASSED?
      /  \
    SÍ   NO
    ↓     ↓
   ✅   ❌ Ver qué falló
   OK    Arreglar bug
         Ejecutar test de nuevo
```

---

## 🎯 Checklist - Antes de Subir Código

- [ ] Ejecuté: `pytest tests/ -v`
- [ ] Todos los tests muestran: `PASSED` ✅
- [ ] El output termina con: `8 passed` ✅
- [ ] No hay errores en logs ✅
- [ ] No hay `FAILED` ❌

Si todo está ✅ → Puedes hacer commit y push sin miedo

---

## 📁 Dónde Está Qué

**Tests:** `Backend/tests/test_api/`
- test_auth.py (autenticación)
- test_products.py (productos)
- test_orders.py (órdenes)
- test_health.py (salud de API)

**Código testedo:** `Backend/app/api/v1/`
- auth.py (implementa registro y login)
- products.py (implementa endpoints de productos)
- orders.py (implementa endpoints de órdenes)

**Configuración de tests:** `Backend/tests/conftest.py`
- Fixtures (datos de prueba)
- Setup de base de datos SQLite

---

## 💡 Tips Profesionales

### Ver salida detallada de un test
```bash
pytest tests/test_api/test_auth.py::test_register_user -v -s
```
El `-s` muestra `print()` statements

### Debuggear un test
```bash
pytest tests/test_api/test_auth.py::test_register_user --pdb
```
Se abre debugger si falla

### Correr solo tests rápidos
```bash
pytest tests/ -m "not slow"
```

### Ver qué líneas NO están testeadas
```bash
pytest tests/ --cov=app --cov-report=html
```
Abre: `htmlcov/index.html`

---

## 🎓 Conclusión

Los tests son tu amigo. Ellos te dicen si tu código funciona. 

- Si pasan → tu código funciona ✅
- Si fallan → hay un bug que necesitas arreglar ❌

Cada test corresponde a un endpoint. Si un test falla, sabes exactamente qué endpoint tiene el problema.

**Recomendación:** Corre los tests después de cada cambio importante. Es rápido (menos de 1 segundo) y te evita muchos problemas.

---

**Última actualización:** 18 de Enero 2026  
**Para más detalles:** Lee `Backend/tests/README.md`
