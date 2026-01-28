# HealthBytes Development Skill

Este skill contiene todas las reglas, convenciones y guías de desarrollo para el proyecto HealthBytes.

## 📋 Contenido

El archivo `SKILL.md` incluye todas las instrucciones combinadas de:
- `.github/copilot-instructions.md`
- `.cursorrules`

### Secciones Principales

1. **🚫 Prohibiciones Absolutas**
   - Stack tecnológico inmutable
   - Archivos que nunca modificar
   - Reglas de seguridad estrictas
   - Gestión de dependencias

2. **📍 Estructura del Proyecto**
   - Organización completa de carpetas backend/frontend
   - Ubicación de cada tipo de archivo

3. **📁 Documentación Canónica**
   - 4 archivos obligatorios en `docs/copilot-logs/status-logs/`
   - Contenido requerido para cada documento
   - Orden de actualización

4. **🏗️ Patrones de Arquitectura**
   - Separación estricta de capas (routers → services → models)
   - Arquitectura de componentes frontend
   - Sistema de autenticación dual (Clerk + JWT)

5. **⚙️ Flujos de Desarrollo**
   - Comandos para iniciar backend/frontend
   - Configuración de environment
   - Testing y debugging

6. **🎯 Workflow Obligatorio**
   - Antes de modificar código
   - Al crear nuevas features
   - Al debuggear
   - Al instalar dependencias

7. **🧪 Testing**
   - Cuándo ejecutar tests
   - Comandos específicos
   - Criterios de bloqueo

8. **🔒 Seguridad**
   - Variables de entorno
   - Autenticación
   - Mejores prácticas

9. **📦 Dependencias**
   - Dependencias aprobadas
   - Criterios antes de agregar nuevas

10. **🚀 Comandos Permitidos/Prohibidos**
    - Backend (Python/PowerShell)
    - Frontend (pnpm)
    - Docker

11. **🔍 Debugging y Logging**
    - Patrones correctos e incorrectos
    - Backend (Python logging)
    - Frontend (console)

12. **📝 Convenciones de Código**
    - Python (backend)
    - TypeScript (frontend)
    - Componentes React Native

13. **🎨 Patrones y Anti-Patrones**
    - Patrones recomendados
    - Anti-patrones prohibidos

14. **📋 Pull Request Rules**
    - Convención de branch names
    - Conventional Commits
    - Template de PR
    - Checklist obligatorio
    - Flujo correcto paso a paso

15. **🚦 Criterios de Completado**
16. **📞 Cuándo Consultar**
17. **🎓 Recursos de Referencia**
18. **🤝 Reglas de Oro (TL;DR)**

## 🎯 Cómo Usar Este Skill

Antigravity leerá automáticamente este skill cuando trabaje en el proyecto HealthBytes. El sistema de skills permite:

- Acceso automático a todas las reglas del proyecto
- Guías contextuales durante el desarrollo
- Validación de patrones y convenciones
- Referencia rápida a mejores prácticas

## ⚡ Reglas de Oro

1. **Lee primero, modifica después**
2. **Sigue la arquitectura** (routers → services → models)
3. **Ubica correctamente** los archivos
4. **No hardcodees nada** (usa env vars)
5. **Testea siempre**
6. **TypeScript estricto** (no `any`)
7. **Seguridad primero**
8. **Pregunta si dudas**

## 📅 Última Actualización

2026-01-27 - Skill completo con todas las instrucciones de copilot y cursorrules
