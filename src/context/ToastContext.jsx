import React, { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext({})

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const show = useCallback((msg, type = 'success', duration = 3000) => {
    const id = nextId.current++
    setToasts(prev => [...prev, { id, msg, type, duration }])
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts(p => p.filter(t => t.id !== id))
      }, duration)
    }
  }, [])

  const remove = (id) => setToasts(p => p.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ show, toasts, remove }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts, remove } = useContext(ToastContext)
  
  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-3 w-full max-w-[430px] px-6 pointer-events-none">
      {toasts.map(t => (
        <Toast key={t.id} {...t} onRemove={() => remove(t.id)} />
      ))}
    </div>
  )
}

function Toast({ msg, type, onRemove }) {
  const bg = type === 'success' ? '#3ec976' : type === 'error' ? '#ef4444' : '#f59e0b'
  const icon = type === 'success' ? '✅' : type === 'error' ? '⚠️' : '🔔'
  
  return (
    <div 
      className="pointer-events-auto flex items-center gap-3 p-4 rounded-2xl shadow-float animate-pop-in min-h-[64px]"
      style={{ background: '#fff', borderLeft: `6px solid ${bg}` }}
      onClick={onRemove}
    >
      <span className="text-xl">{icon}</span>
      <p className="flex-1 text-sm font-bold" style={{ color: '#1a1a2e' }}>{msg}</p>
    </div>
  )
}

export const useToast = () => useContext(ToastContext)
