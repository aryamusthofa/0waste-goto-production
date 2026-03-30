import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function StatCard({ label, value, color, icon }) {
  return (
    <div className="flex-1 rounded-2xl p-3 flex flex-col items-center"
      style={{ background: color, minWidth: 0 }}>
      <span className="text-xl mb-1">{icon}</span>
      <span className="text-2xl font-black text-white">{value}</span>
      <span className="text-xs text-white opacity-80 text-center leading-tight mt-0.5">{label}</span>
    </div>
  )
}

export default function PartnerDashboard({ navigate }) {
  const { t } = useTranslation()
  const { user, profile } = useAuth()
  const [listings, setListings] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('listings') // listings | add

  // Add product form
  const [form, setForm] = useState({
    name: '', description: '', original_price: '', discount_price: '',
    quantity: '1', category: 'bakery', halal_cert_no: '', image_url: '',
    expiry_time: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')

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
      setSubmitMsg('Nama, harga asli, dan harga diskon wajib diisi.')
      return
    }
    if (parseFloat(form.discount_price) >= parseFloat(form.original_price)) {
      setSubmitMsg('Harga diskon harus lebih rendah dari harga asli.')
      return
    }
    setSubmitting(true); setSubmitMsg('')
    let imageUrl = form.image_url

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

    setSubmitting(false)
    if (error) {
      setSubmitMsg('Gagal menambahkan listing: ' + error.message)
    } else {
      setSubmitMsg(t('product_added'))
      setForm({ name: '', description: '', original_price: '', discount_price: '', quantity: '1', category: 'bakery', halal_cert_no: '', image_url: '', expiry_time: '' })
      setImageFile(null); setImagePreview(null)
      setTab('listings')
      // Refresh
      const { data } = await supabase.from('products').select('*').eq('seller_id', user.id).order('created_at', { ascending: false })
      setListings(data || [])
    }
  }

  const handleMarkPickedUp = async (orderId) => {
    const { error } = await supabase.from('orders').update({ status: 'completed' }).eq('id', orderId)
    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'completed' } : o))
    } else {
      alert('Gagal memperbarui status: ' + error.message)
    }
  }

  if (!user || (profile && profile.role !== 'partner')) return (
    <div className="flex flex-col min-h-screen items-center justify-center pb-28 px-6">
      <div className="text-5xl mb-4">🏪</div>
      <p className="font-bold text-lg text-center mb-2" style={{ color: '#1a1a2e' }}>Akses Partner Saja</p>
      <p className="text-gray-500 text-sm text-center mb-6">Halaman ini hanya untuk mitra terverifikasi.</p>
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
      <div className="px-4 pt-14 pb-4 bg-white">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="font-black text-xl" style={{ color: '#1a1a2e' }}>{t('partner_dashboard')}</h1>
            <p className="text-xs text-gray-400">{t('dashboard_subtitle')}</p>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: 'rgba(62,201,118,0.1)' }}>🏪</div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 pt-4">
        <div className="flex gap-3 mb-4">
          <StatCard label={t('active_listings')} value={stats.active} color="#3ec976" icon="✅" />
          <StatCard label={t('items_expiring')} value={stats.expiring} color="#f59e0b" icon="⏳" />
          <StatCard label={t('incoming_claims')} value={stats.incoming} color="#1a1a2e" icon="📦" />
        </div>

        {/* Anti-Basi verification card */}
        <div className="bg-white rounded-2xl p-4 mb-4 flex items-center gap-3"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid rgba(62,201,118,0.15)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: 'rgba(62,201,118,0.1)' }}>🛡️</div>
          <div className="flex-1">
            <p className="font-black text-sm" style={{ color: '#1a1a2e' }}>{t('anti_basi_verification')}</p>
            <p className="text-xs text-gray-500">{t('verified_partner')}</p>
            <p className="text-xs mt-0.5" style={{ color: '#3ec976' }}>
              {t('safety_rating', { pct: 98 })} • Terverifikasi
            </p>
          </div>
          <span className="text-2xl">✅</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { key: 'listings', label: '📋 Listing Saya' },
            { key: 'add', label: '➕ ' + t('add_listing') },
            { key: 'orders', label: '📦 Pesanan' },
            { key: 'alerts', label: '🔔 Peringatan' },
          ].map(tab_ => (
            <button
              key={tab_.key}
              onClick={() => setTab(tab_.key)}
              className="px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0"
              style={{
                background: tab === tab_.key ? '#3ec976' : '#fff',
                color: tab === tab_.key ? '#fff' : '#6b7280',
                boxShadow: tab === tab_.key ? '0 2px 8px rgba(62,201,118,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              {tab_.label}
            </button>
          ))}
        </div>

        {/* Tab: Listings */}
        {tab === 'listings' && (
          loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 rounded-full spinner"
                style={{ border: '3px solid #3ec976', borderTopColor: 'transparent' }} />
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🌿</div>
              <p className="text-gray-500">Belum ada listing. Tambahkan produk surplus kamu!</p>
              <button onClick={() => setTab('add')}
                className="mt-4 px-6 py-3 rounded-2xl font-bold text-white text-sm"
                style={{ background: '#3ec976' }}>
                {t('add_listing')}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {listings.map(listing => (
                <div key={listing.id} className="bg-white rounded-2xl p-3 flex gap-3"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <img
                    src={listing.image_url || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=80'}
                    alt={listing.name}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=80'}
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <p className="font-bold text-sm" style={{ color: '#1a1a2e' }}>{listing.name}</p>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                        style={{
                          background: listing.status === 'available' ? 'rgba(62,201,118,0.1)' : 'rgba(239,68,68,0.1)',
                          color: listing.status === 'available' ? '#3ec976' : '#ef4444'
                        }}>
                        {listing.status === 'available' ? 'Aktif' : 'Habis'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">Stok: {listing.quantity || 0} • Rp {listing.discount_price?.toLocaleString('id')}</p>
                    {listing.expiry_time && (
                      <p className="text-xs mt-0.5" style={{ color: '#f59e0b' }}>
                        ⏳ Exp: {new Date(listing.expiry_time).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Tab: Add Listing */}
        {tab === 'add' && (
          <div className="bg-white rounded-2xl p-4 flex flex-col gap-4"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 className="font-black" style={{ color: '#1a1a2e' }}>{t('add_product')}</h3>

            {submitMsg && (
              <div className={`p-3 rounded-xl text-sm font-medium ${submitMsg.includes('berhasil') ? 'text-green-700' : 'text-red-600'}`}
                style={{ background: submitMsg.includes('berhasil') ? 'rgba(62,201,118,0.1)' : 'rgba(239,68,68,0.08)' }}>
                {submitMsg}
              </div>
            )}

            {/* Photo upload */}
            <div>
              <label className="text-xs font-extrabold text-gray-700 mb-1.5 block uppercase tracking-wide">
                {t('upload_photo')}
              </label>
              <label
                className="w-full flex flex-col items-center justify-center cursor-pointer rounded-2xl overflow-hidden"
                style={{
                  height: imagePreview ? 160 : 100,
                  border: '2px dashed #3ec976',
                  background: imagePreview ? 'transparent' : 'rgba(62,201,118,0.05)',
                }}
              >
                {imagePreview ? (
                  <img src={imagePreview} className="w-full h-full object-cover" alt="preview" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">📷</span>
                    <span className="text-xs text-gray-400">{t('tap_to_upload')}</span>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>

            {[
              { label: t('product_name'), key: 'name', type: 'text', placeholder: 'Contoh: Roti Croissant Sisa Sarapan' },
              { label: t('description'), key: 'description', type: 'textarea', placeholder: 'Deskripsi singkat produk...' },
            ].map(field => (
              <div key={field.key}>
                <label className="text-xs font-extrabold text-gray-700 mb-1.5 block uppercase tracking-wide">
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={form[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full px-4 py-3 text-sm font-medium outline-none resize-none"
                    style={{ background: '#F4F4F9', borderRadius: 16, border: '1.5px solid transparent', color: '#1a1a2e' }}
                    onFocus={e => e.target.style.borderColor = '#3ec976'}
                    onBlur={e => e.target.style.borderColor = 'transparent'}
                  />
                ) : (
                  <input
                    type={field.type}
                    value={form[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full px-4 text-sm font-medium outline-none"
                    style={{ height: 52, background: '#F4F4F9', borderRadius: 24, border: '1.5px solid transparent', color: '#1a1a2e' }}
                    onFocus={e => e.target.style.borderColor = '#3ec976'}
                    onBlur={e => e.target.style.borderColor = 'transparent'}
                  />
                )}
              </div>
            ))}

            {/* Prices side by side */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t('original_price'), key: 'original_price', placeholder: '0' },
                { label: t('discount_price'), key: 'discount_price', placeholder: '0' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs font-extrabold text-gray-700 mb-1.5 block uppercase tracking-wide">
                    {field.label}
                  </label>
                  <input
                    type="number"
                    value={form[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full px-3 text-sm font-medium outline-none"
                    style={{ height: 48, background: '#F4F4F9', borderRadius: 16, border: '1.5px solid transparent', color: '#1a1a2e' }}
                    onFocus={e => e.target.style.borderColor = '#3ec976'}
                    onBlur={e => e.target.style.borderColor = 'transparent'}
                  />
                </div>
              ))}
            </div>

            {/* Quantity & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-extrabold text-gray-700 mb-1.5 block uppercase tracking-wide">
                  {t('quantity')}
                </label>
                <input
                  type="number" min="1"
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  className="w-full px-3 text-sm font-medium outline-none"
                  style={{ height: 48, background: '#F4F4F9', borderRadius: 16, border: '1.5px solid transparent', color: '#1a1a2e' }}
                  onFocus={e => e.target.style.borderColor = '#3ec976'}
                  onBlur={e => e.target.style.borderColor = 'transparent'}
                />
              </div>
              <div>
                <label className="text-xs font-extrabold text-gray-700 mb-1.5 block uppercase tracking-wide">
                  {t('category')}
                </label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 text-sm font-medium outline-none"
                  style={{ height: 48, background: '#F4F4F9', borderRadius: 16, border: '1.5px solid transparent', color: '#1a1a2e' }}
                >
                  {['bakery', 'fruits', 'meat', 'fish', 'vegetables', 'dairy', 'eco_deals'].map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Expiry */}
            <div>
              <label className="text-xs font-extrabold text-gray-700 mb-1.5 block uppercase tracking-wide">
                {t('expiry_time')}
              </label>
              <input
                type="datetime-local"
                value={form.expiry_time}
                onChange={e => setForm(f => ({ ...f, expiry_time: e.target.value }))}
                className="w-full px-4 text-sm font-medium outline-none"
                style={{ height: 52, background: '#F4F4F9', borderRadius: 24, border: '1.5px solid transparent', color: '#1a1a2e' }}
                onFocus={e => e.target.style.borderColor = '#3ec976'}
                onBlur={e => e.target.style.borderColor = 'transparent'}
              />
            </div>

            {/* Halal cert */}
            <div>
              <label className="text-xs font-extrabold text-gray-700 mb-1.5 block uppercase tracking-wide">
                {t('halal_cert')}
              </label>
              <input
                type="text"
                value={form.halal_cert_no}
                onChange={e => setForm(f => ({ ...f, halal_cert_no: e.target.value }))}
                placeholder="Opsional"
                className="w-full px-4 text-sm font-medium outline-none"
                style={{ height: 52, background: '#F4F4F9', borderRadius: 24, border: '1.5px solid transparent', color: '#1a1a2e' }}
                onFocus={e => e.target.style.borderColor = '#3ec976'}
                onBlur={e => e.target.style.borderColor = 'transparent'}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2"
              style={{ background: submitting ? '#9ca3af' : '#3ec976',
                boxShadow: !submitting ? '0 4px 16px rgba(62,201,118,0.4)' : 'none' }}
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner" />
              ) : `🚀 ${t('publish_listing')}`}
            </button>
          </div>
        )}

        {/* Tab: Orders */}
        {tab === 'orders' && (
          <div className="flex flex-col gap-3">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📦</div>
                <p className="text-gray-500">Belum ada pesanan masuk.</p>
              </div>
            ) : orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl p-4"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div className="flex items-start justify-between mb-2">
                  <p className="font-bold text-sm" style={{ color: '#1a1a2e' }}>
                    {order.products?.name}
                  </p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                    style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(order.created_at).toLocaleString('id-ID')}
                </p>
                <p className="font-black text-sm mt-1" style={{ color: '#3ec976' }}>
                  Rp {order.total_price?.toLocaleString('id')}
                </p>
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button 
                    onClick={() => handleMarkPickedUp(order.id)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white"
                    style={{ background: '#3ec976' }}>{t('mark_picked_up')}</button>
                  <button className="flex-1 py-2 rounded-xl text-xs font-bold"
                    style={{ background: '#F4F4F9', color: '#6b7280' }}>{t('report')}</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Alerts */}
        {tab === 'alerts' && (
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 className="font-black mb-3" style={{ color: '#1a1a2e' }}>{t('protocol_alerts')}</h3>
            {[
              { icon: '✅', text: 'Listing #RT12 diterima oleh GreenFork Kitchen', time: '9 min ago' },
              { icon: '⏳', text: 'Peringatan kedaluwarsa untuk Listing #R20', time: '1 jam lalu' },
              { icon: '🛡️', text: 'Scan keamanan selesai — 0 temuan', time: '7:45 AM' },
              { icon: '📅', text: 'Pickup dijadwalkan: Today 1–2 PM', time: 'Hari ini' },
            ].map((alert, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                <span className="text-xl flex-shrink-0">{alert.icon}</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{alert.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{alert.time}</p>
                </div>
              </div>
            ))}
            <button className="w-full mt-3 py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: '#1a1a2e' }}>{t('view_all_alerts')}</button>
          </div>
        )}
      </div>
    </div>
  )
}
