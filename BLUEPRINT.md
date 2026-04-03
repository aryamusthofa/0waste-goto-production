# 🏛️ 0Waste Shop Architecture Blueprint — Zera AI 🌿

Dokumen ini mendefinisikan standar rekayasa (Engineering Standards) untuk aplikasi **0Waste Shop (Food)** dalam skala produksi profesional.

## 1. Visi Teknis: "Modern Eco-Tech"
Aplikasi dibangun dengan fokus pada tiga pilar:
- **Keamanan**: Row Level Security (RLS) di database untuk isolasi data total.
- **Performa**: Rendering 120Hz, akselerasi GPU, dan bundle statis yang dioptimasi.
- **Skalabilitas**: Sistem UI berbasis Atom (Reusable Components) dan CI/CD otomatis.

---

## 2. Struktur Teknologi (Stack)
- **Frontend**: React 19 + Vite (Modern, Fast-refresh).
- **Styling**: TailwindCSS 4 (Utility-first with custom UI components).
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions).
- **Mobile**: Capacitor 8 (Cross-platform Native Bridge).
- **Payment**: Midtrans Snap SDK (Digital & E-Wallet support).

---

## 3. Sistem UI (UI Core Atoms)
Guna menjaga konsistensi visual "Wow", aplikasi menggunakan komponen reusable di `src/components/ui/`:
- **Card**: Panel glassmorphism dengan shadow-soft.
- **Button**: Kontrol interaktif dengan transisi halus.
- **Badge**: Label status terverifikasi (Halal, Anti-Basi, Diskon).
- **Input**: Kontrol form mobile-friendly dengan proteksi zoom iOS.

---

## 4. Arsitektur Keamanan (Security Hardening)
- **Database (RLS)**: 
  - `orders`: Hanya pemilik atau seller terkait yang bisa melihat data.
  - `profiles`: Data pribadi terisolasi per user ID.
  - `reports`: Sistem moderasi komunitas terpadu.
- **Native Security**: Menggunakan `@capacitor/preferences` untuk Session Persistence yang tahan terhadap pembersihan cache browser.

---

## 5. Alur Pembayaran (Finansial)
- **Front-end**: Midtrans Snap Popup.
- **Back-end Bridge**: Supabase Edge Function (`payment-gateway`) untuk menukar order ID dengan token API secara aman (Server Key Protection).

---

## 6. Strategi Deployment (CI/CD)
- **Testing**: Vercel (Auto-deploy dari GitHub).
- **Android Production**: GitHub Actions (`build-apk.yml`) otomatis men-generate **Signed APK** menggunakan `.jks` resmi untuk rilis Play Store.

---

## 7. Roadmap Produksi Final
- [x] UI/UX Refactoring (Premium Interface)
- [x] Security Hardening (Enhanced RLS)
- [x] Payment Integration (Midtrans)
- [x] Environment Separation (Final vs Staging)
- [ ] Play Store / App Store Submission (Pending Assets)

---
**Maintained by: Antigravity AI (CEO Mindset)** — *Building a Trusted Circular Future.* 🚀
