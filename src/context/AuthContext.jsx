import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isDeveloper, setIsDeveloper] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId, email) => {
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(prof)

    if (email) {
      const { data: dev } = await supabase
        .from('developer_admins')
        .select('is_active')
        .eq('email', email)
        .eq('is_active', true)
        .single()
      setIsDeveloper(!!dev)
    }
    return prof
  }

  useEffect(() => {
    // Fallback to prevent infinite loading on lock deadlock
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 1500)

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id, session.user.email).finally(() => setLoading(false))
        } else {
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error('Supabase getSession error:', err)
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        try {
          await fetchProfile(session.user.id, session.user.email)
        } catch (err) {
          console.error('Profile fetch error:', err)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    
    return () => {
      clearTimeout(timeout)
      subscription?.unsubscribe && subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      // Optimistic UI: Clear local state immediately for instant response
      setUser(null)
      setProfile(null)
      // Attempt server logout in background
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Logout error background:', err)
    }
  }

  const refreshProfile = () => user && fetchProfile(user.id, user.email)

  return (
    <AuthContext.Provider value={{ user, profile, isDeveloper, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
