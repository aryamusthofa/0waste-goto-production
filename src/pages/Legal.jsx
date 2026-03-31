import React from 'react'
import { useTranslation } from 'react-i18next'

const CONTENT = {
  privacy: {
    titleKey: 'privacy_policy',
    icon: '🔒',
    body: `Kebijakan Privasi 0Waste Shop Food

Kami sangat menghargai privasi dan keamanan data Anda. Data pribadi Anda yang dikumpulkan melalui aplikasi ini akan digunakan semata-mata untuk memfasilitasi transaksi marketplace surplus makanan.

1. Pengumpulan Data: Kami mengumpulkan nama, email, lokasi anonim (untuk kalkulasi jarak yang aman), dan riwayat pesanan.
2. Penggunaan Data: Data digunakan untuk mencocokkan penjual dan pembeli secara efisien guna mengurangi limbah makanan.
3. Keamanan: Data tidak akan dijual kepada pihak ketiga. Kami menggunakan keamanan berstandar industri dan autentikasi berbasis Supabase.
4. Hak Pengguna: Anda berhak melihat, mengunduh, atau menghapus (Delete Account) sebagian atau seluruh data Anda secara permanen.`,
  },
  terms: {
    titleKey: 'terms_of_service',
    icon: '📄',
    body: `Syarat dan Ketentuan Layanan

Selamat datang di 0Waste Shop Food. Dengan mendaftar, Anda menyetujui ketentuan berikut:

1. Platform: 0Waste adalah perantara marketplace. Kami menghubungkan partner (merchant/resto) dan pembeli untuk produk makanan surplus berlebih.
2. Keamanan Produk: Partner wajib memastikan seluruh makanan masih aman, higienis, dan layak konsumsi serta memasukkan keterangan 'Anti-Basi' dengan batas waktu yang akurat. 0Waste tidak bertanggung jawab atas keracunan atau kondisi produk pasca-transaksi.
3. Transaksi: Semua pesanan bersifat final jika sudah dikonfirmasi, kecuali status masih 'Menunggu' yang mana dapat dibatalkan.
4. Pelanggaran: Super Admin (Developer) berhak untuk secara permanen mencabut akses (suspend) pengguna, menghilangkan produk, atau menghapus entitas penjual tanpa pemberitahuan jika terbukti melanggar asas Circular Economy dan Keamanan Pangan 0Waste.`,
  },
  guidelines: {
    titleKey: 'community_guidelines',
    icon: '📋',
    body: `Pedoman Komunitas 0Waste

Demi menjaga keamanan ekosistem, mohon taati pedoman berikut:

1. Hormati Semua Pengguna: Tolak ukur utama platform kita adalah saling menghargai. 
2. Realisme Harga Surplus: Produk harus ditawarkan dengan potongan harga transparan dan logis. Kami memantau laporan manipulasi diskon.
3. Standar Kesehatan (Anti-Basi): Jangan menjual barang busuk, tidak layak makan, atau melewati masa ekspirasi yang berbahaya. Makanan harus terjaga kualitasnya hingga titik jemput.
4. Gunakan Chat Zera (AI): Asisten Zera dibuat untuk membantu pertanyaan awam terkait surplus makanan. Jangan mengirimkan data pribadi rahasia melalui chatbot.
5. Laporkan Laporan Palsu (Fraud): Segera laporkan melalui Chat Bantuan jika ada aktivitas fiktif.`,
  }
}

export default function Legal({ navigate, params }) {
  const { t } = useTranslation()
  const type = params?.type || 'privacy'
  const section = CONTENT[type] || CONTENT.privacy

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#ffffff' }}>
      {/* Header */}
      <div className="px-4 pt-14 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('profile')} className="p-1 -ml-1">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#1a1a2e" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="font-black text-lg" style={{ color: '#1a1a2e' }}>{t(section.titleKey)}</h1>
        </div>
      </div>

      <div className="flex-1 px-6 pt-2 pb-14 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6"
          style={{ background: 'rgba(62,201,118,0.1)' }}>
          {section.icon}
        </div>
        
        <div className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
          {section.body}
        </div>
      </div>

      {/* CTA Button */}
      <div className="p-6">
        <button
          onClick={() => navigate('profile')}
          className="w-full py-4 rounded-2xl font-bold text-white text-base"
          style={{ background: '#3ec976', boxShadow: '0 4px 16px rgba(62,201,118,0.4)' }}
        >
          {t('back')}
        </button>
      </div>
    </div>
  )
}
