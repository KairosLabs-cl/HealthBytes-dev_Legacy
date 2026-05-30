-- Migration: Add dietary tags support
-- Date: 2026-02-08
-- Description: Creates dietary_tags table and product_dietary_tags junction table

-- Create dietary_tags table
CREATE TABLE IF NOT EXISTS dietary_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    color VARCHAR(20)
);

-- Create index on name for fast lookups
CREATE INDEX IF NOT EXISTS idx_dietary_tags_name ON dietary_tags(name);

-- Create junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS product_dietary_tags (
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    dietary_tag_id INTEGER NOT NULL REFERENCES dietary_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, dietary_tag_id)
);

-- Create indexes for efficient joins
CREATE INDEX IF NOT EXISTS idx_pdt_product ON product_dietary_tags(product_id);
CREATE INDEX IF NOT EXISTS idx_pdt_tag ON product_dietary_tags(dietary_tag_id);

-- Insert default dietary tags
INSERT INTO dietary_tags (name, display_name, color) VALUES
    ('gluten_free', 'Sin gluten', 'green'),
    ('vegan', 'Vegano', 'blue'),
    ('lactose_free', 'Sin lactosa', 'orange'),
    ('low_sugar', 'Bajo en azúcar', 'purple'),
    ('organic', 'Orgánico', 'emerald'),
    ('keto', 'Keto', 'red')
ON CONFLICT (name) DO NOTHING;
