import React from 'react'

const VARIANTS = {
  primary: {
    bg: '#3ec976',
    text: '#ffffff',
    shadow: '0 4px 16px rgba(62,201,118,0.35)',
    hover: '#28a35a',
  },
  secondary: {
    bg: '#F4F4F9',
    text: '#1a1a2e',
    shadow: 'none',
    hover: 'rgba(0,0,0,0.05)',
  },
  danger: {
    bg: '#ef4444',
    text: '#ffffff',
    shadow: '0 4px 16px rgba(239,68,68,0.3)',
    hover: '#dc2626',
  },
  ghost: {
    bg: 'transparent',
    text: '#6b7280',
    shadow: 'none',
    hover: 'rgba(0,0,0,0.03)',
  },
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  type = 'button',
  className = '',
  icon: Icon,
}) {
  const v = VARIANTS[variant] || VARIANTS.primary

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative flex items-center justify-center gap-2 px-6 rounded-2xl font-bold text-base
        transition-all duration-300 active:scale-[0.97]
        disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : 'w-fit'}
        ${className}
      `}
      style={{
        height: 54,
        background: v.bg,
        color: v.text,
        boxShadow: v.shadow,
      }}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon && <span className="text-xl leading-none">{Icon}</span>}
          {children}
        </>
      )}
    </button>
  )
}
