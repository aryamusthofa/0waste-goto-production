import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useTimeLeft } from '../hooks/useTimeLeft'

function WishlistCard({ item, onRemove, navigate }) {
  const { t } = useTranslation()
  const product = item.products
  const { timeLeft, urgency, isExpired } = useTimeLeft(product?.expiry_time)
  const [removing, setRemoving] = useState(false)

  if (!product) return null

  const discount = product.original_price && product.discount_price
    ? Math.round(((product.original_price - product.discount_price) / product.original_price) * 100)
    : 0
  const urgencyColor = urgency === 'critical' ? '#ef4444' : urgency === 'warning' ? '#f59e0b' : '#3ec976'

  const handleRemove = async (e) => {
    e.stopPropagation()
    setRemoving(true)
    await onRemove(item.id)
  }

  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
      style={{
        background: '#fff',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        opacity: isExpired ? 0.6 : 1,
      }}
      onClick={() => navigate('product', { product })}
    >
      <div className="flex gap-0">
        {/* Image */}
        <div className="relative flex-shrink-0" style={{ width: 100 }}>
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=200'}
            alt={product.name}
            className="w-full object-cover"
            style={{ height: 100 }}
            onError={e => e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=200'}
          />
          {discount > 0 && (
            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-white text-[10px] font-black"
              style={{ background: '#3ec976' }}>
              -{discount}%
            </div>
          )}
          {isExpired && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.45)' }}>
              <span className="text-white text-xs font-bold">Kadaluarsa</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div>
            <p className="font-bold text-sm leading-tight mb-1 truncate" style={{ color: '#1a1a2e' }}>
              {product.name}
            </p>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {product.is_halal && (
                <span className="px-1.5 py-0.5 rounded text-white text-[10px] font-bold"
                  style={{ background: '#059669' }}>HALAL</span>
              )}
              {timeLeft && !isExpired && (
                <span className="px-1.5 py-0.5 rounded text-white text-[10px] font-bold"
                  style={{ background: urgencyColor }}>
                  ⏳ {timeLeft}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-sm" style={{ color: '#1a1a2e' }}>
                Rp {product.discount_price?.toLocaleString('id')}
              </span>
              {discount > 0 && (
                <span className="text-xs text-gray-400 line-through">
                  Rp {product.original_price?.toLocaleString('id')}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigate('checkout', { product, qty: 1 })
              }}
              disabled={isExpired || product.status === 'sold_out'}
              className="flex-1 py-1.5 rounded-xl text-white text-xs font-bold transition-opacity"
              style={{
                background: isExpired || product.status === 'sold_out' ? '#9ca3af' : '#3ec976',
              }}
            >
              {isExpired ? 'Kadaluarsa' : product.status === 'sold_out' ? t('sold_out') : t('add_to_bag')}
            </button>
            <button
              onClick={handleRemove}
              disabled={removing}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity"
              style={{ background: 'rgba(239,68,68,0.1)', opacity: removing ? 0.5 : 1 }}
            >
              {removing ? (
                <div className="w-3 h-3 rounded-full spinner"
                  style={{ border: '2px solid #ef4444', borderTopColor: 'transparent' }} />
              ) : (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Wishlist({ navigate }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('wishlists')
      .select('id, product_id, products(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (!error) setItems(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  const handleRemove = async (wishlistId) => {
    await supabase.from('wishlists').delete().eq('id', wishlistId)
    setItems(prev => prev.filter(i => i.id !== wishlistId))
  }

  const handleClearAll = async () => {
    if (!user) return
    await supabase.from('wishlists').delete().eq('user_id', user.id)
    setItems([])
  }

  if (!user) return (
    <div className="flex flex-col min-h-screen pb-28" style={{ background: '#F4F4F9' }}>
      <div className="px-4 pt-14 pb-4 bg-white">
        <h1 className="font-black text-xl" style={{ color: '#1a1a2e' }}>Wishlist</h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
        <div className="text-6xl">🔒</div>
        <p className="font-bold text-lg text-center" style={{ color: '#1a1a2e' }}>Login untuk melihat wishlist</p>
        <p className="text-gray-500 text-sm text-center">Simpan produk favorit kamu dan akses kapan saja.</p>
        <button onClick={() => navigate('login')}
          className="px-8 py-3 rounded-2xl font-bold text-white"
          style={{ background: '#3ec976' }}>
          Login Sekarang
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen pb-28" style={{ background: '#F4F4F9' }}>
      {/* Header */}
      <div className="px-4 pt-14 pb-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-black text-xl" style={{ color: '#1a1a2e' }}>Wishlist</h1>
            {items.length > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">{items.length} item tersimpan</p>
            )}
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl"
              style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}
            >
              Hapus Semua
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 pt-20">
            <div className="w-10 h-10 rounded-full spinner"
              style={{ border: '3px solid #3ec976', borderTopColor: 'transparent' }} />
            <p className="text-sm text-gray-400">Memuat wishlist...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 pt-16 px-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
              style={{ background: 'rgba(62,201,118,0.1)' }}>❤️</div>
            <p className="font-bold text-lg text-center" style={{ color: '#1a1a2e' }}>Wishlist Kamu Kosong</p>
            <p className="text-gray-500 text-sm text-center leading-relaxed">
              Tap ikon hati di halaman produk untuk menyimpan produk favoritmu.
            </p>
            <button onClick={() => navigate('home')}
              className="px-8 py-3 rounded-2xl font-bold text-white mt-2"
              style={{ background: '#3ec976', boxShadow: '0 4px 16px rgba(62,201,118,0.35)' }}>
              Jelajahi Produk
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map(item => (
              <WishlistCard
                key={item.id}
                item={item}
                onRemove={handleRemove}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
