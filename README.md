# 0Waste Shop Food — Master Production Rollout

Aplikasi marketplace circular economy khusus untuk surplus makanan, dengan tujuan utama mengurangi *food waste* dan menghemat pembelian pangan bagi masyarakat. Dirancang kuat dengan fokus pada *Security, Governance, dan Anti-Basi Protocol*.

## Ringkasan Fitur
- **Buyer Flow**: Pencarian produk berhemat dengan fitur penguncian inventaris (*atomic checkout*).
- **Partner Flow**: Manajemen etalase berjenjang (*Pending → Under Review → Approved*) untuk menjamin kebersihan dan legalitas.
- **Super-Admin Console**: Kontrol penuh untuk menghukum, men-suspend, atau menghapus pengguna/produk bermasalah.
- **EcoChat (Zera AI)**: Asisten virtual bertenaga Gemini 2.0 Flash yang terlindungi di dalam Supabase Edge Function untuk keamanan secret *zero-leak*.

## Arsitektur

- **Frontend**: Vite 8, React 19, TailwindCSS 4
- **Mobile Packaging**: Capacitor 8 (Android-first)
- **Backend / BaaS**: Supabase (PostgreSQL, Storage, RLS, Edge Functions, RPC Auth)
- **AI Backend**: Google Gemini via Supabase Edge Functions 

## Tahap 1: Persiapan Dasar (Zero Setup)

Pastikan dependensi di bawah ini telah terpasang di komputer Anda:
1. Node.js (versi 18+) & `npm`
2. Supabase CLI (`npm install -g supabase`)
3. Docker Desktop (jika ingin *testing* Supabase lokal, namun kita menggunakan Cloud Supabase)
4. Android Studio & SDK (Untuk proses rilis APK/AAB)

Clone repository (terletak di folder `0wasteproduction`), lalu jalankan:
```bash
npm install
```

## Tahap 2: Lingkungan `env`

Buat file `.env` di direktori utama, lalu salin dari `.env.example`:

```bash
VITE_SUPABASE_URL=https://ydaidnppdvzwvdhziifc.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_AI_PROVIDER=gemini
```
*Catatan Keamanan: Tidak boleh ada Kunci API Gemini (`VITE_GEMINI_API_KEY`) di file frontend. Kunci AI akan disimpan di server backend (Edge Functions).*

## Tahap 3: Database & Governance Setup
Buka halaman SQL Editor di Dasbor Supabase Anda, kemudian eksekusi skrip-skrip berikut secara berurutan:
1. `databasesetup3-sql.txt`
2. `databasesetup4-wishlists.sql`
3. `databasesetup5-checkout-engine.sql`
4. `databasesetup6-governance.sql`

## Tahap 4: Akun Super-Admin (Master Keys)

Sebagai developer, Anda harus menginisialisasi **Akses Super Admin** untuk aplikasi ini:

1. Daftarkan diri Anda di Aplikasi Mobile 0Waste secara normal.
2. Buka Supabase SQL Editor.
3. Eksekusi kode berikut:

```sql
INSERT INTO developer_admins (email) VALUES ('email_anda_disini@gmail.com');
UPDATE profiles SET is_super_admin = true WHERE id = (SELECT id FROM auth.users WHERE email = 'email_anda_disini@gmail.com');
```

Setelah ini dieksekusi, menu siluman 'Admin' akan muncul di menu navigasi utama aplikasi Anda.

## Tahap 5: Menyebarkan Edge Function (Gemini)

AI Assistant harus disebarkan ke Supabase Edge Functions guna menyembunyikan API key. Jalankan perintah ini di VSCode Terminal / Cursor:

```bash
# Hubungkan Supabase CLI dengan project Anda
supabase link --project-ref ydaidnppdvzwvdhziifc

# Tanamkan rahasia ke server Supabase Cloud
supabase secrets set GEMINI_API_KEY="isi_dengan_key_gemini_anda_yang_sesungguhnya"

# Kirim fungsi Edge 'eco-chat' ke Cloud
supabase functions deploy eco-chat --no-verify-jwt
```

## Tahap 6: Runbook Produksi Lokal (Smoke Test)

Sebelum mencetak APK Android, jalankan gerbang kualitas otomatis:
```bash
# Mengecek credential leak, conflict marker, dan environment
npm run smoke

# Memastikan optimasi file tidak error
npm run build
```

## Tahap 7: Android Rilis Publik (.APK / .AAB)

Konfigurasi Android tersimpan kokoh di `capacitor.config.json` dengan Bundle ID `com.zerowaste.shopfood`.

```bash
# Sinkronisasi web assets (HTML/CSS/JS) ke Android Native 
npm run cap:sync

# Buka Android Studio untuk Build APK
npm run cap:android
```

Di Android Studio:
- Pilih *Build > Generate Signed Bundle / APK*
- Jika Anda ingin mencoba tes ke HP pribadi, cukup sambungkan dengan kabel USB dan klik tombol *Run (Segitiga Hijau)*.
- Pastikan versi di `android/app/build.gradle` (versionCode dan versionName) tidak bertubrukan saat lempar update ke Play Store kelak.
