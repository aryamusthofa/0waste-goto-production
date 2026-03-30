import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    return data
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
          fetchProfile(session.user.id).finally(() => setLoading(false))
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
          await fetchProfile(session.user.id)
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
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = () => user && fetchProfile(user.id)

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
