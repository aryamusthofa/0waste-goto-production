# PAGES_CHECKLIST.md — Audit Semua Halaman
*Update v3.0 — 13/13 Halaman Complete*
*Last updated: 30 Maret 2026*

---

## Status: ✅ 13 Halaman — Semua Lengkap & Berfungsi

---

### 1. Onboarding (`pages/Onboarding.jsx`)
- ✅ 3 slide: Circular Economy / Safety Anti-Basi / Instant Rescue
- ✅ Dark background (`#0d1117`), animated dots indicator
- ✅ Skip button, swipe dots navigation
- ✅ CTA: "Mulai Sekarang" + "Masuk" di slide terakhir
- ✅ i18n EN/ID

### 2. Welcome (`pages/Welcome.jsx`)
- ✅ Logo 0waste + tagline
- ✅ Value proposition cards (Eco-friendly, Anti-Basi, Instant Rescue)
- ✅ CTA primary: "Masuk", secondary: "Daftar", tertiary: "Lanjutkan sebagai tamu"
- ✅ i18n EN/ID

### 3. Login (`pages/Login.jsx`)
- ✅ Email + password input (tinggi 52px, rounded)
- ✅ Show/Hide password toggle
- ✅ Client-side validation (email format, required)
- ✅ Error message display
- ✅ Link ke Register + ForgotPassword
- ✅ Supabase Auth terintegrasi

### 4. Register (`pages/Register.jsx`)
- ✅ Full name, email, password, confirm password
- ✅ Show/Hide password
- ✅ Role Selector: Customer | Partner (touchable cards)
- ✅ Client-side validation lengkap
- ✅ Email verification trigger (Supabase)
- ✅ Success state setelah register

### 5. ForgotPassword (`pages/ForgotPassword.jsx`)
- ✅ Input email + validasi
- ✅ Kirim reset link via Supabase
- ✅ Success state (cek inbox)
- ✅ Back ke Login

### 6. Home (`pages/Home.jsx`)
- ✅ Custom header: lokasi + search bar rounded
- ✅ Kategori pills horizontal scroll (All/Baru/Eco Deals/Bakery/Buah/Daging/Ikan/Sayuran/Susu)
- ✅ "Expires Soon" section horizontal scroll (produk hampir expired)
- ✅ Grid 2 kolom produk utama
- ✅ ProductCard: foto, badge diskon, badge HALAL, Anti-Basi countdown, harga, tombol Tambah
- ✅ Filter by kategori aktif
- ✅ Search real-time ke Supabase
- ✅ Loading, empty state
- ✅ Akses ke ProductDetail via tap kartu

### 7. ProductDetail (`pages/ProductDetail.jsx`)
- ✅ Foto full-width 280px
- ✅ Back button + Wishlist toggle (❤️) di atas foto
- ✅ Badges: HALAL, Anti-Basi Verified, countdown timer
- ✅ Harga diskon + harga asli (strikethrough)
- ✅ Qty selector (min 1)
- ✅ Expandable sections: Provenance / Shipping & Returns / Reviews
- ✅ CTA fixed bottom: "Tambah ke Keranjang — Rp X"
- ✅ Check wishlist status dari Supabase saat open
- ✅ Toggle wishlist realtime ke DB

### 8. Checkout (`pages/Checkout.jsx`)
- ✅ Product summary card
- ✅ Metode penerimaan: Pickup | Delivery (+Rp 5.000)
- ✅ Metode pembayaran: Digital | COD
- ✅ Ringkasan: subtotal + pickup fee + total
- ✅ Safety badge Anti-Basi
- ✅ RPC `place_order()` — atomic, anti-oversell, validasi stok
- ✅ Error handling: stok habis, produk tidak ada, error server
- ✅ Success screen: order ID, detail metode, navigate ke Orders

### 9. Orders (`pages/Orders.jsx`)
- ✅ Search bar (by nama produk / order ID)
- ✅ Filter tabs: Semua / Menunggu / Selesai / Dibatalkan (dengan counter)
- ✅ OrderCard: status bar berwarna, foto, nama, metode, harga, order ID
- ✅ Tombol Batalkan (2x tap untuk konfirmasi) → RPC `cancel_order()`
- ✅ Stok dikembalikan otomatis saat cancel
- ✅ Tombol Hubungi (placeholder)
- ✅ Login guard, loading state, empty state per filter

### 10. Wishlist (`pages/Wishlist.jsx`)
- ✅ Fetch dari tabel `wishlists` JOIN `products`
- ✅ WishlistCard: foto, nama, badge HALAL, Anti-Basi timer, harga
- ✅ Tombol "Tambah ke Keranjang" → navigate ke Checkout
- ✅ Tombol hapus per item
- ✅ "Hapus Semua" di header
- ✅ Expired state (overlay "Kadaluarsa", tombol disabled)
- ✅ Login guard, empty state, loading state

### 11. EcoChat (`pages/EcoChat.jsx`)
- ✅ Header dark navy + avatar hijau + nama provider AI aktif
- ✅ Badge "AI Live" jika ada API key
- ✅ "Demo Mode" banner jika tidak ada key
- ✅ Chat bubbles: user (hijau, bubble-user) / bot (putih, bubble-bot)
- ✅ Typing indicator (3 dots bounce)
- ✅ Conversation history dikirim ke API (stateful)
- ✅ Quick prompts carousel (4 tombol)
- ✅ Multi-provider: Groq / Gemini / OpenAI (auto-detect dari .env)
- ✅ Fallback hardcoded jika tidak ada key
- ✅ Error handling per provider
- ✅ BottomNav tampil (tidak hide nav lagi)

### 12. PartnerDashboard (`pages/PartnerDashboard.jsx`)
- ✅ Guard: cek login + role='partner' (pesan berbeda untuk non-partner)
- ✅ Stats: Item Aktif / Hampir Kedaluwarsa / Klaim Masuk
- ✅ Tab: Listings | Tambah Produk
- ✅ Listings list: foto, nama, harga, stok, status, delete button
- ✅ Form tambah produk: nama, deskripsi, harga asli + diskon, qty, kategori, expiry, halal cert
- ✅ Upload foto ke Supabase Storage (input type=file, preview)
- ✅ Sales orders list
- ✅ Unverified partner: notice "Menunggu Verifikasi"

### 13. Profile (`pages/Profile.jsx`)
- ✅ Avatar + nama + email + badge verifikasi status
- ✅ Eco-Score badge (88/100)
- ✅ Trust Store stats: Items Rescued / Items Shared / CO₂ Saved
- ✅ Recent Contributions list
- ✅ Language switcher: ID | EN (react-i18next)
- ✅ Privacy & Verification toggles (3 switches)
- ✅ Notifications toggles (3 switches)
- ✅ Support & Legal links (navigate ke EcoChat, placeholder pages)
- ✅ Logout (confirm dialog + Supabase signOut)
- ✅ Delete Account button (placeholder)
- ✅ **Admin Mode** — tap avatar 10x → modal verifikasi Partner instan (DEV ONLY)

---

## BottomNav Tabs

| Tab | Icon | Visible |
|---|---|---|
| Beranda | Home (filled saat aktif) | Semua user |
| Pesanan | Bag | Semua user |
| Wishlist | Heart | Semua user |
| Eco AI | Chat bubble | Semua user |
| Mitra | Shop | Partner is_verified=true saja |
| Profil | User | Semua user |

---

## Yang Belum Diimplementasi (Next Phase)

- Anti-Basi Center page (dari Uizard blueprint)
- Map view (mitra terdekat)
- Notifikasi real-time (Supabase Realtime)
- Geolocation jarak KM
