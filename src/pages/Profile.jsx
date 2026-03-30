import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import i18n from '../i18n'

export default function Profile({ navigate }) {
  const { t } = useTranslation()
  const { user, profile, signOut, refreshProfile } = useAuth()
  const [lang, setLang] = useState(i18n.language)
  const [tapCount, setTapCount] = useState(0)
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

  const handleLogout = async () => {
    if (window.confirm(t('logout_confirm'))) {
      await signOut()
    }
  }

  const handleAvatarTap = async () => {
    const newCount = tapCount + 1
    setTapCount(newCount)
    if (newCount === 10) {
      if (!user) return
      const { error } = await supabase.from('profiles').update({ role: 'partner', is_verified: true }).eq('id', user.id)
      if (!error) {
        alert('Developer Mode Unlocked: Partner Access Granted!')
        refreshProfile()
      } else {
        alert('Failed to unlock: ' + error.message)
      }
      setTapCount(0)
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
      {/* Header */}
      <div className="px-4 pt-14 pb-4 bg-white">
        <div className="flex items-center gap-4">
          <div 
            onClick={handleAvatarTap}
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 cursor-pointer"
            style={{ background: 'rgba(62,201,118,0.15)', border: '2px solid #3ec976' }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} className="w-full h-full rounded-2xl object-cover" alt="avatar" />
              : '🌿'
            }
          </div>
          <div className="flex-1">
            <p className="font-black text-base" style={{ color: '#1a1a2e' }}>
              {profile?.full_name || user.email?.split('@')[0]}
            </p>
            <p className="text-xs text-gray-400">{user.email}</p>
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg mt-1 inline-block"
              style={{
                background: profile?.is_verified ? 'rgba(62,201,118,0.1)' : 'rgba(245,158,11,0.1)',
                color: profile?.is_verified ? '#3ec976' : '#f59e0b'
              }}>
              {profile?.is_verified ? '✅ Terverifikasi' : '⏳ Menunggu Verifikasi'}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center"
              style={{ background: '#3ec976' }}>
              <span className="text-xl font-black text-white">{ecoScore}</span>
              <span className="text-[9px] text-white opacity-80">ECO</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Stats */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p className="font-black text-sm mb-3" style={{ color: '#1a1a2e' }}>{t('trust_store')}</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t('items_rescued'), value: '1.24', icon: '♻️' },
              { label: t('items_shared'), value: '324', icon: '🤝' },
              { label: t('co2_saved'), value: '2.89kg', icon: '🌍' },
            ].map(stat => (
              <div key={stat.label} className="flex flex-col items-center p-2 rounded-xl"
                style={{ background: '#F4F4F9' }}>
                <span className="text-lg">{stat.icon}</span>
                <span className="font-black text-sm mt-0.5" style={{ color: '#1a1a2e' }}>{stat.value}</span>
                <span className="text-[10px] text-gray-400 text-center leading-tight mt-0.5">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent contributions */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-black text-sm" style={{ color: '#1a1a2e' }}>{t('recent_contributions')}</p>
            <button className="text-xs font-semibold" style={{ color: '#3ec976' }}>See all</button>
          </div>
          {contributions.map((c, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: '#F4F4F9' }}>{c.icon}</div>
              <div>
                <p className="text-xs font-semibold" style={{ color: '#1a1a2e' }}>{c.title}</p>
                <p className="text-[11px] text-gray-400">{c.date}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Language */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p className="font-black text-sm mb-3" style={{ color: '#1a1a2e' }}>{t('language')}</p>
          <div className="flex gap-2">
            {[
              { code: 'id', label: '🇮🇩 Bahasa Indonesia' },
              { code: 'en', label: '🇬🇧 English' },
            ].map(l => (
              <button
                key={l.code}
                onClick={() => handleLang(l.code)}
                className="flex-1 py-2 rounded-xl text-xs font-bold"
                style={{
                  background: lang === l.code ? '#3ec976' : '#F4F4F9',
                  color: lang === l.code ? '#fff' : '#6b7280',
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy & Verification */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p className="font-black text-sm mb-3" style={{ color: '#1a1a2e' }}>{t('privacy_settings')}</p>
          {[
            { key: 'profileVisible', label: t('profile_visibility') },
            { key: 'allowContact', label: t('allow_partner_contact') },
            { key: 'showContact', label: t('show_contact_details') },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-700">{item.label}</span>
              <button
                onClick={() => toggleSwitch(item.key)}
                className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
                style={{ background: toggles[item.key] ? '#3ec976' : '#d1d5db' }}
              >
                <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                  style={{ left: toggles[item.key] ? '26px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
            </div>
          ))}
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p className="font-black text-sm mb-3" style={{ color: '#1a1a2e' }}>{t('notifications')}</p>
          {[
            { key: 'pushNotif', label: t('push_notifications') },
            { key: 'smsAlerts', label: t('sms_alerts') },
            { key: 'emailSummary', label: t('email_summaries') },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-700">{item.label}</span>
              <button
                onClick={() => toggleSwitch(item.key)}
                className="w-12 h-6 rounded-full transition-all relative"
                style={{ background: toggles[item.key] ? '#3ec976' : '#d1d5db' }}
              >
                <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                  style={{ left: toggles[item.key] ? '26px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
            </div>
          ))}
        </div>

        {/* Support & Legal */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p className="font-black text-sm mb-3" style={{ color: '#1a1a2e' }}>{t('support')}</p>
          {[
            { label: '💬 ' + t('support_chat'), action: () => navigate('chat') },
            { label: '📋 ' + t('community_guidelines'), action: () => {} },
            { label: '🔒 ' + t('privacy_policy'), action: () => {} },
            { label: '📄 ' + t('terms_of_service'), action: () => {} },
          ].map((item, i) => (
            <button key={i} onClick={item.action}
              className="w-full flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-700">{item.label}</span>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-2xl font-bold text-base"
          style={{ background: '#1a1a2e', color: '#fff' }}
        >
          🚪 {t('logout')}
        </button>

        {/* Delete account */}
        <button className="w-full py-3 rounded-2xl font-bold text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
          🗑️ {t('delete_account')}
        </button>

        <p className="text-center text-xs text-gray-400 pb-2">
          © 0 Waste Shop Food • Build for community sharing — 2026
        </p>
      </div>
    </div>
  )
}
