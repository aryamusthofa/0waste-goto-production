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
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'

export default function Profile({ navigate }) {
  const { t } = useTranslation()
  const { user, profile, isDeveloper, signOut } = useAuth()
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

  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')

  const toggleSwitch = (key) => setToggles(t => ({ ...t, [key]: !t[key] }))

  const handleLang = (l) => {
    i18n.changeLanguage(l)
    setLang(l)
    show(t('language_changed'), 'success')
  }

  const handleLogout = async () => {
    try {
      await signOut()
      show(t('logout_success'), 'info')
      setShowLogoutModal(false)
    } catch (e) {
      show('Gagal keluar: ' + e.message, 'error')
    }
  }

  const handleDeleteAccount = () => {
    setShowDeleteModal(true)
    setDeleteInput('')
  }

  const executeDeleteDeleteAccount = async () => {
    if (deleteInput !== t('delete_confirm_phrase')) {
      show('Frase konfirmasi tidak cocok.', 'error')
      return
    }

    setDeleting(true)
    try {
      const { data, error } = await supabase.rpc('user_self_delete')
      const result = typeof data === 'string' ? JSON.parse(data) : data
      
      if (error || !result.success) throw new Error(error?.message || result.error)
      
      show(t('delete_account_success') || 'Account deleted.', 'success')
      setShowDeleteModal(false)
      await signOut()
    } catch (err) {
      show('Gagal menghapus akun: ' + (err.message || 'Error tidak dikenal.'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (!user) return (
    <div className="flex flex-col min-h-screen items-center justify-center p-8 bg-white text-center">
       <div className="text-7xl mb-8 animate-pop-in">👤</div>
       <h2 className="text-2xl font-black text-[#1a1a2e] mb-2 leading-tight">{t('profile_locked')}</h2>
       <p className="text-gray-400 font-medium mb-12 max-w-[240px]">{t('profile_locked_desc')}</p>
       <Button onClick={() => navigate('login')} className="max-w-[200px]">{t('sign_in')}</Button>
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
                {isDeveloper && (
                  <span className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-600 text-white rounded-lg text-[9px] font-black tracking-tighter align-middle animate-pulse">
                    🛡️ ROOT
                  </span>
                )}
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
           <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] px-1">{t('green_stats')}</h3>
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
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{t('recent_contributions')}</h3>
              <button className="text-[10px] font-black text-[#3ec976] uppercase tracking-widest">{t('view_all')}</button>
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
           <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] px-1">{t('privacy_settings')}</h3>
           
           <div className="flex flex-col gap-4">
              {/* Language Switch */}
              <Card padding="p-5" className="flex flex-col gap-4">
                 <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">{t('language')}</p>
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
                          background: lang === l.code ? '#3ec976' : '#F9FAFB',
                          color: lang === l.code ? '#fff' : '#1a1a2e',
                          borderColor: lang === l.code ? '#3ec976' : 'transparent',
                          boxShadow: lang === l.code ? '0 8px 24px rgba(62,201,118,0.2)' : 'none'
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
              {isDeveloper && (
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

        {/* Support & Support */}
        <div className="flex flex-col gap-4 mt-6">
           <button 
             onClick={() => navigate('support')}
             className="w-full flex items-center justify-between p-5 bg-white rounded-[24px] shadow-sm border border-gray-50 active:scale-[0.98] transition-all"
           >
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-[#3ec976] flex items-center justify-center text-2xl shadow-soft">🚀</div>
               <div className="text-left">
                  <p className="text-[15px] font-black text-[#1a1a2e]">{t('support_chat_now')}</p>
                  <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Direct to Developer (Mas CEO)</p>
               </div>
             </div>
             <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#D1D5DB" strokeWidth={3}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
             </svg>
           </button>
        </div>

        {/* Danger Zone */}
        <div className="flex flex-col gap-4 mt-4 pb-12">
           <Button 
             variant="dark" 
             className="!h-16 !rounded-[24px] !font-black !text-base shadow-lg"
             onClick={() => setShowLogoutModal(true)}
           >
             📦 {t('logout')}
           </Button>
           
           <button
             onClick={handleDeleteAccount}
             disabled={deleting}
             className="w-full py-5 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all duration-300 opacity-60 hover:opacity-100 text-red-500"
           >
             {t('delete_account')}
           </button>
           
           <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest mt-4">
              0Waste Shop v1.0.0-production
           </p>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !deleting && setShowDeleteModal(false)}
        title={t('delete_confirm_title')}
      >
        <div className="flex flex-col gap-6">
           <Card padding="p-5" className="bg-red-50 border border-red-100">
              <div className="flex gap-4">
                 <span className="text-2xl">⚠️</span>
                 <p className="text-sm font-bold text-red-600 leading-relaxed">
                   {t('delete_confirm_desc')}
                 </p>
              </div>
           </Card>

           <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">
                {t('delete_confirm_input_label')}
              </label>
              <Input
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder={t('delete_confirm_phrase')}
                className="!bg-white"
              />
           </div>

           <div className="flex flex-col gap-3 mt-4">
              <Button
                variant="danger"
                className="!h-16 !rounded-[24px] !font-black !text-base shadow-lg"
                disabled={deleteInput !== t('delete_confirm_phrase') || deleting}
                loading={deleting}
                onClick={executeDeleteDeleteAccount}
              >
                🔥 {t('delete_account')}
              </Button>
              <Button
                variant="secondary"
                className="!h-14 !rounded-[22px] !font-black !text-sm"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                {t('cancel')}
              </Button>
           </div>
        </div>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title={t('logout')}
      >
        <div className="flex flex-col gap-8">
           <div className="text-center">
              <div className="text-5xl mb-6">📦</div>
              <p className="font-bold text-[#1a1a2e] text-lg leading-tight">
                {t('logout_confirm')}
              </p>
           </div>
           
           <div className="flex flex-col gap-3">
              <Button 
                variant="dark"
                className="!h-14 !rounded-[22px] !font-black !text-base"
                onClick={handleLogout}
              >
                {t('logout')}
              </Button>
              <Button 
                variant="secondary"
                className="!h-12 !rounded-[20px] !font-black !text-sm"
                onClick={() => setShowLogoutModal(false)}
              >
                {t('cancel')}
              </Button>
           </div>
        </div>
      </Modal>
    </div>
  )
}
