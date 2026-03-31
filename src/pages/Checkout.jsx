import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Checkout({ navigate, params }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const product = params?.product
  const qty = params?.qty || 1

  const [method, setMethod] = useState('pickup')
  const [paymentMethod, setPaymentMethod] = useState('digital')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [orderId, setOrderId] = useState(null)

  const shippingFee = method === 'delivery' ? 5000 : 0
  const subtotal = (product?.discount_price || 0) * qty
  const total = subtotal + shippingFee

  const handleConfirm = async () => {
    if (!user || !product) return
    setLoading(true)
    setError(null)

    try {
      const { data, error: rpcErr } = await supabase.rpc('place_order', {
        p_product_id:  product.id,
        p_qty:         qty,
        p_method:      method,
        p_payment:     paymentMethod,
      })

      if (rpcErr) throw new Error(rpcErr.message)

      // data adalah JSON dari fungsi: { success, order_id, error, remaining }
      const result = typeof data === 'string' ? JSON.parse(data) : data

      if (!result.success) {
        setError(result.error || 'Pemesanan gagal. Coba lagi.')
        setLoading(false)
        return
      }

      setOrderId(result.order_id)
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  // ---- SUCCESS SCREEN ----
  if (orderId) return (
    <div className="flex flex-col min-h-screen items-center justify-center px-6" style={{ background: '#ffffff' }}>
      <div className="text-center animate-fade-in w-full">
        {/* Icon */}
        <div className="w-28 h-28 rounded-full flex items-center justify-center text-6xl mx-auto mb-6"
          style={{ background: 'rgba(62,201,118,0.12)' }}>
          ✅
        </div>

        <h2 className="text-2xl font-black mb-2" style={{ color: '#1a1a2e' }}>Pesanan Dikonfirmasi!</h2>
        <p className="text-gray-500 text-sm mb-1">{t('secure_payment')}</p>
        <p className="text-gray-400 text-xs mb-5">{t('anti_basi_checked')}</p>

        {/* Order ID card */}
        <div className="rounded-2xl p-4 mb-6 text-left"
          style={{ background: '#F4F4F9', border: '1px solid rgba(62,201,118,0.2)' }}>
          <p className="text-xs text-gray-400 mb-1">ID Pesanan</p>
          <p className="font-mono text-xs font-bold" style={{ color: '#1a1a2e', wordBreak: 'break-all' }}>
            #{orderId}
          </p>
          <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400">Metode</p>
              <p className="text-xs font-bold" style={{ color: '#1a1a2e' }}>
                {method === 'pickup' ? '🏪 Pickup' : '🛵 Delivery'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Pembayaran</p>
              <p className="text-xs font-bold" style={{ color: '#1a1a2e' }}>
                {paymentMethod === 'digital' ? '💳 Digital' : '💵 COD'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-xs font-bold" style={{ color: '#3ec976' }}>
                Rp {total.toLocaleString('id')}
              </p>
            </div>
          </div>
        </div>

        {/* Safety badge */}
        <div className="flex items-center gap-2 justify-center mb-8 px-4 py-2 rounded-xl mx-auto"
          style={{ background: 'rgba(62,201,118,0.08)', border: '1px solid rgba(62,201,118,0.2)', width: 'fit-content' }}>
          <span>🛡️</span>
          <span className="text-xs font-bold" style={{ color: '#28a35a' }}>Anti-Basi Verified</span>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button onClick={() => navigate('orders')}
            className="w-full py-4 rounded-2xl font-bold text-white text-base"
            style={{ background: '#3ec976', boxShadow: '0 4px 16px rgba(62,201,118,0.35)' }}>
            Lihat Pesanan Saya
          </button>
          <button onClick={() => navigate('home')}
            className="w-full py-3 rounded-2xl font-bold text-sm"
            style={{ background: '#F4F4F9', color: '#6b7280' }}>
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  )

  // ---- NO PRODUCT ----
  if (!product) return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <p className="text-gray-500">Tidak ada produk dipilih.</p>
      <button onClick={() => navigate('home')} className="mt-4 font-bold" style={{ color: '#3ec976' }}>
        Kembali
      </button>
    </div>
  )

  // ---- CHECKOUT FORM ----
  return (
    <div className="flex flex-col min-h-screen pb-36" style={{ background: '#F4F4F9' }}>
      {/* Header */}
      <div className="px-4 pt-14 pb-4 bg-white flex items-center gap-3">
        <button onClick={() => navigate('product', { product })} className="p-1">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#1a1a2e" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="font-black text-lg" style={{ color: '#1a1a2e' }}>{t('checkout')}</h1>
          <p className="text-xs text-gray-400">{t('review_items')}</p>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 flex flex-col gap-4">

        {/* Product summary */}
        <div className="bg-white rounded-2xl p-4 flex gap-3 items-center"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=100'}
            alt={product.name}
            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
            onError={e => e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=100'}
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: '#1a1a2e' }}>{product.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">Qty: {qty}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-black" style={{ color: '#1a1a2e' }}>
                Rp {product.discount_price?.toLocaleString('id')}
              </span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-lg text-white"
                style={{ background: '#3ec976' }}>🛡️ Anti-Basi</span>
            </div>
          </div>
        </div>

        {/* Metode penerimaan */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p className="font-black text-sm mb-3" style={{ color: '#1a1a2e' }}>Metode Penerimaan</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'pickup',   label: '🏪 ' + t('pickup'),   desc: 'Ambil langsung di mitra' },
              { value: 'delivery', label: '🛵 ' + t('delivery'), desc: '+Rp 5.000' },
            ].map(m => (
              <button key={m.value} onClick={() => setMethod(m.value)}
                className="p-3 rounded-xl text-left transition-all"
                style={{
                  border: `2px solid ${method === m.value ? '#3ec976' : '#e5e7eb'}`,
                  background: method === m.value ? 'rgba(62,201,118,0.06)' : '#F4F4F9',
                }}>
                <p className="font-bold text-xs" style={{ color: '#1a1a2e' }}>{m.label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Metode pembayaran */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p className="font-black text-sm mb-3" style={{ color: '#1a1a2e' }}>{t('payment')}</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'digital', label: '💳 ' + t('digital') },
              { value: 'cod',     label: '💵 ' + t('cod') },
            ].map(p => (
              <button key={p.value} onClick={() => setPaymentMethod(p.value)}
                className="p-3 rounded-xl text-center transition-all"
                style={{
                  border: `2px solid ${paymentMethod === p.value ? '#3ec976' : '#e5e7eb'}`,
                  background: paymentMethod === p.value ? 'rgba(62,201,118,0.06)' : '#F4F4F9',
                  color: '#1a1a2e', fontWeight: 600, fontSize: 13,
                }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ringkasan harga */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p className="font-black text-sm mb-3" style={{ color: '#1a1a2e' }}>Ringkasan Pembayaran</p>
          {[
            { label: t('subtotal'),   value: `Rp ${subtotal.toLocaleString('id')}` },
            { label: t('pickup_fee'), value: shippingFee > 0 ? `Rp ${shippingFee.toLocaleString('id')}` : 'Gratis' },
          ].map(row => (
            <div key={row.label} className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">{row.label}</span>
              <span className="font-semibold" style={{ color: '#1a1a2e' }}>{row.value}</span>
            </div>
          ))}
          <div className="flex justify-between font-black text-base pt-2 border-t border-gray-100">
            <span style={{ color: '#1a1a2e' }}>{t('total')}</span>
            <span style={{ color: '#3ec976' }}>Rp {total.toLocaleString('id')}</span>
          </div>
        </div>

        {/* Safety note */}
        <div className="flex items-start gap-3 p-3 rounded-2xl"
          style={{ background: 'rgba(62,201,118,0.08)', border: '1px solid rgba(62,201,118,0.2)' }}>
          <span className="text-xl flex-shrink-0">🛡️</span>
          <div>
            <p className="text-xs font-bold" style={{ color: '#1a1a2e' }}>{t('verified_safe')}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t('anti_basi_checked')}</p>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="rounded-2xl px-4 py-3 flex items-start gap-2"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <span className="text-lg flex-shrink-0">⚠️</span>
            <div>
              <p className="text-sm font-bold" style={{ color: '#ef4444' }}>Pesanan Gagal</p>
              <p className="text-xs text-gray-500 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* CTA fixed bottom */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 pb-8 pt-4 bg-white"
        style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2"
          style={{
            background: loading ? '#9ca3af' : '#3ec976',
            boxShadow: loading ? 'none' : '0 4px 16px rgba(62,201,118,0.4)',
          }}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner" />
              Memproses...
            </>
          ) : (
            <>✅ {t('confirm_claim')} — Rp {total.toLocaleString('id')}</>
          )}
        </button>
        <p className="text-center text-xs text-gray-400 mt-2">{t('secure_payment')}</p>
      </div>
    </div>
  )
}
