import React from 'react'

export default function Card({
  children,
  onClick,
  className = '',
  padding = 'p-5',
  glass = false,
  shadow = 'soft', // 'soft', 'float', 'none'
  hover = false,
}) {
  const shadows = {
    soft: 'shadow-soft',
    float: 'shadow-float',
    none: '',
  }

  return (
    <div
      onClick={onClick}
      className={`
        rounded-3xl transition-all duration-300
        ${padding}
        ${shadows[shadow] || shadows.soft}
        ${glass ? 'glass-panel' : 'bg-white'}
        ${onClick || hover ? 'hover:scale-[1.02] cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
