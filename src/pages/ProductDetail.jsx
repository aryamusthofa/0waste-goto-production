import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useTimeLeft } from '../hooks/useTimeLeft'
import { supabase } from '../lib/supabase'

// UI Atoms
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'

export default function ProductDetail({ navigate, params }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { show } = useToast()
  
  const product = params?.product
  const { timeLeft, urgency } = useTimeLeft(product?.expiry_time)
  
  const [expanded, setExpanded] = useState(null)
  const [qty, setQty] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
  const [wishlistId, setWishlistId] = useState(null)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('fraud')
  const [reportDetails, setReportDetails] = useState('')
  const [reporting, setReporting] = useState(false)

  useEffect(() => {
    if (!user || !product?.id) return
    supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) { setWishlisted(true); setWishlistId(data.id) }
      })
  }, [user, product?.id])

  const toggleWishlist = async () => {
    if (!user) { show('Silakan login untuk memfavoritkan produk.', 'warning'); navigate('login'); return }
    setWishlistLoading(true)
    try {
      if (wishlisted && wishlistId) {
        await supabase.from('wishlists').delete().eq('id', wishlistId)
        setWishlisted(false); setWishlistId(null)
        show('Dihapus dari wishlist', 'success')
      } else {
        const { data } = await supabase
          .from('wishlists')
          .insert({ user_id: user.id, product_id: product.id })
          .select('id').single()
        setWishlisted(true); setWishlistId(data?.id)
        show('Ditambahkan ke wishlist', 'success')
      }
    } catch (e) {
      show('Gagal memperbarui wishlist', 'error')
    } finally {
      setWishlistLoading(false)
    }
  }

  const handleReport = async () => {
    if (!user) { navigate('login'); return }
    setReporting(true)
    try {
      const { data, error } = await supabase.rpc('submit_report', {
        p_type: 'product',
        p_target: product.id,
        p_reason: reportReason,
        p_details: reportDetails
      })
      if (error) throw error
      show('Laporan berhasil dikirim. Terima kasih!', 'success')
      setShowReport(false)
    } catch (e) {
      show('Gagal mengirim laporan: ' + e.message, 'error')
    } finally {
      setReporting(false)
    }
  }

  const discount = product?.original_price && product?.discount_price
    ? Math.round(((product.original_price - product.discount_price) / product.original_price) * 100)
    : 0
  const urgencyColor = urgency === 'critical' ? 'danger' : urgency === 'warning' ? 'warning' : 'success'

  if (!product) return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-white">
      <div className="text-6xl mb-4">🌿</div>
      <p className="text-gray-400 font-medium font-bold text-center">Produk tidak ditemukan atau akses tidak valid.</p>
      <Button variant="secondary" onClick={() => navigate('home')} className="mt-8">
        Kembali ke Beranda
      </Button>
    </div>
  )

  const sections = [
    { key: 'provenance', label: t('provenance'), content: `Produk ini berasal dari mitra terverifikasi 0Waste. Diproduksi secara higienis dan sudah melalui pemeriksaan keamanan Anti-Basi.` },
    { key: 'shipping', label: t('shipping_returns'), content: `• ${t('carbon_neutral')}\n• ${t('day_return')}\n• ${t('safety_badge')}` },
    { key: 'reviews', label: t('reviews'), content: `⭐⭐⭐⭐⭐ "Produk segar dan berkualitas!" — Pelanggan Terverifikasi\n⭐⭐⭐⭐ "Pengiriman cepat, kemasan rapi." — Pembeli Terpercaya` },
  ]

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-white">
      {/* Image Overlay */}
      <div className="relative">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600'}
          alt={product.name}
          className="w-full object-cover"
          style={{ height: 320 }}
          onError={e => e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600'}
        />
        <div className="absolute inset-0 glass-dark pointer-events-none" style={{ height: 140 }}></div>
        
        {/* Back button */}
        <button
          onClick={() => navigate('home')}
          className="absolute top-12 left-4 w-11 h-11 rounded-[18px] flex items-center justify-center transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#ffffff" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Wishlist button */}
        <button
          onClick={toggleWishlist}
          disabled={wishlistLoading}
          className="absolute top-12 right-4 w-11 h-11 rounded-[18px] flex items-center justify-center transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          {wishlistLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg width="22" height="22" fill={wishlisted ? '#ef4444' : 'rgba(0,0,0,0.4)'} viewBox="0 0 24 24"
              stroke={wishlisted ? '#ef4444' : '#ffffff'} strokeWidth={wishlisted ? 0 : 2.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>

        {discount > 0 && (
          <div className="absolute bottom-6 left-5">
             <Badge variant="dark" className="px-3 py-1 bg-[#3ec976] !text-white text-sm">
                -{discount}% OFF
             </Badge>
          </div>
        )}
      </div>

      {/* Main Content Card */}
      <div className="flex-1 px-6 pt-8 bg-white relative -mt-8 rounded-t-[40px] shadow-[0_-12px_32px_rgba(0,0,0,0.06)] animate-slide-up">
        <h1 className="text-[26px] leading-tight font-black mb-3" style={{ color: '#1a1a2e' }}>{product.name}</h1>

        {/* Status Badges Row */}
        <div className="flex flex-wrap gap-2.5 mb-6">
          {product.is_halal && <Badge variant="success" icon="🕌">{t('halal')}</Badge>}
          <Badge variant="dark" icon="🛡️">{t('anti_basi_verified')}</Badge>
          {timeLeft && (
            <Badge variant={urgencyColor} icon="⏳">
              {timeLeft} {t('left')}
            </Badge>
          )}
        </div>

        {/* Pricing & Stock */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-baseline gap-3">
            <span className="text-[30px] font-black tracking-tight" style={{ color: '#1a1a2e' }}>
              Rp {product.discount_price?.toLocaleString('id')}
            </span>
            {discount > 0 && (
              <span className="text-base text-gray-400 line-through font-bold">
                Rp {product.original_price?.toLocaleString('id')}
              </span>
            )}
          </div>
          <div className="text-right">
             <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{t('quantity')}</p>
             <p className="text-sm font-bold text-[#1a1a2e]">{product.quantity || 1} {t('left')}</p>
          </div>
        </div>

        <p className="text-[16px] text-gray-600 leading-relaxed mb-8">{product.description || 'Tidak ada deskripsi tersedia.'}</p>

        {/* Interaction Controls */}
        <div className="flex items-center justify-between p-4 bg-[#F4F4F9] rounded-[28px] mb-8 shadow-soft">
           <span className="text-sm font-black text-[#1a1a2e] ml-2">Jumlah Pembelian</span>
           <div className="flex items-center gap-4 bg-white p-1 rounded-2xl shadow-sm">
              <button 
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-11 h-11 rounded-[18px] flex items-center justify-center font-black text-2xl text-[#1a1a2e] active:scale-95 transition-all hover:bg-gray-50"
              >−</button>
              <span className="font-black text-xl w-6 text-center">{qty}</span>
              <button 
                onClick={() => setQty(q => q + 1)}
                className="w-11 h-11 rounded-[18px] flex items-center justify-center font-black text-2xl text-white active:scale-95 transition-all"
                style={{ background: '#3ec976', boxShadow: '0 4px 12px rgba(62,201,118,0.3)' }}
              >+</button>
           </div>
        </div>

        {/* Information Sections */}
        <div className="flex flex-col mb-10 overflow-hidden">
           {sections.map((section, idx) => (
             <div key={section.key} className={`border-t border-gray-100 ${idx === sections.length - 1 ? 'border-b' : ''}`}>
                <button
                  className="w-full flex items-center justify-between py-5 text-left active:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(expanded === section.key ? null : section.key)}
                >
                  <span className="font-bold text-[15px] text-[#1a1a2e]">{section.label}</span>
                  <svg 
                    width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={2.5}
                    className={`transition-transform duration-300 ${expanded === section.key ? 'rotate-180' : ''}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expanded === section.key && (
                  <div className="animate-slide-up pb-5">
                     <p className="text-sm text-gray-400 whitespace-pre-line leading-relaxed font-medium">{section.content}</p>
                  </div>
                )}
             </div>
           ))}
        </div>

        {/* Report Block */}
        <Card 
          glass 
          padding="p-4" 
          className="mb-12 border border-red-50 cursor-pointer"
          onClick={() => setShowReport(true)}
        >
          <div className="flex items-center gap-3">
             <span className="text-xl">⚠️</span>
             <div className="flex-1">
                <p className="text-xs font-black text-[#1a1a2e] uppercase tracking-wide">Pemberitahuan Masalah</p>
                <p className="text-[11px] font-bold text-red-500 mt-0.5">Beritahu kami jika produk tidak sesuai standar keamanan.</p>
             </div>
             <span className="text-gray-300 text-xl font-black">›</span>
          </div>
        </Card>
      </div>

      {/* Floating Action CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-5 pb-10 bg-white shadow-[0_-12px_40px_rgba(0,0,0,0.1)] z-50 rounded-t-[40px]">
        <Button
          onClick={() => {
            if (!user) { navigate('login'); return }
            navigate('checkout', { product, qty })
          }}
          loading={false}
          disabled={product.status === 'sold_out'}
        >
          {product.status === 'sold_out' 
            ? t('sold_out') 
            : `${t('add_to_bag')} — Rp ${(product.discount_price * qty)?.toLocaleString('id')}`}
        </Button>
      </div>

      {/* Report Modal Integration */}
      <Modal 
        isOpen={showReport} 
        onClose={() => setShowReport(false)} 
        title="Laporkan Masalah"
      >
        <div className="flex flex-col gap-6">
           <p className="text-sm font-medium text-gray-400 leading-relaxed">
             Privasi kamu terjaga. Laporan ini akan membantu ekosistem 0Waste (Food) tetap aman bagi semua pengguna.
           </p>

           <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'fraud', label: 'Penipuan' },
                { id: 'bad_quality', label: 'Kualitas Buruk' },
                { id: 'wrong_category', label: 'Salah Kategori' },
                { id: 'other', label: 'Lainnya' }
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => setReportReason(r.id)}
                  className="py-3 px-4 rounded-2xl text-sm font-bold transition-all border-2"
                  style={{
                    borderColor: reportReason === r.id ? '#3ec976' : '#F4F4F9',
                    background: reportReason === r.id ? 'rgba(62,201,118,0.06)' : '#F4F4F9',
                    color: reportReason === r.id ? '#3ec976' : '#6b7280'
                  }}
                >
                  {r.label}
                </button>
              ))}
           </div>

           <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Detail Masalah</label>
              <textarea
                value={reportDetails}
                onChange={e => setReportDetails(e.target.value)}
                rows={4}
                placeholder="Misal: Rasa asam, bau tidak sedap, porsi tidak sesuai deskripsi..."
                className="w-full p-5 bg-[#F4F4F9] rounded-[24px] font-bold text-sm outline-none border-[1.5px] border-transparent focus:border-[#3ec976] transition-all resize-none shadow-inner"
              />
           </div>

           <Button 
             variant="danger" 
             onClick={handleReport} 
             loading={reporting}
           >
             Kirim Laporan Resmi
           </Button>
        </div>
      </Modal>
    </div>
  )
}
