# ⚙️ Setup Tools

Scripts para iniciar y configurar el servidor FastAPI.

## 📋 Scripts

### `start.ps1` (Windows PowerShell)
Script principal para iniciar el servidor con gestión automática de ambiente.

```bash
.\start.ps1              # Instalar deps + iniciar
.\start.ps1 -NoInstall   # Solo iniciar (sin pip install)
```

**Qué hace**:
- ✅ Verifica Python 3.14.2
- ✅ Crea/activa virtualenv automáticamente
- ✅ Instala/actualiza dependencias (pip, setuptools, wheel, requirements.txt)
- ✅ Muestra health check con conteo de warnings/errors
- ✅ Inicia servidor FastAPI con hot reload
- ✅ Monitorea cambios en código

**Flags**:
- `-NoInstall`: Omite pip install (más rápido en reinicios)

### `start.sh` (Linux/Mac)
Equivalente de `start.ps1` para sistemas Unix.

```bash
chmod +x start.sh
./start.sh
./start.sh --no-install
```

### `run_server.py`
Script Python que inicia el servidor directamente.

```bash
python run_server.py
```

**Nota**: Normalmente ejecutado por `start.ps1`, pero puede usarse standalone.

---

## 🌍 Variables de Ambiente Requeridas

Backend necesita `.env` en `backend/`:

```env
***REDACTED_DATABASE_URL***
JWT_SECRET=tu-secreto
CLERK_PUBLISHABLE_KEY=pk_test_...
***REDACTED_CLERK_SECRET_KEY***
STRIPE_SECRET_KEY=sk_test_...
```

---

## 📊 Health Check Output

Después de `pip install`, verás un resumen:

```
═══ 🟢 Health Check:  📦 45 deps  |  ⚠️  2 warnings  |  ❌ 0 errors
```

- 🟢 = OK (0 errores)
- 🟡 = Warnings (5+ warnings)
- 🔴 = Errores detectados

---

## 🚀 Workflow Típico

```bash
# Desarrollo (instala deps + inicia)
.\start.ps1

# Restart rápido (sin pip install)
.\start.ps1 -NoInstall

# Agregar nueva dependencia
pip install nueva-package
pip freeze >> requirements.txt

# Restart normal para que se instale
.\start.ps1
```

---

**Última actualización**: 2026-02-04
