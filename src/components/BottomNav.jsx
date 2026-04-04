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
const ShieldIcon = ({ filled }) => (
  <svg width="22" height="22" fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={filled ? 0 : 2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" />
  </svg>
)

export default function BottomNav({ activeRoute, navigate }) {
  const { profile } = useAuth()
  const { t } = useTranslation()
  const isPartner = profile?.role === 'partner' && profile?.partner_status === 'approved' && !profile?.is_suspended
  const isSuperAdmin = Boolean(profile?.is_super_admin)

  const items = [
    { key: 'home', label: t('explore'), icon: <HomeIcon /> },
    { key: 'orders', label: t('orders'), icon: <BagIcon /> },
    { key: 'zera', label: 'Zera AI', icon: <div className="text-xl">🌿</div> },
    { key: 'wishlist', label: 'Wishlist', icon: <HeartIcon /> },
    ...(isPartner ? [{ key: 'dashboard', label: t('partner'), icon: <ShopIcon /> }] : []),
    ...(isSuperAdmin ? [{ key: 'admin', label: 'Admin', icon: <ShieldIcon /> }] : []),
    { key: 'profile', label: t('profile'), icon: <UserIcon /> },
  ]

  return (
    <nav
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[380px] z-50 glass-panel shadow-premium animate-pop-in"
      style={{
        borderRadius: '32px',
        padding: '10px 6px',
      }}
    >
      <div className="flex items-center justify-around">
        {items.map(item => (
          <button
            key={item.key}
            onClick={() => navigate(item.key)}
            className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-[22px] transition-all duration-500 relative ${activeRoute === item.key ? 'scale-110' : 'opacity-40 hover:opacity-100 hover:scale-105'}`}
            style={{
              color: activeRoute === item.key ? '#3ec976' : '#1a1a2e',
              background: activeRoute === item.key ? 'rgba(62,201,118,0.12)' : 'transparent',
            }}
          >
            {activeRoute === item.key && (
              <div className="absolute -top-1 w-1 h-1 rounded-full bg-[#3ec976] shadow-[0_0_8px_#3ec976] animate-pulse" />
            )}
            <div className="transition-transform duration-500">
              {item.icon}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-tighter ${activeRoute === item.key ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}
