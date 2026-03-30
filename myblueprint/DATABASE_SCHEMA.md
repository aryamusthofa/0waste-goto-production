# DATABASE_SCHEMA.md — 0waste Shop Food
*Update v3.0 — Supabase PostgreSQL*
*Last updated: 30 Maret 2026*

---

## Setup Files (jalankan berurutan di SQL Editor Supabase)

| File | Isi |
|---|---|
| `databasesetup-sql.txt` | Tables awal: profiles, products, orders + RLS dasar + seed data |
| `databasesetup2-sql.txt` | RLS lanjutan + Storage bucket policies |
| `databasesetup3-sql.txt` | categories, expiry_time, stock, halal_cert, geolocation columns |
| `databasesetup4-wishlists.sql` | Tabel wishlists + RLS + indexes |
| `databasesetup5-checkout-engine.sql` | RPC: place_order() + cancel_order() (atomic, anti-oversell) |

---

## Tabel: `profiles`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID | FK → auth.users (PK) |
| full_name | TEXT | Nama lengkap |
| role | TEXT | 'customer' \| 'partner' (default: customer) |
| avatar_url | TEXT | URL foto profil |
| is_verified | BOOLEAN | true = bisa jual produk (default: false) |
| id_card_url | TEXT | Foto KTP (private access) |
| latitude | FLOAT | Lokasi user |
| longitude | FLOAT | Lokasi user |
| created_at | TIMESTAMPTZ | Auto |

RLS: Public read, self-insert, self-update.

---

## Tabel: `categories`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID | PK |
| name | TEXT | Nama kategori (Bakery, Buffet, dst) |
| icon | TEXT | Nama icon |
| created_at | TIMESTAMPTZ | Auto |

Seed data: Bakery, Buffet, Beverages, Groceries.

---

## Tabel: `products`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID | PK |
| seller_id | UUID | FK → profiles |
| name | TEXT | Nama produk |
| description | TEXT | Deskripsi |
| original_price | DECIMAL(10,2) | Harga asli |
| discount_price | DECIMAL(10,2) | Harga diskon |
| quantity | INTEGER | Stok (default: 1) |
| stock | INTEGER | Alias quantity (legacy compat) |
| image_url | TEXT | URL foto produk |
| is_halal | BOOLEAN | Sertifikasi halal (default: true) |
| halal_cert_no | TEXT | Nomor sertifikat halal |
| status | TEXT | 'available' \| 'sold_out' |
| category_id | UUID | FK → categories |
| category | TEXT | Nama kategori (denormalized, untuk filter) |
| expiry_time | TIMESTAMPTZ | Batas jam Anti-Basi |
| created_at | TIMESTAMPTZ | Auto |

RLS: Public read, partner insert, owner update/delete.

---

## Tabel: `orders`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID | PK |
| customer_id | UUID | FK → profiles |
| product_id | UUID | FK → products |
| method | TEXT | 'pickup' \| 'delivery' |
| total_price | DECIMAL(10,2) | Total bayar |
| shipping_fee | DECIMAL(10,2) | Biaya antar (default: 0) |
| payment_method | TEXT | 'digital' \| 'cod' |
| payment_status | TEXT | 'unpaid' \| 'paid' \| 'refunded' |
| status | TEXT | 'pending' \| 'completed' \| 'cancelled' |
| created_at | TIMESTAMPTZ | Auto |

RLS: Read by customer atau seller. Insert authenticated.

**RPC Functions:**
- `place_order(p_customer_id, p_product_id, p_qty, p_method, p_payment, p_total)` → JSON
  - Atomic: lock row → cek stok → insert order → update stok → sold_out jika habis
  - Returns: `{ success, order_id, remaining }` atau `{ success: false, error }`
- `cancel_order(p_order_id, p_user_id)` → JSON
  - Kembalikan stok, buka produk jika sold_out
  - Hanya bisa cancel status 'pending'

---

## Tabel: `wishlists`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → profiles (ON DELETE CASCADE) |
| product_id | UUID | FK → products (ON DELETE CASCADE) |
| created_at | TIMESTAMPTZ | Auto |

Constraint: UNIQUE(user_id, product_id) — tidak bisa wishlist produk yang sama 2x.
RLS: Self-only read/insert/delete. Index pada user_id + product_id.

---

## Storage Bucket: `product-images`

- Public bucket
- Policy: public read, authenticated upload
- Path format: `products/{user_id}_{timestamp}.{ext}`
