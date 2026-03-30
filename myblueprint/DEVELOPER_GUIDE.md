# DEVELOPER_GUIDE.md — 0waste Shop Food
*Update v3.0*
*Last updated: 30 Maret 2026*

---

## 1. Setup Awal (Fresh Clone)

```bash
# 1. Clone repo
git clone https://github.com/aryamusthofa/0waste-shop-app-orchids.git
cd 0waste-shop-app-orchids

# 2. Install dependencies
npm install

# 3. Buat file .env
cp .env.example .env
# Edit .env → isi VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, dan AI keys

# 4. Jalankan SQL migrations di Supabase SQL Editor (berurutan):
#    databasesetup-sql.txt
#    databasesetup2-sql.txt
#    databasesetup3-sql.txt
#    databasesetup4-wishlists.sql
#    databasesetup5-checkout-engine.sql

# 5. Jalankan dev server
npm run dev
```

---

## 2. Environment Variables

```env
# Wajib
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Opsional — minimal satu untuk AI real
VITE_GROQ_API_KEY=gsk_...        # Gratis, paling cepat (console.groq.com)
VITE_GEMINI_API_KEY=AIza...      # (aistudio.google.com)
VITE_OPENAI_API_KEY=sk-...       # (platform.openai.com)
VITE_AI_PROVIDER=groq            # groq | gemini | openai
```

Tanpa AI key → EcoChat jalan dalam Demo Mode (hardcoded responses).

---

## 3. Konvensi Kode

- **Mobile First** — semua layout flex, padding fleksibel, test di 375px lebar
- **Warna brand** — `#3ec976` (primary green), `#1a1a2e` (dark text), `#F4F4F9` (bg)
- **Border radius** — cards `rounded-2xl` (16px), buttons `rounded-2xl`, inputs `rounded-[22px]`
- **Touch targets** — minimum 44px height/width untuk semua elemen interaktif
- **Clean Logic** — pisahkan logika Supabase dari UI. Gunakan `try/catch` semua async
- **Loading states** — selalu tampilkan spinner saat loading data
- **Error states** — selalu tampilkan pesan error yang informatif

---

## 4. Menambah Halaman Baru

1. Buat `src/pages/NamaHalaman.jsx`
2. Import di `src/App.jsx`
3. Tambahkan `case 'nama-halaman'` di `renderPage()`
4. Jika perlu BottomNav: tambahkan ke `NAV_PAGES` dan `AUTH_PAGES`
5. Jika harus hide BottomNav: tambahkan ke `NO_NAV_PAGES`

---

## 5. Admin Dev Mode

**Cara akses:** Buka Profile → Tap avatar 10x berturut-turut

**Fungsi:** Update akun aktif menjadi `role='partner'` + `is_verified=true` secara instan di Supabase tanpa proses verifikasi resmi. Berguna untuk testing fitur PartnerDashboard.

**⚠️ WAJIB dihapus/dilock sebelum upload ke PlayStore/AppStore public.**

Untuk lock: di `Profile.jsx`, hapus state `avatarTaps`, `showAdminMode`, dan fungsi `handleAvatarTap`.

---

## 6. AI Service (aiService.js)

```js
import { sendAiMessage, isAiReady, getActiveProvider } from '../lib/aiService'

// Cek apakah ada API key aktif
if (isAiReady()) { ... }

// Kirim pesan (messages = array [{role, content}])
const reply = await sendAiMessage(messages)

// Provider aktif: 'groq' | 'gemini' | 'openai' | null
const provider = getActiveProvider()
```

Auto-detect: cek `VITE_AI_PROVIDER` → fallback ke provider pertama yang punya key.

---

## 7. Anti-Basi Hook

```js
import { useTimeLeft } from '../hooks/useTimeLeft'

const { timeLeft, isExpired, urgency } = useTimeLeft(product.expiry_time)
// timeLeft: "2h 30m" | "45m" | "Expired"
// urgency: "normal" | "warning" (< 6 jam) | "critical" (< 2 jam)
// isExpired: boolean
```

Update setiap 30 detik otomatis via `setInterval`.

---

## 8. Build APK (Capacitor)

```bash
# Pastikan Android Studio sudah terinstall + ANDROID_HOME di PATH

npm run cap:android
# Shortcut untuk: vite build → cap sync android → cap open android

# Di Android Studio:
# Build → Generate Signed Bundle/APK → APK → pilih keystore → Build
```

App ID: `com.zerowaste.shopfood`

---

## 9. Struktur SQL (Urutan Wajib)

```
1. databasesetup-sql.txt          → Tabel dasar + seed products
2. databasesetup2-sql.txt         → RLS + Storage
3. databasesetup3-sql.txt         → Kolom tambahan (categories, expiry, dll)
4. databasesetup4-wishlists.sql   → Tabel wishlists
5. databasesetup5-checkout-engine.sql → RPC place_order + cancel_order
```

Jika ada error "column already exists" → abaikan, lanjut ke file berikutnya.
