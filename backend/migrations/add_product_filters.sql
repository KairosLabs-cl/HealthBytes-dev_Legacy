SET search_path TO public;

-- Habilitar extensión necesaria para índices GIN en diversos tipos si no está
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Asegurar que las columnas existan con el tipo TEXT (que tiene mejor soporte para GIN)
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS dietary_tags TEXT[] DEFAULT '{}';

-- Si la columna ya existía como string (VARCHAR/TEXT), la convertimos a TEXT[] de forma segura
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'dietary_tags' 
        AND data_type != 'ARRAY'
    ) THEN
        ALTER TABLE products ALTER COLUMN dietary_tags TYPE TEXT[] USING string_to_array(dietary_tags, ',');
    END IF;
END $$;

-- Crear índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
-- Usamos el índice GIN estándar para arrays de texto
CREATE INDEX IF NOT EXISTS idx_products_dietary_tags ON products USING GIN(dietary_tags);

-- Poblar datos de ejemplo
UPDATE products SET category = 'Snacks', dietary_tags = ARRAY['sin-gluten', 'vegano'] WHERE name ILIKE '%harina%' OR name ILIKE '%galleta%';
UPDATE products SET category = 'Suplementos', dietary_tags = ARRAY['alto-en-proteina'] WHERE name ILIKE '%proteina%';
UPDATE products SET category = 'Bebidas', dietary_tags = ARRAY['sin-lactosa', 'vegano'] WHERE name ILIKE '%leche%' OR name ILIKE '%almendra%';
