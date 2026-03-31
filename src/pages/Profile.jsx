import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import i18n from '../i18n'

export default function Profile({ navigate }) {
  const { t } = useTranslation()
  const { user, profile, signOut } = useAuth()
  const [lang, setLang] = useState(i18n.language)
  const [toggles, setToggles] = useState({
    profileVisible: true,
    allowContact: true,
    showContact: false,
    pushNotif: true,
    smsAlerts: false,
    emailSummary: true,
  })

  const toggleSwitch = (key) => setToggles(t => ({ ...t, [key]: !t[key] }))

  const handleLang = (l) => {
    i18n.changeLanguage(l)
    setLang(l)
  }

  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleLogout = async () => {
    if (window.confirm(t('logout_confirm'))) {
      await signOut()
    }
  }

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      return
    }
    if (!window.confirm('PERHATIAN: Akun akan dihapus permanen. Lanjutkan?')) {
      setDeleteConfirm(false)
      return
    }
    setDeleting(true)
    try {
      await supabase.from('wishlists').delete().eq('user_id', user.id)
      await supabase.from('profiles').delete().eq('id', user.id)
      await signOut()
    } catch (err) {
      alert('Gagal menghapus akun: ' + err.message)
    } finally {
      setDeleting(false)
      setDeleteConfirm(false)
    }
  }

  if (!user) return (
    <div className="flex flex-col min-h-screen items-center justify-center pb-28 px-6">
      <div className="text-5xl mb-4">👤</div>
      <p className="font-bold text-lg text-center mb-2" style={{ color: '#1a1a2e' }}>Login untuk melihat profil</p>
      <button onClick={() => navigate('login')}
        className="px-8 py-3 rounded-2xl font-bold text-white mt-4"
        style={{ background: '#3ec976' }}>
        {t('sign_in')}
      </button>
    </div>
  )

  const ecoScore = 88
  const contributions = [
    { icon: '🌿', title: 'Rescued groceries from GreenMart', date: 'Mar 18 • 7 items' },
    { icon: '📺', title: 'Telethon donation to Haven Shelter', date: 'Mar 14 • 12 items' },
    { icon: '🥗', title: 'Meals redistributed to Community Fridge', date: 'Mar 14 • 20+ items' },
  ]

  return (
    <div className="flex flex-col min-h-screen pb-28" style={{ background: '#F4F4F9' }}>
      <div className="px-4 pt-14 pb-6 bg-white shadow-sm sticky top-0 z-30 animate-slide-up">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-[22px] flex items-center justify-center text-3xl flex-shrink-0 select-none shadow-soft"
            style={{ background: 'rgba(62,201,118,0.15)' }}
          >
            {profile?.avatar_url
              ? <img src={profile.avatar_url} className="w-full h-full rounded-[22px] object-cover" alt="avatar" />
              : '🌿'
            }
          </div>
          <div className="flex-1">
            <p className="font-black text-lg leading-tight mb-0.5" style={{ color: '#1a1a2e' }}>
              {profile?.full_name || user.email?.split('@')[0]}
            </p>
            <p className="text-[13px] text-gray-500">{user.email}</p>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl mt-2 inline-block shadow-sm"
              style={{
                background: profile?.is_verified ? 'rgba(62,201,118,0.1)' : 'rgba(245,158,11,0.1)',
                color: profile?.is_verified ? '#3ec976' : '#f59e0b'
              }}>
              {profile?.partner_status === 'approved'
                ? '✅ Partner Disetujui'
                : profile?.partner_status === 'pending' || profile?.partner_status === 'under_review'
                  ? '⏳ Verifikasi Partner'
                  : profile?.is_verified
                    ? '✅ Terverifikasi'
                    : '👤 Akun Customer'}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-[52px] h-[52px] rounded-2xl flex flex-col items-center justify-center shadow-soft hover:scale-105 transition-transform cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #3ec976 0%, #28a35a 100%)' }}>
              <span className="text-xl font-black text-white">{ecoScore}</span>
              <span className="text-[9px] text-white opacity-90 font-medium">ECO</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        <div className="bg-white rounded-[24px] p-5 shadow-soft animate-slide-up stagger-1">
          <p className="font-black text-[15px] mb-3" style={{ color: '#1a1a2e' }}>{t('trust_store')}</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t('items_rescued'), value: '1.24', icon: '♻️' },
              { label: t('items_shared'), value: '324', icon: '🤝' },
              { label: t('co2_saved'), value: '2.89kg', icon: '🌍' },
            ].map(stat => (
              <div key={stat.label} className="flex flex-col items-center p-3 rounded-2xl border border-gray-50 bg-[#F9FAFB] hover:scale-105 transition-transform duration-300">
                <span className="text-xl mb-1">{stat.icon}</span>
                <span className="font-black text-[15px]" style={{ color: '#1a1a2e' }}>{stat.value}</span>
                <span className="text-[10px] text-gray-400 text-center leading-tight mt-0.5 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent contributions */}
        <div className="bg-white rounded-[24px] p-5 shadow-soft animate-slide-up stagger-2">
          <div className="flex items-center justify-between mb-4">
            <p className="font-black text-[15px]" style={{ color: '#1a1a2e' }}>{t('recent_contributions')}</p>
            <button className="text-xs font-bold" style={{ color: '#3ec976' }}>See all</button>
          </div>
          {contributions.map((c, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer px-2 -mx-2">
              <div className="w-11 h-11 rounded-[16px] flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: '#F4F4F9' }}>{c.icon}</div>
              <div>
                <p className="text-[13px] font-bold" style={{ color: '#1a1a2e' }}>{c.title}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{c.date}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Language */}
        <div className="bg-white rounded-[24px] p-5 shadow-soft animate-slide-up stagger-2">
          <p className="font-black text-[15px] mb-3" style={{ color: '#1a1a2e' }}>{t('language')}</p>
          <div className="flex gap-2">
            {[
              { code: 'id', label: '🇮🇩 Bahasa Indonesia' },
              { code: 'en', label: '🇬🇧 English' },
            ].map(l => (
              <button
                key={l.code}
                onClick={() => handleLang(l.code)}
                className="flex-1 py-3 border border-gray-100 rounded-xl text-[13px] font-bold transition-all duration-300 active:scale-95"
                style={{
                  background: lang === l.code ? '#3ec976' : '#fff',
                  color: lang === l.code ? '#fff' : '#6b7280',
                  boxShadow: lang === l.code ? '0 4px 12px rgba(62,201,118,0.2)' : 'none'
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy & Verification */}
        <div className="bg-white rounded-[24px] p-5 shadow-soft animate-slide-up stagger-3">
          <p className="font-black text-[15px] mb-2" style={{ color: '#1a1a2e' }}>{t('privacy_settings')}</p>
          <div className="flex flex-col">
            {[
              { key: 'profileVisible', label: t('profile_visibility') },
              { key: 'allowContact', label: t('allow_partner_contact') },
              { key: 'showContact', label: t('show_contact_details') },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
                <span className="text-[14px] text-gray-700 font-medium">{item.label}</span>
                <button
                  onClick={() => toggleSwitch(item.key)}
                  className="w-12 h-[26px] rounded-full transition-all duration-300 relative flex-shrink-0"
                  style={{ background: toggles[item.key] ? '#3ec976' : '#e5e7eb' }}
                >
                  <div className="w-[22px] h-[22px] rounded-full bg-white absolute top-[2px] transition-all duration-300"
                    style={{ left: toggles[item.key] ? '24px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-[24px] p-5 shadow-soft animate-slide-up stagger-3">
          <p className="font-black text-[15px] mb-2" style={{ color: '#1a1a2e' }}>{t('notifications')}</p>
          <div className="flex flex-col">
            {[
              { key: 'pushNotif', label: t('push_notifications') },
              { key: 'smsAlerts', label: t('sms_alerts') },
              { key: 'emailSummary', label: t('email_summaries') },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
                <span className="text-[14px] text-gray-700 font-medium">{item.label}</span>
                <button
                  onClick={() => toggleSwitch(item.key)}
                  className="w-12 h-[26px] rounded-full transition-all duration-300 relative"
                  style={{ background: toggles[item.key] ? '#3ec976' : '#e5e7eb' }}
                >
                  <div className="w-[22px] h-[22px] rounded-full bg-white absolute top-[2px] transition-all duration-300"
                    style={{ left: toggles[item.key] ? '24px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Support & Legal */}
        <div className="bg-white rounded-[24px] p-5 shadow-soft animate-slide-up stagger-4">
          <p className="font-black text-[15px] mb-2" style={{ color: '#1a1a2e' }}>{t('support')}</p>
          <div className="flex flex-col">
            {[
              { label: '💬  ' + t('support_chat'), action: () => navigate('chat') },
              { label: '📋  ' + t('community_guidelines'), action: () => navigate('legal', { type: 'guidelines' }) },
              { label: '🔒  ' + t('privacy_policy'), action: () => navigate('legal', { type: 'privacy' }) },
              { label: '📄  ' + t('terms_of_service'), action: () => navigate('legal', { type: 'terms' }) },
            ].map((item, i) => (
              <button key={i} onClick={item.action}
                className="w-full flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0 active:bg-gray-50 transition-colors text-left">
                <span className="text-[14px] text-gray-700 font-medium whitespace-pre">{item.label}</span>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#d1d5db" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-2xl font-black text-base animate-slide-up stagger-5 active:scale-95 transition-transform"
          style={{ background: '#1a1a2e', color: '#fff' }}
        >
          🚪 {t('logout')}
        </button>

        {/* Delete account */}
        <button
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="w-full py-3.5 rounded-[20px] font-bold text-[13px] animate-slide-up stagger-5 active:scale-95 transition-transform"
          style={{ background: deleteConfirm ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)', color: '#ef4444', border: deleteConfirm ? '1.5px solid rgba(239,68,68,0.3)' : '1.5px solid transparent' }}
        >
          {deleting ? 'Sedang menghapus...' : deleteConfirm ? '⚠️ Tekan sekali lagi untuk Konfirmasi' : `🗑️ ${t('delete_account')}`}
        </button>

        <p className="text-center text-xs text-gray-400 pb-2">
          © 0 Waste Shop Food • Build for community sharing — 2026
        </p>
      </div>
    </div>
  )
}
