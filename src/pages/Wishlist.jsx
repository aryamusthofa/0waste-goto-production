import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useTimeLeft } from '../hooks/useTimeLeft'

// UI Atoms
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

function WishlistCard({ item, onRemove, navigate }) {
  const { t } = useTranslation()
  const { show } = useToast()
  const product = item.products
  const { timeLeft, urgency, isExpired } = useTimeLeft(product?.expiry_time)
  const [removing, setRemoving] = useState(false)

  if (!product) return null

  const discount = product.original_price && product.discount_price
    ? Math.round(((product.original_price - product.discount_price) / product.original_price) * 100)
    : 0

  const handleRemove = async (e) => {
    e.stopPropagation()
    setRemoving(true)
    try {
      await onRemove(item.id)
      show('Produk dihapus dari wishlist.', 'info')
    } catch (e) {
      show('Gagal menghapus produk.', 'error')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <Card 
      padding="p-0" 
      className={`overflow-hidden cursor-pointer active:scale-[0.98] transition-transform duration-300 border-2 ${isExpired ? 'opacity-60 grayscale border-transparent' : 'border-white hover:border-[#3ec976]/20'}`}
      onClick={() => navigate('product', { product })}
    >
      <div className="flex gap-0 h-[120px]">
        {/* Image Section */}
        <div className="relative w-[120px] flex-shrink-0 bg-gray-50 h-full">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=300'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={e => e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=300'}
          />
          {discount > 0 && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-white text-[10px] font-black shadow-sm"
              style={{ background: '#3ec976' }}>
              -{discount}%
            </div>
          )}
          {isExpired && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <span className="text-white text-[10px] font-black uppercase tracking-widest">Kadaluarsa</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div className="flex flex-col gap-1.5">
             <div className="flex justify-between items-start gap-2">
                <h3 className="font-black text-sm text-[#1a1a2e] leading-snug line-clamp-1 flex-1 uppercase tracking-tight">
                  {product.name}
                </h3>
                <button
                  onClick={handleRemove}
                  disabled={removing}
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90 bg-red-50 hover:bg-red-100"
                >
                  {removing ? (
                    <div className="w-3 h-3 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                  ) : (
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
             </div>

             <div className="flex items-center gap-2">
                {product.is_halal && <Badge variant="success" className="!px-1.5 !py-0 !text-[8px]">HALAL</Badge>}
                {timeLeft && !isExpired && (
                   <Badge variant={urgency === 'critical' ? 'danger' : urgency === 'warning' ? 'warning' : 'success'} className="!px-1.5 !py-0 !text-[8px] animate-pulse">
                      ⏳ {timeLeft}
                   </Badge>
                )}
             </div>

             <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-black text-base text-[#1a1a2e]">
                  Rp {product.discount_price?.toLocaleString('id')}
                </span>
                {discount > 0 && (
                  <span className="text-[10px] text-gray-400 font-bold line-through">
                    Rp {product.original_price?.toLocaleString('id')}
                  </span>
                )}
             </div>
          </div>

          <Button 
            className="!h-8 !rounded-xl !text-[10px] !uppercase !tracking-widest !font-black mt-2"
            disabled={isExpired || product.status === 'sold_out'}
            onClick={(e) => {
              e.stopPropagation()
              navigate('checkout', { product, qty: 1 })
            }}
          >
             {isExpired ? 'Kadaluarsa' : product.status === 'sold_out' ? t('sold_out') : t('add_to_bag')}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function Wishlist({ navigate }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { show } = useToast()
  
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('id, product_id, products(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (!error) setItems(data || [])
    } catch (e) {
      show('Gagal memuat wishlist.', 'error')
    } finally {
      setLoading(false)
    }
  }, [user, show])

  useEffect(() => { load() }, [load])

  const handleRemove = async (wishlistId) => {
    await supabase.from('wishlists').delete().eq('id', wishlistId)
    setItems(prev => prev.filter(i => i.id !== wishlistId))
  }

  const handleClearAll = async () => {
    if (!user || items.length === 0) return
    if (window.confirm('Hapus semua item dari wishlist?')) {
      try {
        await supabase.from('wishlists').delete().eq('user_id', user.id)
        setItems([])
        show('Wishlist dikosongkan.', 'info')
      } catch (e) {
        show('Gagal mengosongkan wishlist.', 'error')
      }
    }
  }

  if (!user) return (
    <div className="flex flex-col min-h-screen items-center justify-center p-8 bg-[#F9FAFB] text-center">
       <div className="text-7xl mb-8 animate-pop-in">🔒</div>
       <h2 className="text-2xl font-black text-[#1a1a2e] mb-2 leading-tight">Wishlist Terkunci</h2>
       <p className="text-gray-400 font-medium mb-12 max-w-[240px]">Masuk untuk menyimpan produk favorit dan akses kapan saja.</p>
       <Button onClick={() => navigate('login')} className="max-w-[220px]">Sign In Sekarang</Button>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-[#F9FAFB]">
      {/* Header */}
      <div className="px-6 pt-16 pb-8 bg-white rounded-b-[40px] shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-[26px] font-black text-[#1a1a2e] leading-tight">Favorit Kamu</h1>
            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{items.length} Item Tersimpan</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
            >
              Hapus Semua
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pt-10 flex flex-col gap-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 pt-20">
             <div className="w-12 h-12 border-4 border-[#3ec976]/20 border-t-[#3ec976] rounded-full animate-spin" />
             <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest animate-pulse">Sinkronisasi Wishlist...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-6 pt-16 bg-white rounded-[40px] p-10 shadow-soft">
            <div className="text-7xl animate-pop-in">❤️</div>
            <div>
              <h2 className="text-xl font-black text-[#1a1a2e]">Masih Kosong</h2>
              <p className="text-xs font-bold text-gray-400 mt-2 leading-relaxed uppercase tracking-wide">Tap ikon hati di halaman produk untuk menyimpan barang favoritmu.</p>
            </div>
            <Button onClick={() => navigate('home')} className="mt-4">Jelajahi Produk</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 animate-fade-in">
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
