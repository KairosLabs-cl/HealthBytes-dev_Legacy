-- Migration: Create addresses table
-- Date: 2026-02-13
-- Description: User shipping/billing addresses

CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    label VARCHAR(50),
    street VARCHAR(255) NOT NULL,
    street_number VARCHAR(20),
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(2) DEFAULT 'CL',
    recipient_name VARCHAR(100),
    phone VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS ix_addresses_id ON addresses (id);
CREATE INDEX IF NOT EXISTS ix_addresses_user_id ON addresses (user_id);
