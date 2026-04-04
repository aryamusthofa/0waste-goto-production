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

    // Safeguard: Check if store is closed
    if (product.profiles?.is_open === false) {
      show('Maaf, toko baru saja tutup. Silakan coba lagi besok.', 'error')
      return
    }

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
    <div className="flex flex-col min-h-screen items-center justify-center px-6 bg-[#F9FAFB]">
      <div className="text-center animate-pop-in w-full max-w-sm">
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-float bg-white">
          {paymentMethod === 'digital' ? '💳' : '📦'}
        </div>

        <h2 className="text-[32px] font-black mb-3 text-[#1a1a2e] leading-tight tracking-tight">Pesanan Diterima!</h2>
        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-10">
          {paymentMethod === 'digital' ? 'Menunggu Konfirmasi Sistem' : 'Pesanan Cod Siap Diproses'}
        </p>

        <Card padding="p-8" className="mb-10 text-left border-2 border-white rounded-card shadow-premium relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#3ec976]"></div>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Ringkasan Transaksi</p>
          
          <div className="flex justify-between items-center mb-6">
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase">Order ID</span>
                <span className="font-mono text-xs font-bold text-[#1a1a2e]">#{orderId.slice(0,18)}</span>
             </div>
             <Badge variant="success" className="!text-[9px] !px-2">VERIFIED</Badge>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-50">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Metode</p>
              <p className="text-xs font-black text-[#1a1a2e] mt-1 uppercase">
                {method}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Bayar</p>
              <p className="text-sm font-black text-[#3ec976] mt-1">
                Rp {total.toLocaleString('id')}
              </p>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Button onClick={() => navigate('orders')}>Lacak Pesanan</Button>
          <Button variant="ghost" onClick={() => navigate('home')} className="!text-gray-400 font-black uppercase text-[10px] tracking-widest">Kembali Berbelanja</Button>
        </div>
      </div>
    </div>
  )

  if (!product) return (
    <div className="flex flex-col min-h-screen items-center justify-center p-8 bg-white text-center">
      <div className="text-8xl mb-8 animate-bounce">🛒</div>
      <h2 className="text-2xl font-black text-[#1a1a2e] mb-2 font-bold">Keranjang Kosong</h2>
      <p className="text-gray-400 font-medium max-w-[240px]">Yuk, jelajahi produk surplus terbaik di sekitar kamu!</p>
      <Button variant="primary" onClick={() => navigate('home')} className="mt-10 max-w-[200px]">Mulai Belanja</Button>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen pb-40 bg-[#F9FAFB]">
      <div className="px-6 pt-16 pb-8 bg-white rounded-b-[42px] shadow-soft flex items-center gap-5">
        <button 
          onClick={() => navigate('product', { product })} 
          className="w-12 h-12 rounded-icon flex items-center justify-center bg-gray-50 active:scale-90 transition-all text-[#1a1a2e] shadow-sm"
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="font-black text-[24px] text-[#1a1a2e] leading-tight">{t('checkout')}</h1>
          <p className="text-[10px] font-black text-gray-300 mt-1 uppercase tracking-[0.2em]">{t('review_items')}</p>
        </div>
      </div>

      <div className="flex-1 px-6 pt-8 flex flex-col gap-8 animate-fade-in">
        <Card padding="p-5" className="flex gap-5 items-center rounded-card shadow-soft border border-white">
          <div className="relative overflow-hidden rounded-2xl w-24 h-24 bg-gray-50 shadow-inner">
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=100'}
              alt={product.name}
              className="w-full h-full object-cover animate-fade-in"
              onError={e => e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=100'}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-[15px] text-[#1a1a2e] truncate uppercase tracking-tight">{product.name}</p>
            <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">Qty: {qty}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-lg font-black text-[#1a1a2e]">
                Rp {product.discount_price?.toLocaleString('id')}
              </span>
              <Badge variant="success" icon="🛡️" className="!px-2 !py-0.5 !text-[8px]">TRUSTED</Badge>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.3em] pl-1">Metode Penerimaan</p>
          <div className="grid grid-cols-2 gap-5">
            {[
              { value: 'pickup',   label: t('pickup'),   icon: '🏪', desc: 'Ambil Sendiri' },
              { value: 'delivery', label: t('delivery'), icon: '🛵', desc: '+Rp 5.000' },
            ].map(m => (
              <button 
                key={m.value} 
                onClick={() => setMethod(m.value)}
                className="relative p-6 rounded-card text-left transition-all duration-500 active:scale-95"
                style={{
                  border: `3px solid ${method === m.value ? '#3ec976' : 'white'}`,
                  background: 'white',
                  boxShadow: method === m.value ? '0 16px 40px rgba(62,201,118,0.18)' : '0 4px 12px rgba(0,0,0,0.02)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                   <span className="text-3xl">{m.icon}</span>
                   {method === m.value && <div className="w-6 h-6 rounded-full bg-[#3ec976] shadow-[0_0_12px_#3ec976] flex items-center justify-center text-[11px] text-white font-black">✓</div>}
                </div>
                <p className="font-black text-[13px] text-[#1a1a2e] uppercase tracking-tight">{m.label}</p>
                <p className="text-[9px] font-black text-gray-300 mt-1 uppercase tracking-widest">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.3em] pl-1">Gerbang Pembayaran</p>
          <div className="grid grid-cols-2 gap-5">
            {[
              { value: 'digital', label: 'Midtrans Pay', icon: '💎', desc: 'E-Wallet & CC' },
              { value: 'cod',     label: t('cod'),        icon: '💵', desc: 'Bayar di Tempat' },
            ].map(p => (
              <button 
                key={p.value} 
                onClick={() => setPaymentMethod(p.value)}
                className="p-6 rounded-card transition-all duration-500 active:scale-95 flex flex-col gap-1"
                style={{
                  border: `3px solid ${paymentMethod === p.value ? '#3ec976' : 'white'}`,
                  background: 'white',
                  boxShadow: paymentMethod === p.value ? '0 16px 40px rgba(62,201,118,0.18)' : '0 4px 12px rgba(0,0,0,0.02)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                   <span className="text-3xl">{p.icon}</span>
                   {paymentMethod === p.value && <div className="w-6 h-6 rounded-full bg-[#3ec976] shadow-[0_0_12px_#3ec976] flex items-center justify-center text-[11px] text-white font-black">✓</div>}
                </div>
                <p className="font-black text-[13px] text-[#1a1a2e] uppercase tracking-tight">{p.label}</p>
                <p className="text-[9px] font-black text-gray-300 mt-1 uppercase tracking-widest">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <Card padding="p-8" className="border-2 border-white rounded-card flex flex-col gap-5 bg-white mb-10 shadow-soft">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Ringkasan Pembayaran</p>
          <div className="flex flex-col gap-4">
             <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-gray-400 uppercase tracking-widest text-[10px]">{t('subtotal')}</span>
                <span className="text-[#1a1a2e] font-black">Rp {subtotal.toLocaleString('id')}</span>
             </div>
             <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-gray-400 uppercase tracking-widest text-[10px]">{t('pickup_fee')}</span>
                <span className={shippingFee > 0 ? 'text-[#1a1a2e] font-black' : 'text-[#3ec976] font-black'}>
                   {shippingFee > 0 ? `Rp ${shippingFee.toLocaleString('id')}` : 'GRATIS'}
                </span>
             </div>
             <div className="h-[1px] bg-gray-50 my-1" />
             <div className="flex justify-between items-center">
                <span className="text-xs font-black text-[#1a1a2e] uppercase tracking-[0.2em]">{t('total')}</span>
                <span className="text-[28px] font-black text-[#1a1a2e] tracking-tighter">Rp {total.toLocaleString('id')}</span>
             </div>
          </div>
        </Card>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-8 pb-12 bg-white rounded-t-[54px] shadow-premium z-50 animate-slide-up border-t border-gray-50">
        <Button
          onClick={handleConfirm}
          loading={loading}
          className="!h-18 !text-xl !font-black !rounded-button !bg-[#1a1a2e] !text-white hover:!bg-black shadow-xl"
        >
          {loading ? 'Processing...' : `Konfirmasi & Bayar`}
        </Button>
        <div className="flex items-center justify-center gap-2 mt-6">
           <div className="w-1 h-1 rounded-full bg-gray-300"></div>
           <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">
              AUTHENTICATED GATEWAY • MIDTRANS
           </p>
           <div className="w-1 h-1 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </div>
  )
}
