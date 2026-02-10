# 👨‍💻 Guía de Desarrollo

Reglas, patrones y procesos para trabajar en HealthBytes.

## 📋 Contenido

### 📄 Reportes y Análisis

- **[testing-report.md](./testing-report.md)** - Reporte completo de pruebas del sistema
  - Backend tests (health check, endpoints)
  - Frontend structure y archivos creados
  - Integration flow y color system
  - Test coverage y problemas resueltos
  - Preparado: 2026-02-05

### [git-workflow.md](./git-workflow.md)
**Convenciones de git y flujo de contribución**

**Contiene:**
- Conventional Commits format
- Branch naming convention
- PR process with templates
- Code review guidelines
- Merge strategy

### [testing-guide.md](./testing-guide.md)
**Testing strategy y ejecución**

**Contiene:**
- Unit testing con pytest
- Integration testing
- Test fixtures y mocks
- Coverage goals (70%+)
- Cómo ejecutar tests

### [code-standards.md](./code-standards.md)
**Estándares de código para backend y frontend**

**Contiene:**
- Python conventions (PEP8)
- TypeScript best practices
- Naming conventions
- Code organization
- Anti-patterns prohibidos

---

## ⚡ Quick Reference

### ✅ Hacer
- ✅ Commits descriptivos con Conventional Commits
- ✅ Branch names: `tipo/descripcion` (feat/user-auth, fix/cart-bug)
- ✅ PRs con descripción completa
- ✅ Tests antes de merge
- ✅ Type hints en Python y TypeScript
- ✅ Async/await para I/O en backend
- ✅ Error handling explícito
- ✅ Logging en cambios críticos

### ❌ No Hacer
- ❌ Commits sin mensaje descriptivo
- ❌ Branch names aleatorios (Feature/MyFeature, bug123)
- ❌ PRs vacías sin descripción
- ❌ Tests fallando en CI
- ❌ Código con `any` type en TypeScript
- ❌ Sync operations en async functions
- ❌ Silent failures o except clauses genéricas
- ❌ `console.log` o `print` en producción

---

## 🔄 Flujo de Contribución (Paso a Paso)

### 1. Preparar
```bash
git checkout master
git pull origin master
```

### 2. Crear Rama
```bash
git checkout -b feat/product-filters    # ✅ CORRECTO
# NO: git checkout -b Feature/Filters
# NO: git checkout -b filters
```

### 3. Hacer Cambios
```bash
# Editar archivos...
# Mantener arquitectura en capas
# Agregar tests
pytest tests/                    # Verificar tests
pnpm run type-check              # Verificar types (frontend)
```

### 4. Commits
```bash
git commit -m "feat(products): add filtering by allergens

- Added filter endpoint /products/filters
- Implemented allergen tags in DB
- Added QuickFilters UI component

Closes #123"
```

### 5. Push y PR
```bash
git push origin feat/product-filters
# Crear PR en GitHub con template completo
```

---

## 📦 Estructura de PR

### Título (MUST sigue Conventional Commits)
```
feat: Add product filtering by allergens
fix: Validate prices from database
docs: Update contributing guidelines
```

### Description (Complete template)
```markdown
## 📝 Descripción
[Qué hace y por qué es importante]

## 🎯 Tipo de Cambio
- [x] Nueva feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentación

## 📸 Screenshots (si aplica)
[Imágenes o videos]

## ✅ Checklist
- [ ] Tests pasan
- [ ] Código sigue convenciones
- [ ] Sin console.logs
- [ ] Sin `any` types
- [ ] Documentación actualizada

Closes #123
```

---

## 🧪 Testing Rápido

### Backend
```bash
cd backend
pytest                              # Todos
pytest tests/test_api/products.py   # Específico
pytest -v -s                        # Verbose
pytest --cov                        # Coverage
```

### Frontend
```bash
cd frontend
pnpm run type-check                 # TypeScript
pnpm test                           # Jest
```

---

## 🚫 Reglas Estrictas

### Backend
1. **Capas separadas**: Router → Service → Model
2. **Type hints obligatorios**: Nunca `Any`
3. **Tests requeridos**: Cada endpoint debe tener test
4. **Async siempre**: DB, HTTP → `async def`
5. **No N+1 queries**: Eager load con selectinload

### Frontend
1. **Props tipadas**: Interfaces para todos los componentes
2. **No `any` type**: Types explícitos siempre
3. **API en api/**: Fetch NUNCA en componentes
4. **State en stores**: Zustand para estado global
5. **No localStorage**: AsyncStorage para tokens

---

## 📚 Recursos

- **Backend Rules**: [backend/AI-README.md](../../backend/AI-README.md)
- **Frontend Rules**: [frontend/AI-README.md](../../frontend/AI-README.md)
- **Strict Guard Rails**: [.cursorrules](../../.cursorrules)
- **IA Instructions**: [.github/copilot-instructions.md](../../.github/copilot-instructions.md)

---

Última actualización: Feb 4, 2026
