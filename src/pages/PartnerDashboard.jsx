import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

// UI Atoms
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

function StatItem({ label, value, variant = 'success', icon }) {
  return (
    <Card padding="p-4" className="flex-1 flex flex-col items-center justify-center text-center shadow-soft border border-gray-50">
      <span className="text-2xl mb-1.5">{icon}</span>
      <span className="text-2xl font-black text-[#1a1a2e] leading-none mb-1">{value}</span>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{label}</span>
    </Card>
  )
}

export default function PartnerDashboard({ navigate }) {
  const { t } = useTranslation()
  const { user, profile, refreshProfile } = useAuth()
  const { show } = useToast()
  
  const [listings, setListings] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('listings') // listings | add | orders | settings | alerts
  const [updatingStore, setUpdatingStore] = useState(false)

  // Add product form
  const [form, setForm] = useState({
    name: '', description: '', original_price: '', discount_price: '',
    quantity: '1', category: 'bakery', halal_cert_no: '', image_url: '',
    expiry_time: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Store settings form
  const [storeForm, setStoreForm] = useState({
    store_name: profile?.store_name || '',
    store_phone: profile?.store_phone || '',
    store_address: profile?.store_address || '',
    business_type: profile?.business_type || 'restaurant'
  })

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      const [{ data: prods }, { data: ords }] = await Promise.all([
        supabase.from('products').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }),
        supabase.from('orders').select('*, products(*)').eq('products.seller_id', user.id).order('created_at', { ascending: false }),
      ])
      setListings(prods || [])
      setOrders(ords?.filter(o => o.products?.seller_id === user.id) || [])
      setLoading(false)
    }
    load()
  }, [user])

  const stats = {
    active: listings.filter(l => l.status === 'available').length,
    expiring: listings.filter(l => {
      if (!l.expiry_time) return false
      return (new Date(l.expiry_time) - new Date()) < 6 * 3600000
    }).length,
    incoming: orders.filter(o => o.status === 'pending').length,
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!form.name || !form.original_price || !form.discount_price) {
      show('Mohon lengkapi nama dan harga produk.', 'error')
      return
    }
    if (parseFloat(form.discount_price) >= parseFloat(form.original_price)) {
      show('Harga diskon harus lebih rendah dari harga asli.', 'error')
      return
    }
    
    setSubmitting(true)
    let imageUrl = form.image_url

    try {
      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const path = `products/${user.id}/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('product-images')
          .upload(path, imageFile)
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
          imageUrl = urlData.publicUrl
        }
      }

      const { error } = await supabase.from('products').insert({
        seller_id: user.id,
        name: form.name,
        description: form.description,
        original_price: parseFloat(form.original_price),
        discount_price: parseFloat(form.discount_price),
        quantity: parseInt(form.quantity) || 1,
        category: form.category,
        halal_cert_no: form.halal_cert_no || null,
        image_url: imageUrl || null,
        expiry_time: form.expiry_time ? new Date(form.expiry_time).toISOString() : null,
        is_halal: true,
        status: 'available',
      })

      if (error) throw error
      
      show(t('product_added'), 'success')
      setForm({ name: '', description: '', original_price: '', discount_price: '', quantity: '1', category: 'bakery', halal_cert_no: '', image_url: '', expiry_time: '' })
      setImageFile(null); setImagePreview(null)
      setTab('listings')
      
      // Refresh listings
      const { data } = await supabase.from('products').select('*').eq('seller_id', user.id).order('created_at', { ascending: false })
      setListings(data || [])
    } catch (err) {
      show('Gagal: ' + err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStore = async () => {
    setUpdatingStore(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          store_name: storeForm.store_name,
          store_phone: storeForm.store_phone,
          store_address: storeForm.store_address,
          business_type: storeForm.business_type
        })
        .eq('id', user.id)
      
      if (error) throw error
      show('Pengaturan toko berhasil diperbarui.', 'success')
      refreshProfile()
    } catch (err) {
      show('Gagal memperbarui toko: ' + err.message, 'error')
    } finally {
      setUpdatingStore(false)
    }
  }

  const handleMarkPickedUp = async (orderId) => {
    const { error } = await supabase.from('orders').update({ status: 'completed' }).eq('id', orderId)
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed' } : o))
      show('Pesanan ditandai selesai.', 'success')
    } else {
      show('Gagal memperbarui status.', 'error')
    }
  }

  // Gates
  if (profile?.is_suspended) return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-white text-center">
      <div className="text-6xl mb-6">⛔</div>
      <h2 className="text-2xl font-black text-[#1a1a2e] mb-2">Akun Ditangguhkan</h2>
      <p className="text-gray-400 font-medium mb-10 max-w-[240px]">Akses mitra telah dibatasi sementara oleh administrator.</p>
      <Button onClick={() => navigate('home')}>Kembali ke Beranda</Button>
    </div>
  )

  if (!user || (profile && profile.role !== 'partner')) return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-white text-center">
       <div className="text-6xl mb-8">🏪</div>
       <h2 className="text-2xl font-black text-[#1a1a2e] mb-2">Hanya untuk Mitra</h2>
       <p className="text-gray-400 font-medium mb-10 max-w-[240px]">Halaman ini eksklusif untuk mitra 0Waste yang terverifikasi.</p>
       <Button onClick={() => navigate('login')}>{t('sign_in')}</Button>
    </div>
  )

  if (profile?.partner_status !== 'approved') return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-white text-center">
       <div className="text-6xl mb-8">🕒</div>
       <h2 className="text-2xl font-black text-[#1a1a2e] mb-2">Menunggu Verifikasi</h2>
       <p className="text-gray-400 font-medium mb-10 max-w-[240px]">Tim kami sedang meninjau pendaftaran toko kamu. Harap tunggu!</p>
       <Badge variant="warning" className="mb-8">Status: {profile?.partner_status || 'pending'}</Badge>
       <Button variant="secondary" onClick={() => navigate('home')}>Kembali ke Beranda</Button>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-[#F9FAFB]">
      {/* Header */}
      <div className="px-6 pt-14 pb-8 bg-white rounded-b-[40px] shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-8">
           <div className="flex flex-col">
              <h1 className="text-[26px] font-black text-[#1a1a2e] leading-tight">{t('partner_dashboard')}</h1>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">Store ID: #{user.id.slice(0,8).toUpperCase()}</p>
           </div>
           <Card className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-soft" padding="p-0" style={{ background: 'rgba(62,201,118,0.1)' }}>🏪</Card>
        </div>

        {/* Stats Row */}
        <div className="flex gap-4">
           <StatItem label={t('active_listings')} value={stats.active} icon="✅" />
           <StatItem label={t('eco_impact_meals')} value={orders.filter(o => o.status === 'completed').length} icon="🥗" />
           <StatItem label={t('eco_impact_co2')} value={(orders.filter(o => o.status === 'completed').length * 0.5).toFixed(1) + ' kg'} icon="🌱" />
        </div>
      </div>

      <div className="px-6 flex flex-col gap-8 pt-8">
        {/* Anti-Basi Verification Banner */}
        <Card glass padding="p-4" className="border border-[#3ec976]/20 bg-[#3ec976]/5">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm">🛡️</div>
              <div className="flex-1">
                 <p className="text-sm font-black text-[#1a1a2e] leading-tight mb-0.5">{t('anti_basi_verification')}</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Mitra Terverifikasi Sejak {new Date(profile.created_at).getFullYear()}</p>
                 <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="success" className="!px-1.5 !py-0.5 !text-[8px]">Trust Score 98%</Badge>
                 </div>
              </div>
              <div className="text-[#3ec976] text-xl">✅</div>
           </div>
        </Card>

        {/* Tabs Bar */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
          {[
            { key: 'listings', label: '📋 Listing', icon: 'Items' },
            { key: 'add', label: '➕ Tambah', icon: 'Product' },
            { key: 'orders', label: '📦 Pesanan', icon: 'Sales' },
            { key: 'settings', label: '⚙️ Pengaturan', icon: 'Settings' },
            { key: 'alerts', label: '🔔 Alert', icon: 'Safety' },
          ].map(tab_ => (
            <button
              key={tab_.key}
              onClick={() => setTab(tab_.key)}
              className="px-5 py-2.5 rounded-[22px] whitespace-nowrap text-sm font-black transition-all duration-300"
              style={{
                background: tab === tab_.key ? '#1a1a2e' : 'white',
                color: tab === tab_.key ? 'white' : '#6b7280',
                boxShadow: tab === tab_.key ? '0 8px 24px rgba(26,26,46,0.2)' : '0 4px 12px rgba(0,0,0,0.03)',
              }}
            >
              {tab_.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {tab === 'listings' && (
            <div className="flex flex-col gap-4">
               {loading ? (
                 <div className="py-20 text-center flex flex-col items-center gap-3">
                   <div className="w-8 h-8 border-4 border-[#3ec976]/20 border-t-[#3ec976] rounded-full animate-spin" />
                   <p className="text-xs font-black text-gray-300 uppercase">Sinkronisasi Inventaris...</p>
                 </div>
               ) : listings.length === 0 ? (
                 <Card padding="p-10" className="text-center flex flex-col items-center">
                    <div className="text-6xl mb-6">🏜️</div>
                    <p className="font-black text-[#1a1a2e] mb-4">Belum ada listing aktif.</p>
                    <Button onClick={() => setTab('add')} fullWidth={false} className="px-8">Ciptakan Produk Pertama</Button>
                 </Card>
               ) : (
                 listings.map(l => (
                   <Card key={l.id} padding="p-3" className="flex gap-4 items-center">
                      <img
                        src={l.image_url || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=100'}
                        className="w-16 h-16 rounded-xl object-cover border border-gray-50 flex-shrink-0"
                        alt={l.name}
                      />
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center justify-between mb-1">
                            <p className="font-black text-[15px] text-[#1a1a2e] truncate">{l.name}</p>
                            <Badge variant={l.status === 'available' ? 'success' : 'danger'} className="!px-1.5 !py-0 !text-[8px]">
                               {l.status === 'available' ? 'AKTIF' : 'SOLD'}
                            </Badge>
                         </div>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                           {l.category} • Stok: {l.quantity || 0}
                         </p>
                         <div className="flex items-center gap-3 mt-1.5">
                            <span className="font-black text-sm text-[#1a1a2e]">Rp {l.discount_price?.toLocaleString('id')}</span>
                            {l.expiry_time && (
                              <span className="text-[9px] font-black text-[#f59e0b] uppercase">Exp: {new Date(l.expiry_time).toLocaleDateString()}</span>
                            )}
                         </div>
                      </div>
                   </Card>
                 ))
               )}
            </div>
          )}

          {tab === 'add' && (
            <Card padding="p-6" className="flex flex-col gap-6">
              <h3 className="text-lg font-black text-[#1a1a2e]">{t('add_product')}</h3>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">{t('upload_photo')}</label>
                <label className="relative w-full h-[180px] rounded-[28px] border-2 border-dashed border-[#3ec976]/30 bg-[#3ec976]/5 overflow-hidden cursor-pointer flex flex-col items-center justify-center group transition-all active:scale-[0.98]">
                  {imagePreview ? (
                    <img src={imagePreview} className="w-full h-full object-cover" alt="preview" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 group-hover:scale-110 transition-transform">
                      <span className="text-4xl">📸</span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('tap_to_upload')}</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>

              <Input label={t('product_name')} value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Contoh: Sayur Segar Sisa Display" />
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">{t('description')}</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  rows={3}
                  placeholder="Ceritakan kondisi dan kualitas sisa layak konsumsi..."
                  className="w-full p-5 bg-[#F4F4F9] rounded-[24px] font-bold text-sm outline-none border-[1.5px] border-transparent focus:border-[#3ec976] transition-all resize-none shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <Input label={t('original_price')} type="number" value={form.original_price} onChange={e => setForm(f => ({...f, original_price: e.target.value}))} placeholder="0" />
                 <Input label={t('discount_price')} type="number" value={form.discount_price} onChange={e => setForm(f => ({...f, discount_price: e.target.value}))} placeholder="0" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <Input label={t('quantity')} type="number" value={form.quantity} onChange={e => setForm(f => ({...f, quantity: e.target.value}))} />
                 <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">{t('category')}</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(f => ({...f, category: e.target.value}))}
                      className="w-full h-[54px] px-5 bg-[#F4F4F9] rounded-[20px] font-bold text-sm outline-none border-[1.5px] border-transparent focus:border-[#3ec976] transition-all"
                    >
                      {['bakery', 'fruits', 'meat', 'fish', 'vegetables', 'dairy', 'eco_deals'].map(c => (
                        <option key={c} value={c}>{c.toUpperCase()}</option>
                      ))}
                    </select>
                 </div>
              </div>

              <Input label={t('expiry_time')} type="datetime-local" value={form.expiry_time} onChange={e => setForm(f => ({...f, expiry_time: e.target.value}))} />
              
              <Input label={t('halal_cert')} value={form.halal_cert_no} onChange={e => setForm(f => ({...f, halal_cert_no: e.target.value}))} placeholder="Opsional" />

              <Button onClick={handleSubmit} loading={submitting}>🚀 {t('publish_listing')}</Button>
            </Card>
          )}

          {tab === 'orders' && (
            <div className="flex flex-col gap-4">
               {orders.length === 0 ? (
                 <Card padding="p-10" className="text-center flex flex-col items-center">
                    <div className="text-6xl mb-6">😴</div>
                    <p className="font-black text-[#1a1a2e]">Belum ada pesanan.</p>
                    <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-wide">Coba buat promo Eco Deals!</p>
                 </Card>
               ) : orders.map(o => (
                 <Card key={o.id} padding="p-4" className="flex flex-col gap-4 border border-gray-50">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                       <Badge variant={o.status === 'pending' ? 'warning' : 'success'} className="!px-2 !py-0.5 !text-[9px]">
                          {o.status.toUpperCase()}
                       </Badge>
                       <span className="text-[10px] font-black text-gray-300 uppercase font-mono tracking-widest">#{o.id.slice(0,10)}</span>
                    </div>
                    <div className="flex gap-4 items-center">
                       <img src={o.products?.image_url} className="w-14 h-14 rounded-xl object-cover" alt="" />
                       <div className="flex-1 min-w-0">
                          <p className="font-black text-sm text-[#1a1a2e] truncate">{o.products?.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Rp {o.total_price.toLocaleString('id')}</p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <Button 
                         onClick={() => handleMarkPickedUp(o.id)}
                         disabled={o.status === 'completed'}
                         className="!h-10 !px-4 !text-xs !rounded-xl flex-1"
                       >
                          {o.status === 'completed' ? 'Selesai' : 'Konfirmasi Diambil'}
                       </Button>
                       <Button 
                         variant="secondary" 
                         className="!h-10 !px-4 !text-xs !rounded-xl flex-shrink-0"
                         onClick={() => {
                           const msg = t('wa_notify_template', { store: profile?.store_name || '0Waste Partner' })
                           const phone = o.partner_phone || '' // Assuming user phone is reachable
                           window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
                         }}
                       >
                         💬 WA
                       </Button>
                    </div>
                 </Card>
               ))}
            </div>
          )}

          {tab === 'settings' && (
            <Card padding="p-6" className="flex flex-col gap-6">
               <h3 className="text-lg font-black text-[#1a1a2e]">Pengaturan Toko</h3>
               
               <Input 
                 label="Nama Toko" 
                 value={storeForm.store_name} 
                 onChange={e => setStoreForm(s => ({...s, store_name: e.target.value}))} 
               />
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Tipe Bisnis</label>
                    <select
                      value={storeForm.business_type}
                      onChange={e => setStoreForm(s => ({...s, business_type: e.target.value}))}
                      className="w-full h-[54px] px-5 bg-[#F4F4F9] rounded-[20px] font-bold text-sm outline-none border-[1.5px] border-transparent focus:border-[#3ec976] transition-all"
                    >
                      <option value="restaurant">Restaurant</option>
                      <option value="cafe">Cafe</option>
                      <option value="hotel">Hotel</option>
                      <option value="catering">Catering</option>
                    </select>
                 </div>
                 <Input 
                   label="Telepon Toko" 
                   value={storeForm.store_phone} 
                   onChange={e => setStoreForm(s => ({...s, store_phone: e.target.value}))} 
                 />
               </div>
               
               <div className="flex flex-col gap-1.5">
                 <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Alamat Lokal</label>
                 <textarea
                   value={storeForm.store_address}
                   onChange={e => setStoreForm(s => ({...s, store_address: e.target.value}))}
                   rows={3}
                   className="w-full p-5 bg-[#F4F4F9] rounded-[20px] font-bold text-sm outline-none border-[1.5px] border-transparent focus:border-[#3ec976] transition-all resize-none"
                 />
               </div>
               
               <div className="flex flex-col gap-3 p-5 bg-[#3ec976]/5 rounded-[28px] border border-[#3ec976]/20 mb-2">
                  <div className="flex items-center justify-between">
                     <div className="flex flex-col">
                        <p className="text-[11px] font-black text-[#1a1a2e] uppercase tracking-wider">{t('store_status')}</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5">{profile?.is_open ? t('store_open') : t('store_closed')}</p>
                     </div>
                     <button 
                       onClick={async () => {
                          const nextStatus = !profile?.is_open
                          const { error } = await supabase.from('profiles').update({ is_open: nextStatus }).eq('id', user.id)
                          if (!error) {
                            show(nextStatus ? t('store_open') : t('store_closed'), 'success')
                            refreshProfile()
                          }
                       }}
                       className={`w-14 h-8 rounded-full transition-all relative flex items-center px-1 ${profile?.is_open ? 'bg-[#3ec976]' : 'bg-gray-300'}`}
                     >
                        <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-md ${profile?.is_open ? 'translate-x-6' : 'translate-x-0'}`} />
                     </button>
                  </div>
               </div>

               <Button onClick={handleUpdateStore} loading={updatingStore}>Simpan Perubahan</Button>
            </Card>
          )}

          {tab === 'alerts' && (
            <Card padding="p-6">
               <h3 className="text-lg font-black text-[#1a1a2e] mb-6">{t('protocol_alerts')}</h3>
               <div className="flex flex-col gap-5">
                  {[
                    { icon: '🚀', text: 'Sirkulasi: Listing baru diterbitkan di area kamu.', time: 'Baru saja' },
                    { icon: '⚠️', text: 'Peringatan: Stok Sayur Segar sisa 2 unit.', time: '10 menit lalu' },
                    { icon: '🛡️', text: 'Kualitas: Laporan mingguan higienitas telah diverifikasi.', time: 'Kemarin' },
                    { icon: '✅', text: 'Pembayaran: Klaim digital periode 1 telah dikirim.', time: '2 hari lalu' },
                  ].map((alert, i) => (
                    <div key={i} className="flex items-start gap-4 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                       <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-xl shadow-inner">{alert.icon}</div>
                       <div className="flex-1">
                          <p className="text-sm font-bold text-[#1a1a2e] leading-snug">{alert.text}</p>
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">{alert.time}</p>
                       </div>
                    </div>
                  ))}
               </div>
               <Button variant="secondary" className="mt-8">Laporan Komprehensif</Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
