# 🤖 Contexto para IA - Frontend (HealthBytes)

**Este documento es solo para asistentes de IA (Copilot, Claude, etc.)**
**Para desarrolladores humanos, ver [README.md](README.md)**

Este archivo define reglas, patrones y principios que debes seguir cuando generes código para el frontend de HealthBytes.

---

## 🎯 Propósito del Proyecto

**HealthBytes** es un e-commerce mobile especializado en productos para personas con restricciones de salud (celiaquía, diabetes, alergias).

El **valor clave**: Rapidez para encontrar productos adecuados sin fricción cognitiva.

---

## 🛡️ Principios Rectores (PRIORIDAD MÁXIMA)

### 1. UX Intuitiva

El e-commerce debe sentirse:
- **Intuitivo**: Usuario entiende qué hacer sin tutoriales
- **Rápido**: Feedback inmediato (< 300ms en interacciones)
- **Accesible**: Funciona con lectores de pantalla, tamaños de fuente variables
- **Confiable**: Mensajes claros en errores, carrito persistente
- **Consistente**: Patrones repetibles en inputs, botones, tarjetas

Si una decisión técnica complica estos puntos → **debe justificarse o descartarse**.

### 2. Escalabilidad Desde el Inicio

- No contaminar componentes UI con lógica futura
- Usar hooks/services para lógica extractable
- Preparar para recomendador, filtros avanzados, deep links
- Mantener capas desacopladas (API, store, components)

### 3. Seguridad

- ✋ **Nunca guardar tokens en localStorage** → AsyncStorage cifrado
- ✋ **No hardcodear URLs de API** → variables de entorno
- ✋ **No loguear datos sensibles** (tokens, contraseñas, emails)
- ✋ **Validar entrada del usuario** siempre
- ✋ **No usar `any` en TypeScript** → types explícitos

---

## 📋 Estructura y Organización

### Stack Obligatorio

- **UI**: React Native (Expo) + TypeScript
- **Theming**: Gluestack + Tailwind (NativeWind)
- **Estado**: Zustand
- **Navegación**: Expo Router (file-based)
- **Fetching**: Fetch nativo (no axios sin permiso)

### Organización de Carpetas

```
components/     → Componentes puros (sin lógica de fetch)
api/            → Clientes API (data layer)
store/          → Zustand stores (estado global)
types/          → TypeScript definitions
lib/            → Utilidades y helpers
assets/         → Recursos estáticos
app/            → Screens y navegación
```

### Nuevas Dependencias

**Obtener aprobación antes de instalar**.
Evaluar: bundle size, consistencia visual, impacto en performance.

---

## 🎨 Patrones de Diseño

### Componentes

```typescript
// ✅ BIEN: Props tipadas, nombres claros
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
  return <Box onPress={onPress}>{/* contenido */}</Box>;
};

// ❌ MAL: Props loosely typed
export const ProductCard = (props: any) => {
  return <Box onPress={props.onClick}>{/* contenido */}</Box>;
};
```

### Hooks Personalizados

```typescript
// ✅ BIEN: Lógica en hook, componente solo renderiza
const useProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // fetch logic aquí
  }, []);

  return { products, loading, error };
};

export const ProductList = () => {
  const { products, loading, error } = useProductList();
  
  if (loading) return <SkeletonLoader />;
  if (error) return <ErrorMessage />;
  return <FlatList data={products} />;
};
```

### Estado Global vs Local

**Global (Zustand)**: auth, carrito, tema, configuración usuario
**Local (useState)**: modals visibility, loader de componente, input focus

```typescript
// ✅ BIEN: Derivar en lugar de duplicar
const useCartTotal = () => {
  const items = useCartStore((state) => state.items);
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
};

// ❌ MAL: Guardar derivado en state
const [total, setTotal] = useState(0); // No guardes esto
```

### Manejo de API Calls

**Todos deben manejar**: loading, error, success

```typescript
// ✅ BIEN: Estados completos
const fetchProducts = async () => {
  setLoading(true);
  try {
    const data = await fetch('/api/v1/products');
    setProducts(await data.json());
  } catch (err) {
    setError(err);
  } finally {
    setLoading(false);
  }
};

// ❌ MAL: Ignorar error o loading
const fetchProducts = async () => {
  const data = await fetch('/api/v1/products');
  setProducts(await data.json());
};
```

---

## 🎯 Patrones de UX Concretos

### Loading States

- ✅ Skeleton loaders (no spinners vacíos)
- ✅ Lazy image loading con fallback
- ✅ Tap target mínimo 44x44

```typescript
if (loading) return <SkeletonLoader count={3} />;
```

### Estados Vacíos

```typescript
// ✅ BIEN: Icono + mensaje + CTA
<Box align="center" gap="lg">
  <Icon name="inbox" />
  <Text>No hay productos</Text>
  <Button onPress={handleRefresh}>Recargar</Button>
</Box>

// ❌ MAL: Solo mensaje genérico
<Text>No results</Text>
```

### Errores

- ✅ Mensajes amigables (no técnicos)
- ✅ Botón de reintento en contexto del error
- ✅ No revelar causas exactas (especialmente en login)

```typescript
if (error) {
  return (
    <Box>
      <Text>Algo salió mal. Intenta nuevamente.</Text>
      <Button onPress={retry}>Reintentar</Button>
    </Box>
  );
}
```

### Feedback al Usuario

- ✅ Toast/snackbar al añadir al carrito
- ✅ Actualización optimista de cantidades
- ✅ Botón sticky "Checkout" al scrollear

```typescript
// ✅ Actualización optimista
const addToCart = (product) => {
  // Update UI inmediatamente
  useCartStore.setState(state => ({
    items: [...state.items, product]
  }));
  
  // Request a backend (si falla, revertir)
  api.addToCart(product).catch(() => {
    // Revertir cambio
    refetch();
  });
};
```

### Validación

- ✅ Validación inline (no silenciosa)
- ✅ Mensajes claros si algo es inválido
- ✅ No bloquear acciones, mostrar por qué

```typescript
// ✅ BIEN: Error inline
{hasError && <Text color="red">Email inválido</Text>}

// ❌ MAL: Validación silenciosa
if (email.includes('@')) { /* ... */ }
```

---

## 📝 Convenciones de Nombres

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Archivos Componentes | `PascalCase` | `ProductCard.tsx` |
| Archivos Hooks | `camelCase` | `useProductList.ts` |
| Archivos Utilitarios | `camelCase` | `formatPrice.ts` |
| Zustand Stores | `<domain>Store.ts` exporta `use<Domain>Store` | `cartStore.ts` → `useCartStore()` |
| Variables booleanas | `is`, `has`, `can` | `isLoading`, `hasError`, `canSubmit` |
| Funciones handlers | `handle<Action>` | `handleAddToCart`, `handleLogout` |
| Zustand actions | `<verb><Noun>` | `addItem`, `removeItem`, `clearCart` |

---

## ✅ Checklist para Nuevo Código

Antes de generar código, verifica:

- [ ] ¿Tiene TypeScript types claros?
- [ ] ¿Maneja loading, error, success?
- [ ] ¿Está accesible (labels, contraste, roles)?
- [ ] ¿Hay feedback visual para interacciones?
- [ ] ¿Está lógica fuera del componente (en hook/service)?
- [ ] ¿Sigue convenciones de nombres?
- [ ] ¿Es reutilizable o duplica código?
- [ ] ¿Se puede testear fácilmente?
- [ ] ¿Hay comentarios útiles?

---

## 🚫 Reglas Obligatorias (NO violar)

1. **Nunca `any`** → Usa types explícitos
2. **Nunca localStorage** para tokens → AsyncStorage
3. **Nunca hardcodear URLs** → Usa constants o .env
4. **Nunca console.log** en producción → Usa logger
5. **Nunca renderizar datos sin validar** → Null checks
6. **Nunca hacer fetch sin manejo de error**
7. **Nunca bloquear UI** → Usa loading states
8. **Nunca ignorar TypeScript warnings**
9. **Nunca olvidar cleanup** en useEffect (return function)
10. **Nunca props muy complejos** → Simplificar o estructurar

---

## 🎨 Tokens de Diseño (Obligatorio Respetar)

### Espaciado
- Múltiplos de 4px: 4, 8, 12, 16, 24, 32, 48, 64

### Border Radius
- 8px por defecto en tarjetas/inputs
- 4px en elementos más pequeños
- 0px en casos raros y justificados

### Colores
- Usar tokens de Gluestack, no hardcodear
- Respetar contraste AA mínimo (4.5:1 para texto)
- No depender solo del color (usar iconos/texto)

### Tipografía
- Máximo 3 jerarquías visuales simultáneas
- Usar escalas, no pixeles absolutos
- Font sizes: heading (32-24), title (18-20), body (14-16), small (12)

---

## 📚 Ejemplo Completo de Buena Práctica

```typescript
// types/product.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

// api/products.ts
export const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch('http://localhost:3001/api/v1/products');
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
};

// components/ProductCard.tsx
interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  return (
    <Box
      onPress={onPress}
      style={{
        padding: '$4',
        borderRadius: '$2',
        borderWidth: 1,
        borderColor: '$borderLight200',
      }}
    >
      <Text bold>{product.name}</Text>
      <Text color="$textLight500">${product.price.toFixed(2)}</Text>
    </Box>
  );
};

// Uso en screen
export default function ProductListScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <SkeletonLoader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <ProductCard product={item} onPress={() => { /* navigate */ }} />
      )}
      keyExtractor={(item) => item.id}
    />
  );
}
```

---

## 🧪 Sobre Testing

- Unit: Lógica de hooks (cálculos, transformaciones)
- Component: Snapshot + interacción básica (press events)
- E2E: Detox o Maestro (futuro)

Ejemplo:
```typescript
describe('ProductCard', () => {
  it('calls onPress when tapped', () => {
    const mockOnPress = jest.fn();
    render(
      <ProductCard
        product={{ id: '1', name: 'Test', price: 100 }}
        onPress={mockOnPress}
      />
    );
    fireEvent.press(screen.getByText('Test'));
    expect(mockOnPress).toHaveBeenCalled();
  });
});
```

---

## ⚠️ Notas Especiales

### Responsabilidad Médica
- La plataforma **NO reemplaza consejo médico profesional**
- Evitar afirmaciones diagnósticas
- Lenguaje neutral en mensajes de restricciones

### Privacidad
- No guardar datos sensibles sin cifrar
- No loguear información médica/personal
- Respetar decisiones de privacidad del usuario

### Performance
- Optimizar bundles (no importar modules grandes innecesariamente)
- Lazy load screens no necesarias al inicio
- Usar React.memo para componentes costosos

---

## 📞 Dudas

Si algo no está claro en este documento:
1. Revisa el README.md (documentación para devs)
2. Busca ejemplos en `components/`
3. Pregunta en el contexto de la conversación
