import React from 'react'
import { useTranslation } from 'react-i18next'

export default function Welcome({ navigate }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#ffffff' }}>
      {/* Header visual */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-4 gap-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center"
            style={{ background: '#3ec976', boxShadow: '0 8px 32px rgba(62,201,118,0.35)' }}
          >
            <span className="text-5xl">🌿</span>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black" style={{ color: '#1a1a2e' }}>{t('app_name')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('app_tagline')}</p>
          </div>
        </div>

        {/* Value props */}
        <div className="w-full flex flex-col gap-3 mt-4">
          {[
            { icon: '♻️', title: 'Eco-Friendly Tech', desc: 'Kurangi jejak karbon dengan setiap transaksi' },
            { icon: '🛡️', title: 'Anti-Basi Protocol', desc: 'Jaminan aman — produk selalu segar & layak konsumsi' },
            { icon: '⚡', title: 'Verified Partners', desc: 'Hanya mitra terverifikasi yang bisa berjualan' },
          ].map(item => (
            <div
              key={item.title}
              className="flex items-center gap-4 p-4 rounded-2xl"
              style={{ background: '#F4F4F9', border: '1px solid rgba(62,201,118,0.15)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: 'rgba(62,201,118,0.12)' }}
              >
                {item.icon}
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: '#1a1a2e' }}>{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="p-6 pb-10 flex flex-col gap-3">
        <button
          onClick={() => navigate('register')}
          className="w-full py-4 rounded-2xl font-bold text-white text-base"
          style={{ background: '#3ec976', boxShadow: '0 4px 16px rgba(62,201,118,0.4)' }}
        >
          {t('sign_up')}
        </button>
        <button
          onClick={() => navigate('login')}
          className="w-full py-4 rounded-2xl font-semibold text-base"
          style={{ background: '#F4F4F9', color: '#1a1a2e' }}
        >
          {t('sign_in')}
        </button>
        <button
          onClick={() => navigate('home')}
          className="text-center text-gray-400 text-sm py-2"
        >
          {t('continue_as_guest')}
        </button>
      </div>
    </div>
  )
}
