import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const STATUS = {
  pending:   { bg: 'rgba(245,158,11,0.1)',  color: '#b45309', label: '⏳ Menunggu',   canCancel: true  },
  completed: { bg: 'rgba(62,201,118,0.1)',  color: '#15803d', label: '✅ Selesai',    canCancel: false },
  cancelled: { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626', label: '❌ Dibatalkan', canCancel: false },
}

function OrderCard({ order, onCancel }) {
  const { t } = useTranslation()
  const s = STATUS[order.status] || STATUS.pending
  const [cancelling, setCancelling] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const handleCancel = async () => {
    if (!confirmCancel) { setConfirmCancel(true); return }
    setCancelling(true)
    await onCancel(order.id)
    setCancelling(false)
    setConfirmCancel(false)
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      {/* Status bar */}
      <div className="px-4 py-2 flex items-center justify-between"
        style={{ background: s.bg }}>
        <span className="text-xs font-bold" style={{ color: s.color }}>{s.label}</span>
        <span className="text-xs text-gray-400">
          {new Date(order.created_at).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })}
        </span>
      </div>

      {/* Product info */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <img
            src={order.products?.image_url || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=80'}
            alt={order.products?.name}
            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
            onError={e => e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=80'}
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-tight truncate" style={{ color: '#1a1a2e' }}>
              {order.products?.name || 'Produk dihapus'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {order.method === 'pickup' ? '🏪 Pickup' : '🛵 Delivery'}
              {' · '}
              {order.payment_method === 'digital' ? '💳 Digital' : '💵 COD'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="font-black text-base" style={{ color: '#1a1a2e' }}>
                Rp {order.total_price?.toLocaleString('id')}
              </span>
              {order.products?.is_halal && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white"
                  style={{ background: '#059669' }}>HALAL</span>
              )}
            </div>
          </div>
        </div>

        {/* Order ID */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 font-mono">
            ID: #{order.id?.slice(0, 18)}...
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          {/* Cancel — hanya jika pending */}
          {s.canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
              style={{
                background: confirmCancel ? 'rgba(239,68,68,0.12)' : '#F4F4F9',
                color: confirmCancel ? '#dc2626' : '#6b7280',
                border: confirmCancel ? '1.5px solid rgba(239,68,68,0.3)' : '1.5px solid transparent',
              }}
            >
              {cancelling ? (
                <div className="w-3 h-3 rounded-full spinner"
                  style={{ border: '2px solid #dc2626', borderTopColor: 'transparent' }} />
              ) : confirmCancel ? '⚠️ Tap lagi untuk konfirmasi' : 'Batalkan'}
            </button>
          )}

          {/* Hubungi mitra — placeholder */}
          <button
            onClick={() => {}}
            className="px-4 py-2.5 rounded-xl text-xs font-bold flex-shrink-0"
            style={{ background: 'rgba(62,201,118,0.1)', color: '#15803d' }}
          >
            💬 Hubungi
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Orders({ navigate }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, products(*)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  const handleCancel = async (orderId) => {
    const { data, error } = await supabase.rpc('cancel_order', {
      p_order_id: orderId,
      p_user_id:  user.id,
    })
    const result = typeof data === 'string' ? JSON.parse(data) : data
    if (!error && result?.success) {
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: 'cancelled' } : o
      ))
    }
  }

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter
    const matchSearch = !search ||
      o.products?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.id?.includes(search)
    return matchFilter && matchSearch
  })

  const countByStatus = (s) => orders.filter(o => o.status === s).length

  if (!user) return (
    <div className="flex flex-col min-h-screen items-center justify-center pb-28 px-6" style={{ background: '#F4F4F9' }}>
      <div className="text-5xl mb-4">🔐</div>
      <p className="font-bold text-lg text-center mb-2" style={{ color: '#1a1a2e' }}>Login untuk melihat pesanan</p>
      <p className="text-gray-500 text-sm text-center mb-6">Masuk ke akun kamu untuk melihat riwayat pesanan.</p>
      <button onClick={() => navigate('login')}
        className="px-8 py-3 rounded-2xl font-bold text-white"
        style={{ background: '#3ec976' }}>
        {t('sign_in')}
      </button>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen pb-28" style={{ background: '#F4F4F9' }}>
      {/* Header */}
      <div className="px-4 pt-14 pb-3 bg-white">
        <h1 className="font-black text-xl mb-3" style={{ color: '#1a1a2e' }}>{t('order_history')}</h1>

        {/* Search */}
        <div className="relative mb-3">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('search_orders')}
            className="w-full pl-9 pr-4 text-sm outline-none"
            style={{ height: 40, background: '#F4F4F9', borderRadius: 20, color: '#1a1a2e' }}
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { key: 'all',       label: `Semua (${orders.length})` },
            { key: 'pending',   label: `⏳ Menunggu (${countByStatus('pending')})` },
            { key: 'completed', label: `✅ Selesai (${countByStatus('completed')})` },
            { key: 'cancelled', label: `❌ Batal (${countByStatus('cancelled')})` },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all"
              style={{
                background: filter === f.key ? '#3ec976' : '#F4F4F9',
                color: filter === f.key ? '#fff' : '#6b7280',
              }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      <div className="flex-1 px-4 pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 rounded-full spinner"
              style={{ border: '3px solid #3ec976', borderTopColor: 'transparent' }} />
            <p className="text-sm text-gray-400">Memuat pesanan...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📦</div>
            <p className="font-bold text-base mb-1" style={{ color: '#1a1a2e' }}>
              {filter === 'all' ? 'Belum ada pesanan' : `Tidak ada pesanan "${filter}"`}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              {filter === 'all' ? 'Mulai berbelanja sekarang!' : 'Coba filter lain.'}
            </p>
            {filter === 'all' && (
              <button onClick={() => navigate('home')}
                className="px-8 py-3 rounded-2xl font-bold text-white"
                style={{ background: '#3ec976' }}>
                Jelajahi Produk
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(order => (
              <OrderCard key={order.id} order={order} onCancel={handleCancel} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
