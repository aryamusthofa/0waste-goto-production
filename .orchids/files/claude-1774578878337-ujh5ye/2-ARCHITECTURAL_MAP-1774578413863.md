# Arsitektur Sistem 0waste (Update v2.1)

## 1. Alur Pengguna (User Flow)
**A. Onboarding (Pengguna Baru/Belum Login)**
1.  **Splash Screen:** Logo 0waste + Loading Session Check.
2.  **Welcome Page:** Ilustrasi visual, Value Proposition, Tombol "Masuk" & "Daftar".
3.  **Auth Pages:**
    -   **Login:** Email/Password (Show/Hide), Forgot Password Link.
    -   **Register:** Form Data Diri + Role Selection + Email Verification Trigger.
    -   **Forgot Password:** Input Email -> Kirim Link Reset.

**B. Main App (Pengguna Login)**
1.  **Customer:**
    -   Home (Kategori + Feed).
    -   Orders History.
    -   Profile.
2.  **Partner (Verified):**
    -   Home (Sama).
    -   **Sell Tab (Create Product).**
    -   Orders History (Sales).
    -   Profile.

## 2. Struktur Direktori Baru
- `/app/index.tsx`: (Ubah fungsi) Menjadi **Welcome Page** / Gatekeeper.
- `/app/auth/forgot-password.tsx`: Halaman baru pemulihan akun.
- `/components/WelcomeSlide.tsx`: Komponen visual onboarding.

## 3. Security Update
- **Session Persistence:** Menggunakan `AsyncStorage` (via Supabase Auth) agar user tidak perlu login ulang setiap buka aplikasi.
- **Role Guard:** `_layout.tsx` di folder `(tabs)` memfilter akses berdasarkan `is_verified`.
