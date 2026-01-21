PLAN DE ACCION - HealthBytes
Actualizado: 2026-01-22

Prioridades inmediatas (esta semana)
1) Extraer lógica de routers auth/users/orders a services; cubrir con tests de servicios y endpoints.
2) Implementar filtros y paginación en GET /products; añadir índices en campos filtrables.
3) Persistir carrito con AsyncStorage y rehidratación al inicio.

Siguiente bloque (2-3 semanas)
1) Checkout completo: formulario envío, Stripe PaymentIntent, webhook básico, limpieza de carrito al éxito.
2) Endurecer auth: eliminar decodificación sin firma en dev; pruebas de JWKS.
3) Aumentar cobertura backend a 70% (tests de servicios + API críticos).

Infra y operativa
- Configurar pipeline CI (pytest + lint + type-check). Sin cambios en docker-compose por ahora.
- No agregar dependencias sin justificar; mantener pnpm en frontend y requirements.txt en backend.
