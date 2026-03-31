import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useTimeLeft } from '../hooks/useTimeLeft'

const categories = [
  { key: 'all', labelKey: 'all', icon: '🌿' },
  { key: 'new', labelKey: 'new', icon: '✨' },
  { key: 'eco_deals', labelKey: 'eco_deals', icon: '♻️' },
  { key: 'bakery', labelKey: 'bakery', icon: '🍞' },
  { key: 'fruits', labelKey: 'fruits', icon: '🍎' },
  { key: 'meat', labelKey: 'meat', icon: '🥩' },
  { key: 'fish', labelKey: 'fish', icon: '🐟' },
  { key: 'vegetables', labelKey: 'vegetables', icon: '🥦' },
  { key: 'dairy', labelKey: 'dairy', icon: '🥛' },
]

function ProductCard({ product, index = 0, navigate }) {
  const { t } = useTranslation()
  const { timeLeft, isExpired, urgency } = useTimeLeft(product.expiry_time)
  const discount = product.original_price && product.discount_price
    ? Math.round(((product.original_price - product.discount_price) / product.original_price) * 100)
    : 0

  const urgencyColor = urgency === 'critical' ? '#ef4444' : urgency === 'warning' ? '#f59e0b' : '#3ec976'
  const staggerClass = index < 5 ? `stagger-${index + 1}` : ''

  return (
    <div
      className={`rounded-3xl overflow-hidden animate-slide-up ${staggerClass} cursor-pointer hover:scale-[1.02] shadow-soft transition-all duration-300`}
      style={{ background: '#fff' }}
      onClick={() => navigate('product', { product })}
    >
      <div className="relative">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400'}
          alt={product.name}
          className="w-full object-cover"
          style={{ height: 140 }}
          onError={e => e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400'}
        />
        {discount > 0 && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-white text-xs font-black"
            style={{ background: '#3ec976' }}>
            -{discount}% {t('discount')}
          </div>
        )}
        {product.is_halal && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-white text-[10px] font-black"
            style={{ background: '#059669' }}>
            {t('halal')}
          </div>
        )}
        {timeLeft && !isExpired && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg text-white text-xs font-bold flex items-center gap-1"
            style={{ background: urgencyColor }}>
            ⏳ {timeLeft}
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-bold text-sm leading-tight mb-1" style={{ color: '#1a1a2e' }}
          title={product.name}>
          {product.name.length > 28 ? product.name.slice(0, 27) + '…' : product.name}
        </p>
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="font-black text-base" style={{ color: '#1a1a2e' }}>
            Rp {product.discount_price?.toLocaleString('id')}
          </span>
          {discount > 0 && (
            <span className="text-xs text-gray-400 line-through">
              Rp {product.original_price?.toLocaleString('id')}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">🏷️ {product.category || 'surplus'}</span>
          {product.status === 'sold_out' ? (
            <span className="text-xs text-red-400 font-semibold">{t('sold_out')}</span>
          ) : (
            <button
              className="px-3 py-1.5 rounded-xl text-white text-xs font-bold"
              style={{ background: '#3ec976' }}
              onClick={e => { e.stopPropagation(); navigate('product', { product }) }}
            >
              {t('add_to_cart')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Home({ navigate }) {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => { controller.abort() }, 3000);

    const load = async () => {
      setLoading(true)
      try {
        let query = supabase.from('products').select('*').neq('status', 'sold_out').order('created_at', { ascending: false }).abortSignal(controller.signal)
        if (search) query = query.ilike('name', `%${search}%`)
        const { data, error } = await query

        if (error) {
          console.error('Supabase fetch products error:', error)
        }
        setProducts(data || [])
      } catch (err) {
        console.error('Crash in fetching products:', err)
        setProducts([])
      } finally {
        clearTimeout(timeout)
        setLoading(false)
      }
    }
    load()
    return () => { clearTimeout(timeout); controller.abort(); }
  }, [search])

  const filtered = activeCategory === 'all'
    ? products
    : activeCategory === 'new'
      ? [...products].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10)
      : products.filter(p => p.category?.toLowerCase() === activeCategory)

  const expiringSoon = products.filter(p => p.expiry_time).slice(0, 4)

  return (
    <div className="flex flex-col min-h-screen pb-28" style={{ background: '#F4F4F9' }}>
      {/* Header */}
      <div className="px-4 pt-14 pb-4" style={{ background: '#ffffff' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400 font-medium tracking-wide mb-0.5">📍 {t('delivery_location')}</p>
            <p className="font-black text-lg" style={{ color: '#1a1a2e' }}>Jakarta Selatan</p>
          </div>
          <div className="w-12 h-12 rounded-[20px] overflow-hidden flex items-center justify-center text-xl shadow-soft"
            style={{ background: 'rgba(62,201,118,0.15)', border: '2px solid rgba(62,201,118,0.4)' }}>
            🌿
          </div>
        </div>
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full pl-10 pr-4 text-sm outline-none"
            style={{
              height: 44, background: '#F4F4F9', borderRadius: 22,
              border: 'none', color: '#1a1a2e'
            }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="flex gap-3 overflow-x-auto no-scrollbar snap-carousel py-1">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className="snap-start flex items-center gap-1.5 px-4 py-2 rounded-[20px] whitespace-nowrap text-sm font-bold flex-shrink-0 transition-all duration-300 hover:scale-105"
              style={{
                background: activeCategory === cat.key ? '#3ec976' : '#F4F4F9',
                color: activeCategory === cat.key ? '#fff' : '#6b7280',
                boxShadow: activeCategory === cat.key ? '0 4px 16px rgba(62,201,118,0.3)' : 'none',
              }}
            >
              <span>{cat.icon}</span>
              <span>{t(cat.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 pt-4">
        {/* Expires Soon section */}
        {expiringSoon.length > 0 && activeCategory === 'all' && !search && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black text-base" style={{ color: '#1a1a2e' }}>
                ⏰ {t('expires_soon')}
              </h2>
              <button className="text-xs font-semibold" style={{ color: '#3ec976' }}>{t('show_all')}</button>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar snap-carousel pb-3 pt-1">
              {expiringSoon.map((product, idx) => (
                <div
                  key={product.id}
                  onClick={() => navigate('product', { product })}
                  className={`snap-start flex-shrink-0 w-40 rounded-[24px] overflow-hidden cursor-pointer hover:scale-105 shadow-soft transition-all duration-300 animate-slide-up ${idx < 5 ? `stagger-${idx + 1}` : ''}`}
                  style={{ background: '#fff' }}
                >
                  <div className="relative">
                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=200'}
                      alt={product.name}
                      className="w-full object-cover"
                      style={{ height: 90 }}
                      onError={e => e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=200'}
                    />
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-lg text-white text-[10px] font-bold"
                      style={{ background: '#ef4444' }}>
                      Hampir Habis
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-bold leading-tight mb-1" style={{ color: '#1a1a2e' }}>
                      {product.name.length > 18 ? product.name.slice(0, 17) + '…' : product.name}
                    </p>
                    <p className="text-xs font-black" style={{ color: '#3ec976' }}>
                      Rp {product.discount_price?.toLocaleString('id')}
                    </p>
                    <button
                      className="mt-1.5 w-full py-1 rounded-lg text-white text-[11px] font-bold"
                      style={{ background: '#3ec976' }}
                      onClick={e => { e.stopPropagation(); navigate('product', { product }) }}
                    >
                      {t('add_to_cart')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main grid */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-base" style={{ color: '#1a1a2e' }}>
            {activeCategory === 'all' ? '🌿 Semua Produk' : `${categories.find(c => c.key === activeCategory)?.icon} ${t(activeCategory)}`}
          </h2>
          <span className="text-xs text-gray-400">{filtered.length} item</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-3 border-t-transparent rounded-full spinner"
              style={{ border: '3px solid #3ec976', borderTopColor: 'transparent' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🌿</div>
            <p className="text-gray-500 font-medium">
              {search ? 'Tidak ada produk ditemukan.' : 'Belum ada produk di kategori ini.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} navigate={navigate} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
