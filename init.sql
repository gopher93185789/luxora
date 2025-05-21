CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TABLE IF NOT EXISTS luxora_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    refresh_token TEXT,
    last_login TIMESTAMP,
    provider VARCHAR(50) CHECK (provider IN ('github', 'google', 'plain')),
    provider_user_id TEXT UNIQUE,
    profile_picture_link TEXT,
    signup_type VARCHAR(50) CHECK (signup_type IN ('github', 'google', 'plain')),
    password_hash TEXT
);

CREATE TABLE IF NOT EXISTS luxora_product (
    user_id UUID REFERENCES luxora_user(id) ON DELETE CASCADE NOT NULL,
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sold BOOLEAN DEFAULT false,
    category VARCHAR(255),
    sold_to_user_id UUID,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS luxora_product_price_history (
    product_id UUID REFERENCES luxora_product(item_id) ON DELETE CASCADE NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    currency CHAR(3) DEFAULT 'EUR',
    created TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS luxora_product_image (
    user_id UUID NOT NULL REFERENCES luxora_user(id) ON DELETE CASCADE,
    image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES luxora_product(item_id) ON DELETE CASCADE,
    compressed_image BYTEA,
    checksum TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    sort_order INTEGER NOT NULL
);


CREATE TABLE IF NOT EXISTS product_bid (
    bid_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES luxora_product(item_id) ON DELETE CASCADE,
    user_id UUID REFERENCES luxora_user(id) ON DELETE CASCADE,
    bid_amount NUMERIC(10, 2) NOT NULL,
    currency CHAR(3) DEFAULT 'EUR',
    bid_time TIMESTAMP DEFAULT NOW()
);
