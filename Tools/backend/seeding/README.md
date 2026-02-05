# 🌱 Seeding Tools

Scripts para poblar la base de datos con datos de prueba.

## 📋 Scripts Disponibles

### `seed_products.py`
Inserta productos de ejemplo en la base de datos (Python).

```bash
python seed_products.py
```

### `seed_simple.sql`
Inserta productos de ejemplo usando SQL directo (PostgreSQL/SQLite).

```bash
# PostgreSQL
psql -U postgres -d healthbytes -f seed_simple.sql

# SQLite
sqlite3 database.db < seed_simple.sql
```

**Qué inserta**:
- 8 productos de ejemplo
- Categorías: harinas, pastas, bebidas, panes, chocolates, snacks, aceites, miel
- Cada producto con nombre, descripción, precio, stock e imagen

**Productos**:
- Harina de Almendra
- Pasta Sin Gluten
- Leche de Almendra
- Pan Sin Gluten
- Chocolate Negro 85%
- Snack de Quinua
- Aceite de Coco Virgen
- Miel Orgánica

---

## 🚀 Cómo Usar

### Primero: Recrear BD (opcional)
```bash
cd ../database
python recreate_db.py
```

### Segundo: Sembrar productos
```bash
cd ../seeding
python seed_products.py
```

### Tercera: Migración Full-Text Search
```bash
cd ../database
python run_migration.py
```

---

## 🛠️ Agregar Más Productos

Edita `seed_products.py` y agrega dicts a la lista `products`:

```python
products = [
    {
        "name": "Mi Producto",
        "description": "Descripción detallada",
        "price": 9990,  # En centavos
        "stock": 50,
        "image": "https://url-imagen.jpg"
    },
    # ... más productos
]
```

Luego ejecuta el script nuevamente.

---

**Última actualización**: 2026-02-04
