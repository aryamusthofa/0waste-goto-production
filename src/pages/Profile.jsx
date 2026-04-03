import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { supabase } from '../lib/supabase'
import i18n from '../i18n'

// UI Atoms
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

export default function Profile({ navigate }) {
  const { t } = useTranslation()
  const { user, profile, signOut } = useAuth()
  const { show } = useToast()
  
  const [lang, setLang] = useState(i18n.language)
  const [toggles, setToggles] = useState({
    profileVisible: true,
    allowContact: true,
    showContact: false,
    pushNotif: true,
    smsAlerts: false,
    emailSummary: true,
  })

  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const toggleSwitch = (key) => setToggles(t => ({ ...t, [key]: !t[key] }))

  const handleLang = (l) => {
    i18n.changeLanguage(l)
    setLang(l)
    show(t('language_changed'), 'success')
  }

  const handleLogout = async () => {
    // We'll use a standard confirmation instead of window.confirm for production
    if (window.confirm(t('logout_confirm'))) {
      try {
        await signOut()
        show('Berhasil keluar.', 'info')
      } catch (e) {
        show('Gagal keluar: ' + e.message, 'error')
      }
    }
  }

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      show('Tekan sekali lagi untuk konfirmasi penghapusan akun.', 'warning')
      return
    }
    
    setDeleting(true)
    try {
      const { data, error } = await supabase.rpc('user_self_delete')
      const result = typeof data === 'string' ? JSON.parse(data) : data
      
      if (error || !result.success) throw new Error(error?.message || result.error)
      
      show('Akun berhasil dihapus. Sampai jumpa lagi!', 'success')
      await signOut()
    } catch (err) {
      show('Gagal menghapus akun: ' + (err.message || 'Error tidak dikenal.'), 'error')
      setDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  if (!user) return (
    <div className="flex flex-col min-h-screen items-center justify-center p-8 bg-white text-center">
       <div className="text-7xl mb-8 animate-pop-in">👤</div>
       <h2 className="text-2xl font-black text-[#1a1a2e] mb-2 leading-tight">Masuk ke Profil</h2>
       <p className="text-gray-400 font-medium mb-12 max-w-[240px]">Kelola pesanan, riwayat donasi, dan pengaturan akun kamu.</p>
       <Button onClick={() => navigate('login')} className="max-w-[200px]">Sign In</Button>
    </div>
  )

  const ecoScore = 88
  const contributions = [
    { icon: '🌿', title: 'Rescued groceries from GreenMart', date: 'Mar 18 • 7 items' },
    { icon: '📺', title: 'Telethon donation to Haven Shelter', date: 'Mar 14 • 12 items' },
    { icon: '🥗', title: 'Meals redistributed to Community Fridge', date: 'Mar 14 • 20+ items' },
  ]

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-[#F9FAFB]">
      {/* Header Profile */}
      <div className="px-6 pt-16 pb-10 bg-white rounded-b-[48px] shadow-[0_8px_32px_rgba(0,0,0,0.02)] relative z-20">
        <div className="flex items-center gap-5">
           <div className="relative group">
              <Card className="w-20 h-20 rounded-[28px] overflow-hidden flex items-center justify-center text-4xl shadow-soft" padding="p-0">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar" />
                  : <span className="select-none animate-pulse">🌿</span>
                }
              </Card>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#3ec976] rounded-xl border-4 border-white flex items-center justify-center text-[10px] text-white shadow-sm">
                ⭐
              </div>
           </div>
           
           <div className="flex-1 min-w-0">
              <h1 className="text-[22px] font-black text-[#1a1a2e] leading-tight truncate">
                {profile?.full_name || user.email?.split('@')[0]}
              </h1>
              <p className="text-xs font-bold text-gray-400 mt-0.5 truncate uppercase tracking-tight">{user.email}</p>
              
              <div className="flex gap-2 mt-3">
                 <Badge variant={profile?.is_verified ? 'success' : 'warning'} className="!px-2.5 !py-0.5 !text-[9px] uppercase tracking-wider">
                   {profile?.partner_status === 'approved' ? 'Partner Premium' : profile?.is_verified ? 'Verified Citizen' : 'Community Member'}
                 </Badge>
              </div>
           </div>

           <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-soft hover:scale-105 transition-all duration-300 cursor-pointer text-white"
                style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #3ec976 100%)' }}>
                <span className="text-lg font-black">{ecoScore}</span>
                <span className="text-[8px] font-black uppercase opacity-80 tracking-widest">ECO</span>
              </div>
           </div>
        </div>
      </div>

      <div className="px-6 pt-10 flex flex-col gap-8">
        {/* Eco Stats */}
        <div className="flex flex-col gap-4">
           <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] px-1">Statistik Hijau</h3>
           <Card padding="p-6">
              <div className="grid grid-cols-3 gap-6">
                 {[
                   { label: t('items_rescued'), value: '1.24', icon: '♻️' },
                   { label: t('items_shared'), value: '324', icon: '🤝' },
                   { label: t('co2_saved'), value: '2.89', unit: 'kg', icon: '🌍' },
                 ].map(stat => (
                   <div key={stat.label} className="flex flex-col items-center text-center">
                      <span className="text-2xl mb-3">{stat.icon}</span>
                      <p className="text-base font-black text-[#1a1a2e]">{stat.value}<span className="text-[10px] ml-0.5">{stat.unit || ''}</span></p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase leading-tight mt-1">{stat.label}</p>
                   </div>
                 ))}
              </div>
           </Card>
        </div>

        {/* Recent Contributions */}
        <div className="flex flex-col gap-4">
           <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Kontribusi Terakhir</h3>
              <button className="text-[10px] font-black text-[#3ec976] uppercase tracking-widest">Lihat Semua</button>
           </div>
           <Card padding="p-1">
              <div className="flex flex-col">
                {contributions.map((c, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-[20px] transition-colors cursor-pointer group">
                    <div className="w-11 h-11 bg-white rounded-xl shadow-soft flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">{c.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-[#1a1a2e] truncate">{c.title}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-0.5">{c.date}</p>
                    </div>
                  </div>
                ))}
              </div>
           </Card>
        </div>

        {/* Global Settings */}
        <div className="flex flex-col gap-6">
           <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] px-1">Pengaturan & Privasi</h3>
           
           <div className="flex flex-col gap-4">
              {/* Language Switch */}
              <Card padding="p-5" className="flex flex-col gap-4">
                 <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Bahasa Aplikasi</p>
                 <div className="flex gap-2">
                    {[
                      { code: 'id', label: '🇮🇩 ID' },
                      { code: 'en', label: '🇬🇧 EN' },
                    ].map(l => (
                      <button
                        key={l.code}
                        onClick={() => handleLang(l.code)}
                        className="flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 border-2"
                        style={{
                          background: lang === l.code ? '#1a1a2e' : '#F9FAFB',
                          color: lang === l.code ? '#fff' : '#6b7280',
                          borderColor: lang === l.code ? '#1a1a2e' : 'transparent'
                        }}
                      >
                        {l.label}
                      </button>
                    ))}
                 </div>
              </Card>

              {/* Toggles (Privacy & Notifications) */}
              <Card padding="p-2">
                 <div className="flex flex-col">
                    {[
                      { key: 'profileVisible', label: t('profile_visibility'), icon: '👁️' },
                      { key: 'allowContact', label: t('allow_partner_contact'), icon: '📞' },
                      { key: 'pushNotif', label: t('push_notifications'), icon: '🔔' },
                      { key: 'emailSummary', label: t('email_summaries'), icon: '📧' },
                    ].map((item, idx) => (
                      <div key={item.key} className={`flex items-center justify-between p-4 ${idx !== 3 ? 'border-b border-gray-50' : ''}`}>
                         <div className="flex items-center gap-3">
                            <span className="text-lg">{item.icon}</span>
                            <span className="text-sm font-bold text-gray-700">{item.label}</span>
                         </div>
                         <button
                           onClick={() => toggleSwitch(item.key)}
                           className="w-11 h-6 rounded-full transition-all duration-300 relative flex-shrink-0"
                           style={{ background: toggles[item.key] ? '#3ec976' : '#E2E8F0' }}
                         >
                           <div className="w-[18px] h-[18px] rounded-full bg-white absolute top-[3px] transition-all duration-300 shadow-sm"
                             style={{ left: toggles[item.key] ? '22px' : '3px' }} />
                         </button>
                      </div>
                    ))}
                 </div>
              </Card>

              {/* Support & Legal Links */}
              <Card padding="p-2">
                 <div className="flex flex-col">
                    {[
                      { label: t('support_chat'), icon: '💬', action: () => navigate('zera') },
                      { label: t('privacy_policy'), icon: '🔒', action: () => navigate('legal', { type: 'privacy' }) },
                      { label: t('terms_of_service'), icon: '📄', action: () => navigate('legal', { type: 'terms' }) },
                    ].map((item, idx) => (
                      <button key={idx} onClick={item.action} className={`flex items-center justify-between p-5 group text-left ${idx !== 2 ? 'border-b border-gray-50' : ''}`}>
                         <div className="flex items-center gap-3">
                            <span className="text-lg">{item.icon}</span>
                            <span className="text-sm font-bold text-gray-700">{item.label}</span>
                         </div>
                         <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-300 group-hover:text-[#3ec976] group-hover:translate-x-1 transition-all">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                         </svg>
                      </button>
                    ))}
                 </div>
              </Card>

              {/* Developer / Admin Console */}
              {profile?.is_super_admin && (
                <Card className="border-2 border-dashed border-[#3ec976]/30 bg-[#3ec976]/5" padding="p-4">
                   <Button 
                     variant="success" 
                     className="!h-14 !rounded-2xl !uppercase !tracking-[0.15em] !font-black !text-[11px]"
                     onClick={() => navigate('admin')}
                   >
                     🔱 Administrator Console
                   </Button>
                </Card>
              )}
           </div>
        </div>

        {/* Danger Zone */}
        <div className="flex flex-col gap-4 mt-4 pb-12">
           <Button 
             variant="dark" 
             className="!h-16 !rounded-[24px] !font-black !text-base"
             onClick={handleLogout}
           >
             📦 Keluar Sesi
           </Button>
           
           <button
             onClick={handleDeleteAccount}
             disabled={deleting}
             className="w-full py-5 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all duration-300"
             style={{ 
               background: deleteConfirm ? 'rgba(239,68,68,0.1)' : 'transparent', 
               color: '#ef4444',
               border: '2px solid transparent',
               borderColor: deleteConfirm ? '#ef4444' : 'transparent'
             }}
           >
             {deleting ? 'Processing...' : deleteConfirm ? '⚠️ Tekan lagi untuk Konfirmasi' : 'Hapus Akun Permanen'}
           </button>
           
           <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest mt-4">
              0Waste Shop v1.0.0-production
           </p>
        </div>
      </div>
    </div>
  )
}
