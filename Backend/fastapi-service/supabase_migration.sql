-- HealthBytes Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    price FLOAT NOT NULL
);

-- Users table (with Clerk support)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),  -- Nullable for Clerk users
    role VARCHAR(255) NOT NULL DEFAULT 'user',
    name VARCHAR(255),
    address TEXT,
    clerk_id VARCHAR(255) UNIQUE  -- Clerk user ID
);

-- Create index for clerk_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'New',
    user_id INTEGER NOT NULL REFERENCES users(id),
    stripe_payment_intent_id VARCHAR(255)
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price FLOAT NOT NULL
);

-- Sample products (optional - uncomment to add test data)
-- INSERT INTO products (name, description, image, price) VALUES
-- ('Vitamin D3', 'High potency vitamin D3 supplement', 'https://example.com/vitamind.jpg', 19.99),
-- ('Omega-3 Fish Oil', 'Premium fish oil capsules', 'https://example.com/omega3.jpg', 29.99),
-- ('Multivitamin', 'Complete daily multivitamin', 'https://example.com/multi.jpg', 24.99);
