# 🛒💊 HealthBytes – Compras Inteligentes y Seguras (Alimentos y/o Medicamentos)

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![AWS](https://img.shields.io/badge/Amazon_AWS-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com/)

> Plataforma enfocada en simplificar y hacer más seguras las decisiones de compra para personas con restricciones de salud.  
> Exploramos un modelo híbrido: alimentos especializados y (en evaluación) productos / medicamentos OTC de bienestar. 🌱💊

HealthBytes comenzó centrado en alimentos para usuarios con restricciones (celiaquía, diabetes, alergias). Ahora evaluamos expandir el alcance hacia un catálogo mixto (alimentos funcionales y/o medicamentos OTC). Esta fase es exploratoria: la arquitectura y el dominio se están adaptando para soportar ambos casos, manteniendo criterios de seguridad y escalabilidad.

Estado actual (snapshot):
- ⚙️ API: Node.js + TypeScript + Drizzle ORM (PostgreSQL)
- 👤 Autenticación: integración en progreso con Clerk
- 🐳 Docker: todavía NO en uso estándar (planeado)
- 🐍 FastAPI: previsto como servicio futuro para análisis nutricional / validaciones / recomendador
- 🔄 Pivot: soporte experimental dual food | med (con modo híbrido)

⚠️ Disclaimer:
- No sustituye consejo médico profesional.
- La clasificación de productos está en evolución; no usar como única fuente clínica.

## Información General

🎯 Objetivos inmediatos:
- Catálogo filtrable (alérgenos, etiquetas dietéticas, clasificación preliminar)
- Extender modelo a soporte dual: alimentos / medicamentos OTC
- Carrito y flujo base de compra (checkout completo en roadmap)
- BackOffice inicial (gestión y normalización de datos)
- Base para recomendación y validaciones automáticas (ingredientes / riesgos)

🧩 Características clave:
- 🩺 Filtros de salud (alérgenos, ingredientes sensibles)
- 🔄 Dominio adaptable (food | med | hybrid)
- 👤 Auth centralizada con Clerk (sesiones seguras, roles)
- 📱 Mobile First (React Native)
- 🧱 Monolito modular evolutivo
- 🗃️ Drizzle: tipado end‑to‑end esquema ↔ dominio
- 🚀 Preparado para extraer servicios (FastAPI / ML / validación)

🛠️ Stack actual:
- Frontend: React Native + TypeScript
- Backend: Node.js + TypeScript + Drizzle ORM
- DB: PostgreSQL
- Auth: Clerk (en integración)
- Infra (futuro): Docker + AWS
- Servicios futuros: FastAPI (procesamiento avanzado, validaciones, recomendador)

## Estructura de Carpetas (resumen, máx. 2 niveles)

```
HealthBytes/
├── Backend/
│   └── api/                 # API TypeScript (routers, casos de uso, repositorios Drizzle)
├── Frontend/
│   └── shop/                # App React Native (pantallas, hooks, componentes)
├── Docs/
│   └── Diagramas/           # Diagramas de arquitectura / dominio
└── README.md
```

Notas:
- Servicios Python futuros: Backend/py-services/
- Posible módulo común: Backend/shared/ (DTOs, esquemas, eventos, utils)

## Configuración de Entorno

### 🔑 Prerrequisitos
- Node.js 18+ (LTS)
- npm o yarn
- PostgreSQL 14+
- Cuenta Clerk (keys de prueba)
- (Roadmap) Python 3.11+ (servicios complementarios)
- (Roadmap) Docker / Docker Compose

### 🧬 Variables de Entorno

## Recuerda seguir los pasos Conexión a la Base de Datos para un correcto funcionamiento

Archivo `.env` (ejemplo mínimo para desarrollo):

```env
# --- Base de Datos ---
DATABASE_URL=postgresql://admin:contra123A@db.healthbytes.cl:25432

# --- Auth (Clerk) --- <= Todavia no integrado
CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
# CLERK_WEBHOOK_SECRET=whsec_xxx   # (Opcional si usas webhooks)

```

### 🔌 Conexión a la Base de Datos (Esquema / Flujo)

(Visual de referencia del flujo de conexión / capa de acceso actual)


### 🚀 Instalación

Clonar repositorio:

```bash
git clone https://github.com/WindB3NJA/HealthBytes-dev.git
cd HealthBytes-dev
```

Frontend:

```bash
cd Frontend/shop
npm install
```

Backend:

```bash
cd Backend/api
npm install
```

### ▶️ Ejecución

Backend (API):

```bash
cd Backend/api
npm run dev
```

Frontend (emulador / dispositivo):

```bash
cd Frontend/shop
npm start
```

### 🧪 Tests (cuando se integren) <=  No definitivo

```bash
# Backend
cd Backend/test
npm test

# Frontend
cd Frontend/test
npm test
```

## Contacto 💬

¿Ideas, dudas o colaboración?

- 📧 Email: staff@healthbyes.cl
- 🐙 GitHub: @WindB3NJA, @GuillermoSerrano132, @Simon-Aspee, @chachoCL

## Notas Legales (Provisorio) ⚖️

El contenido es informativo y no constituye consejo médico.  
La exactitud de composiciones y advertencias está en revisión continua.  
Siempre consulta a un profesional de salud ante dudas.

---

<div align="center">

**HealthBytes** – Salud y conveniencia en un mismo lugar 🛒💊❤️  
Construyendo un ecosistema seguro para decisiones de compra informadas.

</div>
