# 📚 Documentación de HealthBytes

Bienvenido a la documentación centralizada de HealthBytes. Aquí encontrarás información completa sobre la arquitectura, desarrollo y operación del proyecto.

## 📖 Índice Rápido

### Para Desarrolladores
- **[Backend](../backend/README.md)** - FastAPI, SQLAlchemy, PostgreSQL
- **[Frontend](../frontend/README.md)** - React Native, Expo, TypeScript
- **[Tools](../Tools/README.md)** - Scripts de utilidad organizados por categoría

### Para Asistentes de IA
- **[Backend AI Guide](../backend/AI-README.md)** - Patrones y reglas del backend
- **[Frontend AI Guide](../frontend/AI-README.md)** - Patrones y reglas del frontend
- **[Strict Rules](../.cursorrules)** - Prohibiciones y reglas obligatorias

### Documentación Técnica
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Full-Text Search implementado
- **[SECURITY.md](SECURITY.md)** - Security headers y protecciones
- **[Copilot Logs](./Copilot-logs/README.md)** - Sesiones de desarrollo con IA

### Guías de Configuración
- **[Frontend Setup](./frontend/SETUP.md)** - Configuración del frontend

---

## 🗂️ Estructura de Documentación

```
docs/
├── README.md                                    ← Estás aquí
├── IMPLEMENTATION_SUMMARY.md                    ← Full-Text Search
├── SECURITY.md                                  ← Security headers & protecciones
├── Copilot-logs/                               ← Logs de sesiones de IA
│   ├── status-logs/                            ← Estado del proyecto
│   ├── auth-logs/                              ← Autenticación
│   ├── security-improvements-logs/             ← Mejoras de seguridad
│   └── README.md                               ← Índice de logs
├── frontend/
│   └── SETUP.md                                ← Guía de setup del frontend
├── search-logs/                                ← Full-text search docs
│   ├── README.md
│   ├── SETUP.md
│   └── SUMMARY.md
└── diagramas/                                  ← Diagramas técnicos
```

---

## 🚀 Quick Start

### Backend
```bash
cd backend
.\start.ps1                # Windows
./start.sh                 # Linux/Mac
```

### Frontend
```bash
cd frontend
pnpm install               # Instalar dependencias
pnpm start                 # Iniciar Expo
```

---

## 📚 Documentación por Tópico

### Full-Text Search (Búsqueda)
- **Estado**: ✅ Implementado y testeado
- **Features**: Búsqueda con FTS en PostgreSQL, fallback LIKE para SQLite
- **Ver**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

### Seguridad
- **Estado**: ✅ Security headers implementados
- **Features**: HSTS, X-Frame-Options, CORS, Rate limiting
- **Ver**: [SECURITY.md](SECURITY.md)

### Autenticación
- **Estado**: ✅ Clerk + JWT (dual system)
- **Documentación**: [auth-logs/](./Copilot-logs/auth-logs/)

---

## 🛠️ Tools Scripts

Los scripts de utilidad están organizados en [Tools/](../Tools/):

| Carpeta | Contenido |
|---------|-----------|
| `Tools/backend/setup/` | Documentación de servidor (start.ps1, start.sh) |
| `Tools/backend/database/` | Migraciones y gestión BD |
| `Tools/backend/seeding/` | Scripts para poblar datos |
| `Tools/frontend/testing/` | Test utilities (reservado) |

---

## 📞 Referencias Rápidas

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

### Diagramas y Arquitectura
- [Diagramas técnicos](./diagramas/)