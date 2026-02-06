# 🛠️ Backend Tools

Scripts de utilidad para el backend de HealthBytes.

## 📂 Estructura

### `setup/`
**Scripts para iniciar y configurar el servidor**
- `start.ps1` - Iniciar servidor en Windows PowerShell
- `start.sh` - Iniciar servidor en Linux/Mac
- `run_server.py` - Iniciar FastAPI server (usado por start.ps1)

### `database/`
**Scripts para gestionar la base de datos**
- `run_migration.py` - Ejecutar migración de full-text search
- `recreate_db.py` - Recrear todas las tablas (desarrollo)
- `create_cart_table.py` - Crear tabla de carrito específicamente

### `seeding/`
**Scripts para poblar la base de datos**
- `seed_products.py` - Insertar productos de prueba
- (Otros scripts de seeding según sea necesario)

### `testing/`
**Scripts y configuración de testing**
- Conftest, fixtures, mocks
- Utilidades de testing

## 🚀 Cómo Usar

### Iniciar Servidor
```bash
cd backend
.\start.ps1          # Windows
./start.sh           # Linux/Mac
```

### Recrear Base de Datos
```bash
cd Tools/backend/database
python recreate_db.py
```

### Sembrar Productos
```bash
cd Tools/backend/seeding
python seed_products.py
```

### Ejecutar Migración Full-Text Search
```bash
cd Tools/backend/database
python run_migration.py
```

## 📝 Notas

- Los scripts de **setup** (`start.ps1`, `start.sh`) se mantienen en `backend/` porque son puntos de entrada
- Los scripts de utilidad se organizan en `Tools/` para mantener el backend limpio
- Todos los scripts incluyen manejo de event loop de Windows (SelectorEventLoop)

---

**Última actualización**: 2026-02-04
