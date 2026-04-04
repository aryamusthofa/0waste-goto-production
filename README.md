# 🌿 0Waste Shop (Food) — Trusted Circular Marketplace

0Waste Shop adalah platform inovatif yang menghubungkan pembeli dengan toko yang memiliki surplus makanan berkualitas tinggi. Proyek ini bertujuan untuk mengurangi limbah pangan sekaligus memberikan akses makanan ekonomis kepada masyarakat melalui teknologi modern yang aman, transparan, dan berkelanjutan.

---

## 🚀 Fitur Unggulan

### 🛍️ Marketplace Surplus Pintar
*   **Kategori Dinamis**: Bakery, Fruits, Meat, Dairy, hingga Eco-Deals.
*   **Pencarian Cepat**: Menemukan produk terdekat dengan filter "Hampir Kedaluwarsa".
*   **Lencana Trust**: Indikator **Halal**, **Anti-Basi**, dan **Terverifikasi** untuk keamanan konsumen.

### 💳 Transaksi Aman & Modern (Midtrans)
*   **Pembayaran Digital**: Mendukung E-Wallet, CC, dan Bank Transfer melalui **Midtrans Snap**.
*   **Metode COD**: Fleksibilitas pembayaran di tempat untuk kenyamanan maksimal.
*   **Dua Jalur Pengantaran**: Pilih antara **Ambil Sendiri (Pickup)** atau **Kurir (Delivery)**.

### 🏛️ Mission Control & Moderasi (Super Admin)
*   **Dashboard Root**: Akses kedaulatan penuh bagi pengembang (Mas CEO) untuk mengelola seluruh ekosistem.
*   **Inbox Bantuan**: Komunikasi langsung antara admin dan pengguna untuk resolusi masalah cepat.
*   **Moderasi Komunitas**: Laporkan produk/toko bermasalah untuk lingkungan yang lebih sehat.

### 🏪 Dashboard Mitra Profesional (Partner)
*   **Eco-Impact Dash**: Lihat kontribusi lingkunganmu (CO2 offset).
*   **Status Toko**: Toggle Buka/Tutup Toko dengan antarmuka **Grayscale** otomatis.
*   **WhatsApp Notify**: Kirim instruksi penjemputan ke pembeli hanya dengan satu klik.

### 🤖 Zera AI Assistant
*   **Asisten Cerdas**: Didukung oleh Gemini AI untuk panduan keamanan pangan, ekonomi sirkular, dan bantuan aplikasi dalam Bahasa Indonesia & Inggris.

---

## 🛠️ Tech Stack (Teknologi)

*   **Frontend**: React 19, Vite, TailwindCSS 4.
*   **Mobile Framework**: Capacitor 8 (Cross-platform).
*   **Database & Auth**: Supabase (PostgreSQL with RLS).
*   **CI/CD**: GitHub Actions (Build APK Otomatis).
*   **Localization**: i18next (Dual-language ID/EN).

---

## 📦 Panduan Instalasi & Pengembangan

### 1. Prasyarat (Prerequisites)
Pastikan Anda memiliki:
*   [Node.js (v20+)](https://nodejs.org/)
*   [Supabase Account](https://supabase.com/)
*   Android Studio (Untuk build native lokal)

### 2. Kloning & Pengaturan
```bash
git clone https://github.com/aryamusthofa/0waste-goto-production.git
cd 0wasteproduction
npm install
```

### 3. Konfigurasi Environment
Buat file `.env` di root folder:
```env
VITE_SUPABASE_URL=URL_SUPABASE_ANDA
VITE_SUPABASE_ANON_KEY=ANON_KEY_ANDA
```

### 4. Menjalankan Aplikasi
```bash
# Mode Web Development
npm run dev

# Sinkronisasi Android
npm run cap:android
```

---

## 🏗️ Continuous Integration (CI/CD)

Proyek ini telah dikonfigurasi dengan **GitHub Actions**. Setiap kali Anda melakukan `push` ke branch `main`, GitHub akan secara otomatis:
1. Memeriksa kualitas kode.
2. Membangun aset web produksi.
3. Men-generate file **.APK (Release)** yang bisa diunduh langsung dari tab *Actions*.

---

## 🛡️ Hak Cipta & Tim Pengembang

*   **Pemilik Proyek**: Mas CEO (Arya Musthofa)
*   **AI Developer**: Antigravity AI (Google Deepmind - Zera System)
*   **Visi**: "Membangun masa depan sirkular yang terpercaya satu pesanan sekaligus."

---
**0Waste Shop — Food for Humanity, Future for Earth.** 🌍🌿
