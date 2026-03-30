import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

const ToastContext = createContext({})

const ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: '💡',
}
const COLORS = {
  success: { bg: 'rgba(62,201,118,0.12)', border: 'rgba(62,201,118,0.3)', text: '#15803d' },
  error:   { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#dc2626' },
  warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#b45309' },
  info:    { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', text: '#1d4ed8' },
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const toast = useCallback((message, type = 'success', duration = 3000) => {
    const id = ++idRef.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const confirm = useCallback((message, onConfirm, onCancel) => {
    const id = ++idRef.current
    setToasts(prev => [...prev, { id, message, type: 'confirm', onConfirm, onCancel }])
  }, [])

  const dismissConfirm = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[200] pointer-events-none px-4 pt-14">
        {toasts.filter(t => t.type !== 'confirm').map(t => {
          const c = COLORS[t.type] || COLORS.info
          return (
            <div key={t.id}
              className="pointer-events-auto mb-2 px-4 py-3 rounded-2xl flex items-center gap-3 toast-slide-in"
              style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
              <span className="text-lg flex-shrink-0">{ICONS[t.type]}</span>
              <span className="text-sm font-semibold flex-1" style={{ color: c.text }}>{t.message}</span>
            </div>
          )
        })}
      </div>
      {/* Confirm modals */}
      {toasts.filter(t => t.type === 'confirm').map(t => (
        <div key={t.id} className="fixed inset-0 z-[300] flex items-center justify-center px-8"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-[340px] rounded-3xl p-6"
            style={{ background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">🌿</div>
              <p className="text-sm font-semibold leading-relaxed" style={{ color: '#1a1a2e' }}>{t.message}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { dismissConfirm(t.id); t.onCancel?.() }}
                className="flex-1 py-3 rounded-2xl font-bold text-sm"
                style={{ background: '#F4F4F9', color: '#6b7280' }}>
                Batal
              </button>
              <button
                onClick={() => { dismissConfirm(t.id); t.onConfirm?.() }}
                className="flex-1 py-3 rounded-2xl font-bold text-sm text-white"
                style={{ background: '#3ec976' }}>
                Ya, Lanjut
              </button>
            </div>
          </div>
        </div>
      ))}
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
