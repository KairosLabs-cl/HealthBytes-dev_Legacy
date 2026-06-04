# Reporte Semanal - HealthBytes

Semana: `[fecha inicio] - [fecha cierre]`  
Estado general: `Verde / Amarillo / Rojo`  
Base branch: `master`  
Fuente: `GitHub / local / CI / manual`

---

## Capitulo 1 - Reporte Ejecutivo + Calidad

### 1. Resumen Ejecutivo

`[5-8 lineas. Explicar que cambio esta semana, por que importa, que tan estable esta el proyecto y cual es la decision principal que se puede tomar con este avance.]`

### 2. Escenas De Exito

Las escenas de exito deben contar avances concretos, no solo listar PRs.

- **[Escena 1]:** `[Que paso y por que representa progreso real.]`
- **[Escena 2]:** `[Que problema se redujo o que capacidad nueva quedo lista.]`
- **[Escena 3]:** `[Que evidencia muestra que el proyecto esta mas maduro.]`

Ejemplos de estilo:

- **Base tecnica mas confiable:** el repo redujo deuda estructural y dejo checks, boundaries y documentacion mas defendibles.
- **Accesibilidad medible:** los hallazgos pasaron de auditoria a controles con roles, labels, states y tests.
- **Performance sin rediseño:** se redujo overhead de render sin alterar la experiencia visual.
- **Agentes con criterio:** las PRs automatizadas ahora pueden evaluarse, rescatarse o cerrarse con reglas claras.

### 3. Resultados Por Eje

#### Producto / Experiencia

- `[Resultado principal]`
- `[Impacto en usuarios, sellers, confianza, busqueda, checkout o restricciones dietarias]`

#### Ingenieria

- `[Resultado principal]`
- `[Impacto en mantenibilidad, arquitectura, seguridad o velocidad de desarrollo]`

#### Accesibilidad

- `[Resultado principal]`
- `[Estado de labels, roles, hints, states, touch targets o validacion asistiva]`

#### Calidad / QA

- `[Resultado principal]`
- `[Estado de tests, CI, typecheck, lint, validacion manual o riesgo de regresion]`

#### Automatizacion / Agentes IA

- `[Resultado principal]`
- `[Ruido evitado, PRs rescatadas, reglas nuevas, prompts o flujo de triage]`

### 4. Evidencia De Avance

| Evidencia | Detalle |
|---|---|
| PRs mergeadas | `[Lista de PRs con numero y titulo]` |
| Commits relevantes | `[SHAs o titulos principales]` |
| Tests/checks | `[Comandos, conteos y estado]` |
| Documentacion | `[Docs creados o actualizados]` |
| Riesgos reducidos | `[Riesgos que bajaron esta semana]` |

### 5. Estado De Calidad

| Categoria | Estado | Evidencia / Nota |
|---|---|---|
| CI | `Verde / Amarillo / Rojo / No verificado` | `[Detalle]` |
| Tests frontend | `Verde / Amarillo / Rojo / No verificado` | `[Detalle]` |
| Tests backend | `Verde / Amarillo / Rojo / No verificado` | `[Detalle]` |
| Typecheck / lint | `Verde / Amarillo / Rojo / No verificado` | `[Detalle]` |
| Seguridad | `Verde / Amarillo / Rojo / No verificado` | `[Detalle]` |
| Validacion manual | `Completa / Parcial / Pendiente` | `[Detalle]` |

### 6. Riesgos Y Pendientes Ejecutivos

| Riesgo / Pendiente | Impacto | Proxima accion |
|---|---|---|
| `[Riesgo 1]` | `Alto / Medio / Bajo` | `[Accion concreta]` |
| `[Riesgo 2]` | `Alto / Medio / Bajo` | `[Accion concreta]` |

### 7. Prioridades Proxima Semana

1. `[Prioridad 1]`
2. `[Prioridad 2]`
3. `[Prioridad 3]`

---

## Capitulo 2 - Reporte Tecnico Para Desarrolladores

### 1. Alcance Del Reporte

`[Que se reviso: PRs, commits, CI, repo local, docs, runtime. Indicar explicitamente que no se pudo verificar si aplica.]`

### 2. Cambios Integrados

| PR | Area | Cambio | Riesgo | Estado |
|---|---|---|---|---|
| `#[numero]` | `Frontend / Backend / QA / Docs / A11y / Perf / Seguridad` | `[Resumen tecnico]` | `Alto / Medio / Bajo` | `Mergeado / Abierto / Cerrado / Pendiente` |

### 3. Frontend

#### Cambios Principales

- `[Cambio frontend 1]`
- `[Cambio frontend 2]`

#### Componentes / Pantallas Tocadas

- `[frontend/app/... o frontend/components/...]`

#### Performance

- `[Optimizaciones, mediciones, riesgos o pendientes]`

#### Accesibilidad

- `[Roles, labels, hints, states, hitSlop, tests RNTL, validacion manual]`

#### Riesgos Frontend

- `[Riesgo o deuda pendiente]`

### 4. Backend

#### Cambios Principales

- `[Cambio backend 1]`
- `[Cambio backend 2]`

#### Servicios / Routers / Schemas

- `[Servicios creados o modificados]`
- `[Routers afectados]`
- `[Schemas/modelos afectados]`

#### Seguridad / Auth / Permisos

- `[Cambios o validaciones relevantes]`

#### Riesgos Backend

- `[Riesgo o deuda pendiente]`

### 5. QA / CI / Validacion

#### Checks Ejecutados

| Check | Resultado | Evidencia |
|---|---|---|
| `[Comando/check]` | `Paso / Fallo / No ejecutado` | `[Conteo, error o link]` |

#### Tests Pasados

- `[Suite y conteo]`

#### Tests Faltantes

- `[Cobertura pendiente]`

#### Validacion Manual Pendiente

- `[Flujo, dispositivo, browser, VoiceOver/TalkBack, checkout, pagos, etc.]`

### 6. Arquitectura Y Deuda Tecnica

#### Deuda Reducida

- `[Deuda reducida y evidencia]`

#### Deuda Nueva O Pendiente

- `[Deuda pendiente y razon]`

#### Boundaries Afectados

- `[Frontend API clients, stores, components, backend services, routers, schemas]`

### 7. Automatizacion Y Agentes

#### PRs Utiles

- `[PR o tarea automatizada que aporto valor]`

#### PRs Rescatadas

- `[PR con idea util rescatada como patch limpio]`

#### Ruido Evitado

- `[PR cerrada, duplicada, stale, validate failed, empty diff, etc.]`

#### Reglas Nuevas Aprendidas

- `[Regla para futuros agentes o triage]`

### 8. Backlog Tecnico Priorizado

| Prioridad | Tarea | Area | Motivo |
|---|---|---|---|
| `P0 / P1 / P2` | `[Tarea]` | `[Frontend / Backend / QA / Docs / Seguridad]` | `[Por que importa]` |

---

## Apendice De Evidencia

### PRs

- `#[numero] - [titulo] - [url]`

### Commits

- `[sha] - [mensaje]`

### Archivos Relevantes

- `[ruta]`

### Comandos / Checks

```txt
[comando]
[resultado resumido]
```

### Notas De Verificacion

- `[Limitaciones, errores de entorno, checks no ejecutados o evidencia externa]`
