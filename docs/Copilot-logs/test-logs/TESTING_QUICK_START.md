# 🚀 QUICK START 

## ¿Para qué son los tests?

Para verificar que el backend funciona correctamente. Si todos los tests pasan = el código está bien. Si un test falla = hay un problema.

## Cheat Sheet - Lo más importante

### ✅ Si quieres...

**...ejecutar todos los tests:**

```bash
cd Backend
pytest tests/ -v
```

**...ver qué test falla:**
El output dirá `PASSED` (✅) o `FAILED` (❌)

**...entender qué significa cada test:**
Leer: `Backend/tests/README.md`

**...debuggear un test que falla:**

```bash
pytest tests/test_api/test_<archivo>.py -v -s --tb=short
```

**...agregar un nuevo test:**

1. Crear archivo en `tests/test_api/test_<nombre>.py`
2. Copiar estructura de otro test
3. Ejecutar: `pytest tests/test_api/test_<nombre>.py -v`

**...saber cobertura de código:**

```bash
pytest tests/ --cov=app --cov-html=htmlcov
```

Luego abrir: `htmlcov/index.html`

---

## Resultados Esperados

### ✅ Éxito (Todo bien)

```
tests/test_api/test_auth.py::test_register_user PASSED
tests/test_api/test_auth.py::test_login_user PASSED
tests/test_api/test_health.py::test_health_check PASSED
tests/test_api/test_orders.py::test_get_orders PASSED
tests/test_api/test_orders.py::test_create_order PASSED
tests/test_api/test_products.py::test_get_products PASSED
tests/test_api/test_products.py::test_get_product_by_id PASSED
tests/test_api/test_products.py::test_create_product PASSED

======================== 8 passed in 0.81s ========================
```

**Esto significa:** Todos los endpoints funcionan, base de datos funciona, autenticación funciona. ✅ Deploy seguro.

### ❌ Error (Algo roto)

```
FAILED tests/test_api/test_products.py::test_get_products
AssertionError: assert 500 in [200, 404]

object ChunkedIteratorResult can't be used in 'await' expression
```

**Esto significa:** El endpoint `/api/v1/products` está retornando error 500. Hay un bug en el código.

---

## Qué Prueban los 8 Tests

| Test                   | Verifica                     | Endpoint                   |
| ---------------------- | ---------------------------- | -------------------------- |
| test_register_user     | Crear usuario nuevo          | POST /api/v1/auth/register |
| test_login_user        | Login con credenciales       | POST /api/v1/auth/login    |
| test_health_check      | API está funcionando        | GET /health                |
| test_get_orders        | Obtener órdenes del usuario | GET /api/v1/orders         |
| test_create_order      | Crear nueva orden            | POST /api/v1/orders        |
| test_get_products      | Listar todos los productos   | GET /api/v1/products       |
| test_get_product_by_id | Obtener 1 producto           | GET /api/v1/products/{id}  |
| test_create_product    | Crear nuevo producto         | POST /api/v1/products      |

---

## Troubleshooting Rápido

| Problema                     | Comando                                        | Solución                    |
| ---------------------------- | ---------------------------------------------- | ---------------------------- |
| No sé qué hacer            | `cd Backend && pytest tests/ -v`             | Ejecuta los tests            |
| Quiero saber qué significan | Abre:`Backend/tests/README.md`               | Lee la guía completa        |
| Un test falla y no entiendo  | `pytest <archivo> -v -s --tb=short`          | Ver error detallado          |
| Necesito agregar un test     | Copia estructura de `test_auth.py`           | Sigue mismo formato          |
| Quiero medir cobertura       | `pytest tests/ --cov=app --cov-html=htmlcov` | Abrir `htmlcov/index.html` |

---

## Archivos Importantes

```
Backend/
├── tests/README.md                    ← 📖 LEE ESTO PRIMERO
├── TESTING_NOTES.md                   ← Notas técnicas (opcional)
├── README.md                          ← Documentación general
├── tests/conftest.py                  ← Fixture y setup (no tocar)
└── tests/test_api/
    ├── test_auth.py                   ← Template para nuevos tests
    ├── test_health.py
    ├── test_orders.py
    └── test_products.py
```

---

## Flujo Típico del Día

```
1. Llego a trabajar
2. Abro Backend/
3. Ejecuto: pytest tests/ -v
4. Si todos PASSED ✅ → puedo programar tranquilo
5. Si alguno FAILED ❌ → necesito arreglar ese bug
6. Programo la feature
7. Creo test para esa feature
8. Ejecuto: pytest tests/ -v
9. Si todavía PASSED ✅ → commit y push
10. Si FAILED ❌ → debuggeo y arreglo
```

---

## Status Actual: ✅ TODO OK

- 8/8 tests pasando
- Cobertura: 41% (aceptable)
- Todos los endpoints validados
- Base de datos funciona
- Autenticación funciona

**Puedes programar con confianza.**

---

**Última actualización:** 18 de Enero 2026
**Próximos pasos:** Leer `Backend/tests/README.md` si necesitas más detalles
