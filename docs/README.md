# 📚 HealthBytes - Documentación Centralizada

Bienvenido a la documentación de **HealthBytes**. Esta carpeta contiene toda la información necesaria para entender, desarrollar y mejorar el proyecto.

## 🗂️ Estructura de Documentación

Hemos organizado toda la documentación de forma **intuitiva y por tópicos**:

### 🚀 [setup/](./setup/) - Configuración e Instalación
Guías paso a paso para configurar el entorno de desarrollo:
- **[frontend-setup.md](./setup/frontend-setup.md)** - Configuración del frontend
- **[environment-variables.md](./setup/environment-variables.md)** - Variables de entorno

### 🏗️ [architecture/](./architecture/) - Arquitectura y Decisiones
Comprende cómo está construido HealthBytes:
- Estructura de carpetas detallada
- Decisiones técnicas y patrones
- Stack tecnológico
- **[API_DESIGN_ANALYSIS.md](./architecture/API_DESIGN_ANALYSIS.md)** - Análisis completo del REST API

### ✨ [features/](./features/) - Características Implementadas
Documentación detallada de features del proyecto:
- **[full-text-search.md](./features/full-text-search.md)** - Búsqueda FTS en PostgreSQL
- **[authentication.md](./features/authentication.md)** - Sistema de autenticación
- **[cart-system.md](./features/cart-system.md)** - Sistema de carrito

### 🔐 [security/](./security/) - Seguridad
Información sobre seguridad y mejoras implementadas:
- **[security-improvements.md](./security/security-improvements.md)** - Security headers y protecciones

### 👨‍💻 [development/](./development/) - Para Desarrolladores
Guías para trabajar en el código:
- **[testing-report.md](./development/testing-report.md)** - Reporte de pruebas (2026-02-05)
- **[testing-guide.md](./development/testing-guide.md)** - Estrategia de testing
- **[git-workflow.md](./development/git-workflow.md)** - Flujo de git y commits
- **[code-standards.md](./development/code-standards.md)** - Estándares de código

### 🤖 [ai-logs/](./ai-logs/) - Sesiones de Desarrollo con IA
Documentación de sesiones con Copilot y análisis del proyecto:

**⭐ Acceso Rápido:**
- **[ai-logs/latest/](./ai-logs/latest/)** - Reportes más recientes
- **[ai-logs/status/](./ai-logs/status/)** - Estado del proyecto
- **[ai-logs/features/](./ai-logs/features/)** - Features desarrolladas
- **[ai-logs/auth/](./ai-logs/auth/)** - Autenticación
- **[ai-logs/security/](./ai-logs/security/)** - Mejoras de seguridad

---

## 🎯 Navegación Rápida

| Necesito | Ir a |
|----------|------|
| 🚀 Empezar rápido | [setup/](./setup/) |
| 🏗️ Entender arquitectura | [architecture/](./architecture/) |
| ✨ Ver features | [features/](./features/) |
| 🔐 Seguridad | [security/](./security/) |
| 👨‍💻 Contribuir | [development/](./development/) |
| 📊 Estado del proyecto | [ai-logs/status/](./ai-logs/status/) |

---

## 📖 Documentación en Otros Lugares

**En la raíz:**
- [README.md](../README.md) - Overview del proyecto
- [.cursorrules](../.cursorrules) - Reglas para IA
- [.github/copilot-instructions.md](../.github/copilot-instructions.md) - Instrucciones para IA

**En las carpetas de código:**
- [backend/README.md](../backend/README.md) - Backend
- [backend/AI-README.md](../backend/AI-README.md) - Backend para IA
- [frontend/README.md](../frontend/README.md) - Frontend
- [frontend/AI-README.md](../frontend/AI-README.md) - Frontend para IA
- [Tools/README.md](../Tools/README.md) - Scripts y herramientas

---

**Última actualización:** Feb 4, 2026 ✅

- **Requisitos**: Python 3.14+, Node.js 18+, PostgreSQL 14+
- **Lenguajes**: Python (backend), TypeScript (frontend)
- **Arquitectura**: FastAPI + React Native (Expo)
- **Base de Datos**: PostgreSQL (prod), SQLite (testing)

---

**Última actualización**: Febrero 4, 2026  
**Status**: ✅ Proyecto activo
- [Mejoras de seguridad](./copilot-logs/security-improvements-logs/)
- [Autenticación](./copilot-logs/auth-logs/)

### Búsqueda Full-Text
Documentación completa sobre la implementación de búsqueda:
- [Índice de búsqueda](./search-logs/README.md)
- [Resumen técnico](./search-logs/SUMMARY.md)
- [Guía de setup](./search-logs/SETUP.md)
  
## Diagramas
Para visualizar los flujos y arquitectura del proyecto:
- [Diagramas técnicos](./diagramas/)
- [Infraestructura](diagramas/Infrastructura.drawio) - Diagrama de infraestructura (abrir con draw.io)
- [Flujo B2B de Inserción de Productos](diagramas/b2b-product-insertion-flow.md) - Storyboard Mermaid del proceso de integración de proveedores
