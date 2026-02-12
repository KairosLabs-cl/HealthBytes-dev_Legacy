-- Migration to add nutritional_info column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS nutritional_info TEXT DEFAULT NULL;
