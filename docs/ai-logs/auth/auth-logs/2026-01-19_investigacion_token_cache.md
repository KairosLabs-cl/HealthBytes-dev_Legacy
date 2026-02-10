# 🔍 Investigación: Token No Disponible Post-OAuth

**Fecha:** 2026-01-19  
**Problema:** Google login funciona (`isSignedIn=true`) pero `getToken()` devuelve `null` en checkout  
**Afectado:** Master + feature branches (problema preexistente, no PR-específico)  
**Prioridad:** 🔴 CRÍTICA - Bloquea pagos completamente

---

## 📋 Síntomas

```
Usuario hace login con Google
    ✅ createdSessionId se obtiene
    ✅ setActive({ session: createdSessionId }) se llama
    ✅ Redirige a home (router.replace("/"))
    ✅ isSignedIn hook devuelve true
    ❌ getToken() devuelve null
    ❌ API devuelve 401 "Access denied"
    ❌ Usuario ve: "Error al procesar solicitud, Debe iniciar sesión"
```

---

## 🔗 Cadena de Ejecución

### 1. OAuth Flow (`login.tsx` líneas 45-60)
```typescript
const { createdSessionId, setActive } = await googleOAuth({
  redirectUrl: Linking.createURL("/(auth)/login", { scheme: "myapp" }),
});

if (createdSessionId && setActive) {
  await setActive({ session: createdSessionId });  // ← Sets session
  router.replace("/");                              // ← Redirect
}
```

**Estado esperado después:**
- Clerk session activa en memoria
- Token guardado en SecureStore
- `useAuth().getToken()` debe devolver el token

**Estado actual:**
- Clerk session activa ✅
- Token en SecureStore ❌ (o no accesible)
- `useAuth().getToken()` devuelve null ❌

---

### 2. Token Caching (`lib/cache.ts`)
```typescript
export const tokenCache = Platform.OS !== 'web' 
  ? createTokenCache()  // Usa SecureStore
  : undefined;          // Web no tiene SecureStore

const createTokenCache = (): TokenCache => ({
  getToken: async (key: string) => {
    const item = await SecureStore.getItemAsync(key);
    return item;
  },
  saveToken: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
});
```

**Problemas potenciales:**
1. ¿SecureStore.setItemAsync() falla silenciosamente después de OAuth?
2. ¿La llave es diferente entre save y get?
3. ¿El token expira muy rápido?
4. ¿Hay error en SecureStore que no se registra?

---

### 3. Checkout Flow (`checkout.tsx` líneas 52-82)
```typescript
const handlePay = async () => {
  // ✅ Este check funciona
  if (!isSignedIn) {
    alert("Debes iniciar sesión...");
    return;
  }

  // ❌ Este call devuelve null
  const token = await getToken();
  if (!token) {
    alert("Tu sesión ha expirado...");  // ← Usuario ve esto
    router.push("/(auth)/login");
    return;
  }

  createOrderMutation.mutate(); // Nunca llega aquí
};
```

**Logs agregados:**
- "🔵 handlePay: Iniciando validación..."
- "✅ handlePay: Usuario autenticado (isSignedIn=true)"
- "🔄 handlePay: Solicitando token..."
- "❌ handlePay: Token no disponible - getToken() retornó null"

---

### 4. Backend Auth (`middleware/auth.py` líneas 73-120)
```python
async def get_current_user(
    authorization: Optional[str] = Header(None),
    credentials: Optional[HTTPAuthCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    token = credentials.credentials or authorization  # Extrae Bearer token
    
    if not token:
        raise HTTPException(
            status_code=401,  # ← Error que usuario ve
            detail="Access denied"
        )
    
    # Verify token...
```

**El error 401 es correcto** - el backend rechaza peticiones sin token.  
**El problema es upstream** - el token nunca sale del frontend.

---

## 🧪 Hipótesis Principales

### Hipótesis 1: SecureStore No Guarda Correctamente
**Síntoma:** `saveToken()` devuelve Promise pero error se ignora  
**Evidencia:** No hay try-catch en Clerk's token caching  
**Solución:** Agregar logging en cache.ts para verificar saveToken()

```typescript
// lib/cache.ts - Agregar logging
saveToken: async (key: string, value: string) => {
  console.log(`💾 Guardando token en SecureStore: ${key}`);
  try {
    await SecureStore.setItemAsync(key, value);
    console.log(`✅ Token guardado exitosamente`);
  } catch (error) {
    console.error(`❌ Error al guardar token:`, error);
  }
}
```

---

### Hipótesis 2: Timing Issue - Token Solicitado Antes de Guardarse
**Síntoma:** Checkout immediatamente después de login muestra error  
**Evidencia:** Hay delay de 3s en handlePay() pero aún falla  
**Solución:** Agregar espera explícita después de setActive()

```typescript
// login.tsx
if (createdSessionId && setActive) {
  await setActive({ session: createdSessionId });
  
  // NUEVO: Esperar a que el token esté disponible
  let maxAttempts = 10;
  let token = null;
  while (!token && maxAttempts > 0) {
    token = await getToken();
    if (!token) {
      await new Promise(resolve => setTimeout(resolve, 500));
      maxAttempts--;
    }
  }
  
  if (token) {
    console.log("✅ Token disponible después de OAuth");
    router.replace("/");
  } else {
    console.error("❌ Token nunca estuvo disponible después de OAuth");
  }
}
```

---

### Hipótesis 3: Clerk Version Con Bug Conocido
**Síntoma:** Este flujo debería funcionar out-of-the-box  
**Evidencia:** Problema presente en todas las ramas  
**Solución:** Verificar versión de @clerk/clerk-expo y revisar CHANGELOG

```bash
# En terminal
cd frontend
pnpm list @clerk/clerk-expo
# Revisar: https://github.com/clerk/clerk-js/releases
```

---

### Hipótesis 4: TokenCache Nunca Se Pasa a ClerkProvider
**Síntoma:** tokenCache podría estar undefined o mal configurado  
**Evidencia:** En `_layout.tsx` se pasa `tokenCache`  
**Solución:** Verificar que tokenCache está configurado correctamente

```typescript
// _layout.tsx - Línea 30
<ClerkProvider 
  publishableKey={publishableKey} 
  tokenCache={tokenCache}  // ← ¿Está undefined?
>
```

---

## 🔧 Plan de Debugging

### Paso 1: Verificar SecureStore
```typescript
// Agregar en lib/cache.ts
const testSecureStore = async () => {
  try {
    await SecureStore.setItemAsync("TEST_KEY", "TEST_VALUE");
    const retrieved = await SecureStore.getItemAsync("TEST_KEY");
    console.log("✅ SecureStore funciona:", retrieved === "TEST_VALUE");
  } catch (error) {
    console.error("❌ SecureStore error:", error);
  }
};

// Llamar en _layout.tsx useEffect después de ClerkLoaded
```

### Paso 2: Agregar Logging en saveToken/getToken
```typescript
// lib/cache.ts - Modificar TokenCache
saveToken: async (key: string, value: string) => {
  console.log(`[CACHE] Guardando: ${key} (length: ${value?.length})`);
  const result = await SecureStore.setItemAsync(key, value);
  console.log(`[CACHE] ✅ Guardado: ${key}`);
  return result;
},
getToken: async (key: string) => {
  console.log(`[CACHE] Obteniendo: ${key}`);
  const item = await SecureStore.getItemAsync(key);
  console.log(`[CACHE] ${item ? '✅ Encontrado' : '❌ No encontrado'}: ${key}`);
  return item;
}
```

### Paso 3: Verificar useAuth Hook
```typescript
// En checkout.tsx - Antes de handlePay
const { getToken, isLoaded, isSignedIn, sessionId } = useAuth();

console.log("📊 Auth State:");
console.log("  isLoaded:", isLoaded);
console.log("  isSignedIn:", isSignedIn);
console.log("  sessionId:", sessionId);

// Intentar getToken directamente
const testToken = await getToken();
console.log("  getToken() returned:", testToken ? `${testToken.length} chars` : "null");
```

### Paso 4: Revisar Versión de Clerk
```bash
cd frontend
pnpm list @clerk/clerk-expo
```

---

## 📊 Checklist de Investigación

- [ ] ¿SecureStore está guardando el token post-OAuth? (Agregar logs en saveToken)
- [ ] ¿El token se puede recuperar (getToken devuelve valor)? (Agregar logs en getToken)
- [ ] ¿Hay delay entre save y get que lo explica? (Esperar 1-2s antes de getToken)
- [ ] ¿Versión de Clerk tiene este bug? (Revisar versión y CHANGELOG)
- [ ] ¿tokenCache está siendo pasado correctamente a ClerkProvider? (Verificar en _layout.tsx)
- [ ] ¿isSignedIn=true pero sessionId=undefined? (Revisar estado completo de useAuth)
- [ ] ¿El error viene desde Clerk backend o frontend? (Ver network tab en React Native debugger)

---

## 🚀 Próximos Pasos

1. **Agregar logs generosos** en todo el flujo OAuth → checkout
2. **Reproducir en simulator/device** y capturar logs completos
3. **Revisar versión de Clerk** y buscar issues similares
4. **Considerar fallback manual** si Clerk sigue fallando

---

## 📝 Notas

- Problem occurs in both master and feature branches → not PR-specific
- OAuth itself works (setActive completes, redirect happens)
- Problem is in token persistence/retrieval layer
- User sees generic error message, need to improve error clarity
- This blocks all payments - must prioritize
