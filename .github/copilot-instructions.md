# 🤖 Instrucciones para AI / Copilot

Este documento proporciona **instrucciones especializadas** para asistentes de IA (GitHub Copilot, Claude, etc.) que trabajan en HealthBytes y mejora significativamente la calidad y coherencia de las sugerencias de código.

---

## 📚 Referencia de Skills y Contexto

### 📂 **Carpeta `.ai/`** - Skills y Contexto

La carpeta `.ai/` contiene guías detalladas sobre cómo trabajar eficientemente en HealthBytes:

```
.ai/
├── context/           # Información de contexto del proyecto
│   ├── bolt.md       # Integración con herramientas de desarrollo
│   └── sentinel.md    # Patrones de seguridad del proyecto
├── skills/            # Mejores prácticas por área
│   ├── test-driven-development/     # TDD en este proyecto
│   ├── writing-skills/               # Cómo documentar código
│   ├── systematic-debugging/         # Debugging efectivo
│   ├── using-git-worktrees/         # Gestión de ramas
│   ├── verification-before-completion/ # Verificación de cambios
│   ├── writing-plans/               # Planificación de tareas
│   └── supabase-postgres-best-practices/ # Patrones BD específicos
└── router.json        # Mapeo de skills según el contexto
```

**Cómo usar**: Los asistentes de IA consultan estas guías automáticamente según la tarea. Las guías cubren:
- Patrones de código esperados en HealthBytes
- Mejores prácticas para testing
- Convenciones de seguridad
- Estrategias de debugging

### 🛡️ **Archivo `.cursorrules`** - Guardrails y Límites

**Lee esto si modificas código**: [`.cursorrules`](../.cursorrules)

Este archivo define **prohibiciones y reglas estrictas** que TODOS los asistentes deben seguir:

```
✅ PERMITIDO:
- Crear features nuevas siguiendo la arquitectura
- Refactorizar código existente con seguridad
- Mejorar tests y cobertura
- Optimizar queries a BD

❌ PROHIBIDO:
- Cambiar stack tecnológico sin aprobación
- Mover archivos entre backend/frontend
- Hardcodear secretos o credenciales
- Modificar docker-compose.yml sin justificación
- Cambiar la estructura de carpetas principales
```

[👉 Ver el archivo completo de guardrails](../.cursorrules)

---

## 💡 Consejos para Trabajar con Copilot en HealthBytes

1. **Antes de pedir cambios**: Menciona qué feature trabajas (ej: "Estoy en la feature de búsqueda")
2. **Sé específico**: "Crea una función que..." es mejor que "Ayuda con productos"
3. **Referencia tickets**: Si trabajas en un issue específico, comparte el número
4. **Testing primero**: Pide tests junto con la implementación
5. **Verifica guardrails**: Si la IA sugiere cambiar stack/estructura, rechaza

---

## 🔗 Recursos Relacionados

| Recurso | Propósito | Ubicación |
| --- | --- | --- |
| Skills de IA | Mejores prácticas especializadas | [`.ai/skills/`](../.ai/skills/) |
| Contexto del proyecto | Info sobre arquitectura | [`.ai/context/`](../.ai/context/) |
| Guardrails (must-read) | Límites y prohibiciones | [`.cursorrules`](../.cursorrules) |
| Documentación técnica | Detalles de implementación | [`docs/`](../docs/) |

---

## 📖 Documentación Complementaria

- **Arquitectura del Proyecto**: Ver [README.md](../README.md#️-arquitectura-del-proyecto)
- **Stack Tecnológico**: Ver [README.md](../README.md#️-stack-tecnológico)
- **Estructura del Proyecto**: Ver [README.md](../README.md#-estructura-del-proyecto)

---

_Última actualización: 4 Marzo 2026_
