-- ==========================================
-- DATABASE SETUP 4: WISHLISTS TABLE
-- Jalankan di Supabase SQL Editor
-- ==========================================

-- 1. Buat tabel wishlists
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)  -- satu user tidak bisa wishlist produk yang sama 2x
);

-- 2. Enable RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Users can view own wishlists" ON wishlists;
CREATE POLICY "Users can view own wishlists"
ON wishlists FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own wishlists" ON wishlists;
CREATE POLICY "Users can insert own wishlists"
ON wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own wishlists" ON wishlists;
CREATE POLICY "Users can delete own wishlists"
ON wishlists FOR DELETE USING (auth.uid() = user_id);

-- 4. Index untuk performa query
CREATE INDEX IF NOT EXISTS wishlists_user_id_idx ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS wishlists_product_id_idx ON wishlists(product_id);

-- Selesai! Tabel wishlists siap dipakai.
