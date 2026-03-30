import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

const HomeIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)
const BagIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
)
const HeartIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)
const UserIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)
const ShopIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

export default function BottomNav({ active, navigate }) {
  const { profile } = useAuth()
  const { t } = useTranslation()
  const isPartner = profile?.role === 'partner' && profile?.is_verified

  const items = [
    { key: 'home', label: t('all'), icon: <HomeIcon /> },
    { key: 'orders', label: t('orders'), icon: <BagIcon /> },
    { key: 'wishlist', label: 'Wishlist', icon: <HeartIcon /> },
    ...(isPartner ? [{ key: 'partner', label: 'Partner', icon: <ShopIcon /> }] : []),
    { key: 'profile', label: t('profile'), icon: <UserIcon /> },
  ]

  return (
    <nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[398px] z-50"
      style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
        padding: '8px 4px',
      }}
    >
      <div className="flex items-center justify-around">
        {items.map(item => (
          <button
            key={item.key}
            onClick={() => navigate(item.key)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200 min-w-[44px]"
            style={{
              color: active === item.key ? '#3ec976' : '#9ca3af',
              background: active === item.key ? 'rgba(62,201,118,0.1)' : 'transparent',
            }}
          >
            {item.icon}
            <span className="text-[10px] font-semibold">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
