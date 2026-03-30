# Panduan Pengembangan (Developer Guide)

## 1. Aturan Penulisan Kode
- **Mobile First:** Gunakan satuan fleksibel (flex, padding/margin ganjil) agar pas di berbagai ukuran layar.
- **Clean Logic:** Pisahkan logika database (Supabase) dengan tampilan UI.
- **Safe Keys:** Jangan pernah commit file `.env`. Gunakan `EXPO_PUBLIC_` prefix untuk variabel lingkungan agar terbaca di Expo.

## 2. Strategi Anti-Halu (Validation)
- Gunakan **Try-Catch** di setiap pemanggilan API.
- Tampilkan **ActivityIndicator** saat proses loading.
- Gunakan **Alert** atau **Toast** untuk konfirmasi aksi user (Beli, Jual, Logout).
- Validasi input di sisi klien (Contoh: Harga tidak boleh negatif).

## 4. Internal Testing & Debugging (Fase 4)
- **Admin Mini Mode:** Terdapat fitur rahasia di halaman Profil (Tap Avatar 10x) untuk mengakses panel verifikasi partner selama masa pengembangan.
- **CRITICAL:** Fitur ini WAJIB dihapus atau dikunci dengan hak akses SuperAdmin asli sebelum aplikasi di-upload ke Production Public Access.
- **Mobile Priority:** Semua interaksi harus diuji menggunakan gestur sentuh (touch), bukan sekadar klik mouse. Pastikan jarak antar tombol (hitbox) minimal 44px.
