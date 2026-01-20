# 📚 Documentación - Tests Backend

## 🎯 ¿Por dónde empezar?

### ⚡ Necesito info RÁPIDA (5 minutos)
Abre: `../TESTING_QUICK_START.md`

### ❓ Un test falló ¿qué significa?
Abre: `../QUE_DICEN_LOS_TESTS.md`

### 📖 Quiero entender TODO
Abre: `../tests/README.md`

### 🆕 Ver todos los tests disponibles
Abre: `TEST_INDEX.md`

---

## 📁 Contenido de esta carpeta

**En esta carpeta:**
- `README.md` - Este archivo, índice rápido

**En subcarpeta `test-logs/`:**
- `00_LEEME_PRIMERO.txt` - Índice visual
- `START_HERE.txt` - Bienvenida
- `DOCUMENTACION_INDEX.md` - Mapa maestro
- `RESUMEN_EJECUTIVO.md` - Resumen ejecutivo
- `DOCUMENTACION_CREADA.txt` - Inventario
- `RESUMEN_FINAL.txt` - Resumen final
- `TESTING_NOTES.md` - Detalles técnicos
- `REORGANIZACION.txt` - Log de cambios

**En subcarpeta `prices/`:**
- `README.md` - Guía de tests de validación de precios
- `test_validate_prices.py` - Script ejecutable (3 tests)
- `2026-01-20_validacion_precios_implementacion.md` - Detalles técnicos
- `RESUMEN.md` - Resumen ejecutivo

---

## 🚀 Comandos Esenciales

```bash
cd Backend

# Ejecutar tests
pytest tests/ -v

# Ver cobertura
pytest tests/ --cov=app --cov-html=htmlcov

# Debuggear un test
pytest tests/test_api/test_auth.py -v -s --tb=short
```

---

## ✅ Status

- **Tests de Precios:** 3/3 ✅ (NUEVO)
- **Cobertura Total:** En progreso
- **Documentación:** Completa en español ✅

---

**Para más detalles, abre los archivos en `test-logs/`**
