# 📋 Tasks — HealthBytes

Tareas del equipo organizadas por desarrollador y fecha.

---

## 📁 Estructura

```
tasks/
├── benjamin/
│   └── 2026-06/
│       ├── TASK_DEV_SETUP.md (✅ completada)
│       ├── TASK_DISABLE_MARKETPLACE_FRONTEND.md (P0)
│       ├── TASK_STORE_MODEL_SEED.md (P0)
│       └── TASK_PUSH_TOKEN_BACKEND.md (P1)
│
├── bastian/
│   └── 2026-06/
│       ├── TASK_STORE_MAP.md (P0)
│       └── TASK_A11Y_AUDIT.md (P1)
│
├── jose/
│   └── 2026-06/
│       ├── TASK_DISABLE_MARKETPLACE_BACKEND.md (P0)
│       ├── TASK_STORE_ENDPOINTS.md (P0)
│       ├── TASK_ORDERS_CONTRACT.md (en progreso)
│       └── TASK_ECS_DEPLOY_PART.md (P2)
│
├── andres/
│   └── 2026-06/
│       └── RECON_GUIDE.md (en progreso)
│
├── abram/
│   └── 2026-06/
│       └── RECON_GUIDE.md (en progreso)
│
├── collaborative/
│   └── 2026-06/
│       └── TASK_ECS_STAGING.md (P2 - Benjamin + José)
│
└── templates/
    └── RECON_TEMPLATE.md
```

---

## 🎯 Tareas Activas (P0 - Deadline: 2026-06-20)

### Benjamin (Fullstack)
1. **Deshabilitar marketplace frontend** → `benjamin/2026-06/TASK_DISABLE_MARKETPLACE_FRONTEND.md`
2. **Modelo Store + seed tiendas** → `benjamin/2026-06/TASK_STORE_MODEL_SEED.md`
3. **Renombrar Carrito → Mi Lista** (tarea simple, sin doc)

### José (DevOps - Backend)
1. **Deshabilitar marketplace backend** → `jose/2026-06/TASK_DISABLE_MARKETPLACE_BACKEND.md`
2. **Endpoints store locator** → `jose/2026-06/TASK_STORE_ENDPOINTS.md`

### Bastian (Frontend)
1. **Mapa estilo Copec/Submarino** → `bastian/2026-06/TASK_STORE_MAP.md`

### Andrés (Frontend Jr)
1. **Recon frontend** → `andres/2026-06/RECON_GUIDE.md`

### Abram (Backend Jr)
1. **Recon backend** → `abram/2026-06/RECON_GUIDE.md`

---

## 📊 Estado de Tareas

| Dev | P0 activas | P1 | P2 | Completadas |
|---|---|---|---|---|
| Benjamin | 3 | 1 | 0 | 1 |
| Bastian | 1 | 1 | 0 | 0 |
| José | 2 | 0 | 1 | 0 |
| Andrés | 1 | 0 | 0 | 0 |
| Abram | 1 | 0 | 0 | 0 |

---

## 🗂️ Convención de Naming

### Archivos de tareas:
- `TASK_{DESCRIPCION}.md` — tareas de implementación
- `RECON_GUIDE.md` — guías de reconocimiento para nuevos

### Carpetas:
- `{dev}/YYYY-MM/` — tareas por desarrollador y mes
- `collaborative/YYYY-MM/` — tareas de múltiples devs
- `templates/` — plantillas reutilizables

---

## 📝 Template para Nuevas Tareas

```markdown
# 🛠️ Task — [Dev] ([Rol])

**Tarea:** [Nombre corto]
**Branch:** `tipo/descripcion-corta`
**ID:** `task-YYYYMMDD-dev-slug`
**Deadline:** YYYY-MM-DD
**Tipo:** `feat` | `fix` | `refactor` | `docs`

---

## Objetivo
[Una frase describiendo el objetivo]

## Archivos a tocar
| Archivo | Acción |
|---|---|
| ... | ... |

## Criterios de aceptación
- [ ] ...
- [ ] ...

## Verificación
\`\`\`bash
# Comandos para verificar
\`\`\`

## Commits esperados
\`\`\`
tipo(scope): descripción
\`\`\`
```

---

## 🔗 Referencias

- **Board de tareas:** `.agents/agents/tasks.json`
- **Reporte semanal:** `docs/executive/weekly-reports/`
- **Guías de recon:** `docs/tasks/templates/RECON_TEMPLATE.md`
- **Convenciones de commits:** Conventional Commits
- **Convenciones de branches:** `tipo/descripcion-corta`

---

**Última actualización:** 2026-06-08
