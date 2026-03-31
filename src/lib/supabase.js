import { createClient } from '@supabase/supabase-js'
import { Preferences } from '@capacitor/preferences'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[0waste] Supabase env vars missing! Copy .env.example ke .env dan isi nilainya.')
}

// 🛡️ Bypassing volatile web localStorage to use Android's SharedPreferences
const customStorageAdapter = {
  getItem: async (key) => {
    const { value } = await Preferences.get({ key })
    return value
  },
  setItem: async (key, value) => {
    await Preferences.set({ key, value })
  },
  removeItem: async (key) => {
    await Preferences.remove({ key })
  }
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storageKey: '0waste-session',
    storage: customStorageAdapter,
    persistSession: true,
    autoRefreshToken: true
  }
})
