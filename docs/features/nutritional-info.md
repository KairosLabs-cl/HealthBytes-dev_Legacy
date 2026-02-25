# 🍎 Información Nutricional

Sistema para gestionar y visualizar datos nutricionales de los productos.

## Backend

### Base de Datos
- **Tabla:** `products`
- **Columna:** `nutritional_info` (TEXT, nullable)
- **Formato:** JSON stringify (`{"calories": 150, "protein": 5, ...}`)
- **Migración:** `add_nutritional_info.sql`

### API
- **Modelos:** `Product`, `ProductBase` actualizados.
- **Seeding:** Script `seed_nutrition.py` asigna valores aproximados según categoría.

## Frontend

### Interfaz
- **Pantalla:** `ProductDetailsScreen`
- **Visualización:** Tabla limpia con Calorías, Proteínas, Carbohidratos y Grasas.
- **Lógica:**
  - Verifica si existe `nutritional_info`.
  - Parsea el JSON string de forma segura (`try-catch`).
  - Renderiza condicionalmente la sección.

## Ejemplo de Datos
```json
{
  "calories": 250,
  "protein": 12,
  "carbs": 30,
  "fat": 8
}
```
