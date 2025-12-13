# Contexto para IA - Frontend (HealthBytes)
! Es importante leer ese documento

Este documento guía a Desarrolladores y cualquier IA / asistente (Copilot u otros) para generar código consistente, escalable y ENFOCADO EN UNA EXPERIENCIA DE COMPRA INTUITIVA Y FÁCIL. Cualquier contribución debe priorizar simplicidad, claridad y accesibilidad del flujo de e‑commerce.

## 1. Descripción Breve

HealthBytes facilita decisiones de compra para personas con restricciones de salud. Inicia con alimentos especializados y evoluciona hacia productos y medicamentos OTC (over-the-counter). El valor clave: rapidez para encontrar productos adecuados sin fricción cognitiva.

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

- **Comando**: `npm run lint`
- **Qué hace**: Ejecuta ESLint con reglas de seguridad (`eslint-plugin-security`) y buenas prácticas de React/React Native.
- **Por qué es importante**:
  - Detecta vulnerabilidades de seguridad comunes (ej: inyección de objetos).
  - Asegura consistencia en el código.
  - Previene errores en tiempo de ejecución.

> **Nota para devs**: Si el linter falla, **no** ignores los errores. Corrígelos o discute si es un falso positivo.

