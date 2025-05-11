CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS luxora_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    refresh_token TEXT,
    last_login TIMESTAMP,
    provider VARCHAR(50) CHECK (signup_type IN ('github', 'google', 'plain')),
    provider_user_id TEXT UNIQUE,
    signup_type VARCHAR(50) CHECK (signup_type IN ('github', 'google', 'plain')),
    password_hash TEXT
);

CREATE TABLE IF NOT EXISTS luxora_user_verification (
    user_id UUID PRIMARY KEY REFERENCES luxora_user(id) ON DELETE CASCADE,
    verification_type VARCHAR(50) DEFAULT 'none',
    verification_token TEXT,
    token_expiry TIMESTAMP,
    last_password_update TIMESTAMP,
    last_email_update TIMESTAMP,
    last_username_update TIMESTAMP,
    isverified BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS luxora_product_image (
    user_id UUID  REFERENCES luxora_user(id) ON DELETE CASCADE,
    image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    compressed_image BYTEA,
    image_url TEXT, -- optional if they wan use a url
    checksum TEXT, -- only for non url images
    uploaded_at TIMESTAMP DEFAULT NOW(),
    sort_order INTEGER NOT NULL,
    CHECK (
        (compressed_image IS NOT NULL AND image_url IS NULL)
        OR (compressed_image IS NULL AND image_url IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS luxora_product (
    user_id UUID REFERENCES luxora_user(id) ON DELETE CASCADE,
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sold BOOLEAN DEFAULT false,
    category VARCHAR(255),
    sold_to_user_id UUID DEFAULT NULL, 
    currency CHAR(3) DEFAULT 'EUR',
    description TEXT
);

CREATE TABLE IF NOT EXISTS luxora_product_price_history (
    product_id UUID REFERENCES luxora_product(item_id) ON DELETE CASCADE UNIQUE,
    starting_price NUMERIC(10, 2) NOT NULL,
    currency CHAR(3) DEFAULT 'EUR',
    changed_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (product_id, changed_at)
);

CREATE TABLE IF NOT EXISTS product_bid (
    bid_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES luxora_user(id) ON DELETE CASCADE,
    item_id UUID REFERENCES luxora_product(item_id) ON DELETE CASCADE,
    bid_amount NUMERIC(10, 2) NOT NULL,
    currency CHAR(3) DEFAULT 'EUR',
    bid_time TIMESTAMP DEFAULT NOW()
);