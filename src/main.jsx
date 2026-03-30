import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App'

// Reset Token Supabase otomatis untuk menyapu bersih deadlock Error 401
localStorage.removeItem('sb-ydaidnppdvzwvdhziifc-auth-token')

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
