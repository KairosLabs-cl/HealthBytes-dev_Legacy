-- Migración: Sistema de Favoritos por Usuario
SET search_path TO public;

-- 1. Crear tabla de favoritos (relación many-to-many)
CREATE TABLE IF NOT EXISTS user_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_product_favorite UNIQUE(user_id, product_id)
);

-- 2. Crear índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_product_id ON user_favorites(product_id);

-- 3. Habilitar Row-Level Security (RLS)
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS: Los usuarios solo pueden ver/modificar sus propios favoritos
-- Nota: Supabase usa auth.uid() que devuelve el clerk_id del usuario autenticado

CREATE POLICY "Users can view their own favorites"
    ON user_favorites FOR SELECT
    USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can add their own favorites"
    ON user_favorites FOR INSERT
    WITH CHECK (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can remove their own favorites"
    ON user_favorites FOR DELETE
    USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
