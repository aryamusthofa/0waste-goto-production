# 0WASTE HUB (Project 0waste) - UI/UX Migration Blueprint

## 1. Visi & Identitas Baru
Aplikasi "0waste" sedang berevolusi menjadi **0waste Hub** (Zero Waste Era). Identitas visualnya ditingkatkan dari sekadar purwarupa fungsional menjadi *High-End Eco-Tech Startup Mobile App*. 
**Warna Utama:** Modern Green (`#3ec976` / `emerald-500`) dipadukan dengan background putih & abu-abu terang (`#F4F4F9`) untuk menciptakan kesan bersih, higienis, dan elit.

## 2. Arsitektur Tampilan (The "Anti-Basi" UI Model)
Project ini adalah migrasi penuh desain dari Uizard ke dalam lingkungan **React Native (Expo + NativeWind / Tailwind CSS)**. 

### A. Komponen Struktural Utama:
1. **Premium Home Feed (`app/(tabs)/index.tsx`)**
   - Menggunakan Custom Header (melepas default Expo Header).
   - "Anti-Basi Badge": Menampilkan hitung mundur batas kedaluwarsa secara visual (`⏳ 2h 30m left`).
   - Jarak lokasi tersimulasi (UI ready untuk integrasi Geolocation).
   - Label diskon tebal dengan background `#3ec976`.

2. **Eco Assistant 2.0 (`app/chat.tsx`)**
   - Chatbot AI dengan UI terpisah.
   - Menggunakan warna pesan buble hijau (`#3ec976`) untuk user, dan putih berbayang untuk AI.
   - Header mewah dengan label "Online • AI 2.0".

3. **Bottom Navigation (`app/(tabs)/_layout.tsx`)**
   - Dibuat mengambang (Floating Effect) dengan elevasi/shadow yang tinggi (`shadow-sm` offset atas).
   - Navigasi khusus dipisah: Beranda (Semua) dan Partner (Mitra Verifikasi).

4. **Auth & Onboarding (`app/index.tsx`, `login.tsx`, `register.tsx`)**
   - Halaman Splash/Onboarding yang bersih dan fokus pada *call to action* (CTA).
   - Form Login & Register bergaya *Tech Startup* dengan `TextInput` ber-radius tinggi (`rounded-[24px]`).

## 3. Alur Pengembangan Selanjutnya
- Pengujian murni akan dilakukan secara manual oleh owner (melalui Device atau Browser lokal dengan `npx expo start`).
- Komponen tersisa (Partner Dashboard di `two.tsx`) akan dirapikan menyusul.
- Setelah UI sempurna, kode akan langsung di-*commit* ke GitHub repository utama (`0waste-production-proj`).

## 4. Konsep Keamanan & UX
- Seluruh perpindahan halaman dibuat seringan mungkin (penggunaan `<ScrollView>` dan `<KeyboardAvoidingView>`).
- Tombol aksi utama (Primary Button) selalu memiliki tinggi minimal 50px untuk standar aksesibilitas jempol (Mobile-First UX).
