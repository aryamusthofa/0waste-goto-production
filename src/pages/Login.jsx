import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Login({ navigate }) {
  const { t } = useTranslation()
  const { show } = useToast()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!email) e.email = t('err_email_required')
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = t('err_invalid_email')
    
    if (!password) e.password = t('err_password_required')
    
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleLogin = async () => {
    if (!validate()) return
    
    setLoading(true)
    const { error: e } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    
    if (e) {
      show(t('err_login_failed'), 'error')
    } else {
      show(t('login_success'), 'success')
      // AuthContext handles navigation via user state
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center px-4 pt-14 pb-2">
        <button 
          onClick={() => navigate('welcome')} 
          className="p-2 -ml-2 rounded-xl active:scale-95 transition-all text-[#1a1a2e]"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="flex-1 px-6 pt-4 animate-fade-in">
        <div className="mb-10">
          <div className="w-16 h-16 rounded-[24px] flex items-center justify-center mb-6 shadow-soft"
            style={{ background: '#3ec976', boxShadow: '0 8px 32px rgba(62,201,118,0.25)' }}>
            <span className="text-4xl">🌿</span>
          </div>
          <h1 className="text-[28px] font-black leading-tight" style={{ color: '#1a1a2e' }}>{t('sign_in')}</h1>
          <p className="text-gray-400 font-medium mt-1.5">{t('app_name')}</p>
        </div>

        <div className="flex flex-col gap-6">
          <Input 
            label={t('email')}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@domain.com"
            error={errors.email}
            autoComplete="email"
          />

          <div className="flex flex-col gap-2">
            <Input 
              label={t('password')}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              error={errors.password}
              autoComplete="current-password"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            
            <button
              onClick={() => navigate('forgot-password')}
              className="text-right text-xs font-black self-end py-1 px-2"
              style={{ color: '#3ec976' }}
            >
              {t('forgot_password')}
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 pb-12 flex flex-col gap-4 animate-slide-up">
        <Button 
          onClick={handleLogin}
          loading={loading}
          fullWidth
        >
          {t('login')}
        </Button>
        
        <p className="text-center text-sm font-medium text-gray-400">
          {t('no_account')}{' '}
          <button 
            onClick={() => navigate('register')} 
            className="font-black" 
            style={{ color: '#1a1a2e' }}
          >
            {t('sign_up')}
          </button>
        </p>
      </div>
    </div>
  )
}
