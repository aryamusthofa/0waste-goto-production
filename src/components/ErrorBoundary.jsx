import React from 'react'
import Button from './ui/Button'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL APP CRASH:', error, errorInfo)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col min-h-screen items-center justify-center p-8 bg-white text-center">
           <div className="text-7xl mb-8 animate-pop-in">🧊</div>
           <h1 className="text-2xl font-black text-[#1a1a2e] mb-2 leading-tight">Ups! Ada Kendala Teknis</h1>
           <p className="text-gray-400 font-medium mb-12 max-w-[280px]">
             Terjadi kesalahan sistem yang tidak terduga. Tim 0Waste sudah diberitahu.
           </p>
           
           <div className="flex flex-col gap-4 w-full max-w-xs">
              <Button onClick={this.handleReload}>Mulai Ulang Aplikasi</Button>
              <Button variant="secondary" onClick={() => window.location.href = '/'}>Pindah ke Beranda</Button>
           </div>
           
           <p className="mt-12 text-[9px] font-bold text-gray-300 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">
              ERROR_ID: {this.state.error?.message?.slice(0, 32) || 'UNKNOWN_FAILURE'}
           </p>
        </div>
      )
    }

    return this.props.children
  }
}
