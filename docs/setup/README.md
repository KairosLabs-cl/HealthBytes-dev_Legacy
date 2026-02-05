# 🚀 Configuración e Instalación

Guías paso a paso para configurar y ejecutar HealthBytes en tu entorno local.

## 📋 Contenido

### [environment-variables.md](./environment-variables.md)
Variables de entorno necesarias para backend y frontend.

**Contiene:**
- `.env` del backend (DATABASE_URL, JWT_SECRET, CLERK_KEYS, STRIPE_KEYS)
- `.env` del frontend (API_URL, CLERK_PUBLISHABLE_KEY)
- Valores de ejemplo para desarrollo

### [frontend-setup.md](./frontend-setup.md)
Configuración completa del frontend React Native.

**Contiene:**
- Requisitos previos (Node, pnpm, Expo)
- Paso a paso de instalación
- Configuración de variables de entorno
- Cómo iniciar la app

## 🏃 Inicio Rápido

### Backend
```bash
cd backend
.\start.ps1    # Windows
# o
./start.sh     # Linux/Mac
```
**Puerto:** http://localhost:3001

### Frontend
```bash
cd frontend
pnpm install
pnpm start
```
**Puerto:** Expo en puerto 8081

## ⚙️ Variables de Entorno Críticas

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:password@localhost/healthbytes
JWT_SECRET=your-secret-key-min-32-chars
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Frontend (.env)
```bash
EXPO_PUBLIC_API_URL=http://127.0.0.1:3001
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## 📚 Documentación Detallada

Para instrucciones completas, consulta:
- **Frontend**: [frontend-setup.md](./frontend-setup.md)
- **Variables de Entorno**: [environment-variables.md](./environment-variables.md)
- **Backend**: [backend/README.md](../../backend/README.md)

## 🆘 Troubleshooting

**Puerto 3001 en uso:**
```bash
lsof -i :3001           # Listar procesos en puerto
kill -9 <PID>           # Matar proceso
```

**pnpm lockfile corrupto:**
```bash
rm -rf pnpm-lock.yaml node_modules
pnpm install
```

**Clerk JWKS no accesible:**
```bash
# Verificar:
curl https://{your-frontend-api}/.well-known/jwks.json
```

Última actualización: Feb 4, 2026
