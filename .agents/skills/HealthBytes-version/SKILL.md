---
name: HealthBytes-version
description: Use when the user needs to change, update, or bump the app version of HealthBytes — mentions "versión", "version bump", "subir versión", "cambiar versión", "release", "nueva versión", or asks what version the app is on.
---

# Version Bump — HealthBytes

Guía completa para cambiar la versión del producto en todos los archivos del repo. Un solo lugar de verdad, sin olvidar nada.

## Esquema de versiones (SemVer)

| Etapa | Formato | Cuándo |
|---|---|---|
| Desarrollo activo | `0.x.0` | Ahora mismo, pre-beta |
| Alpha interno | `0.x.0-alpha.N` | Testing interno |
| Beta externa | `0.x.0-beta.N` | Testing con usuarios reales |
| Release Candidate | `0.x.0-rc.N` | Candidato final |
| Release público | `1.0.0` | Lanzamiento estable |

**Regla:** El `MAJOR` se queda en `0` hasta que el producto esté listo para producción pública.

---

## Archivos que SIEMPRE se tocan

Al hacer un bump, actualizar **todos** estos archivos en el mismo commit:

### Frontend

| Archivo | Campo | Nota |
|---|---|---|
| `frontend/app.json` | `"version"` | Lo que ve el usuario en iOS/Android |
| `frontend/package.json` | `"version"` | Versión del paquete npm/pnpm |

> `android.versionCode` en `app.json` es un entero incremental para el Play Store — súbelo en 1 por cada release de producción, **no** tiene que coincidir con SemVer.

### Backend

| Archivo | Campo | Nota |
|---|---|---|
| `backend/pyproject.toml` | `version =` | Versión del paquete Python |
| `backend/app/main.py` | `version=` en `FastAPI(...)` | Aparece en `/docs` de la API |

### UI (muestra la versión al usuario)

| Archivo | Campo | Nota |
|---|---|---|
| `frontend/app/(tabs)/profile.tsx` | Footer del perfil | Lee dinámicamente de `Constants.expoConfig?.version` — **no requiere cambio manual**, se actualiza solo con `app.json` |

---

## Qué NO tocar

| Archivo | Por qué |
|---|---|
| `frontend/store/recentlyViewedStore.ts` — `version: 1` | Número de migración del schema de Zustand persist, no es la versión de la app |
| `frontend/eas.json` — `"version": ">= 5.2.0"` | Versión del CLI de EAS, no de la app |
| `.agents/skills/*/SKILL.md` — `version: 1.0.0` | Versiones internas de skills de IA |
| `pnpm-lock.yaml`, `pnpm-lock.yaml` | Versiones de dependencias de terceros, auto-generado |
| `.github/workflows/*.yml` | Versiones de herramientas CI (Python, Node, pnpm) |

---

## Pasos de ejecución

```bash
# 1. Definir la nueva versión
NEW_VERSION="0.5.0"

# 2. Frontend — app.json
sed -i '' "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" frontend/app.json

# 3. Frontend — package.json (solo el campo "version" del proyecto, línea 3)
sed -i '' "3s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" frontend/package.json

# 4. Backend — pyproject.toml
sed -i '' "s/^version = \".*\"/version = \"$NEW_VERSION\"/" backend/pyproject.toml

# 5. Backend — main.py
sed -i '' "s/version=\"[^\"]*\"/version=\"$NEW_VERSION\"/" backend/app/main.py

# 6. Verificar que todo quedó bien
grep -n "version" frontend/app.json frontend/package.json backend/pyproject.toml backend/app/main.py
```

---

## Verificación manual rápida

Después del bump, confirmar que estos 4 valores coinciden:

```bash
grep '"version"' frontend/app.json          # "version": "X.X.X"
grep '"version"' frontend/package.json      # "version": "X.X.X"  (línea 3)
grep 'version =' backend/pyproject.toml     # version = "X.X.X"
grep 'version=' backend/app/main.py         # version="X.X.X"
```

Y que el perfil de la app muestra la versión correcta (lee desde `Constants.expoConfig?.version` automáticamente).

---

## Commit convencional

```
chore(release): bump version to X.X.X
```

O si incluye cambios de funcionalidad:

```
feat(release): X.X.X — descripción del release
```
