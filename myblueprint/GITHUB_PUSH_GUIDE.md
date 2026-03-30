# GITHUB_PUSH_GUIDE.md — Cara Push ke GitHub
*0waste Shop Food — Orchids App*

---

## Persiapan (Lakukan Sekali)

```bash
# 1. Pastikan sudah ada di folder yang benar
cd path/ke/0waste-shop-app-orchids

# 2. Cek remote sudah benar
git remote -v
# Harus menampilkan: origin → https://github.com/aryamusthofa/0waste-shop-app-orchids.git
```

---

## Setelah Download ZIP dari Claude

```bash
# 1. Extract ZIP ke folder project kamu (replace semua file)

# 2. Buat .env dari template (jika belum ada)
cp .env.example .env
# Edit .env → isi VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY

# 3. Install dependencies (jika ada package baru)
npm install

# 4. Test lokal dulu sebelum push
npm run dev
```

---

## Jalankan SQL Migrations (Urutan Wajib)

Buka Supabase SQL Editor → jalankan berurutan:

1. `databasesetup-sql.txt`
2. `databasesetup2-sql.txt`
3. `databasesetup3-sql.txt`
4. `databasesetup4-wishlists.sql`
5. `databasesetup5-checkout-engine.sql`

---

## Push ke GitHub

```bash
# Cek file yang berubah
git status

# Stage semua perubahan (kecuali .env — sudah ada di .gitignore)
git add .

# Commit dengan pesan deskriptif
git commit -m "feat: checkout engine atomic RPC, wishlist full, EcoChat AI multi-provider, BottomNav chat tab, Profile admin mode, env security, blueprint docs"

# Push
git push origin main
```

---

## Verifikasi Setelah Push

Pastikan file berikut ADA di GitHub:
- ✅ `src/lib/aiService.js`
- ✅ `src/pages/Wishlist.jsx` (bukan stub 25 baris)
- ✅ `src/components/BottomNav.jsx` (ada ChatIcon)
- ✅ `databasesetup4-wishlists.sql`
- ✅ `databasesetup5-checkout-engine.sql`
- ✅ `myblueprint/` folder dengan 5 file
- ✅ `.env.example`

Pastikan file berikut TIDAK ADA di GitHub:
- ❌ `.env` (seharusnya di .gitignore)

---

## Build APK (Setelah Push)

```bash
npm run cap:android
# Buka Android Studio → Build → Generate Signed APK
```
