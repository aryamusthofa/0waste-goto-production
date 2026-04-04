# 🏛️ 0Waste Shop Full Architectural Blueprint — Zera AI 🌿

Dokumen ini adalah rekaman kronologis lengkap dari pengembangan **0Waste Shop (Food)**, sebuah platform marketplace surplus terpercaya berkekuatan sirkular.

---

## 📅 Kronologi Pengembangan (The Journey)

### Fase 1: Fondasi & Identitas Digital (Identity Core)
*   **Sistem Autentikasi**: Implementasi Supabase Auth dengan integrasi JWT untuk sesi aman.
*   **Profil Pengguna**: Skema basis data `profiles` yang mendukung peran ganda (Pembeli & Mitra/Seller).
*   **Session Persistence**: Migrasi dari localStorage ke `@capacitor/preferences` untuk mencegah "logout paksa" pada perangkat Android saat cache dibersihkan.

### Fase 2: Mesin Marketplace (The Exchange Engine)
*   **Manajemen Produk**: Tabel `products` dengan fitur unggah gambar (Storage), status stok real-time, dan kategori dinamis.
*   **Sistem Pencarian**: Implementasi fungsionalitas pencarian berbasis teks (Vite-optimized) untuk memudahkan penemuan barang surplus di sekitar pengguna.
*   **Kategori Produk**: Penataan kategori (Bakery, Fruits, Meat, dll) dengan ikonografi modern.

### Fase 3: Integritas Transaksional (Checkout & Orders)
*   **Checkout Engine**: Logika perhitungan subtotal, biaya pengantaran (delivery fee), dan pilihan metode operasional (Pickup/Delivery).
*   **Manajemen Pesanan**: Tabel `orders` dengan transisi status (`pending` -> `processing` -> `completed` -> `cancelled`).
*   **Midtrans Integration**: Integrasi gerbang pembayaran digital Midtrans Snap melalui Supabase Edge Functions untuk keamanan Key API di sisi server.

### Fase 4: Lokalisasi & Pengalaman Pengguna (Localization & UX)
*   **i18next Framework**: Dukungan penuh Bahasa Indonesia (ID) dan Inggris (EN) di seluruh antarmuka.
*   **Zera AI Assistant**: Kakak asisten pintar (Gemini-powered) yang membantu pengguna memahami ekonomi sirkular dan keamanan pangan.
*   **UI Core Atoms**: Pembuatan sistem desain berbasis kartu (Card), tombol (Button), dan lencana (Badge) dengan estetika premium (Glassmorphism & Vibrant Colors).

### Fase 5: Tata Kelola & Keamanan (Governance & Hardening)
*   **Row Level Security (RLS)**: Proteksi data tingkat baris di PostgreSQL, memastikan pembeli tidak bisa melihat pesanan orang lain dan mitra hanya bisa mengelola produk mereka sendiri.
*   **Developer ROOT Access**: Pembuatan tabel `developer_admins` untuk memberikan hak akses kedaulatan penuh (Super Admin) kepada pemilik sistem (Mas CEO) yang melewati seluruh aturan RLS biasa.
*   **Audit Trail**: Pencatatan otomatis aktivitas administratif untuk akuntabilitas sistem.

### Fase 6: Keselamatan Komunitas (Safety & Moderation)
*   **Reporting System**: Fitur pelaporan produk/mitra bermasalah oleh komunitas untuk menjaga kualitas ekosistem.
*   **Admin Console (Mission Control)**: Panel kendali pusat untuk meninjau laporan, memberikan persetujuan mitra baru, dan mengelola tiket bantuan.
*   **GitHub-style Account Deletion**: Mekanisme penghapusan akun permanen dengan konfirmasi teks kaku ("konfirm-delete") untuk mencegah ketidaksengajaan.

### Fase 7: Keunggulan Operasional & Eco-Metrics
*   **Store Operational Status**: Fitur "Buka/Tutup Toko" dengan efek visual **Grayscale** pada produk yang tokonya sedang tutup.
*   **Eco-Impact Dashboard**: Visualisasi kontribusi lingkungan bagi mitra (Produk terselamatkan & estimasi pengurangan CO2 sebesar 0.5kg/produk).
*   **WhatsApp Notification Shortcut**: Tombol koordinasi cepat di Dashboard Mitra untuk memberitahu pembeli bahwa pesanan siap diambil.

### Fase 8: Produksi Massal & CI/CD (The Grand Final)
*   **Hardware Compatibility**: Optimalisasi `minSdkVersion` ke level **21 (Android 5.0)** untuk mendukung perangkat lama hingga paling modern (Infinix Note 11 Pro).
*   **CI/CD GitHub Actions**: Otomatisasi pembangunan file APK produksi setiap kali kode di-push ke branch utama.
*   **Production Hardening**: Pembersihan dependensi ganda, minimalisasi bundle (Terser), dan validasi jalur muatan statis (`./`) untuk mencegah "Blank Screen".

---

## 🛠️ Spesifikasi Teknologi (Final Stack)
- **Frontend**: React 19, Vite 6, TailwindCSS 4.
- **Backend**: Supabase (PostgreSQL, Auth, Functions, Storage).
- **Mobile Native**: Capacitor 8.
- **Payments**: Midtrans Snap SDK.
- **CI/CD**: GitHub Actions.

---

## 🛡️ Standar Keamanan & Performa
1.  **Zero-Leak Policy**: Seluruh kunci rahasia API disimpan di Environment Variables & GitHub Secrets.
2.  **Optimized Load**: Gambar produk diproses secara *lazy-load* dengan penanganan error yang elegan.
3.  **Clean Code**: Struktur komponen modular untuk kemudahan pemeliharaan jangka panjang.

---
**Maintained by: Antigravity AI (Zera System)** — *Building a Trusted Circular Future with Precision.* 🚀🏛️✨
