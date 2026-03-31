import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import BottomNav from './components/BottomNav'

// Pages
import Onboarding from './pages/Onboarding'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import PartnerDashboard from './pages/PartnerDashboard'
import Profile from './pages/Profile'
import EcoChat from './pages/EcoChat'
import Wishlist from './pages/Wishlist'
import AdminConsole from './pages/AdminConsole'
import Legal from './pages/Legal'

const NO_NAV_PAGES = ['onboarding', 'welcome', 'login', 'register', 'forgot-password', 'product', 'checkout', 'legal']
const AUTH_PAGES = ['home', 'orders', 'wishlist', 'chat', 'partner', 'profile', 'admin']
const NAV_PAGES = { home: 'home', orders: 'orders', wishlist: 'wishlist', chat: 'chat', partner: 'partner', profile: 'profile', admin: 'admin' }

function AppContent() {
  const { user, profile, loading } = useAuth()
  const [page, setPage] = useState('onboarding')
  const [params, setParams] = useState({})
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)

  // Redirect after login
  useEffect(() => {
    if (!loading && user) {
      if (['onboarding', 'welcome', 'login', 'register'].includes(page)) {
        setPage('home')
      }
    }
  }, [user, loading])

  const navigate = (to, p = {}) => {
    setParams(p)
    if (to === 'onboarding' && hasSeenOnboarding) {
      setPage('welcome')
      return
    }
    if (to === 'onboarding') setHasSeenOnboarding(true)

    // Guard: redirect to login if not authed
    if (AUTH_PAGES.includes(to) && !user && to !== 'home') {
      setPage('login')
      return
    }
    setPage(to)
    window.scrollTo(0, 0)
  }

  const activeTab = NAV_PAGES[page] || page

  if (loading) return (
    <div className="flex flex-col min-h-screen items-center justify-center" style={{ background: '#ffffff' }}>
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
        style={{ background: '#3ec976', boxShadow: '0 8px 32px rgba(62,201,118,0.35)' }}>
        <span className="text-4xl">🌿</span>
      </div>
      <div className="w-8 h-8 rounded-full spinner mt-4"
        style={{ border: '3px solid #3ec976', borderTopColor: 'transparent' }} />
    </div>
  )

  const renderPage = () => {
    switch (page) {
      case 'onboarding': return <Onboarding navigate={navigate} />
      case 'welcome': return <Welcome navigate={navigate} />
      case 'login': return <Login navigate={navigate} />
      case 'register': return <Register navigate={navigate} />
      case 'forgot-password': return <ForgotPassword navigate={navigate} />
      case 'home': return <Home navigate={navigate} />
      case 'product': return <ProductDetail navigate={navigate} params={params} />
      case 'checkout': return <Checkout navigate={navigate} params={params} />
      case 'orders': return <Orders navigate={navigate} />
      case 'partner': return <PartnerDashboard navigate={navigate} />
      case 'profile': return <Profile navigate={navigate} />
      case 'chat': return <EcoChat navigate={navigate} />
      case 'wishlist': return <Wishlist navigate={navigate} />
      case 'admin': return <AdminConsole navigate={navigate} />
      case 'legal': return <Legal navigate={navigate} params={params} />
      default: return <Home navigate={navigate} />
    }
  }

  const showNav = !NO_NAV_PAGES.includes(page)

  return (
    <div style={{ background: '#F4F4F9', minHeight: '100vh' }}>
      {renderPage()}
      {showNav && <BottomNav active={activeTab} navigate={navigate} />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
