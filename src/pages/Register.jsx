import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'

export default function Register({ navigate }) {
  const { t } = useTranslation()
  const { show } = useToast()
  
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [role, setRole] = useState('customer')
  const [storeName, setStoreName] = useState('')
  const [businessType, setBusinessType] = useState('restaurant')
  const [storePhone, setStorePhone] = useState('')
  const [storeAddress, setStoreAddress] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!fullName) e.fullName = t('err_name_required')
    if (!email || !/\S+@\S+\.\S+/.test(email)) e.email = t('err_invalid_email')
    if (!password || password.length < 6) e.password = t('err_password_short')
    if (password !== confirmPw) e.confirmPw = t('err_password_match')
    
    if (role === 'partner' && !storeName.trim()) {
      e.storeName = 'Nama toko wajib diisi untuk akun partner.'
    }
    
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleRegister = async () => {
    if (!validate()) return
    
    setLoading(true)
    const { data, error: e } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } }
    })
    
    if (e) {
      show(t('err_register_failed'), 'error')
      setLoading(false)
      return
    }
    
    if (data.user) {
      const { error: pErr } = await supabase.from('profiles').upsert({
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
      
      if (pErr) {
        show('Gagal menyimpan profil: ' + pErr.message, 'error')
        setLoading(false)
        return
      }
    }
    
    setLoading(false)
    setSuccess(true)
    show('Pendaftaran berhasil!', 'success')
  }

  if (success) return (
    <div className="flex flex-col min-h-screen items-center justify-center px-6 bg-white">
      <div className="text-center animate-pop-in">
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-soft"
          style={{ background: 'rgba(62,201,118,0.12)', boxShadow: '0 8px 32px rgba(62,201,118,0.2)' }}>
          ✅
        </div>
        <h2 className="text-[28px] font-black mb-3 leading-tight" style={{ color: '#1a1a2e' }}>Hampir Selesai!</h2>
        <p className="text-gray-400 font-medium mb-10">{t('email_verification_sent')}</p>
        
        {role === 'partner' && (
          <Card className="mb-8 border border-amber-100" padding="p-4" style={{ background: 'rgba(245,158,11,0.05)' }}>
            <p className="text-xs font-bold text-amber-600 leading-relaxed">
              Akun partner kamu dalam antrian verifikasi. Kami akan memberitahu kamu setelah disetujui.
            </p>
          </Card>
        )}
        
        <Button onClick={() => navigate('login')}>
          {t('sign_in')}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex items-center px-4 pt-14 pb-2">
        <button onClick={() => navigate('welcome')} className="p-2 -ml-2 rounded-xl active:scale-95 transition-all text-[#1a1a2e]">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="flex-1 px-6 pt-4 overflow-y-auto no-scrollbar animate-fade-in">
        <div className="mb-8">
          <h1 className="text-[28px] font-black leading-tight" style={{ color: '#1a1a2e' }}>{t('sign_up')}</h1>
          <p className="text-gray-400 font-medium mt-1.5">{t('app_name')}</p>
        </div>

        <div className="flex flex-col gap-8 pb-10">
          {/* Role selector */}
          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">
              Daftar sebagai
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'customer', label: t('role_customer'), icon: '🛍️', desc: 'Buyer' },
                { value: 'partner', label: t('role_partner'), icon: '🏪', desc: 'Seller' },
              ].map(r => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className="relative p-4 rounded-[24px] text-left transition-all duration-300"
                  style={{
                    border: `2px solid ${role === r.value ? '#3ec976' : '#F4F4F9'}`,
                    background: role === r.value ? 'white' : '#F4F4F9',
                    boxShadow: role === r.value ? '0 8px 24px rgba(62,201,118,0.15)' : 'none',
                  }}
                >
                  <span className="text-2xl mb-2 block">{r.icon}</span>
                  <p className="font-black text-sm" style={{ color: '#1a1a2e' }}>{r.label}</p>
                  <p className="text-[10px] uppercase font-bold text-gray-400 mt-0.5 tracking-wider">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {role === 'partner' && (
            <div className="flex flex-col gap-6 animate-slide-up">
              <Input 
                label="Nama Toko"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                placeholder="Contoh: GreenBite Surplus"
                error={errors.storeName}
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Tipe</label>
                   <select
                     value={businessType}
                     onChange={e => setBusinessType(e.target.value)}
                     className="w-full h-[54px] px-5 bg-[#F4F4F9] rounded-[20px] font-bold text-sm outline-none border-[1.5px] border-transparent focus:border-[#3ec976] transition-all"
                   >
                     <option value="restaurant">Restaurant</option>
                     <option value="cafe">Cafe</option>
                     <option value="hotel">Hotel</option>
                     <option value="catering">Catering</option>
                     <option value="other">Other</option>
                   </select>
                </div>
                <Input 
                  label="No. HP Toko"
                  value={storePhone}
                  onChange={e => setStorePhone(e.target.value)}
                  placeholder="08xxxx"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Alamat Toko</label>
                <textarea
                  value={storeAddress}
                  onChange={e => setStoreAddress(e.target.value)}
                  rows={3}
                  placeholder="Alamat lengkap lokasi pickup..."
                  className="w-full p-5 bg-[#F4F4F9] rounded-[20px] font-bold text-sm outline-none border-[1.5px] border-transparent focus:border-[#3ec976] transition-all resize-none"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-6">
            <Input 
              label={t('full_name')}
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Nama Lengkap"
              error={errors.fullName}
              autoComplete="name"
            />
            <Input 
              label={t('email')}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@domain.com"
              error={errors.email}
              autoComplete="email"
            />
            <Input 
              label={t('password')}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 6 Karakter"
              error={errors.password}
              autoComplete="new-password"
            />
            <Input 
              label={t('confirm_password')}
              type="password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              placeholder="Ulangi Kata Sandi"
              error={errors.confirmPw}
              autoComplete="new-password"
            />
          </div>
        </div>
      </div>

      <div className="px-6 pb-12 flex flex-col gap-4 bg-white pt-4 shadow-[0_-12px_24px_rgba(0,0,0,0.02)]">
        <Button 
          onClick={handleRegister}
          loading={loading}
        >
          {t('register')}
        </Button>
        <p className="text-center text-sm font-medium text-gray-400">
          {t('have_account')}{' '}
          <button onClick={() => navigate('login')} className="font-black" style={{ color: '#1a1a2e' }}>
            {t('sign_in')}
          </button>
        </p>
      </div>
    </div>
  )
}
