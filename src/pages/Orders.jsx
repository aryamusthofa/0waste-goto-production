import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

// UI Atoms
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const STATUS_CONFIG = {
  pending:   { variant: 'warning', label: '⏳ Menunggu Konfirmasi', canCancel: true  },
  completed: { variant: 'success', label: '✅ Pesanan Selesai',    canCancel: false },
  cancelled: { variant: 'danger',  label: '❌ Pesanan Dibatalkan', canCancel: false },
}

function OrderCard({ order, onCancel, onViewReceipt }) {
  const { t } = useTranslation()
  const { show } = useToast()
  
  const s = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
  const [cancelling, setCancelling] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const handleCancelClick = async () => {
    if (!confirmCancel) { 
      setConfirmCancel(true)
      return 
    }
    
    setCancelling(true)
    try {
      const success = await onCancel(order.id)
      if (success) {
        show('Pesanan berhasil dibatalkan.', 'success')
      } else {
        show('Gagal membatalkan pesanan.', 'error')
      }
    } catch (e) {
      show('Terjadi kesalahan sistem.', 'error')
    } finally {
      setCancelling(false)
      setConfirmCancel(false)
    }
  }

  return (
    <Card padding="p-0" className="overflow-hidden border border-gray-50 flex flex-col rounded-card shadow-soft hover:shadow-premium transition-all duration-300">
      {/* Top Status Bar */}
      <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
         <Badge variant={s.variant} className="!px-2 !py-0.5 !text-[9px]">{s.label}</Badge>
         <span className="text-[10px] font-black text-gray-400">
           {new Date(order.created_at).toLocaleDateString('id-ID', {
             day: 'numeric', month: 'short', year: 'numeric',
             hour: '2-digit', minute: '2-digit'
           })}
         </span>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Product Details */}
        <div className="flex gap-4">
           <img
             src={order.products?.image_url || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=100'}
             alt={order.products?.name}
             className="w-16 h-16 rounded-xl object-cover border border-gray-50"
             onError={e => e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=100'}
           />
           <div className="flex-1 min-w-0">
             <p className="font-black text-sm text-[#1a1a2e] truncate leading-tight">
               {order.products?.name || 'Produk dihapus'}
             </p>
             <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight">
               {order.method === 'pickup' ? '🏪 Pickup' : '🛵 Delivery'}
               {' · '}
               {order.payment_method === 'digital' ? '💳 Digital' : '💵 COD'}
             </p>
             <div className="flex items-center gap-3 mt-2">
                <span className="text-base font-black text-[#1a1a2e]">
                   Rp {order.total_price?.toLocaleString('id')}
                </span>
                {order.products?.is_halal && (
                   <Badge variant="success" className="!px-1.5 !py-0 !text-[8px]">HALAL</Badge>
                )}
             </div>
           </div>
        </div>

        {/* Footer Order Info */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
           <p className="text-[10px] font-black text-gray-300 font-mono tracking-widest">
             #{order.id?.slice(0, 12).toUpperCase()}
           </p>
           
           <div className="flex gap-2">
              {s.canCancel && (
                <Button 
                  variant={confirmCancel ? 'danger' : 'ghost'} 
                  onClick={handleCancelClick}
                  loading={cancelling}
                  fullWidth={false}
                  className="!h-10 !px-5 !text-[11px] !font-black !rounded-xl !uppercase tracking-tighter"
                >
                  {confirmCancel ? 'Konfirmasi' : 'Batalkan'}
                </Button>
              )}
              
              <Button 
                variant="secondary" 
                fullWidth={false}
                className="!h-10 !px-4 !text-xs !rounded-xl"
                onClick={() => onViewReceipt(order)}
              >
                Struk
              </Button>
           </div>
        </div>
      </div>
    </Card>
  )
}

export default function Orders({ navigate }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [exporting, setExporting] = useState(false)
  const receiptRef = useRef(null)

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
    })
    const result = typeof data === 'string' ? JSON.parse(data) : data
    if (!error && result?.success) {
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: 'cancelled' } : o
      ))
      return true
    }
    return false
  }

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter
    const matchSearch = !search ||
      o.products?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.id?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const countByStatus = (s) => orders.filter(o => o.status === s).length

  if (!user) return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-white text-center">
      <div className="text-6xl mb-8">🔐</div>
      <h2 className="text-2xl font-black text-[#1a1a2e] mb-2">Riwayat Terkunci</h2>
      <p className="text-gray-400 font-medium mb-10 max-w-[240px]">Silakan masuk ke akun kamu untuk melihat riwayat belanja.</p>
      <Button onClick={() => navigate('login')}>Masuk Sekarang</Button>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-[#F9FAFB]">
      {/* Header */}
      <div className="px-6 pt-14 pb-6 bg-white rounded-b-[40px] shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
        <h1 className="font-black text-[24px] text-[#1a1a2e] mb-6">{t('order_history')}</h1>

        <div className="flex flex-col gap-6">
          <Input 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            placeholder={t('search_orders')}
            icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>}
          />

          {/* Filter tabs */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {[
              { key: 'all',       label: `Semua (${orders.length})` },
              { key: 'pending',   label: `⏳ Menunggu (${countByStatus('pending')})` },
              { key: 'completed', label: `✅ Selesai (${countByStatus('completed')})` },
              { key: 'cancelled', label: `❌ Batal (${countByStatus('cancelled')})` },
            ].map(f => (
              <button 
                key={f.key} 
                onClick={() => setFilter(f.key)}
                className="px-4 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-widest whitespace-nowrap flex-shrink-0 transition-all duration-300"
                style={{
                  background: filter === f.key ? '#1a1a2e' : '#F4F4F9',
                  color: filter === f.key ? 'white' : '#6b7280',
                  boxShadow: filter === f.key ? '0 8px 24px rgba(26,26,46,0.2)' : 'none',
                }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders list */}
      <div className="flex-1 px-6 pt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in text-center">
            <div className="w-10 h-10 border-4 border-[#3ec976]/20 border-t-[#3ec976] rounded-full animate-spin" />
            <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Sinkronisasi Data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="text-6xl mb-6">📦</div>
            <p className="font-black text-lg text-[#1a1a2e] mb-2">
              {filter === 'all' ? 'Belum Ada Pesanan' : 'Tidak Ditemukan'}
            </p>
            <p className="text-sm font-medium text-gray-400 mb-10 max-w-[200px]">
              {filter === 'all' ? 'Sepertinya kamu belum mulai berinteraksi dengan circular economy.' : 'Coba ubah filter atau kata kunci pencarian kamu.'}
            </p>
            {filter === 'all' && (
              <Button onClick={() => navigate('home')} fullWidth={false} className="px-10">Jelajahi Marketplace</Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-5 animate-slide-up">
            {filtered.map(order => (
              <OrderCard key={order.id} order={order} onCancel={handleCancel} onViewReceipt={setSelectedOrder} />
            ))}
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={t('receipt_title')}
      >
        {selectedOrder && (
          <div className="flex flex-col gap-8 pb-4">
             {/* Virtual Receipt Paper */}
             <div 
               ref={receiptRef}
               className="bg-white p-8 rounded-card shadow-lg border-2 border-dashed border-gray-100 flex flex-col gap-6"
               style={{ width: '100%', maxWidth: '340px', margin: '0 auto' }}
             >
                {/* Receipt Header */}
                <div className="text-center border-b-2 border-dashed border-gray-50 pb-6">
                   <div className="w-14 h-14 rounded-full bg-[#3ec976] flex items-center justify-center text-3xl mx-auto mb-4">🌿</div>
                   <h3 className="text-xl font-black text-[#1a1a2e] uppercase tracking-widest">0Waste Shop</h3>
                   <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Eco-Circular Food Marketplace</p>
                </div>

                {/* Order Meta */}
                <div className="flex flex-col gap-1.5 py-4 border-b border-gray-50">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                      <span>Order ID</span>
                      <span>{selectedOrder.id?.slice(0, 14).toUpperCase()}</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                      <span>Date</span>
                      <span>{new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                   </div>
                </div>

                {/* Items */}
                <div className="flex flex-col gap-4 py-4 border-b border-gray-50 text-sm font-bold text-[#1a1a2e]">
                   <div className="flex justify-between items-start gap-3">
                      <span className="flex-1">{selectedOrder.products?.name}</span>
                      <span className="text-right">Rp {selectedOrder.total_price?.toLocaleString('id')}</span>
                   </div>
                   <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>Qty: 1</span>
                      <span>Subtotal: Rp {selectedOrder.total_price?.toLocaleString('id')}</span>
                   </div>
                </div>

                {/* Total */}
                <div className="flex flex-col gap-4 pt-4">
                   <div className="flex justify-between items-center">
                      <span className="text-sm font-black text-[#1a1a2e]">TOTAL</span>
                      <span className="text-xl font-black text-[#3ec976]">Rp {selectedOrder.total_price?.toLocaleString('id')}</span>
                   </div>
                   <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                      <span className="text-[9px] font-black text-gray-400 uppercase">Payment Method</span>
                      <span className="text-[10px] font-black text-[#1a1a2e] uppercase">{selectedOrder.payment_method}</span>
                   </div>
                </div>

                {/* Footer Message */}
                <div className="text-center pt-6 opacity-30">
                   <p className="text-[8px] font-black text-gray-400 leading-relaxed uppercase tracking-widest">Terima kasih telah membantu<br/>mengurangi limbah pangan! 🌿✨</p>
                </div>
             </div>

             {/* Export Buttons */}
             <div className="flex flex-col gap-3 mt-4">
                <Button
                  onClick={async () => {
                    setExporting(true)
                    try {
                      const canvas = await html2canvas(receiptRef.current, { scale: 3, backgroundColor: '#ffffff' })
                      const link = document.createElement('a')
                      link.download = `receipt-${selectedOrder.id.slice(0, 8)}.png`
                      link.href = canvas.toDataURL('image/png')
                      link.click()
                      show('Gambar struk berhasil diunduh.', 'success')
                    } catch (e) {
                      show('Gagal mengekspor gambar.', 'error')
                    } finally {
                      setExporting(false)
                    }
                  }}
                  loading={exporting}
                  className="!h-14 !rounded-2xl !font-black !text-sm"
                >
                  🖼️ {t('receipt_export_img')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    setExporting(true)
                    try {
                      const canvas = await html2canvas(receiptRef.current, { scale: 3, backgroundColor: '#ffffff' })
                      const imgData = canvas.toDataURL('image/png')
                      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
                      const imgProps = pdf.getImageProperties(imgData)
                      const pdfWidth = pdf.internal.pageSize.getWidth()
                      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
                      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
                      pdf.save(`receipt-${selectedOrder.id.slice(0, 8)}.pdf`)
                      show('PDF struk berhasil diunduh.', 'success')
                    } catch (e) {
                      show('Gagal mengekspor PDF.', 'error')
                    } finally {
                      setExporting(false)
                    }
                  }}
                  loading={exporting}
                  className="!h-14 !rounded-2xl !font-black !text-sm"
                >
                  📄 {t('receipt_export_pdf')}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedOrder(null)}
                  className="!h-12 !rounded-xl !font-black !text-xs !uppercase !tracking-widest"
                >
                  {t('close')}
                </Button>
             </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
