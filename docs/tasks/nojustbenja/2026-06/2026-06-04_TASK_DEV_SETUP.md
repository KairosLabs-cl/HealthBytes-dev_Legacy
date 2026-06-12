# 🛠️ Task — nojustbenja (CTO / Full-Stack)

**Tarea:** Setup del entorno de desarrollo local para nuevos devs
**Branch:** `docs/dev-environment-onboarding`
**ID:** `task-20260604-nojustbenja-dev-setup`
**Tipo:** `docs` + `feat` — ayuda directa al equipo esta semana

---

## Objetivo

Andrés y Abram no tienen una guía clara para levantar el proyecto localmente.
Tú sabes exactamente qué hace falta — documéntalo y scriptéalo para que cualquiera
pueda estar listo en menos de 30 minutos.

---

## Archivos a tocar

| Acción | Archivo |
|---|---|
| **Revisar/actualizar** | `frontend/setup-env.sh` |
| **Revisar/actualizar** | `frontend/start.sh` |
| **Crear o completar** | `docs/development/setup/local-setup.md` |
| **Opcional** | `docs/development/setup/env-variables.md` |

---

## Qué debe cubrir la guía

### Para Andrés (Frontend)

```markdown
## Setup Frontend
1. Requisitos: Node 20+, pnpm, Expo Go en el celular
2. `cp frontend/.env.example frontend/.env` → qué variables llenar
3. `cd frontend && pnpm install`
4. `pnpm start` → cómo conectarse desde el celular por QR
5. Cómo saber que funciona: pantalla de Home visible en Expo Go
```

### Para Abram (Backend)

```markdown
## Setup Backend
1. Requisitos: Python 3.11+, PostgreSQL, Redis
2. `cp backend/.env.example backend/.env` → qué variables llenar
3. Cómo crear la DB local (comando exacto)
4. `cd backend && pip install -r requirements.txt`
5. `uvicorn app.main:app --reload`
6. Cómo saber que funciona: GET /docs abre el Swagger
```

---

## Criterios de aceptación

- [ ] Andrés puede levantar el frontend siguiendo la guía sin preguntarte nada
- [ ] Abram puede levantar el backend siguiendo la guía sin preguntarte nada
- [ ] Los scripts `setup-env.sh` y `start.sh` están actualizados y funcionan
- [ ] La guía vive en `docs/development/setup/local-setup.md`
- [ ] No hay credenciales hardcodeadas en ningún archivo commiteado

---

## Impacto en el equipo

Cuando este PR mergee, Andrés y Abram pueden hacer su recon de la semana
con la app corriendo en su máquina — mucho más valioso que leer código en frío.

---

## Commits esperados

```
docs(setup): add local development guide for new team members
feat(setup): update setup-env.sh with complete env variable docs
```

> [!NOTE]
> Esta tarea **no requiere código de producto**. Es infraestructura de equipo.
> Hazla antes del miércoles para que Andrés y Abram puedan usarla durante su recon.
