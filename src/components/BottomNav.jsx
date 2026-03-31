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

export default function BottomNav({ active, navigate }) {
  const { profile } = useAuth()
  const { t } = useTranslation()
  const isPartner = profile?.role === 'partner' && profile?.partner_status === 'approved' && !profile?.is_suspended
  const isSuperAdmin = Boolean(profile?.is_super_admin)

  const items = [
    { key: 'home', label: 'Beranda', icon: <HomeIcon /> },
    { key: 'orders', label: 'Pesanan', icon: <BagIcon /> },
    { key: 'wishlist', label: 'Wishlist', icon: <HeartIcon /> },
    { key: 'chat', label: 'Eco AI', icon: <span className="text-[18px]">🌿</span> },
    ...(isPartner ? [{ key: 'partner', label: 'Mitra', icon: <ShopIcon /> }] : []),
    ...(isSuperAdmin ? [{ key: 'admin', label: 'Admin', icon: <ShieldIcon /> }] : []),
    { key: 'profile', label: 'Profil', icon: <UserIcon /> },
  ]

  return (
    <nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[398px] z-50 glass-panel shadow-float animate-slide-up"
      style={{
        borderRadius: '24px',
        padding: '8px 4px',
      }}
    >
      <div className="flex items-center justify-around">
        {items.map(item => (
          <button
            key={item.key}
            onClick={() => navigate(item.key)}
            className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-[20px] transition-all duration-300 min-w-[50px] ${active === item.key ? 'scale-105' : 'scale-100 hover:scale-105'}`}
            style={{
              color: active === item.key ? '#3ec976' : '#9ca3af',
              background: active === item.key ? 'rgba(62,201,118,0.12)' : 'transparent',
            }}
          >
            <div className="transition-transform duration-300 transform">
              {item.icon}
            </div>
            <span className="text-[10px] font-semibold">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
