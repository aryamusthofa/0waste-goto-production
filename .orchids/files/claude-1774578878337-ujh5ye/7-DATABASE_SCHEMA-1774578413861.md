# Spesifikasi Tabel & Keamanan (Update v2.0)

## 1. Tabel: `profiles` (Update)
- `is_verified`: Boolean (Hanya yang TRUE yang bisa jualan).
- `id_card_url`: TEXT (Foto KTP - Private Access).
- `location_lat/lng`: FLOAT (Untuk hitung jarak Maps).

## 2. Tabel: `categories` (New)
- `id`, `name`, `icon`. (Bakery, Buffet, Grocery, etc).

## 3. Tabel: `products` (Update)
- `category_id`: FK ke `categories`.
- `expiry_time`: TIMESTAMP (Batas jam konsumsi).
- `stock`: INTEGER (Stok nyata).
- `halal_cert_no`: TEXT (Nomor sertifikat).

## 4. Tabel: `orders` (Update)
- `payment_status`: 'unpaid', 'paid', 'refunded'.
- `shipping_fee`: DECIMAL (Berdasarkan jarak).
- `payment_method`: 'digital' atau 'cod'.
