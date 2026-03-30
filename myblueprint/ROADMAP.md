# ROADMAP.md — 0waste Shop Food
*Update v3.0 — Status: 90% Production Ready*
*Last updated: 30 Maret 2026*

---

## Status Keseluruhan: **90% — Siap Demo & Build APK**

---

## ✅ Fase 1: Auth & Role System (SELESAI 100%)

- [x] Supabase Auth — email/password, session persistence (AsyncStorage via Supabase)
- [x] Role-Based UI — tab Mitra hanya muncul untuk partner is_verified=true
- [x] Partner Verification — Admin Mode (tap avatar 10x di Profile)
- [x] Register dengan Role Selector (Customer | Partner)
- [x] Forgot Password — reset via email (Supabase)
- [x] Show/Hide Password di Login & Register
- [x] Input validation client-side (email, password length, match)

---

## ✅ Fase 2: Database & Security (SELESAI 100%)

- [x] Schema: profiles, categories, products, orders, wishlists
- [x] RLS 2.0 — row-level security ketat di semua tabel
- [x] Storage bucket `product-images` dengan RLS
- [x] RPC `place_order()` — atomic dengan FOR UPDATE lock (anti-oversell)
- [x] RPC `cancel_order()` — kembalikan stok otomatis
- [x] Credentials pindah ke `.env` (tidak hardcode lagi)
- [x] `.gitignore` fixed — `.env` tidak ter-commit

---

## ✅ Fase 3: Core Features (SELESAI 100%)

- [x] Home Feed — grid produk, kategori pills, search bar, Expires Soon section
- [x] Anti-Basi badge — countdown real-time dari expiry_time DB (useTimeLeft hook)
- [x] ProductDetail — foto, badges, qty selector, expandable sections
- [x] Wishlist — toggle dari ProductDetail, full page dengan hapus & checkout langsung
- [x] Checkout — pickup/delivery, digital/COD, ringkasan harga, RPC atomic
- [x] Orders — riwayat, filter status, batalkan pesanan (RPC)
- [x] PartnerDashboard — listings, stats, add product dengan upload foto
- [x] EcoChat — AI multi-provider (Groq/Gemini/OpenAI), fallback demo mode
- [x] Profile — eco-score, stats, language switch, privacy toggles, logout

---

## ✅ Fase 4: UX & Polish (SELESAI 100%)

- [x] Onboarding 3-slide (dark theme, animated dots)
- [x] Welcome page dengan value proposition
- [x] Floating BottomNav (blur effect, active state filled icons)
- [x] i18n EN/ID di semua halaman
- [x] Loading states, error states, empty states semua halaman
- [x] Mobile-first: touch targets min 44px, safe area insets

---

## 🔄 Fase 5: Deployment (TARGET SEKARANG)

- [ ] **SQL Setup** — Jalankan ke-5 file SQL di Supabase SQL Editor
- [ ] **API Keys** — Isi `.env` dengan Supabase credentials + AI keys
- [ ] **UAT** — Test manual di HP (Android) via `npm run dev` atau Capacitor
- [ ] **EAS Build / Capacitor Build** — Generate `.apk` untuk distribusi

---

## 🔮 Fase 6: Next Iteration (Optional/Future)

- [ ] Geolocation real — hitung jarak KM dari GPS HP ke lokasi mitra
- [ ] Maps integration — peta mitra terdekat
- [ ] Payment Gateway — Midtrans / Xendit integration
- [ ] Push Notifications — order update real-time
- [ ] Anti-Basi Center page — halaman verifikasi & safety tools
- [ ] Auto-remove expired products — cron job Supabase
- [ ] Admin dashboard web — manajemen partner & produk
- [ ] Rating & review system

---

## Checklist Sebelum Production Public

- [ ] Hapus atau lock Admin Mode (tap avatar 10x) di Profile.jsx
- [ ] Ganti seed data Supabase dengan data mitra real
- [ ] Pasang Sentry / error monitoring
- [ ] Review semua RLS policies di Supabase
- [ ] Test APK di minimal 3 device berbeda
