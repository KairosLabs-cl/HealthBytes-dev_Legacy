---
name: HealthBytes-sprint
description: Use when asking for a team report, assigning tasks, updating task status, or managing the sprint board for HealthBytes. Triggers on "reporte del equipo", "asignar tarea", "dame un resumen del sprint", "qué están haciendo los chicos", "nueva tarea para", or any team/task management request.
---

# HealthBytes Sprint Manager

## Overview

Gestiona el ciclo de vida de tareas del equipo HealthBytes: reportes de estado, asignación, actualización y creación de tareas. Fuente de verdad: `.agents/agents/tasks.json` + archivos en `docs/tasks/`.

**Equipo:**
| Persona | Rol | Nivel |
|---|---|---|
| nojustbenja | CTO / Full-Stack | Senior — reviewer y oversight |
| Bastián | Frontend | Mid |
| chachoCL | Backend | Mid |
| Andrés | Frontend | 🆕 Junior |
| Abram | Backend | 🆕 Junior |

---

## Flujo de decisión

```
¿Qué pidió el usuario?
├── "reporte" / "resumen" / "qué están haciendo"
│   → MODO REPORTE (ver abajo)
│   → Al terminar: preguntar si asignar/actualizar tareas
│
├── "asigna" / "nueva tarea" / "ponle esto a [dev]"
│   → MODO ASIGNACIÓN
│
├── "actualiza" / "mueve a done" / "en progreso"
│   → MODO ACTUALIZACIÓN
│
└── Mención de dev + trabajo (fuera de contexto)
    → Detectar intent → preguntar confirmación → actuar
```

---

## MODO REPORTE

### Paso 1 — Leer estado actual

```bash
cat .agents/agents/tasks.json
ls docs/tasks/
```

### Paso 2 — Generar reporte

Formato obligatorio:

```markdown
## 📊 Reporte del Equipo — HealthBytes · [FECHA]

### 🔴 In Progress
| Dev | Tarea | Branch | ID |
|---|---|---|---|
| [nombre] | [descripción breve] | [branch] | [id] |

### 🟡 Todo
| Dev | Tarea | Tipo | ID |
|---|---|---|---|

### ✅ Done esta semana
| Dev | Tarea | ID |
|---|---|---|

### 🚧 Bloqueadores conocidos
- [si no hay: "Ninguno reportado"]

### 📌 Próximos pasos sugeridos
- [1-3 acciones concretas]
```

### Paso 3 — SIEMPRE preguntar al final del reporte

```
¿Querés hacer algo con estas tareas?
1. Asignar una tarea nueva a alguien
2. Mover alguna tarea de estado (Todo → In Progress → Done)
3. Crear una tarea nueva desde cero
4. No, solo quería el reporte
```

---

## MODO ASIGNACIÓN

### Información necesaria (preguntar si falta)

1. **¿Para quién?** — nombre del dev
2. **¿Qué hace?** — descripción de la tarea
3. **¿Tipo?** — `recon` (nuevo) | `feat` | `fix` | `docs` | `chore`
4. **¿Branch?** — sugerir automáticamente: `tipo/descripcion-corta`

### ID de tarea

Formato: `task-YYYYMMDD-[dev]-[slug]`
Ejemplo: `task-20260604-andres-recon`

### Archivos a actualizar

1. `.agents/agents/tasks.json` → agregar a `tasks` + `columns.todo.taskIds`
2. `docs/tasks/` → crear `TASK_[NOMBRE].md` o `RECON_GUIDE_[NOMBRE].md`

### Template RECON (nuevos devs)

```markdown
# 🔍 Recon Guide — [Dev] ([Stack])
**Misión:** Explorar [área] y entregar RECON_[NOMBRE]_[FECHA].md en docs/tasks/
**Archivos clave:** [listar 8-10 archivos en orden]
**Preguntas guía:** [5 preguntas específicas]
**Entregable:** Copiar RECON_TEMPLATE.md y completar las 6 secciones
```

### Template FEAT (devs mid/senior)

```markdown
# 🛠️ Task — [Dev] ([Stack])
**Branch:** [tipo/descripcion]
**ID:** [task-id]
## Objetivo — [una frase]
## Archivos a tocar — tabla Acción/Archivo
## Criterios de aceptación — checklist
## Verificación — comandos exactos
## Commits esperados — formato Conventional Commits
```

---

## MODO ACTUALIZACIÓN

### Estados válidos en tasks.json

`todo` → `in-progress` → `done` | `periodic`

### Qué actualizar

1. Mover el `taskId` al array del nuevo estado en `columns`
2. **NO** eliminar el objeto de `tasks` — solo se mueve entre columnas

---

## Detección fuera de contexto

Si el usuario menciona un dev + trabajo sin pedir explícitamente gestión de tareas:

**Ejemplos que disparan este skill:**
- "Voy a pedirle a Bastián que arregle el login"
- "chachoCL terminó el contrato de órdenes"
- "Andrés no entiende los stores de Zustand"

**Respuesta:**

```
Entendido — ¿lo registro en el sprint?
- [Sí] → pregunto detalles y actualizo tasks.json
- [No] → continúo sin registrar
```

---

## Reglas

- **Nunca asumir** que una tarea está done si el dev no lo confirmó
- **Siempre sugerir branch name** cuando se crea una tarea nueva
- **Siempre listar archivos a crear/modificar** en tareas de feat
- **Tareas para nuevos (Andrés/Abram)** → usar template RECON, no FEAT
- **Tareas sin task entry** en tasks.json → no pueden mapearse a un PR

---

## Quick Reference

| Acción | Comando/Archivo |
|---|---|
| Ver board completo | `cat .agents/agents/tasks.json` |
| Ver guías actuales | `ls docs/tasks/` |
| Ver template recon | `cat docs/tasks/RECON_TEMPLATE.md` |
| IDs de tareas activas | `tasks.columns.in-progress.taskIds` |
| Agregar tarea nueva | `tasks.tasks[id]` + `tasks.columns.todo.taskIds` |
