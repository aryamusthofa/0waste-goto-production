import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useTimeLeft } from '../hooks/useTimeLeft'

// UI Atoms
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

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

  const urgencyVariant = urgency === 'critical' ? 'danger' : urgency === 'warning' ? 'warning' : 'success'
  const staggerClass = index < 6 ? `stagger-${index + 1}` : ''

  return (
    <Card
      padding="p-0"
      className={`relative overflow-hidden animate-slide-up ${staggerClass}`}
      onClick={() => navigate('product', { product })}
    >
      <div className="relative">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400'}
          alt={product.name}
          className={`w-full object-cover transition-all duration-700 ${product.profiles?.is_open === false ? 'grayscale brightness-75' : ''}`}
          style={{ height: 160 }}
          onError={e => e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400'}
        />
        {product.profiles?.is_open === false && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
            <Badge variant="dark" className="!bg-black/60 !text-white !text-[10px] !px-3 font-black tracking-widest uppercase">
              Toko Tutup
            </Badge>
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {discount > 0 && (
            <Badge variant="dark" className="px-2 py-0.5 bg-[#3ec976] !text-white !text-[9px]">
               -{discount}% {t('discount')}
            </Badge>
          )}
        </div>
        <div className="absolute top-2 right-2">
           {product.is_halal && (
             <Badge variant="success" className="px-2 py-0.5 !text-[9px]" icon="🕌">
               {t('halal')}
             </Badge>
           )}
        </div>
        {timeLeft && !isExpired && (
          <div className="absolute bottom-2 left-2">
            <Badge variant={urgencyVariant} className="px-2 py-0.5 !text-[9px]" icon="⏳">
              {timeLeft}
            </Badge>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <p className="font-black text-sm leading-tight mb-2 text-[#1a1a2e]" title={product.name}>
          {product.name.length > 32 ? product.name.slice(0, 31) + '…' : product.name}
        </p>
        
        <div className="flex flex-col gap-0.5 mb-3">
          <p className="font-black text-lg text-[#1a1a2e]">
            Rp {product.discount_price?.toLocaleString('id')}
          </p>
          {discount > 0 && (
            <p className="text-xs text-gray-400 line-through font-bold">
              Rp {product.original_price?.toLocaleString('id')}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <Badge variant="info" className="!px-2 !py-0.5 !text-[8px] !tracking-widest">
             {product.category || 'surplus'}
          </Badge>
          {product.status === 'sold_out' ? (
            <span className="text-[10px] text-red-500 font-black uppercase tracking-widest">{t('sold_out')}</span>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-[#3ec976]/10 flex items-center justify-center text-[#3ec976] font-black pointer-events-none">
              +
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

function SkeletonCard() {
  return (
    <Card padding="p-0" className="overflow-hidden animate-pulse">
      <div className="w-full bg-gray-100" style={{ height: 160 }}></div>
      <div className="p-4">
        <div className="h-4 bg-gray-100 rounded-lg w-3/4 mb-3"></div>
        <div className="h-6 bg-gray-50 rounded-lg w-1/2 mb-4"></div>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-50 rounded-lg w-1/4"></div>
          <div className="h-8 w-8 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    </Card>
  )
}

export default function Home({ navigate }) {
  const { t } = useTranslation()
  const { isDeveloper } = useAuth()
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [location, setLocation] = useState('Sudirman, JKT')

  useEffect(() => {
    const controller = new AbortController();
    
    // Safety timeout: 7 seconds to stop infinite loading
    const timeout = setTimeout(() => {
      setLoading(false)
      controller.abort()
    }, 7000)

    const load = async () => {
      setLoading(true)
      try {
        let query = supabase.from('products')
          .select('*, profiles(is_open, store_name)')
          .neq('status', 'sold_out')
          .order('created_at', { ascending: false })
          .abortSignal(controller.signal)
          
        if (search) query = query.ilike('name', `%${search}%`)
        
        const { data, error } = await query
        if (error) throw error
        setProducts(data || [])
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Supabase fetch products error:', err)
          setProducts([])
        }
      } finally {
        clearTimeout(timeout)
        setLoading(false)
      }
    }
    
    load()
    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [search])

  const filtered = activeCategory === 'all'
    ? products
    : activeCategory === 'new'
      ? [...products].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10)
      : products.filter(p => p.category?.toLowerCase() === activeCategory)

  const expiringSoon = products.filter(p => p.expiry_time).slice(0, 5)

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-[#F9FAFB]">
      {/* Header & Search */}
      <div className="px-6 pt-18 pb-6 bg-white rounded-b-[40px] shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 pl-0.5">
              📍 {t('delivery_location')}
            </span>
            <div 
              className="flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
              onClick={() => setShowLocationModal(true)}
            >
               <span className="font-black text-[22px] text-[#1a1a2e]">{location}</span>
               <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#1a1a2e" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
               </svg>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Card 
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-soft transition-transform active:scale-95"
              padding="p-0"
              style={{ background: 'rgba(62,201,118,0.12)', border: '2px solid rgba(62,201,118,0.2)' }}
              onClick={() => navigate('profile')}
            >
              🌿
            </Card>
            {isDeveloper && (
              <Badge variant="danger" className="!px-1.5 !py-0 !text-[8px] !font-black !tracking-tight">🛡️ ROOT</Badge>
            )}
          </div>
        </div>

        <Input 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('search_placeholder')}
          icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>}
          autoComplete="off"
        />
      </div>

      {/* Categories Bar */}
      <div className="px-6 py-5 sticky top-0 z-30 bg-[#F9FAFB]/80 backdrop-blur-md">
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className="px-5 py-2.5 rounded-[22px] whitespace-nowrap text-sm font-black transition-all duration-300 flex items-center gap-2"
              style={{
                background: activeCategory === cat.key ? '#3ec976' : 'white',
                color: activeCategory === cat.key ? 'white' : '#1a1a2e',
                boxShadow: activeCategory === cat.key ? '0 8px 24px rgba(62,201,118,0.25)' : '0 4px 12px rgba(0,0,0,0.03)',
              }}
            >
              <span className="text-lg">{cat.icon}</span>
              <span>{t(cat.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 flex flex-col gap-8">
        {/* Horizontal Sections */}
        {expiringSoon.length > 0 && activeCategory === 'all' && !search && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="font-black text-lg text-[#1a1a2e] flex items-center gap-2">
                <span className="text-xl">⏰</span> {t('expires_soon')}
              </h2>
              <button className="text-xs font-black uppercase tracking-widest text-[#3ec976]">{t('show_all')}</button>
            </div>
            <div className="flex gap-5 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1">
              {expiringSoon.map((product, idx) => (
                <Card
                  key={product.id}
                  padding="p-0"
                  className="flex-shrink-0 w-44 overflow-hidden"
                  onClick={() => navigate('product', { product })}
                >
                  <div className="relative">
                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=200'}
                      alt={product.name}
                      className={`w-full object-cover transition-all ${product.profiles?.is_open === false ? 'grayscale brightness-75' : ''}`}
                      style={{ height: 110 }}
                    />
                    <Badge variant="danger" className="absolute bottom-2 left-2 !px-2 !py-0.5 !text-[8px]">
                      Hampir Habis
                    </Badge>
                    {product.profiles?.is_open === false && (
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <span className="text-[7px] font-black text-white uppercase tracking-tighter bg-black/40 px-1.5 py-0.5 rounded-md">CLOSED</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-black text-[#1a1a2e] leading-tight mb-2">
                      {product.name.length > 20 ? product.name.slice(0, 19) + '…' : product.name}
                    </p>
                    <p className="text-sm font-black text-[#3ec976]">
                      Rp {product.discount_price?.toLocaleString('id')}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Home Feed Grid */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-black text-lg text-[#1a1a2e]">
              {activeCategory === 'all' ? '🌿 ' + t('all') : categories.find(c => c.key === activeCategory)?.icon + ' ' + t(activeCategory)}
            </h2>
            <Badge variant="info" className="!px-2 !py-0.5 !text-[9px]">
               {filtered.length} Items Nearby
            </Badge>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-5">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
              <div className="text-6xl mb-6">🏜️</div>
              <p className="text-gray-400 font-bold max-w-[200px]">
                {search ? 'Kami tidak menemukan apa pun untuk pencarian ini.' : 'Belum ada produk di kategori ini.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} navigate={navigate} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Location Picker Modal */}
      <Modal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        title="Ganti Lokasi Pengantaran"
      >
        <div className="flex flex-col gap-6">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Area Populer Jakarta</p>
           <div className="flex flex-col gap-2">
              {['Sudirman, JKT', 'Menteng, JKT', 'Kuningan, JKT', 'Senopati, JKT', 'Kemang, JKT'].map(loc => (
                <button
                  key={loc}
                  onClick={() => { setLocation(loc); setShowLocationModal(false) }}
                  className="w-full p-5 rounded-2xl flex items-center justify-between transition-all group"
                  style={{
                    background: location === loc ? '#3ec976' : '#F4F4F9',
                    color: location === loc ? 'white' : '#1a1a2e',
                  }}
                >
                  <span className="font-black text-sm">{loc}</span>
                  {location === loc && <span className="text-white">✓</span>}
                </button>
              ))}
           </div>
           
           <div className="mt-4 pt-6 border-t border-gray-50 flex flex-col gap-3">
              <Button
                variant="secondary"
                className="!h-14 !rounded-2xl !font-black !text-sm"
                onClick={() => setShowLocationModal(false)}
              >
                Tutup
              </Button>
           </div>
        </div>
      </Modal>
    </div>
  )
}
