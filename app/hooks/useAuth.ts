import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener?.subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const redirectTo =
      window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : 'https://subs.info.vn'
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    })
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' })
    } catch (err) {
      console.warn('⚠️ Logout global failed, fallback to local')
      await supabase.auth.signOut({ scope: 'local' })
    }
  }

  return {
    session,
    signInWithGoogle,
    signOut
  }
} 