-- ==========================================
-- DATABASE SETUP 2: RLS & SECURITY POLICIES
-- Goal: Fix Error 42501 & Enable Production Security
-- ==========================================

-- 1. ENABLE RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 2. POLICIES FOR 'PROFILES'
-- Public can view profiles (to see seller names)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

-- Authenticated users can insert their own profile (FIX 42501)
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);


-- 3. POLICIES FOR 'PRODUCTS'
-- Public can view available products
DROP POLICY IF EXISTS "Anyone can view available products" ON products;
CREATE POLICY "Anyone can view available products" 
ON products FOR SELECT USING (true);

-- Authenticated users can post products
DROP POLICY IF EXISTS "Authenticated users can create products" ON products;
CREATE POLICY "Authenticated users can create products" 
ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Owners can update/delete their own products
DROP POLICY IF EXISTS "Users can update own products" ON products;
CREATE POLICY "Users can update own products" 
ON products FOR UPDATE USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can delete own products" ON products;
CREATE POLICY "Users can delete own products" 
ON products FOR DELETE USING (auth.uid() = seller_id);


-- 4. POLICIES FOR 'ORDERS'
-- Users can see orders they are involved in
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" 
ON orders FOR SELECT USING (
    auth.uid() = customer_id OR 
    EXISTS (
        SELECT 1 FROM products 
        WHERE products.id = orders.product_id 
        AND products.seller_id = auth.uid()
    )
);

-- Authenticated users can place orders
DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
CREATE POLICY "Authenticated users can create orders" 
ON orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- 5. STORAGE SETUP (For Food Images)
-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
