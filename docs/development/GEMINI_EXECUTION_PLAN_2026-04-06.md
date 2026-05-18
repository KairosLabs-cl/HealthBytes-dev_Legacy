# Plan de Ejecucion para Gemini - Centralizacion Documental

> Fecha: 2026-04-06
> Objetivo: mantener una unica fuente de verdad de estado/roadmap y eliminar inconsistencias.

## Objetivo

Consolidar el seguimiento del proyecto en `docs/development/PROJECT_STATUS.md` y alinear el resto de la documentacion para evitar links rotos y estados contradictorios.

## Alcance

- Actualizar enlaces de estado/roadmap en documentacion raiz.
- Mantener `PROJECT_STATUS.md` como documento canonical.
- Corregir referencias historicas que apunten a archivos inexistentes.

## Tareas (orden recomendado)

1. Revalidar links en `README.md` y `docs/**`.
2. Reemplazar referencias a archivos inexistentes de estado/roadmap por `docs/development/PROJECT_STATUS.md`.
3. Verificar consistencia de fechas y porcentajes de hitos contra este archivo maestro.
4. Marcar documentos historicos como contexto, no como fuente de verdad.
5. Dejar una seccion "How to update" en `PROJECT_STATUS.md` con protocolo semanal.

## Criterios de Aceptacion

- No quedan links rotos a `docs/development/ESTADO.md` ni `docs/development/ROADMAP.md`.
- `README.md` y `docs/development/README.md` apuntan a `PROJECT_STATUS.md`.
- Cambios de estado global se registran primero en `PROJECT_STATUS.md`.

## Prompt sugerido para Gemini

"Actua como technical writer senior. Revisa toda la documentacion del repo y alinea todas las referencias de estado/roadmap para usar unicamente `docs/development/PROJECT_STATUS.md`. No cambies decisiones tecnicas, solo consistencia documental. Entrega un resumen de cambios por archivo y lista de links corregidos." 
