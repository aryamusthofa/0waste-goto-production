import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[0waste] Error Boundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col min-h-screen items-center justify-center px-6"
          style={{ background: '#ffffff' }}>
          <div className="text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-6"
              style={{ background: 'rgba(239,68,68,0.1)' }}>⚠️</div>
            <h2 className="text-xl font-black mb-2" style={{ color: '#1a1a2e' }}>
              Oops, terjadi masalah
            </h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed max-w-xs mx-auto">
              Aplikasi mengalami gangguan. Silakan muat ulang untuk melanjutkan.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 rounded-2xl font-bold text-white text-base"
              style={{ background: '#3ec976', boxShadow: '0 4px 16px rgba(62,201,118,0.4)' }}>
              🔄 Muat Ulang
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
