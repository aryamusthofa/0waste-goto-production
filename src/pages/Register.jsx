import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

export default function Register({ navigate }) {
  const { t } = useTranslation()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [role, setRole] = useState('customer')
  const [storeName, setStoreName] = useState('')
  const [businessType, setBusinessType] = useState('restaurant')
  const [storePhone, setStorePhone] = useState('')
  const [storeAddress, setStoreAddress] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const validate = () => {
    if (!fullName) return t('err_name_required')
    if (!email || !/\S+@\S+\.\S+/.test(email)) return t('err_invalid_email')
    if (!password || password.length < 6) return t('err_password_short')
    if (password !== confirmPw) return t('err_password_match')
    if (role === 'partner' && !storeName.trim()) return 'Nama toko wajib diisi untuk akun partner.'
    return null
  }

  const handleRegister = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true); setError('')
    const { data, error: e } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } }
    })
    if (e) { setError(t('err_register_failed')); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        role,
        is_verified: false,
        partner_status: role === 'partner' ? 'pending' : 'none',
        store_name: role === 'partner' ? storeName.trim() : null,
        store_slug: role === 'partner' ? storeName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36).slice(-4) : null,
        business_type: role === 'partner' ? businessType : null,
        store_phone: role === 'partner' ? storePhone.trim() || null : null,
        store_address: role === 'partner' ? storeAddress.trim() || null : null,
        created_at: new Date().toISOString(),
      })
    }
    setLoading(false)
    setSuccess(true)
  }

  if (success) return (
    <div className="flex flex-col min-h-screen items-center justify-center px-6" style={{ background: '#ffffff' }}>
      <div className="text-center animate-fade-in">
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-6"
          style={{ background: 'rgba(62,201,118,0.15)' }}>✅</div>
        <h2 className="text-2xl font-black mb-3" style={{ color: '#1a1a2e' }}>Berhasil Daftar!</h2>
        <p className="text-gray-500 mb-8">{t('email_verification_sent')}</p>
        {role === 'partner' && (
          <p className="text-xs text-amber-600 mb-4">
            Akun partner kamu masuk antrian verifikasi developer terlebih dahulu sebelum bisa jualan.
          </p>
        )}
        <button onClick={() => navigate('login')}
          className="w-full py-4 rounded-2xl font-bold text-white"
          style={{ background: '#3ec976' }}>
          {t('sign_in')}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#ffffff' }}>
      <div className="flex items-center px-4 pt-14 pb-2">
        <button onClick={() => navigate('welcome')} className="p-2 -ml-2">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#1a1a2e" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="flex-1 px-6 pt-2 pb-4 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black" style={{ color: '#1a1a2e' }}>{t('sign_up')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('app_name')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm font-medium text-red-600"
            style={{ background: 'rgba(239,68,68,0.08)' }}>
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Role selector */}
          <div>
            <label className="text-xs font-extrabold text-gray-700 mb-2 block uppercase tracking-wide">
              Daftar sebagai
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'customer', label: t('role_customer'), desc: t('role_customer_desc'), icon: '🛍️' },
                { value: 'partner', label: t('role_partner'), desc: t('role_partner_desc'), icon: '🏪' },
              ].map(r => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className="p-3 rounded-2xl text-left transition-all"
                  style={{
                    border: `2px solid ${role === r.value ? '#3ec976' : '#e5e7eb'}`,
                    background: role === r.value ? 'rgba(62,201,118,0.06)' : '#F4F4F9',
                  }}
                >
                  <div className="text-2xl mb-1">{r.icon}</div>
                  <p className="font-bold text-sm" style={{ color: '#1a1a2e' }}>{r.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {role === 'partner' && (
            <>
              <div>
                <label className="text-xs font-extrabold text-gray-700 mb-1.5 block uppercase tracking-wide">
                  Nama Toko
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  placeholder="Contoh: GreenBite Surplus Store"
                  className="w-full px-4 text-sm font-medium outline-none"
                  style={{ height: 52, background: '#F4F4F9', borderRadius: 24, border: '1.5px solid transparent', color: '#1a1a2e' }}
                  onFocus={e => e.target.style.borderColor = '#3ec976'}
                  onBlur={e => e.target.style.borderColor = 'transparent'}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-extrabold text-gray-700 mb-1.5 block uppercase tracking-wide">
                    Tipe Usaha
                  </label>
                  <select
                    value={businessType}
                    onChange={e => setBusinessType(e.target.value)}
                    className="w-full px-4 text-sm font-medium outline-none"
                    style={{ height: 52, background: '#F4F4F9', borderRadius: 24, border: '1.5px solid transparent', color: '#1a1a2e' }}
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="cafe">Cafe</option>
                    <option value="hotel">Hotel</option>
                    <option value="catering">Catering</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-extrabold text-gray-700 mb-1.5 block uppercase tracking-wide">
                    No. HP Toko
                  </label>
                  <input
                    type="text"
                    value={storePhone}
                    onChange={e => setStorePhone(e.target.value)}
                    placeholder="08xxxx"
                    className="w-full px-4 text-sm font-medium outline-none"
                    style={{ height: 52, background: '#F4F4F9', borderRadius: 24, border: '1.5px solid transparent', color: '#1a1a2e' }}
                    onFocus={e => e.target.style.borderColor = '#3ec976'}
                    onBlur={e => e.target.style.borderColor = 'transparent'}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-extrabold text-gray-700 mb-1.5 block uppercase tracking-wide">
                  Alamat Toko
                </label>
                <textarea
                  value={storeAddress}
                  onChange={e => setStoreAddress(e.target.value)}
                  rows={3}
                  placeholder="Alamat lengkap untuk verifikasi"
                  className="w-full px-4 py-3 text-sm font-medium outline-none resize-none"
                  style={{ background: '#F4F4F9', borderRadius: 16, border: '1.5px solid transparent', color: '#1a1a2e' }}
                  onFocus={e => e.target.style.borderColor = '#3ec976'}
                  onBlur={e => e.target.style.borderColor = 'transparent'}
                />
              </div>
            </>
          )}

          {[
            { label: t('full_name'), value: fullName, set: setFullName, type: 'text', placeholder: 'Nama Lengkap' },
            { label: t('email'), value: email, set: setEmail, type: 'email', placeholder: 'email@domain.com' },
          ].map(field => (
            <div key={field.label}>
              <label className="text-xs font-extrabold text-gray-700 mb-1.5 block uppercase tracking-wide">
                {field.label}
              </label>
              <input
                type={field.type}
                value={field.value}
                onChange={e => field.set(e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 text-sm font-medium outline-none"
                style={{
                  height: 52, background: '#F4F4F9', borderRadius: 24,
                  border: '1.5px solid transparent', color: '#1a1a2e',
                }}
                onFocus={e => e.target.style.borderColor = '#3ec976'}
                onBlur={e => e.target.style.borderColor = 'transparent'}
              />
            </div>
          ))}

          <div>
            <label className="text-xs font-extrabold text-gray-700 mb-1.5 block uppercase tracking-wide">
              {t('password')}
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 karakter"
                className="w-full px-4 pr-12 text-sm font-medium outline-none"
                style={{
                  height: 52, background: '#F4F4F9', borderRadius: 24,
                  border: '1.5px solid transparent', color: '#1a1a2e',
                }}
                onFocus={e => e.target.style.borderColor = '#3ec976'}
                onBlur={e => e.target.style.borderColor = 'transparent'}
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-extrabold text-gray-700 mb-1.5 block uppercase tracking-wide">
              {t('confirm_password')}
            </label>
            <input
              type={showPw ? 'text' : 'password'}
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              placeholder="Ulangi kata sandi"
              className="w-full px-4 text-sm font-medium outline-none"
              style={{
                height: 52, background: '#F4F4F9', borderRadius: 24,
                border: '1.5px solid transparent', color: '#1a1a2e',
              }}
              onFocus={e => e.target.style.borderColor = '#3ec976'}
              onBlur={e => e.target.style.borderColor = 'transparent'}
            />
          </div>
        </div>
      </div>

      <div className="px-6 pb-10 flex flex-col gap-3">
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center"
          style={{ background: loading ? '#9ca3af' : '#3ec976' }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner" />
          ) : t('register')}
        </button>
        <p className="text-center text-sm text-gray-500">
          {t('have_account')}{' '}
          <button onClick={() => navigate('login')} className="font-bold" style={{ color: '#3ec976' }}>
            {t('sign_in')}
          </button>
        </p>
      </div>
    </div>
  )
}
