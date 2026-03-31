import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useTimeLeft } from '../hooks/useTimeLeft'
import { supabase } from '../lib/supabase'

export default function ProductDetail({ navigate, params }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const product = params?.product
  const { timeLeft, urgency } = useTimeLeft(product?.expiry_time)
  const [expanded, setExpanded] = useState(null)
  const [qty, setQty] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
  const [wishlistId, setWishlistId] = useState(null)
  const [wishlistLoading, setWishlistLoading] = useState(false)

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
    if (!user) { navigate('login'); return }
    setWishlistLoading(true)
    try {
      if (wishlisted && wishlistId) {
        await supabase.from('wishlists').delete().eq('id', wishlistId)
        setWishlisted(false); setWishlistId(null)
      } else {
        const { data } = await supabase
          .from('wishlists')
          .insert({ user_id: user.id, product_id: product.id })
          .select('id').single()
        setWishlisted(true); setWishlistId(data?.id)
      }
    } catch (e) {
      console.error('Wishlist error:', e)
    } finally {
      setWishlistLoading(false)
    }
  }

  const discount = product?.original_price && product?.discount_price
    ? Math.round(((product.original_price - product.discount_price) / product.original_price) * 100)
    : 0
  const urgencyColor = urgency === 'critical' ? '#ef4444' : urgency === 'warning' ? '#f59e0b' : '#3ec976'

  if (!product) return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <p className="text-gray-500">Produk tidak ditemukan.</p>
      <button onClick={() => navigate('home')} className="mt-4 font-bold" style={{ color: '#3ec976' }}>
        Kembali
      </button>
    </div>
  )

  const sections = [
    { key: 'provenance', label: t('provenance'), content: `Produk ini berasal dari mitra terverifikasi 0waste. Diproduksi secara higienis dan sudah melalui pemeriksaan keamanan Anti-Basi.` },
    { key: 'shipping', label: t('shipping_returns'), content: `• ${t('carbon_neutral')}\n• ${t('day_return')}\n• ${t('safety_badge')}` },
    { key: 'reviews', label: t('reviews'), content: `⭐⭐⭐⭐⭐ "Produk segar dan berkualitas!" — Pelanggan Terverifikasi\n⭐⭐⭐⭐ "Pengiriman cepat, kemasan rapi." — Pembeli Terpercaya` },
  ]

  return (
    <div className="flex flex-col min-h-screen pb-28" style={{ background: '#ffffff' }}>
      {/* Image */}
      <div className="relative">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600'}
          alt={product.name}
          className="w-full object-cover"
          style={{ height: 280 }}
          onError={e => e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600'}
        />
        <div className="absolute inset-0 glass-dark pointer-events-none" style={{ height: 120 }}></div>
        {/* Back button */}
        <button
          onClick={() => navigate('home')}
          className="absolute top-12 left-4 w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)' }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#ffffff" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {/* Wishlist button */}
        <button
          onClick={toggleWishlist}
          disabled={wishlistLoading}
          className="absolute top-12 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)' }}
        >
          {wishlistLoading ? (
            <div className="w-4 h-4 rounded-full spinner"
              style={{ border: '2px solid #ffffff', borderTopColor: 'transparent' }} />
          ) : (
            <svg width="20" height="20" fill={wishlisted ? '#ef4444' : 'rgba(0,0,0,0.4)'} viewBox="0 0 24 24"
              stroke={wishlisted ? '#ef4444' : '#ffffff'} strokeWidth={wishlisted ? 0 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>
        {discount > 0 && (
          <div className="absolute bottom-4 left-4 px-3 py-1 rounded-xl text-white text-sm font-black"
            style={{ background: '#3ec976' }}>
            -{discount}% OFF
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-6 bg-white relative -mt-6 rounded-t-3xl shadow-float animate-slide-up stagger-1 pb-10">
        <h1 className="text-[22px] leading-tight font-black mb-2" style={{ color: '#1a1a2e' }}>{product.name}</h1>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-5">
          {product.is_halal && (
            <span className="px-2.5 py-1 rounded-xl text-white text-xs font-bold"
              style={{ background: '#059669' }}>{t('halal')}</span>
          )}
          <span className="px-2.5 py-1 rounded-xl text-white text-xs font-bold flex items-center gap-1 shadow-soft"
            style={{ background: '#1a1a2e' }}>
            🛡️ {t('anti_basi_verified')}
          </span>
          {timeLeft && (
            <span className="px-2.5 py-1 rounded-xl text-white text-xs font-bold shadow-soft"
              style={{ background: urgencyColor }}>
              ⏳ {timeLeft} {t('left')}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3 mb-1 animate-slide-up stagger-2">
          <span className="text-[28px] font-black" style={{ color: '#1a1a2e' }}>
            Rp {product.discount_price?.toLocaleString('id')}
          </span>
          {discount > 0 && (
            <span className="text-base text-gray-400 line-through">
              Rp {product.original_price?.toLocaleString('id')}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-4">Stok: {product.quantity || product.stock || 1} tersisa</p>

        {product.description && (
          <p className="text-[15px] text-gray-600 leading-relaxed mb-6 animate-slide-up stagger-3">{product.description}</p>
        )}

        {/* Qty selector */}
        <div className="flex items-center justify-between p-4 rounded-2xl mb-6 shadow-soft animate-slide-up stagger-3" style={{ background: '#F9FAFB' }}>
          <span className="text-sm font-bold text-gray-700">Jumlah Pembelian</span>
          <div className="flex items-center gap-4 bg-white p-1 rounded-xl shadow-sm">
            <button onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-xl hover:bg-gray-50 active:scale-95 transition-all"
              style={{ color: '#1a1a2e' }}>−</button>
            <span className="font-black text-lg w-6 text-center">{qty}</span>
            <button onClick={() => setQty(q => q + 1)}
              className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-xl active:scale-95 transition-all"
              style={{ background: '#3ec976', color: '#fff', boxShadow: '0 2px 8px rgba(62,201,118,0.3)' }}>+</button>
          </div>
        </div>

        {/* Expandable sections */}
        {sections.map(section => (
          <div key={section.key} className="border-t border-gray-100">
            <button
              className="w-full flex items-center justify-between py-4 text-left"
              onClick={() => setExpanded(expanded === section.key ? null : section.key)}
            >
              <span className="font-semibold text-sm" style={{ color: '#1a1a2e' }}>{section.label}</span>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={2}
                style={{ transform: expanded === section.key ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expanded === section.key && (
              <p className="text-sm text-gray-500 pb-4 whitespace-pre-line leading-relaxed">{section.content}</p>
            )}
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-8 pt-4 glass-panel z-50">
        <button
          onClick={() => {
            if (!user) { navigate('login'); return }
            navigate('checkout', { product, qty })
          }}
          className="w-full py-4 rounded-2xl font-bold text-white text-base"
          style={{
            background: product.status === 'sold_out' ? '#9ca3af' : '#3ec976',
            boxShadow: product.status !== 'sold_out' ? '0 4px 16px rgba(62,201,118,0.4)' : 'none',
          }}
          disabled={product.status === 'sold_out'}
        >
          {product.status === 'sold_out'
            ? t('sold_out')
            : `${t('add_to_bag')} — Rp ${(product.discount_price * qty)?.toLocaleString('id')}`}
        </button>
      </div>
    </div>
  )
}
