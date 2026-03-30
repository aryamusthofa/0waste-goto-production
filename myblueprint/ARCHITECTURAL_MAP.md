# ARCHITECTURAL_MAP.md — 0waste Shop Food
*Update v3.0 — Orchids App (React 19 + Vite 8 + TailwindCSS 4 + Capacitor 8)*
*Last updated: 30 Maret 2026*

---

## 1. Stack Teknologi

| Layer | Teknologi |
|---|---|
| Frontend | React 19, Vite 8, TailwindCSS 4 |
| Routing | Custom state-based router (App.jsx) |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email/password, session persistence) |
| Storage | Supabase Storage (bucket: `product-images`) |
| AI Chat | Multi-provider: Groq (default) / Gemini / OpenAI |
| i18n | react-i18next (ID default, EN fallback) |
| Mobile | Capacitor 8 (Android + iOS bundle) |
| State | React Context (AuthContext) |

---

## 2. Alur Pengguna

### A. New User / Belum Login
```
Splash (loading session)
  → Onboarding (3 slide: Eco / Safety / Instant)
  → Welcome (CTA: Masuk | Daftar)
  → Login / Register / ForgotPassword
  → Home (auto-redirect setelah auth)
```

### B. Customer (Logged In)
```
Home → ProductDetail → Checkout → Orders
     ↓
  Wishlist
     ↓
  EcoChat (Eco AI tab)
     ↓
  Profile (Language, Privacy, Logout)
```

### C. Partner / Mitra (role='partner' + is_verified=true)
```
Semua flow Customer +
PartnerDashboard (tab Mitra muncul di BottomNav)
  → Listings management
  → Add product (upload foto ke Supabase Storage)
  → Orders masuk (sales history)
```

---

## 3. Struktur File

```
src/
├── App.jsx               # Router utama + AuthProvider wrapper
├── main.jsx              # Entry point
├── i18n.js               # Translations EN + ID
├── index.css             # Global styles + CSS variables
│
├── lib/
│   ├── supabase.js       # Supabase client (credentials dari .env)
│   └── aiService.js      # Multi-provider AI: Groq / Gemini / OpenAI
│
├── context/
│   └── AuthContext.jsx   # user, profile, signOut, refreshProfile
│
├── hooks/
│   └── useTimeLeft.js    # Anti-Basi countdown timer hook
│
├── components/
│   └── BottomNav.jsx     # Floating bottom nav (Beranda/Orders/Wishlist/EcoAI/Mitra/Profil)
│
└── pages/
    ├── Onboarding.jsx    # 3-slide intro (dark bg, dots indicator)
    ├── Welcome.jsx       # Landing CTA (Masuk | Daftar)
    ├── Login.jsx         # Email/password + show/hide + validasi
    ├── Register.jsx      # Form + Role selector (Customer | Partner)
    ├── ForgotPassword.jsx# Reset via email (Supabase)
    ├── Home.jsx          # Feed produk + kategori + search + Expires Soon
    ├── ProductDetail.jsx # Detail produk + wishlist toggle + qty
    ├── Checkout.jsx      # Pickup/delivery + payment + RPC place_order
    ├── Orders.jsx        # Riwayat + filter status + cancel (RPC)
    ├── Wishlist.jsx      # Saved products (Supabase wishlists table)
    ├── EcoChat.jsx       # AI chat (multi-provider, fallback demo mode)
    ├── PartnerDashboard.jsx # Listings + add product + sales stats
    └── Profile.jsx       # Eco-score + stats + settings + Admin Mode
```

---

## 4. Routing Logic (App.jsx)

```js
NO_NAV_PAGES  = ['onboarding','welcome','login','register','forgot-password','product','checkout']
AUTH_PAGES    = ['home','orders','wishlist','chat','partner','profile']
NAV_PAGES     = { home, orders, wishlist, chat, partner, profile }
```

- Halaman di `AUTH_PAGES` redirect ke login jika belum auth
- `home` bisa diakses tanpa login (guest browsing)
- BottomNav tampil di semua halaman kecuali `NO_NAV_PAGES`

---

## 5. Security & Environment

```
.env                    # JANGAN commit! Sudah ada di .gitignore
.env.example            # Template aman untuk di-commit
```

Variabel wajib:
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GROQ_API_KEY       # (opsional, untuk AI real)
VITE_GEMINI_API_KEY     # (opsional)
VITE_OPENAI_API_KEY     # (opsional)
VITE_AI_PROVIDER        # "groq" | "gemini" | "openai"
```

---

## 6. Build & Deployment

```bash
# Development
npm run dev

# Build web
npm run build

# Bundle APK (Android)
npm run cap:android
# → vite build → cap sync android → cap open android → Build APK di Android Studio

# Bundle iOS
npm run cap:ios
```

Capacitor config: `capacitor.config.json`
- appId: `com.zerowaste.shopfood`
- appName: `0 Waste Shop Food`
- Splash screen: green (#3ec976), 2 detik
