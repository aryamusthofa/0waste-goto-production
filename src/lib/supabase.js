import { createClient } from '@supabase/supabase-js'
import { Preferences } from '@capacitor/preferences'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[0waste] Supabase keys missing. Aplikasi mungkin tidak berfungsi.')
}

// 🛡️ Bypassing volatile web localStorage to use Android's SharedPreferences
const customStorageAdapter = {
  getItem: async (key) => {
    try {
      const { value } = await Preferences.get({ key })
      return value
    } catch { return null }
  },
  setItem: async (key, value) => {
    await Preferences.set({ key, value }).catch(() => {})
  },
  removeItem: async (key) => {
    await Preferences.remove({ key }).catch(() => {})
  }
}

// Hanya inisialisasi jika URL valid untuk mencegah crash di startup
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storageKey: '0waste-session',
        storage: customStorageAdapter,
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : { auth: { onAuthStateChange: () => ({ data: { subscription: null } }), getSession: async () => ({ data: { session: null } }) } }
