import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

export default function Login({ navigate }) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validate = () => {
    if (!email) return t('err_email_required')
    if (!/\S+@\S+\.\S+/.test(email)) return t('err_invalid_email')
    if (!password) return t('err_password_required')
    return null
  }

  const handleLogin = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true); setError('')
    const { error: e } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (e) setError(t('err_login_failed'))
    // AuthContext handles navigation via user state
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#ffffff' }}>
      {/* Header */}
      <div className="flex items-center px-4 pt-14 pb-2">
        <button onClick={() => navigate('welcome')} className="p-2 -ml-2 rounded-xl">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#1a1a2e" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="flex-1 px-6 pt-4">
        <div className="mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: '#3ec976' }}>
            <span className="text-3xl">🌿</span>
          </div>
          <h1 className="text-2xl font-black" style={{ color: '#1a1a2e' }}>{t('sign_in')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('app_name')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm font-medium text-red-600"
            style={{ background: 'rgba(239,68,68,0.08)' }}>
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
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

          <div>
            <label className="text-xs font-extrabold text-gray-700 mb-1.5 block uppercase tracking-wide">
              {t('password')}
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 pr-12 text-sm font-medium outline-none"
                style={{
                  height: 52, background: '#F4F4F9', borderRadius: 24,
                  border: '1.5px solid transparent', color: '#1a1a2e',
                }}
                onFocus={e => e.target.style.borderColor = '#3ec976'}
                onBlur={e => e.target.style.borderColor = 'transparent'}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPw ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate('forgot-password')}
            className="text-right text-sm font-semibold -mt-1"
            style={{ color: '#3ec976' }}
          >
            {t('forgot_password')}
          </button>
        </div>
      </div>

      <div className="px-6 pb-10 flex flex-col gap-3">
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center"
          style={{ background: loading ? '#9ca3af' : '#3ec976' }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner" />
          ) : t('login')}
        </button>
        <p className="text-center text-sm text-gray-500">
          {t('no_account')}{' '}
          <button onClick={() => navigate('register')} className="font-bold" style={{ color: '#3ec976' }}>
            {t('sign_up')}
          </button>
        </p>
      </div>
    </div>
  )
}
