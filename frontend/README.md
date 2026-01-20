# 📱 Frontend - HealthBytes

React Native + TypeScript e-commerce mobile para personas con restricciones de salud.

## 📋 Tabla de Contenidos

- [Quick Start](#-quick-start)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Stack Tecnológico](#-stack-tecnológico)
- [Desarrollo](#-desarrollo)
- [Principios de Diseño](#-principios-de-diseño)
- [Convenciones de Código](#-convenciones-de-código)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

### Instalación

```bash
cd frontend

# Instalar dependencias (usar pnpm)
pnpm install

# Iniciar el servidor de desarrollo
pnpm start
```

### Ejecutar en Emulador/Dispositivo

```bash
# iOS (macOS)
pnpm ios

# Android
pnpm android

# Expo Go (escanear QR con celular)
pnpm start
```

---

## 📂 Estructura del Proyecto

```
frontend/
├── app/                          # Pantallas y navegación (Expo Router)
│   ├── (auth)/                   # Rutas de autenticación
│   ├── product/                  # Rutas de productos
│   ├── _layout.tsx               # Layout raíz
│   ├── index.tsx                 # Home
│   ├── cart.tsx                  # Carrito
│   └── checkout.tsx              # Checkout
│
├── components/                   # Componentes reutilizables
│   ├── ui/                       # Componentes base (Gluestack)
│   ├── ProductListItem.tsx       # Tarjeta de producto
│   ├── Header.tsx                # Navegación
│   ├── FavoritesBar.tsx          # Favoritos
│   ├── QuickFilters.tsx          # Filtros rápidos
│   └── ...
│
├── api/                          # Clientes API (data layer)
│   ├── auth.ts                   # Endpoints de auth
│   ├── products.ts               # Endpoints de productos
│   └── orders.ts                 # Endpoints de órdenes
│
├── store/                        # Zustand stores (estado global)
│   ├── authStore.ts              # Auth state
│   ├── cartStore.ts              # Cart state
│   └── recentlyViewedStore.ts    # Recently viewed state
│
├── types/                        # TypeScript types
│   └── product.ts                # Tipos de producto
│
├── lib/                          # Utilidades
│   └── cache.ts                  # Cache utilities
│
├── assets/                       # Recursos estáticos
│   └── products.json             # Seed data
│
├── global.css                    # Estilos globales
├── tailwind.config.js            # Tailwind config
├── metro.config.js               # Metro bundler config
├── babel.config.js               # Babel config
├── app.json                      # Expo app config
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencias
└── README.md                     # Este archivo
```

---

## 🛠️ Stack Tecnológico

| Tecnología            | Propósito                       |
| ---------------------- | -------------------------------- |
| **React Native** | Framework mobile multiplataforma |
| **TypeScript**   | Type safety                      |
| **Expo**         | Tooling y desarrollo ágil       |
| **Expo Router**  | Navegación file-based           |
| **Zustand**      | State management ligero          |
| **Gluestack UI** | Componentes UI consistentes      |
| **NativeWind**   | Tailwind CSS para React Native   |
| **pnpm**         | Gestor de paquetes               |

---

## 👨‍💻 Desarrollo

### Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
pnpm start

# Limpiar caché y reiniciar
pnpm start --clear

# Build para producción
pnpm build

# Lint del código
pnpm lint

# Tests
pnpm test
```

### Estructura de Componentes

**Componente Funcional Típico:**

```typescript
import React from 'react';
import { Box } from '@gluestack-ui/themed';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  onPress,
}) => {
  return (
    <Box onPress={onPress}>
      {/* Contenido */}
    </Box>
  );
};
```

### Uso de Stores (Zustand)

```typescript
// En un componente
import { useAuthStore } from '@/store/authStore';

export const MyComponent = () => {
  const { user, logout } = useAuthStore();
  
  return (
    // Usar user y logout aquí
  );
};
```

### Llamadas a API

```typescript
// api/products.ts
export const fetchProducts = async () => {
  const response = await fetch('http://localhost:3001/api/v1/products');
  return response.json();
};

// En componente
import { useEffect, useState } from 'react';
import { fetchProducts } from '@/api/products';

export const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
  
    load();
  }, []);

  if (loading) return <SkeletonLoader />;
  if (error) return <ErrorMessage retry={load} />;
  
  return <FlatList data={products} renderItem={...} />;
};
```

---

## 🎨 Principios de Diseño

### Experiencia de Usuario

El e-commerce debe sentirse:

- **Intuitivo**: El usuario entiende qué hacer sin tutoriales
- **Rápido**: Feedback inmediato (< 300ms para interacciones)
- **Accesible**: Funciona con lectores de pantalla, tamaños de fuente variables
- **Confiable**: Mensajes claros en errores, carrito persistente
- **Consistente**: Patrones repetibles para inputs, botones, tarjetas

### Patrones Comunes

**Loading States:**

- Usar skeleton loaders, no spinners vacíos
- Lazy loading de imágenes con fallback

**Estados Vacíos:**

- Icono + mensaje amigable + CTA
- Ej: "No hay productos. Recargar?"

**Errores:**

- Mensajes amigables (no técnicos)
- Botón de reintento en el contexto del error
- No revelar causas exactas (ej: en login)

**Carrito:**

- Actualización optimista de cantidades
- Botón sticky "Checkout" al scrollear
- Toast de confirmación al añadir producto

### Tokens de Diseño

- **Espaciado**: Múltiplos de 4px
- **Radio**: 8px por defecto en tarjetas/inputs
- **Colores**: Respetar constraste AA mínimo (4.5:1)
- **Tipografía**: Máx 3 jerarquías visuales simultáneas

---

## 📝 Convenciones de Código

### Nombres

- **Archivos**: `PascalCase` para componentes, `camelCase` para hooks/utils
- **Componentes**: `PascalCase` (ej: `ProductCard.tsx`)
- **Hooks**: `camelCase` con prefijo `use` (ej: `useProductList.ts`)
- **Variables booleanas**: `is`, `has`, `can` (ej: `isLoading`, `hasError`)

### Tipado TypeScript

```typescript
// ✅ BIEN
interface ProductProps {
  id: string;
  name: string;
  price: number;
}

const Product: React.FC<ProductProps> = ({ id, name, price }) => {
  return null;
};

// ❌ MAL
const Product = (props: any) => {
  return null;
};
```

### Estado Global vs Local

- **Global**: auth, carrito, configuración, tema
- **Local**: flags UI (modals, loaders por componente)
- **Derivar** en lugar de duplicar (ej: total del carrito se calcula)

### Props y Propiedades

```typescript
// ✅ BIEN: Props claros y simples
interface CardProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
}

// ❌ MAL: Props complejos sin documentar
interface CardProps {
  data: any;
  handlers: any;
}
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
pnpm test
```

### Estrategia de Testing

- **Unit**: Lógica de hooks y utilidades
- **Component**: Snapshot + interacción básica
- **E2E** (futuro): Detox o Maestro

### Ejemplo de Test

```typescript
// __tests__/ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ProductCard } from '../ProductCard';

describe('ProductCard', () => {
  it('should call onPress when tapped', () => {
    const mockOnPress = jest.fn();
    render(
      <ProductCard
        id="1"
        name="Test Product"
        price={100}
        onPress={mockOnPress}
      />
    );

    fireEvent.press(screen.getByText('Test Product'));
    expect(mockOnPress).toHaveBeenCalled();
  });
});
```

---

## 🔒 Seguridad y Calidad

### Verificar Código Antes de Hacer Push

```bash
pnpm lint
```

**Qué verifica:**

- Vulnerabilidades de seguridad
- Consistencia de código
- Buenas prácticas de React/React Native

> Si lint falla, corrige los errores antes de hacer commit

### Reglas de Seguridad

- ✋ **Nunca guardar tokens en localStorage sin cifrar** → usar AsyncStorage
- ✋ **No hardcodear URLs de API** → usar variables de entorno
- ✋ **No loguear datos sensibles** (tokens, contraseñas)
- ✋ **Validar entrada del usuario** siempre

---

## 🚨 Troubleshooting

### El metro bundler no inicia

```bash
# Limpiar caché
pnpm start --clear

# O más agresivo
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm start
```

### Los cambios no se reflejan

- Presiona `r` en la terminal para recargar
- Si no funciona, haz `pnpm start --clear`

### Error de conexión a la API

- Verifica que el backend está corriendo en `localhost:3001`
- En Android, usa `10.0.2.2` en lugar de `localhost`
- En iOS, asegúrate que tienes permiso de red (Info.plist)

### Problema con pnpm

```bash
# Actualizar pnpm
npm install -g pnpm@latest

# Verificar versión
pnpm --version  # Debe ser 8+
```

---

## 📖 Documentación Adicional

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Gluestack UI Components](https://gluestack.io/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

---

## 📞 Contacto

Para dudas o sugerencias sobre el frontend, abre un [issue](https://github.com/nojustbenja/HealthBytes-dev/issues) o una [discussion](https://github.com/nojustbenja/HealthBytes-dev/discussions).

## 2. Principio Rector UX (IMPORTANTE)

El e‑commerce debe sentirse:

1. Intuitivo: el usuario entiende qué hacer sin tutoriales.
2. Rápido: feedback inmediato en interacciones (optimizar perceived performance).
3. Accesible: navegación usable con lector de pantalla / tamaños de fuente variables.
4. Confiable: mensajes claros en errores; no perder el estado del carrito.
5. Consistente: patrones repetibles para inputs, botones y tarjetas de producto.

Si una decisión técnica potencialmente complica estos puntos, debe justificarse en comentarios o ser descartada.

## 3. Estructura del Frontend Actual

```
Frontend/shop/ <= ! aqui es donde debes hacer el ´´npm install && npm start´´
	app/                # Rutas (Expo Router)
	api/                # Wrappers hacia backend (fetch/axios si se añade)
	components/         # UI reutilizable (gluestack + wrappers propios)
	store/              # Zustand stores (auth, cart)
	assets/             # Íconos / imágenes
	global.css / tailwind / gluestack config
```

## 4. Tecnologías

- UI: React Native (Expo) + TypeScript
- Theming / UI lib: Gluestack + Tailwind (nativewind) (mantener cohesión de tokens)
- Estado: Zustand (simple; evitar sobre‑ingeniería)
- Navegación: Expo Router (file-based)
- Autenticación: transición a Clerk (a confirmar). Mientras tanto soporte JWT backend.
- Backend futuro: FastAPI (mantener capas desacopladas para adaptar endpoints).

## 5. Objetivos Funcionales

1. Catálogo rápido con búsqueda y filtros simples (posterior: filtros avanzados por categoría / restricciones).
2. Ficha de producto clara: nombre, imagen, precio, descripción.
3. Flujo de carrito: añadir, editar cantidad, eliminar, persistir entre sesiones.
4. Checkout claro (placeholder hasta integrar pagos reales / Stripe / Clerk).
5. Escalabilidad hacia recomendador (no contaminar componentes de presentación con lógica futura; usar hooks/services).

## 6. Experiencia de Usuario (Patrones Concretos)

### Listado de productos

- Skeleton loaders (no spinner vacío) para primera carga.
- Lazy image loading + fallback.
- Tap target mínimo 44x44.

### Detalle de producto

- Botón primario “Añadir al carrito” fijo (sticky) al final si el contenido desplaza.
- Mostrar feedback: snackbar/toast “Producto añadido”.

### Carrito

- Edición inline de cantidades con +/- y actualización optimista.
- Mostrar subtotal + (futuro: impuestos / envío).
- Botón checkout deshabilitado con tooltip si vacío.

### Estados vacíos

- Productos: mensaje + CTA “Recargar” si error / “No hay resultados”.
- Carrito: icono + copy amigable + botón “Explorar productos”.

### Errores y Validaciones

- Errores de red: reintento contextual (botón en componente afectado, no banner global solamente).
- Autenticación: mensajes neutros (evitar revelar causas exactas si hay fallo en login).

### Accesibilidad

- Uso de `accessibilityLabel` en botones clave.
- Contraste AA mínimo (ver tokens de color – evitar texto gris claro en fondos claros).
- No depender sólo del color para estados (usar iconos / texto).

### Performance Percibida

- Prefetch de detalles al hacer hover (web) o al iniciar scroll en móvil (opcional futuro).
- División lógica: evitar cargar pantallas no necesarias al inicio.

## 7. Diseño Visual (Tokens Base — mantener consistencia)

- Espaciado: múltiplos de 4.
- Radio: 8px por defecto en tarjetas / inputs.
- Colores (propuesta):
  - Primary: azul/verde accesible (contrast ratio >= 4.5 con texto blanco).
  - Success para confirmaciones (añadir al carrito), Danger para errores.
- Tipografía: usar los estilos del tema; no hardcodear tamaños en px (usar escalas). Evitar más de 3 jerarquías visibles simultáneas.

## 8. Organización de Código

- Componentes puros (sin efectos) dentro de `components/`.
- Hooks personalizados `useX` para lógica (ej: `useProductList`, `useCartActions`).
- Evitar lógica de fetch dentro de componentes de UI; centralizar en `api/` o hooks.
- Props simples, nombradas y tipadas (no pasar objetos anónimos grandes).

## 9. Convenciones de Nombres

- Archivos: `PascalCase` para componentes, `camelCase` para hooks.
- Zustand stores: `<domain>Store.ts` exporta `use<Domain>Store` (ya consistente: `authStore`, `cartStore`).
- Variables booleanas: prefijo `is`, `has`, `can`.

## 10. Estado Global vs Local

- Global sólo: auth, carrito, configuración usuario, tema.
- Local: flags UI (modals, loaders por componente).
- Derivar en lugar de duplicar (ej: total del carrito se calcula, no se guarda).

## 11. Integración con Backend

- Todas las llamadas deben manejar: loading, error, success.
- Reintentos automáticos: únicamente idempotentes (GET). POST sólo manual.
- Normalizar datos (ej: camelCase si backend retorna snake_case — documentar transformaciones).

## 12. Manejo de Autenticación

- Hasta consolidar Clerk: guardar token JWT cifrado (AsyncStorage) – nunca en variables globales sin control.
- Refrescar contexto al iniciar app: validar token, sino limpiar sesión.
- Guardar rol si existe (para mostrar opciones futuras seller/admin).

## 13. Accesibilidad y Internacionalización (Roadmap)

- Preparar copy centralizado (archivo de strings) para futura i18n.
- Evitar texto embebido directamente en muchos componentes.

## 14. Testing Frontend (Sugerido)

- Unit: lógica de helpers y hooks (ej: cálculo total carrito).
- Component: snapshot + interacción básica (añadir al carrito).
- E2E (futuro): Detox / Maestro.

## 15. Reglas para IA (Muy Importante)

1. Priorizar simplicidad de navegación sobre features avanzadas.
2. No introducir dependencias UI sin evaluar impacto en bundle size / consistencia. (A menos de que se solicite)
3. Cada nuevo componente reusable debe tener: props tipadas + breve comentario JSDoc.
4. No duplicar lógica de negocio (centralizar en hooks / stores).
5. Evitar “premature optimization” (optimizar sólo si hay medición).
6. Mantener accesibilidad (labels, contrastes, role) en cualquier componente nuevo.
7. Cualquier cambio a flujos críticos (añadir al carrito, login) debe mantener estados: loading -> éxito/error con feedback visible.
8. No bloquear UI por una petición secundaria (usar loaders discretos, no overlays globales salvo en checkout final).

## 16. Métricas UX (para orientar decisiones)

- Tiempo a primer listado: < 2s (perceived) – usar skeletons si real > 2s.
- Interacción añadir al carrito: feedback < 300ms (optimista si backend lento).
- Scroll sin jank (60fps ideal) – evitar listas pesadas (usar FlatList con `keyExtractor`, `getItemLayout` si aplica).

## 17. Errores Comunes a Evitar

- Navegación oculta tras demasiados niveles de anidación.
- Textos técnicos en errores (mostrar mensajes amigables).
- Estados vacíos sin guidance.
- Bloquear acciones por validaciones silenciosas (si algo es inválido, explicarlo inline).

## 18. Notas Clínicas / Responsabilidad

- La plataforma NO reemplaza consejo médico profesional.
- Mensajes deben evitar afirmaciones diagnósticas.

## 19. Futuras Integraciones

- Tracking de eventos (amigable a privacidad) para entender abandono de carrito.
- Deep links (producto / categoría) compartibles.
- Modo offline lectura catálogo cacheado.

---

Mantener este documento actualizado cuando se introduzcan cambios estructurales o de experiencia.

## 20. Calidad de Código y Seguridad

Es **obligatorio** verificar la calidad y seguridad del código antes de enviar cambios (Push/PR).

- **Comando**: `pnpm run lint`
- **Qué hace**: Ejecuta ESLint con reglas de seguridad (`eslint-plugin-security`) y buenas prácticas de React/React Native.
- **Por qué es importante**:
  - Detecta vulnerabilidades de seguridad comunes (ej: inyección de objetos).
  - Asegura consistencia en el código.
  - Previene errores en tiempo de ejecución.

> **Nota para devs**: Si el linter falla, **no** ignores los errores. Corrígelos o discute si es un falso positivo.
