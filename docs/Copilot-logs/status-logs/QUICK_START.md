# ⚡ QUICK START - Guía Rápida para Contribuidores

**¡Bienvenido a HealthBytes! Aquí te decimos cómo empezar en 5 minutos.**

---

## 📋 Checklist de Setup (10 minutos)

### 1️⃣ Clonar y Entrar
```powershell
git clone https://github.com/WindB3NJA/HealthBytes-dev.git
cd HealthBytes-dev
```

### 2️⃣ Backend Setup (5 minutos)

```powershell
cd Backend\fastapi-service

# Crear virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt

# Copiar variables de entorno
cp .env.example .env

# IMPORTANTE: Editar .env con tus valores
# Abre .env y llena:
#   - DATABASE_URL (tu PostgreSQL)
#   - JWT_SECRET (algo aleatorio)
#   - CLERK keys (opcional por ahora)
```

### 3️⃣ Frontend Setup (5 minutos)

```powershell
cd Frontend\shop

# Instalar dependencies
pnpm install

# Ver la versión
pnpm --version  # debe ser 8+ preferentemente
```

### 4️⃣ Verificar que funciona

**Terminal 1 - Backend:**
```powershell
cd Backend\fastapi-service
# Asegúrate que venv está activo
./start.ps1
# Espera: "Uvicorn running on http://localhost:3001"
# Visita http://localhost:3001/docs
```

**Terminal 2 - Frontend:**
```powershell
cd Frontend\shop
npm start
# Espera: "Metro waiting on exp://..."
```

✅ **Si llegaste aquí sin errores: ¡Estás listo!**

---

## 🎯 Workflow Diario

### Ver estado del proyecto
```powershell
# En raíz del proyecto
cat RESUMEN_EJECUTIVO.md  # Hoy
cat DIAGNOSTICO_PROYECTO.md  # Issues detalles
cat PLAN_ACCION.md  # Qué implementar
```

### Escoger una tarea
1. Abre `PLAN_ACCION.md`
2. Busca algo en `FASE 1: ARREGLOS CRÍTICOS`
3. Lee la sección de esa tarea
4. Implementa el código provided

### Ejemplo: Arreglar Validación de Precios

**Archivo:** `Backend/fastapi-service/app/routers/orders.py`

1. Abre el archivo (va a la línea ~46)
2. Encuentra:
   ```python
   # TODO: validate products ids, and take their actual price from db
   ```
3. Reemplaza la lógica con el código de PLAN_ACCION.md
4. Test manual:
   ```bash
   curl -X POST http://localhost:3001/orders \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"items": [{"product_id": 1, "quantity": 1, "price": 99999}]}'
   ```
5. Verifica que precio guardado = precio de DB, no 99999
6. Commit:
   ```bash
   git add .
   git commit -m "fix: validate product prices from DB in orders"
   git push origin fix/validate-prices
   ```

---

## 🔍 Explorar el Código

### Backend - Agregar un Endpoint
**Estructura:** `Backend/fastapi-service/app/routers/products.py`

```python
# Ver un endpoint existente
@router.get("/{id}")
async def get_product_by_id(id: int, db: AsyncSession = Depends(get_db)):
    """Obtenemos un producto por ID"""
    result = await db.execute(select(Product).where(Product.id == id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product
```

**Para agregar uno nuevo:**
1. Copia estructura similar
2. Cambia `@router.get()` a la ruta que necesitas
3. Implement lógica
4. Test en http://localhost:3001/docs

### Frontend - Agregar un Componente
**Estructura:** `Frontend/shop/components/MyComponent.tsx`

```typescript
import React from 'react';
import { View, Text } from 'react-native';

export function MyComponent({ prop1 }: { prop1: string }) {
  return (
    <View className="p-4">
      <Text>{prop1}</Text>
    </View>
  );
}
```

**Usar el componente:**
```typescript
import { MyComponent } from '@/components/MyComponent';

export default function MyScreen() {
  return <MyComponent prop1="Hello" />;
}
```

---

## 🧪 Testing Rápido

### Backend - Test un endpoint
```powershell
# Instala httpie (más fácil que curl)
pip install httpie

# GET /products
http get http://localhost:3001/products

# GET un producto específico
http get http://localhost:3001/products/1

# POST nuevo producto (necesita auth)
http post http://localhost:3001/products \
  name="Arroz sin gluten" \
  price=5.99 \
  description="Arroz 100% naturales"
```

### Frontend - Test el store
```typescript
// En tu componente, puedes hacer:
import { useCart } from '@/store/cartStore';

export function TestCart() {
  const cart = useCart();
  
  return (
    <Button
      onPress={() => {
        cart.addProduct({ id: 1, name: 'Test', price: 10 });
        console.log(cart.items);
      }}
    >
      Add to Cart
    </Button>
  );
}
```

---

## 🐛 Si Algo No Funciona

### Backend No Inicia
```powershell
# Error: "ModuleNotFoundError: No module named 'fastapi'"
# Solución: Activa venv
.\venv\Scripts\Activate.ps1

# Error: "database connection refused"
# Solución: Verifica DATABASE_URL en .env
psql -c "SELECT 1;"  # Prueba conexión PostgreSQL

# Error: "Uvicorn address already in use"
# Solución: El puerto 3001 ya está en uso
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess
# O simplemente cambia el puerto en app/config.py
```

### Frontend No Inicia
```powershell
# Error: "expo not found"
# Solución:
pnpm install -g expo-cli
pnpm install

# Error: "Cannot find module '@/api'"
# Solución: Verifica tsconfig.json tiene paths configurados

# Error: "React Native versión incompatible"
# Solución:
pnpm install
pnpm start --reset-cache
```

### Cambios No Aparecen
```powershell
# Backend: Debería hacer auto-reload
# Si no, reinicia: uvicorn app.main:app --reload

# Frontend: Debería hot-reload
# Si no, presiona 'r' en la terminal de Expo
# O: pnpm start --reset-cache
```

---

## 📚 Documentación Clave

| Documento | Qué Contiene | Cuándo Leer |
|-----------|--------------|-----------|
| `README.md` | Visión general del proyecto | Primero |
| `RESUMEN_EJECUTIVO.md` | Estado y prioridades | Setup |
| `PLAN_ACCION.md` | Tasks implementables con código | Antes de codificar |
| `DIAGNOSTICO_PROYECTO.md` | Análisis detallado de 20+ issues | Deep dive |
| `ARQUITECTURA.md` | Diagramas y estructura técnica | Entender design |
| `Backend/fastapi-service/README.md` | Setup backend específico | Setup backend |
| `Frontend/README-Frontend.md` | Guidelines frontend | Desarrollo frontend |

---

## 🎯 Primeras 3 Cosas que Hacer

### 1. Lee el Resumen (5 min)
```powershell
cat RESUMEN_EJECUTIVO.md
```
→ Entiende dónde está el proyecto

### 2. Haz Setup Local (15 min)
Sigue la sección "Checklist de Setup" arriba

### 3. Escoge una Task Fácil
Recomendado para empezar:
- [ ] Validar precios en órdenes (2h)
- [ ] Completar .env.example (30m)
- [ ] Agregar timestamps a modelos (1h)
- [ ] Mejorar validación Pydantic (2h)

---

## 💬 Preguntas Frecuentes

### ¿Por dónde empiezo?
**R:** Tasks en orden:
1. DIAGNOSTICO_PROYECTO.md - entiende issues
2. PLAN_ACCION.md - elige una tarea FASE 1
3. Implement código provided
4. Push a rama de feature

### ¿Qué rama crear?
**R:** Sigue patrón:
```bash
git checkout -b fix/issue-name
# O
git checkout -b feature/new-feature
```

### ¿Cómo hago un commit?
**R:**
```bash
git add .
git commit -m "fix: descripción corta"
git push origin fix/issue-name
```

### ¿Necesito tests?
**R:** Depende:
- **Critical fixes:** Sí, 100% coverage
- **Features:** Sí, >70% coverage
- **Docs:** No

### ¿Dónde hago deploy?
**R:** Still in development. Para producción:
- Backend: AWS Lambda + API Gateway
- Frontend: Expo + EAS Build
- Ver PLAN_ACCION.md Fase 3

---

## 🚀 Pro Tips

### Tip 1: Usa Type Safety
```typescript
// ❌ Malo
const products: any[] = await listProducts();

// ✅ Bien
const products: Product[] = await listProducts();
```

### Tip 2: Mensaje de Commit Descriptivo
```bash
# ❌ Malo
git commit -m "fix"

# ✅ Bien
git commit -m "fix: validate product prices from DB in orders endpoint"
```

### Tip 3: Test Local Primero
```powershell
# Antes de push, verifica:
http get http://localhost:3001/products  # Backend funciona
pnpm start  # Frontend compila
# Luego push
```

### Tip 4: Lee el Código Existente
Antes de escribir una feature nueva, lee code similar para mantener consistencia.

### Tip 5: Documenta tu Código
```python
@router.post("/", response_model=ProductResponse, status_code=201)
async def create_product(
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(verify_seller)
):
    """
    Crear nuevo producto.
    
    - Solo sellers pueden crear
    - Valida campos requeridos
    - Retorna producto creado
    """
    # Implementación
```

---

## 🎓 Learning Resources

- **FastAPI:** https://fastapi.tiangolo.com/
- **SQLAlchemy Async:** https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
- **React Native:** https://reactnative.dev/
- **Zustand:** https://github.com/pmndrs/zustand
- **Pydantic:** https://docs.pydantic.dev/

---

## ✅ Checklist Antes de Hacer Push

- [ ] Código compila sin errores
- [ ] Tests pasan (si hay)
- [ ] No hay TODO/FIXME dejados
- [ ] Mensaje de commit descriptivo
- [ ] No commitear `.env` (está en .gitignore)
- [ ] Rama está up-to-date con main
- [ ] PR description clara

---

## 🆘 Ayuda

Si necesitas ayuda:
1. Revisa `PLAN_ACCION.md` - tienen código de ejemplo
2. Busca similar en el código existente
3. Pregunta en el equipo Slack/Discord
4. Abre issue en GitHub

---

**¡Bienvenido al equipo! 🎉 Estamos emocionados de tener tu ayuda.**

Cualquier pregunta: slack o GitHub issues. Feliz desarrollo! 🚀

