-- ==========================================
-- DATABASE SETUP 3: PRODUCTION SCALABILITY
-- Goal: Categories, Verification, & Expiry System
-- ==========================================

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add New Columns to Profiles (Verification & Location)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS id_card_url TEXT,
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- 3. Add New Columns to Products (Categorization & Expiry)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id),
ADD COLUMN IF NOT EXISTS expiry_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS halal_cert_no TEXT;

-- 4. Add New Columns to Orders (Payment & Logistics)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS shipping_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'digital';

-- 5. Insert Initial Categories
INSERT INTO categories (name, icon) VALUES 
('Bakery', 'bread'), 
('Buffet', 'cutlery'), 
('Beverages', 'coffee'), 
('Groceries', 'shopping-basket')
ON CONFLICT DO NOTHING;
