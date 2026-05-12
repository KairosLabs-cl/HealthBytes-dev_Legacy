# 📚 HealthBytes - Documentación Centralizada

Bienvenido a la documentación de **HealthBytes**. Esta carpeta contiene toda la información necesaria para entender, desarrollar y mejorar el proyecto.

## 🗂️ Estructura de Documentación

### 🚀 [setup/](./setup/) - Configuración e Instalación
Guías paso a paso para configurar el entorno de desarrollo:
- **[frontend-setup.md](./setup/frontend-setup.md)** - Configuración del frontend
- **[DOCKER_SETUP.md](./setup/DOCKER_SETUP.md)** - Configuración Docker
- **[ANDROID_BUILD_GUIDE.md](./setup/ANDROID_BUILD_GUIDE.md)** - Build para Android
- **[configuration.md](./setup/configuration.md)** - Variables de entorno y archivos de configuración
- **[deployment.md](./setup/deployment.md)** - Guía de despliegue y rollback

### 🏗️ [architecture/](./architecture/) - Arquitectura y Decisiones
Comprende cómo está construido HealthBytes:
- **[README.md](./architecture/README.md)** - Estructura y decisiones técnicas
- **[architecture.md](./architecture/architecture.md)** - Arquitectura del sistema y componentes
- **[API_DESIGN_ANALYSIS.md](./architecture/API_DESIGN_ANALYSIS.md)** - Análisis completo del REST API
- **[04_negocio.md](./architecture/04_negocio.md)** - Auditoría de lógica de negocio y resiliencia transaccional

### ✨ [features/](./features/) - Características Implementadas
Documentación detallada de features del proyecto:
- **[full-text-search.md](./features/full-text-search.md)** - Búsqueda FTS en PostgreSQL
- **[nutritional-info.md](./features/nutritional-info.md)** - Información nutricional
- **[wishlist.md](./features/wishlist.md)** - Lista de deseos
- **[ui-ux-improvements.md](./features/ui-ux-improvements.md)** - Mejoras UI/UX

### 🔐 [security/](./security/) - Seguridad
Información sobre seguridad y mejoras implementadas:
- **[security-improvements.md](./security/security-improvements.md)** - Security headers, CI scanning, y protecciones

### 👨‍💻 [development/](./development/) - Para Desarrolladores
Guías para trabajar en el código:
- **[PROJECT_STATUS.md](./development/PROJECT_STATUS.md)** - ⭐ Estado y roadmap centralizados (fuente de verdad)
- **[development-guide.md](./development/development-guide.md)** - Setup, comandos y flujo de contribución
- **[testing.md](./development/testing.md)** - Infraestructura y procedimientos de testing
- **[UIUX_ROADMAP.md](./development/UIUX_ROADMAP.md)** - Roadmap UI/UX detallado
- **[UIUX_SYSTEM_OVERVIEW.md](./development/UIUX_SYSTEM_OVERVIEW.md)** - Overview del design system
- **[inspections/](./development/inspections/)** - Reportes de inspección de código
- **[inspections/01_infra.md](./development/inspections/01_infra.md)** - Auditoría de infraestructura, CI/CD y DevOps

### 📱 [frontend/](./frontend/) - Auditorías Frontend
Reportes específicos de frontend y experiencia de usuario:
- **[03_frontend.md](./frontend/03_frontend.md)** - Auditoría de cumplimiento y performance frontend
- **[accessibility-audit-2026.md](./frontend/accessibility-audit-2026.md)** - Auditoría WCAG 2.2 AA de accesibilidad

---

## 🎯 Navegación Rápida

| Necesito | Ir a |
|----------|------|
| 🚀 Empezar rápido | [setup/](./setup/) |
| 🏗️ Entender arquitectura | [architecture/](./architecture/) |
| ✨ Ver features | [features/](./features/) |
| 🔐 Seguridad | [security/](./security/) |
| 👨‍💻 Contribuir | [development/](./development/) |
| 🏗️ Auditorías técnicas | [development/inspections/](./development/inspections/) |

---

## 📖 Documentación en Otros Lugares

**En la raíz:**
- [README.md](../README.md) - Overview del proyecto

**En las carpetas de código:**
- [backend/README.md](../backend/README.md) - Backend
- [backend/AI-README.md](../backend/AI-README.md) - Backend para IA
- [frontend/README.md](../frontend/README.md) - Frontend
- [frontend/AI-README.md](../frontend/AI-README.md) - Frontend para IA

---

**Última actualización:** Abril 6, 2026 ✅

- **Requisitos**: Python 3.14+, Node.js 20+, PostgreSQL 14+
- **Lenguajes**: Python (backend), TypeScript (frontend)
- **Arquitectura**: FastAPI + React Native (Expo)
- **Base de Datos**: PostgreSQL (prod), SQLite (testing)
- **Tests**: 580 checks verdes (450 backend + 130 frontend + 10 E2E), smoke listo

---

## Diagramas

Para visualizar los flujos y arquitectura del proyecto:
- [Diagramas técnicos](./diagramas/)
- [Infraestructura](diagramas/Infrastructura.drawio) - Diagrama de infraestructura (abrir con draw.io)
- [Flujo B2B de Inserción de Productos](diagramas/b2b-product-insertion-flow.md) - Storyboard Mermaid del proceso de integración de proveedores
