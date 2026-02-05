# 🔐 Seguridad y Protecciones

Documentación de medidas de seguridad implementadas en HealthBytes.

## 📋 Contenido

### [security-improvements.md](./security-improvements.md)
**Estado:** ✅ Implementado

Mejoras de seguridad a través de headers HTTP y protecciones de CORS.

**Contiene:**
- Security headers (HSTS, X-Frame-Options, etc.)
- CORS configuration
- Request body size limits
- Rate limiting patterns
- HTTPS enforcement

---

## 🛡️ Medidas de Seguridad Implementadas

### 1. Security Headers
✅ **HSTS** - Enforce HTTPS
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

✅ **X-Frame-Options** - Prevenir clickjacking
```
X-Frame-Options: DENY
```

✅ **X-Content-Type-Options** - Prevenir MIME sniffing
```
X-Content-Type-Options: nosniff
```

✅ **Referrer-Policy** - Privacy
```
Referrer-Policy: no-referrer
```

✅ **Permissions-Policy** - Deshabilitar features sensibles
```
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### 2. CORS
✅ Origen específico (no `*`)
✅ Headers limitados
✅ Métodos específicos (GET, POST, PUT, DELETE)
✅ Credenciales permitidas

### 3. Validación
✅ Pydantic para input validation
✅ Type hints obligatorios
✅ Límite de tamaño de request (10 MB por defecto)
✅ Validación de ownership (usuario puede ver solo sus datos)

### 4. Autenticación
✅ Clerk JWKS verification (RS256)
✅ JWT fallback con secret (HS256)
✅ Token expiration (30 días)
✅ Bearer token en Authorization header

### 5. Bases de Datos
✅ SQLAlchemy parameterized queries (prevenir SQL injection)
✅ Transacciones ACID
✅ Índices en campos sensibles
✅ No loguear passwords o tokens

---

## 🚨 NUNCA Hacer

- ❌ Hardcodear credenciales o keys
- ❌ Loguear passwords, tokens, emails
- ❌ Confiar en input del cliente
- ❌ Usar `*` en CORS
- ❌ Guardar tokens en localStorage (frontend)
- ❌ Endpoints sin autenticación (excepto /health, /docs)
- ❌ Revelar errores técnicos al cliente
- ❌ SQL queries raw (usar ORM)

---

## 📚 Checklist de Seguridad para New Features

Antes de agregar un endpoint, verifica:

- [ ] Input validado con Pydantic
- [ ] Autenticación requerida (si es necesario)
- [ ] Autorización verificada (ownership check)
- [ ] No hay logging de datos sensibles
- [ ] No hay SQL injection posible
- [ ] Errores son genéricos (no técnicos)
- [ ] Rate limiting considerado
- [ ] CORS config apropiada

---

## 🔍 Testing de Seguridad

```bash
# Tests de validación
pytest tests/ -m security

# Tests de autenticación
pytest tests/ -m auth

# OWASP checks (manual)
# - SQL Injection: Usa SQLAlchemy ✅
# - XSS: JSON responses (no HTML) ✅
# - CSRF: Stateless API (no sessions) ✅
# - Auth: Clerk JWKS ✅
```

---

Última actualización: Feb 4, 2026
