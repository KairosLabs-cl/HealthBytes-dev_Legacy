# 🚀 Guía de Actualización Frontend - HealthBytes

Esta guía te ayudará a actualizar el frontend a las últimas versiones de Expo y sus dependencias.

## 📋 Pre-requisitos

- Node.js 18+ instalado
- pnpm instalado (`npm install -g pnpm`)
- Git con branch limpio (sin cambios sin commitear)

## 🔄 Proceso de Actualización

### Opción 1: Script Automático (Recomendado)

**Windows (PowerShell):**
```powershell
cd frontend
.\scripts\update-deps.ps1
```

**Linux/macOS:**
```bash
cd frontend
chmod +x scripts/update-deps.sh
./scripts/update-deps.sh
```

### Opción 2: Manual

1. **Revisar dependencias desactualizadas:**
```bash
cd frontend
pnpm outdated
```

2. **Actualizar dependencias principales:**
```bash
# Expo SDK
pnpm update expo@latest
pnpm update expo-router@latest
pnpm update expo-constants@latest

# React Query
pnpm update @tanstack/react-query@latest

# Clerk
pnpm update @clerk/clerk-expo@latest

# UI
pnpm update nativewind@latest
pnpm update tailwindcss@latest

# State Management
pnpm update zustand@latest
```

3. **Verificar tipos:**
```bash
pnpm run type-check
```

4. **Probar la aplicación:**
```bash
pnpm start
```

## 🆕 Nuevas Dependencias Agregadas

Las siguientes dependencias se agregaron para mejorar la aplicación:

```bash
# Instalar nuevas dependencias
pnpm add expo-image  # Optimización de imágenes
pnpm add zod         # Validación runtime
```

## ✅ Checklist Post-Actualización

- [ ] `pnpm install` ejecutado sin errores
- [ ] `pnpm run type-check` pasa sin errores
- [ ] App inicia correctamente (`pnpm start`)
- [ ] Navegación funciona en iOS y Android
- [ ] Autenticación con Clerk funciona
- [ ] Carrito de compras funciona
- [ ] Búsqueda de productos funciona
- [ ] No hay console.errors en desarrollo

## 🐛 Troubleshooting

### Error: "Cannot find module 'expo'"

**Solución:**
```bash
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Error: TypeScript no compila

**Solución:**
```bash
# Limpiar cache de TypeScript
pnpm exec tsc --build --clean

# Reinstalar dependencias
pnpm install
```

### Error: "Metro bundler not found"

**Solución:**
```bash
pnpm expo start --clear
```

### Error: Gluestack UI styles no se aplican

**Solución:**
```bash
# Limpiar cache de NativeWind
pnpm expo start --clear
```

## 📦 Versiones Recomendadas

```json
{
  "expo": "^53.0.20",
  "react-native": "0.76.9",
  "react": "18.3.1",
  "typescript": "~5.8.3",
  "@tanstack/react-query": "^5.90.19",
  "@clerk/clerk-expo": "^2.19.18",
  "zustand": "^5.0.10",
  "nativewind": "^4.2.1"
}
```

## 🔧 Configuración TypeScript

El proyecto ahora usa **strict mode** completo. Si encuentras errores:

1. **No usar `any`** - Define tipos explícitos
2. **Manejar `null`/`undefined`** - Usa optional chaining (`?.`)
3. **Tipos de funciones** - Define params y return types

```typescript
// ❌ Malo
function getData(id: any) {
  return fetch(`/api/${id}`);
}

// ✅ Bueno
async function getData(id: string): Promise<Product> {
  const response = await fetch(`/api/${id}`);
  return response.json();
}
```

## 🚀 Mejoras Implementadas

### 1. Error Boundaries
Ahora la app maneja errores globalmente:

```tsx
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';

// Automáticamente envuelto en _layout.tsx
```

### 2. Safe Area Management
Safe areas configuradas globalmente:

```tsx
import { SafeAreaWrapper } from '@/components/layout/SafeAreaWrapper';

<SafeAreaWrapper edges={['top', 'bottom']}>
  <YourContent />
</SafeAreaWrapper>
```

### 3. Skeleton Loaders
Loading states mejorados:

```tsx
import { ProductListSkeleton } from '@/components/layout/SkeletonLoader';

if (isLoading) {
  return <ProductListSkeleton count={6} numColumns={2} />;
}
```

### 4. Performance Optimizations
- Componentes memoizados con `React.memo`
- Hooks optimizados con `useCallback` y `useMemo`
- Queries con staleTime configurado

### 5. Accessibility
Todos los elementos interactivos tienen:
- `accessibilityRole`
- `accessibilityLabel`
- `accessibilityHint`

## 📚 Recursos

- [Expo SDK 53 Docs](https://docs.expo.dev/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Clerk Expo Docs](https://clerk.com/docs/quickstarts/expo)
- [NativeWind Docs](https://www.nativewind.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🆘 Soporte

Si encuentras problemas:

1. Revisa la documentación de Expo
2. Busca en GitHub Issues del proyecto
3. Consulta el documento de arquitectura: `docs/copilot-logs/ui-logs/2026-01-23_frontend_upgrade_plan.md`

---

**Última actualización:** 2026-01-23
**Versión:** Expo 53.0.20 + React Native 0.76.9
