import React, { useState, useEffect, Suspense, lazy } from 'react'
import { supabase } from './lib/supabase'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider, useToast } from './context/ToastContext'

// Essential non-lazy Components
import ErrorBoundary from './components/ErrorBoundary'

// Dashboard & UI Core
import BottomNav from './components/BottomNav'

// LAZY LOADING ROUTES
const Home             = lazy(() => import('./pages/Home'))
const Login            = lazy(() => import('./pages/Login'))
const Register         = lazy(() => import('./pages/Register'))
const ProductDetail    = lazy(() => import('./pages/ProductDetail'))
const Checkout         = lazy(() => import('./pages/Checkout'))
const Orders           = lazy(() => import('./pages/Orders'))
const ZeraAI           = lazy(() => import('./pages/EcoChat'))
const Wishlist         = lazy(() => import('./pages/Wishlist'))
const ForgotPassword   = lazy(() => import('./pages/ForgotPassword'))
const Legal            = lazy(() => import('./pages/Legal'))
const Onboarding       = lazy(() => import('./pages/Onboarding'))
const Welcome          = lazy(() => import('./pages/Welcome'))
const PartnerDashboard = lazy(() => import('./pages/PartnerDashboard'))
const Profile          = lazy(() => import('./pages/Profile'))
const AdminConsole     = lazy(() => import('./pages/AdminConsole'))

function LoadingScreen() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-white">
       <div className="w-12 h-12 border-4 border-[#3ec976]/20 border-t-[#3ec976] rounded-full animate-spin" />
       <p className="mt-4 text-[10px] font-black text-gray-300 uppercase tracking-widest animate-pulse">
         Synchronizing 0Waste...
       </p>
    </div>
  )
}

function MainApp() {
  const { user, profile, loading: authLoading } = useAuth()
  const [route, setRoute] = useState('home') // home | login | register | product | checkout | orders | dashboard | profile | admin | zera
  const [routeParams, setRouteParams] = useState(null)

  const navigate = (to, params = null) => {
    setRoute(to); setRouteParams(params); window.scrollTo(0, 0)
  }

  const renderRoute = () => {
    switch (route) {
      case 'login':            return <Login navigate={navigate} />
      case 'register':         return <Register navigate={navigate} />
      case 'product':          return <ProductDetail navigate={navigate} params={routeParams} />
      case 'checkout':         return <Checkout navigate={navigate} params={routeParams} />
      case 'orders':           return <Orders navigate={navigate} />
      case 'dashboard':        return <PartnerDashboard navigate={navigate} />
      case 'profile':          return <Profile navigate={navigate} />
      case 'admin':            return <AdminConsole navigate={navigate} />
      case 'zera':             return <ZeraAI navigate={navigate} />
      case 'wishlist':         return <Wishlist navigate={navigate} />
      case 'forgot-password':  return <ForgotPassword navigate={navigate} />
      case 'legal':            return <Legal navigate={navigate} />
      case 'onboarding':       return <Onboarding navigate={navigate} />
      case 'welcome':          return <Welcome navigate={navigate} />
      default:                 return <Home navigate={navigate} />
    }
  }

  if (authLoading) return <LoadingScreen />

  return (
    <div className="max-w-[430px] mx-auto min-h-screen relative overflow-hidden bg-[#F9FAFB] shadow-2xl mobile-container-shadow transition-all duration-500">
      <Suspense fallback={<LoadingScreen />}>
         {renderRoute()}
      </Suspense>

      {/* Persistent Bottom UI */}
      {route !== 'login' && route !== 'register' && (
        <BottomNav 
          navigate={navigate} 
          activeRoute={route} 
          role={profile?.role} 
          isSuperAdmin={profile?.is_super_admin}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <MainApp />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
