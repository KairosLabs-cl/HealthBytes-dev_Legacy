# 📑 Índice de Tests - HealthBytes

**Última actualización:** 20 Enero 2026

---

## 🎯 Tests Disponibles

### 🔒 Validación de Precios (NUEVO ✨)
**Carpeta:** `test-logs/prices/`

**Propósito:** Validar que `POST /orders` usa precios reales de BD

**Estado:** ✅ 3/3 TESTS PASS

**Ejecutar:**
```bash
python docs/copilot-logs/test-logs/prices/test_validate_prices.py
```

**Qué valida:**
- ✅ Cliente no puede enviar precio falso
- ✅ Sistema rechaza productos inexistentes (404)
- ✅ Múltiples items se validan correctamente

**Archivos:**
- `README.md` - Guía rápida
- `test_validate_prices.py` - Script ejecutable
- `2026-01-20_validacion_precios_implementacion.md` - Detalles técnicos
- `RESUMEN.md` - Resumen ejecutivo

**Documentación:** [Ver aquí](prices/README.md)

---

## 📊 Resumen de Tests

| Test | Status | Tests | Ubicación |
|------|--------|-------|-----------|
| **Precios** | ✅ | 3/3 | `prices/test_validate_prices.py` |
| **Auth** | 📋 | Pendiente | `tests/test_api/test_auth.py` |
| **Products** | 📋 | Pendiente | `tests/test_api/test_products.py` |
| **Orders** | 📋 | Pendiente | `tests/test_api/test_orders.py` |
| **Health** | 📋 | Pendiente | `tests/test_api/test_health.py` |

---

## 🚀 Cómo Ejecutar

### Test de Precios (RECOMENDADO EMPEZAR AQUÍ)
```bash
cd docs/copilot-logs/test-logs/prices
python test_validate_prices.py
```

### Todos los pytest tests (cuando estén implementados)
```bash
cd backend
pytest
```

---

## 📁 Estructura de Carpetas

```
docs/copilot-logs/test-logs/
├── README.md
├── [otros archivos de documentación existente...]
│
└── prices/                          ← NUEVO
    ├── README.md
    ├── test_validate_prices.py
    ├── 2026-01-20_validacion_precios_implementacion.md
    └── RESUMEN.md
```

---

## ✨ Próximos Tests a Implementar

- [ ] **Auth Tests** - Validar JWT y Clerk
- [ ] **Products Tests** - CRUD de productos
- [ ] **Orders Tests** - Crear, actualizar, listar órdenes
- [ ] **Health Tests** - Health checks y JWKS

---

## 📚 Documentación Relacionada

- [TESTING_QUICK_START.md](../TESTING_QUICK_START.md) - Guía rápida general
- [QUE_DICEN_LOS_TESTS.md](../QUE_DICEN_LOS_TESTS.md) - Interpretación de errores
- [TESTING_NOTES.md](../TESTING_NOTES.md) - Notas técnicas

---

**Para más información sobre tests de precios:** [prices/README.md](prices/README.md)
