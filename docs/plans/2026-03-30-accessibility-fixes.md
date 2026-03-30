# Accessibility Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all critical and serious accessibility issues in the HealthBytes React Native/Expo app based on WCAG 2.2 guidelines.

**Architecture:** Fix accessibility issues by adding React Native accessibility props (`accessibilityLabel`, `accessibilityRole`, `accessibilityState`) to interactive elements, images, and form inputs. Implement `prefers-reduced-motion` handling for animations.

**Tech Stack:** React Native, Expo, react-native-reanimated

---

## Task 1: Fix Icon Buttons - Login Screen

**Files:**
- Modify: `frontend/app/(auth)/login.tsx`

**Step 1: Add accessibilityLabel to back button**

Edit `frontend/app/(auth)/login.tsx` line 71-77:

```tsx
<Pressable
  onPress={() => router.back()}
  className="mt-4 ml-4 self-start p-2 active:opacity-60"
  hitSlop={8}
  accessibilityLabel="Volver"
  accessibilityRole="button"
>
  <ChevronLeft size={24} color="#111827" />
</Pressable>
```

**Step 2: Add accessibilityLabel to Google login button**

Edit `frontend/app/(auth)/login.tsx` line 95-111:

```tsx
<Pressable
  onPress={handleGoogleLogin}
  disabled={isLoading}
  className="flex-row items-center justify-center bg-white border border-gray-200 rounded-xl px-5 py-4 active:bg-gray-50"
  style={{ minHeight: 52 }}
  accessibilityLabel={isLoading ? "Iniciando sesión con Google" : "Continuar con Google"}
  accessibilityRole="button"
>
```

**Step 3: Add error announcement with role="alert"**

Edit `frontend/app/(auth)/login.tsx` line 89-93 - wrap in a View with accessibilityRole:

```tsx
{error && (
  <View 
    className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6"
    accessibilityRole="alert"
  >
    <Text className="text-red-600 text-sm">{error}</Text>
  </View>
)}
```

---

## Task 2: Fix Header Component Accessibility

**Files:**
- Modify: `frontend/components/Header.tsx`

**Step 1: Read Header.tsx to find exact lines**

Run: `grep -n "Pressable\|TextInput" frontend/components/Header.tsx`

**Step 2: Add accessibilityLabel to back button (line ~78)**

```tsx
<Pressable
  onPress={() => router.back()}
  className="p-2"
  hitSlop={8}
  accessibilityLabel="Volver"
  accessibilityRole="button"
>
```

**Step 3: Add accessibilityLabel to search icon (line ~92)**

```tsx
<Pressable
  onPress={handleSearch}
  className="p-2"
  accessibilityLabel="Buscar"
  accessibilityRole="button"
>
```

**Step 4: Add accessibilityLabel to clear search button (line ~105)**

```tsx
<Pressable
  onPress={handleClear}
  className="p-2"
  accessibilityLabel="Limpiar búsqueda"
  accessibilityRole="button"
>
```

**Step 5: Add accessibilityLabel to search TextInput (line ~95)**

```tsx
<TextInput
  // ... existing props
  accessibilityLabel="Buscar productos"
  accessibilityHint="Ingresa el nombre del producto que buscas"
  placeholder="Buscar..."
  // ... 
/>
```

---

## Task 3: Fix OnboardingModal Accessibility

**Files:**
- Modify: `frontend/components/OnboardingModal.tsx`

**Step 1: Read OnboardingModal.tsx**

**Step 2: Add accessibilityRole="dialog" to Modal**

Find the Modal component wrapper and add:

```tsx
<Modal
  isOpen={visible}
  onClose={onClose}
  accessibilityRole="dialog"
  accessibilityLabel="Tutorial de bienvenida"
>
```

**Step 3: Add accessibilityLabel to Skip button**

```tsx
<Pressable
  onPress={onComplete}
  accessibilityLabel="Omitir tutorial"
  accessibilityRole="button"
>
```

**Step 4: Add accessibilityLabel to primary button**

```tsx
<Button
  onPress={onComplete}
  accessibilityLabel="Comenzar"
  accessibilityRole="button"
>
```

**Step 5: Add accessibilityLabel to DietaryTagCard Pressables**

Each dietary tag Pressable should have:

```tsx
<Pressable
  onPress={() => toggleTag(tag.id)}
  accessibilityLabel={selected ? `${tag.name} seleccionado` : tag.name}
  accessibilityRole="checkbox"
  accessibilityState={{ checked: selected }}
>
```

---

## Task 4: Fix ReviewModal Accessibility

**Files:**
- Modify: `frontend/components/ReviewModal.tsx`

**Step 1: Read ReviewModal.tsx**

**Step 2: Add accessibilityRole="dialog" to Modal**

```tsx
<Modal
  isOpen={visible}
  onClose={onClose}
  accessibilityRole="dialog"
  accessibilityLabel="Agregar reseña"
>
```

**Step 3: Add accessibilityLabel to star rating Pressables**

In the interactive star rating:

```tsx
<Pressable
  onPress={() => onChange?.(index + 1)}
  accessibilityLabel={`${index + 1} de ${maxStars} estrellas`}
  accessibilityRole="button"
>
```

**Step 4: Add accessibilityLabel to close backdrop**

```tsx
<Pressable
  onPress={onClose}
  className="flex-1 bg-black/40"
  accessibilityLabel="Cerrar modal"
  accessibilityRole="button"
>
```

**Step 5: Add accessibilityLabel to comment TextInput**

```tsx
<TextInput
  // ... existing props
  accessibilityLabel="Tu reseña"
  accessibilityHint="Escribe tu opinión sobre el producto"
  multiline
  // ...
/>
```

---

## Task 5: Fix RatingStars Component

**Files:**
- Modify: `frontend/components/RatingStars.tsx`

**Step 1: Read RatingStars.tsx**

**Step 2: Add accessibility to interactive Pressable stars**

Edit line 34-45:

```tsx
<Pressable
  key={index}
  onPress={() => onChange?.(index + 1)}
  onPressIn={() => setHoverRating(index + 1)}
  onPressOut={() => setHoverRating(0)}
  accessibilityLabel={`${index + 1} de ${maxStars} estrellas`}
  accessibilityRole="button"
>
```

**Step 3: Add accessibility to static Star icons**

Edit line 50-56:

```tsx
<Star
  key={index}
  size={size}
  fill={filled || halfFilled ? '#FBBF24' : 'transparent'}
  color={filled || halfFilled ? '#FBBF24' : '#9CA3AF'}
  accessibilityLabel={`${index + 1} de ${maxStars} estrellas`}
/>
```

---

## Task 6: Fix Addresses Page Accessibility

**Files:**
- Modify: `frontend/app/addresses.tsx`

**Step 1: Read addresses.tsx**

**Step 2: Add accessibilityLabel to cancel edit button**

```tsx
<Pressable
  onPress={handleCancelEdit}
  accessibilityLabel="Cancelar edición"
  accessibilityRole="button"
>
```

**Step 3: Add accessibilityLabel to edit/delete address buttons**

```tsx
<Pressable
  onPress={() => handleEdit(address)}
  accessibilityLabel={`Editar dirección ${address.label}`}
  accessibilityRole="button"
>
<Pressable
  onPress={() => handleDelete(address.id)}
  accessibilityLabel={`Eliminar dirección ${address.label}`}
  accessibilityRole="button"
>
```

**Step 4: Add accessibilityLabel to form inputs**

For each TextInput, add:

```tsx
<TextInput
  // ... existing props
  accessibilityLabel="Etiqueta de dirección"
  // ...
/>
```

---

## Task 7: Fix Checkout Page Accessibility

**Files:**
- Modify: `frontend/app/checkout-v2.tsx`

**Step 1: Read checkout-v2.tsx**

**Step 2: Add accessibilityLabel to address selection cards**

```tsx
<Pressable
  onPress={() => selectAddress(address)}
  accessibilityLabel={`Dirección: ${address.label}, ${address.street}`}
  accessibilityRole="radio"
  accessibilityState={{ selected: selectedAddressId === address.id }}
>
```

**Step 3: Add accessibilityLabel to add address button**

```tsx
<Pressable
  onPress={() => router.push("/addresses")}
  accessibilityLabel="Agregar nueva dirección"
  accessibilityRole="button"
>
```

---

## Task 8: Fix Profile Settings Page Accessibility

**Files:**
- Modify: `frontend/app/profile-settings.tsx`

**Step 1: Read profile-settings.tsx**

**Step 2: Add accessibilityLabel to change profile photo button**

```tsx
<Pressable
  onPress={handleChangePhoto}
  accessibilityLabel="Cambiar foto de perfil"
  accessibilityRole="button"
>
```

**Step 3: Add accessibilityLabel to form inputs**

```tsx
<TextInput
  // ... 
  accessibilityLabel="Nombre"
  // ...
/>
<TextInput
  // ...
  accessibilityLabel="Apellido"
  // ...
/>
```

---

## Task 9: Implement prefers-reduced-motion

**Files:**
- Modify: `frontend/components/FavoriteButton.tsx`
- Modify: `frontend/components/OnboardingModal.tsx`

**Step 1: Create useReducedMotion hook**

Create file `frontend/hooks/useReducedMotion.ts`:

```tsx
import { useReducedMotion } from 'react-native-reanimated';

export function useReducedMotion() {
  const reducedMotion = useReducedMotion();
  return reducedMotion;
}
```

**Step 2: Update FavoriteButton to respect reduced motion**

Edit `frontend/components/FavoriteButton.tsx`:

```tsx
import { useReducedMotion } from '@/hooks/useReducedMotion';

function FavoriteButton({ productId, size = 24 }: FavoriteButtonProps) {
  const reducedMotion = useReducedMotion();
  // ... existing code
  
  const handlePress = useCallback(async () => {
    if (!reducedMotion) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 10, stiffness: 400 })
      );
    }
    // ... rest of handler
  }, [reducedMotion, /* other deps */]);
}
```

**Step 3: Update OnboardingModal to respect reduced motion**

Edit `frontend/components/OnboardingModal.tsx`:

```tsx
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Inside component:
const reducedMotion = useReducedMotion();

// Use reducedMotion to conditionally apply animations
// Replace FadeIn with FadeIn.duration(0) when reducedMotion is true
```

---

## Task 10: Add Alt Text to Product Images

**Files:**
- Modify: `frontend/components/ProductCard.tsx`
- Modify: `frontend/components/CartItem.tsx`
- Modify: `frontend/components/OrderItemRow.tsx`
- Modify: `frontend/components/WishlistTableRow.tsx`
- Modify: `frontend/app/index.tsx`
- Modify: `frontend/app/profile-settings.tsx`
- Modify: `frontend/app/profile.tsx`

**Step 1: Fix ProductCard.tsx (line ~183)**

```tsx
<Image
  source={{ uri: product.image_url }}
  alt={`Imagen de ${product.name}`}
  // ... other props
/>
```

**Step 2: Fix CartItem.tsx (line ~50)**

```tsx
<Image
  source={{ uri: item.product.image_url }}
  alt={`Imagen de ${item.product.name}`}
  // ...
/>
```

**Step 3: Similar fixes for other components**

For each product image, add: `alt={`Imagen de ${productName}`}`

---

## Task 11: Verify and Test

**Step 1: Run ESLint to check for issues**

```bash
cd frontend && npm run lint
```

**Step 2: Run TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

**Step 3: Commit all changes**

```bash
git add -A
git commit -m "fix: improve accessibility (WCAG 2.2)"
```

---

## Execution Notes

- Priority order: Tasks 1-5 (Critical) → Tasks 6-10 (Serious) → Task 11 (Verify)
- Test on physical device with VoiceOver/TalkBack enabled
- Check color contrast separately (not in this plan)
