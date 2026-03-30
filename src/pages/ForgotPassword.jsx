import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

export default function ForgotPassword({ navigate }) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) { setError(t('err_invalid_email')); return }
    setLoading(true); setError('')
    const { error: e } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    })
    setLoading(false)
    if (e) setError(e.message)
    else setSent(true)
  }

  if (sent) return (
    <div className="flex flex-col min-h-screen items-center justify-center px-6" style={{ background: '#ffffff' }}>
      <div className="text-center animate-fade-in">
        <div className="text-6xl mb-6">📧</div>
        <h2 className="text-xl font-black mb-2" style={{ color: '#1a1a2e' }}>{t('reset_link_sent')}</h2>
        <p className="text-gray-500 mb-8 text-sm">Periksa inbox email kamu.</p>
        <button onClick={() => navigate('login')}
          className="px-8 py-3 rounded-2xl font-bold text-white"
          style={{ background: '#3ec976' }}>
          {t('back')} ke Login
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#ffffff' }}>
      <div className="flex items-center px-4 pt-14 pb-2">
        <button onClick={() => navigate('login')} className="p-2 -ml-2">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#1a1a2e" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="flex-1 px-6 pt-8">
        <div className="text-5xl mb-6">🔐</div>
        <h1 className="text-2xl font-black mb-2" style={{ color: '#1a1a2e' }}>{t('forgot_password_title')}</h1>
        <p className="text-gray-500 text-sm mb-8">{t('forgot_password_desc')}</p>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm text-red-600" style={{ background: 'rgba(239,68,68,0.08)' }}>
            {error}
          </div>
        )}

        <label className="text-xs font-extrabold text-gray-700 mb-1.5 block uppercase tracking-wide">
          {t('email')}
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="email@domain.com"
          className="w-full px-4 text-sm font-medium outline-none"
          style={{
            height: 52, background: '#F4F4F9', borderRadius: 24,
            border: '1.5px solid transparent', color: '#1a1a2e',
          }}
          onFocus={e => e.target.style.borderColor = '#3ec976'}
          onBlur={e => e.target.style.borderColor = 'transparent'}
        />
      </div>

      <div className="px-6 pb-10">
        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center"
          style={{ background: loading ? '#9ca3af' : '#3ec976' }}
        >
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner" /> : t('send_reset_link')}
        </button>
      </div>
    </div>
  )
}
