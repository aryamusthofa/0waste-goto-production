import React, { useEffect } from 'react'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
  animate = 'slide-up',
}) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className={`
          relative bg-white w-full rounded-t-[32px] sm:rounded-[32px] shadow-float 
          overflow-hidden transform transition-all 
          ${maxWidth} ${animate === 'slide-up' ? 'animate-slide-up' : 'animate-pop-in'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h3 className="text-xl font-black text-[#1a1a2e]">{title}</h3>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 active:scale-90 transition-all font-bold"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-10 pt-4 overflow-y-auto max-h-[80vh] no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  )
}
