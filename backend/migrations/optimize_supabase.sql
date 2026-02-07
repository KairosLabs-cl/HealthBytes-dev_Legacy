-- HealthBytes Supabase Optimization & Security Migration
-- Target Schema: public

SET search_path TO public;

-- 1. Optimize Data Types (Ensure precision for monetary values)
ALTER TABLE products ALTER COLUMN price TYPE NUMERIC(10, 2);
ALTER TABLE orders ALTER COLUMN total TYPE NUMERIC(10, 2);
ALTER TABLE order_items ALTER COLUMN price TYPE NUMERIC(10, 2);

-- 2. Add Missing Indexes for Foreign Keys (Improve JOIN performance)
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- USERS: Can only see and modify their own record
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users
FOR SELECT USING (auth.uid()::text = clerk_id OR id::text = auth.uid()::text);

-- PRODUCTS: Everyone can view, only admins (service role) can modify
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" ON products
FOR SELECT USING (true);

-- ORDERS: Users can view their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth.uid()::text = clerk_id OR id::text = auth.uid()::text));

-- ORDER_ITEMS: Linked to order visibility
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" ON order_items
FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE user_id IN (SELECT id FROM users WHERE auth.uid()::text = clerk_id OR id::text = auth.uid()::text)));

-- CART_ITEMS: Users can manage their own cart
DROP POLICY IF EXISTS "Users can manage own cart" ON cart_items;
CREATE POLICY "Users can manage own cart" ON cart_items
FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth.uid()::text = clerk_id OR id::text = auth.uid()::text));
