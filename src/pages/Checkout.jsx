import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

// UI Atoms
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

export default function Checkout({ navigate, params }) {
  const { t } = useTranslation()
  const { user, profile } = useAuth()
  const { show } = useToast()
  
  const product = params?.product
  const qty = params?.qty || 1

  const [method, setMethod] = useState('pickup')
  const [paymentMethod, setPaymentMethod] = useState('digital')
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState(null)

  const shippingFee = method === 'delivery' ? 5000 : 0
  const subtotal = (product?.discount_price || 0) * qty
  const total = subtotal + shippingFee

  const handleConfirm = async () => {
    if (!user || !product) return
    setLoading(true)

    try {
      // 1. Buat pesanan di Database (Status masih pending)
      const { data, error: rpcErr } = await supabase.rpc('place_order', {
        p_product_id:  product.id,
        p_qty:         qty,
        p_method:      method,
        p_payment:     paymentMethod,
      })

      if (rpcErr) throw new Error(rpcErr.message)
      const result = typeof data === 'string' ? JSON.parse(data) : data

      if (!result.success) {
        show(result.error || 'Pemesanan gagal. Coba lagi.', 'error')
        setLoading(false)
        return
      }

      const currentOrderId = result.order_id

      // 2. Jika pembayaran DIGITAL, panggil Midtrans Snap
      if (paymentMethod === 'digital') {
        if (!window.snap) {
          throw new Error('Payment SDK not loaded. Mohon muat ulang halaman.')
        }

        // Ambil Snap Token dari Supabase Edge Function
        const { data: payData, error: payError } = await supabase.functions.invoke('payment-gateway', {
          body: {
            order_id: currentOrderId,
            gross_amount: total,
            customer_details: {
              first_name: profile?.full_name || user.email?.split('@')[0],
              email: user.email,
            }
          }
        })

        if (payError || !payData.token) {
          throw new Error('Gagal mendapatkan token pembayaran. Hubungi admin.')
        }

        // Tampilkan Pop-up Midtrans
        window.snap.pay(payData.token, {
          onSuccess: (res) => {
            show('Pembayaran Berhasil!', 'success')
            setOrderId(currentOrderId)
          },
          onPending: (res) => {
            show('Menunggu Pembayaran...', 'info')
            setOrderId(currentOrderId)
          },
          onError: (res) => {
            show('Pembayaran Gagal. Silakan coba lagi.', 'error')
          },
          onClose: () => {
            show('Anda menutup jendela pembayaran.', 'warning')
          }
        })
      } else {
        // Jika COD, langsung sukses
        setOrderId(currentOrderId)
        show('Pesanan berhasil dibuat (COD)!', 'success')
      }

    } catch (err) {
      show(err.message || 'Terjadi kesalahan sistem.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ---- SUCCESS SCREEN ----
  if (orderId) return (
    <div className="flex flex-col min-h-screen items-center justify-center px-6 bg-white">
      <div className="text-center animate-pop-in w-full max-w-sm">
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-soft"
          style={{ background: 'rgba(62,201,118,0.12)', boxShadow: '0 8px 32px rgba(62,201,118,0.2)' }}>
          ✅
        </div>

        <h2 className="text-[28px] font-black mb-2 text-[#1a1a2e] leading-tight">Pesanan Diterima!</h2>
        <p className="text-gray-400 font-medium mb-10">
          {paymentMethod === 'digital' ? 'Pembayaran sedang divalidasi sistem.' : 'Siapkan pembayaran saat barang tiba.'}
        </p>

        <Card padding="p-6" className="mb-10 text-left border border-gray-50">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Order ID Reference</p>
          <p className="font-mono text-xs font-bold text-[#1a1a2e] break-all">#{orderId}</p>
          
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-50">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Metode</p>
              <p className="text-xs font-bold text-[#1a1a2e] mt-0.5">
                {method === 'pickup' ? '🏪 Pickup' : '🛵 Delivery'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Bayar</p>
              <p className="text-xs font-black text-[#3ec976] mt-0.5">
                Rp {total.toLocaleString('id')}
              </p>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Button onClick={() => navigate('orders')}>Lihat Pesanan Saya</Button>
          <Button variant="secondary" onClick={() => navigate('home')}>Kembali ke Beranda</Button>
        </div>
      </div>
    </div>
  )

  if (!product) return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-white text-center">
      <div className="text-6xl mb-6 animate-bounce">🛒</div>
      <p className="text-gray-400 font-bold max-w-[200px]">Keranjang kamu kosong. Yuk belanja dulu!</p>
      <Button variant="primary" onClick={() => navigate('home')} className="mt-8">Cari Produk</Button>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen pb-36 bg-[#F9FAFB]">
      <div className="px-6 pt-14 pb-6 bg-white rounded-b-[40px] shadow-[0_8px_32px_rgba(0,0,0,0.02)] flex items-center gap-4">
        <button 
          onClick={() => navigate('product', { product })} 
          className="w-11 h-11 rounded-[18px] flex items-center justify-center bg-gray-50 active:scale-90 transition-all text-[#1a1a2e]"
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="font-black text-[22px] text-[#1a1a2e] leading-tight">{t('checkout')}</h1>
          <p className="text-xs font-bold text-gray-400 mt-0.5 uppercase tracking-wider">{t('review_items')}</p>
        </div>
      </div>

      <div className="flex-1 px-6 pt-6 flex flex-col gap-6 animate-fade-in">
        <Card padding="p-4" className="flex gap-4 items-center">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=100'}
            alt={product.name}
            className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
            onError={e => e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=100'}
          />
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm text-[#1a1a2e] truncate">{product.name}</p>
            <p className="text-xs font-bold text-gray-400 mt-1 uppercase">Jumlah: {qty}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-base font-black text-[#1a1a2e]">
                Rp {product.discount_price?.toLocaleString('id')}
              </span>
              <Badge variant="dark" icon="🛡️" className="!px-2 !py-0.5 !text-[8px]">SECURITY_VERIFIED</Badge>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Metode Penerimaan</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: 'pickup',   label: t('pickup'),   icon: '🏪', desc: 'Ambil Sendiri' },
              { value: 'delivery', label: t('delivery'), icon: '🛵', desc: '+Rp 5.000' },
            ].map(m => (
              <button 
                key={m.value} 
                onClick={() => setMethod(m.value)}
                className="relative p-5 rounded-[28px] text-left transition-all duration-300 active:scale-95"
                style={{
                  border: `2px solid ${method === m.value ? '#3ec976' : 'white'}`,
                  background: 'white',
                  boxShadow: method === m.value ? '0 12px 32px rgba(62,201,118,0.15)' : '0 4px 12px rgba(0,0,0,0.03)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                   <span className="text-2xl">{m.icon}</span>
                   {method === m.value && <div className="w-5 h-5 rounded-full bg-[#3ec976] flex items-center justify-center text-[10px] text-white">✓</div>}
                </div>
                <p className="font-black text-[13px] text-[#1a1a2e]">{m.label}</p>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tight">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Gerbang Pembayaran</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: 'digital', label: 'Midtrans Pay', icon: '💳', desc: 'E-Wallet & CC' },
              { value: 'cod',     label: t('cod'),        icon: '💵', desc: 'Bayar di Tempat' },
            ].map(p => (
              <button 
                key={p.value} 
                onClick={() => setPaymentMethod(p.value)}
                className="p-5 rounded-[28px] transition-all duration-300 active:scale-95 flex flex-col gap-1"
                style={{
                  border: `2px solid ${paymentMethod === p.value ? '#3ec976' : 'white'}`,
                  background: 'white',
                  boxShadow: paymentMethod === p.value ? '0 12px 32px rgba(62,201,118,0.15)' : '0 4px 12px rgba(0,0,0,0.03)',
                }}
              >
                <div className="flex items-center justify-between">
                   <span className="text-2xl">{p.icon}</span>
                   {paymentMethod === p.value && <div className="w-5 h-5 rounded-full bg-[#3ec976] flex items-center justify-center text-[10px] text-white">✓</div>}
                </div>
                <p className="font-black text-[13px] text-[#1a1a2e] mt-1">{p.label}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <Card padding="p-6" className="border border-gray-50 flex flex-col gap-4">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Ringkasan Pembayaran</p>
          <div className="flex flex-col gap-3">
             <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-gray-400">{t('subtotal')}</span>
                <span className="text-[#1a1a2e]">Rp {subtotal.toLocaleString('id')}</span>
             </div>
             <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-gray-400">{t('pickup_fee')}</span>
                <span className={shippingFee > 0 ? 'text-[#1a1a2e]' : 'text-[#3ec976]'}>
                   {shippingFee > 0 ? `Rp ${shippingFee.toLocaleString('id')}` : 'Gratis'}
                </span>
             </div>
             <div className="h-[1px] bg-gray-50 my-1" />
             <div className="flex justify-between items-center">
                <span className="text-sm font-black text-[#1a1a2e] uppercase tracking-widest">{t('total')}</span>
                <span className="text-2xl font-black text-[#3ec976]">Rp {total.toLocaleString('id')}</span>
             </div>
          </div>
        </Card>

        <div className="flex items-center gap-4 p-5 rounded-[32px] bg-white border border-gray-50 mb-6 shadow-sm">
           <div className="w-12 h-12 rounded-2xl bg-[#3ec976]/10 flex items-center justify-center text-2xl">⚡</div>
           <div>
              <p className="text-xs font-black text-[#1a1a2e] uppercase tracking-tight">Checkout Instan</p>
              <p className="text-[10px] font-bold text-gray-400 mt-0.5 leading-relaxed">Pembayaran Anda dilindungi enkripsi 256-bit standar industri.</p>
           </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-6 pb-12 bg-white rounded-t-[48px] shadow-[0_-12px_48px_rgba(0,0,0,0.08)] z-50 animate-slide-up">
        <Button
          onClick={handleConfirm}
          loading={loading}
          className="!h-16 !text-lg !font-black !rounded-[24px]"
        >
          {loading ? 'Processing...' : `Bayar Sekarang — Rp ${total.toLocaleString('id')}`}
        </Button>
        <p className="text-center text-[10px] font-black text-gray-300 mt-5 uppercase tracking-[0.3em]">
           SECURE GATEWAY • MIDTRANS SNAP
        </p>
      </div>
    </div>
  )
}
