import React from 'react'

const VARIANTS = {
  success: { bg: 'rgba(62,201,118,0.12)', text: '#28a35a', border: '1px solid rgba(62,201,118,0.2)' },
  danger:  { bg: 'rgba(239,68,68,0.1)',   text: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' },
  warning: { bg: 'rgba(245,158,11,0.1)',  text: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' },
  info:    { bg: 'rgba(59,130,246,0.1)',  text: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' },
  dark:    { bg: '#1a1a2e',               text: '#ffffff', border: 'none' },
}

export default function Badge({
  children,
  variant = 'success',
  className = '',
  icon: Icon,
}) {
  const v = VARIANTS[variant] || VARIANTS.success

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider
        whitespace-nowrap transition-all duration-300 animate-slide-up
        ${className}
      `}
      style={{
        background: v.bg,
        color: v.text,
        border: v.border,
      }}
    >
      {Icon && <span className="text-sm leading-none">{Icon}</span>}
      {children}
    </span>
  )
}
