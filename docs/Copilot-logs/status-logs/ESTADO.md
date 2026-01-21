ESTADO - HealthBytes
Actualizado: 2026-01-22

Panorama
- Estado general: MVP funcional; autenticación dual operativa; Stripe deshabilitado.
- Calidad: backend con tests mínimos; frontend sin type-check reportado; coverage bajo.
- Datos: PostgreSQL definido; SQLite en pruebas; sin migraciones activas.
- Entregables recientes: capa de services creada para productos; tests unitarios iniciales en services.

Salud por área
- Seguridad: Clerk + JWT legacy; validación de precios en orders presente; falta eliminar decode sin firma en dev.
- Funcionalidad: CRUD productos/usuarios/ordenes; falta filtros de productos y checkout real.
- UX/Estado: carrito no persiste aún; login via Clerk disponible.
- DevOps: sin CI/CD ni Docker productivo; start.ps1 gestiona venv local.

Riesgos visibles
- Lógica de negocio aún en routers auth/users/orders; riesgo de duplicación y falta de tests.
- Sin paginación ni filtros en productos; potencial de respuestas pesadas.
- Testing insuficiente (<10% estimado); cambios pueden romper flujos críticos.
