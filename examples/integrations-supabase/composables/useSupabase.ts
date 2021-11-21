import { createClient, AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import { useRuntimeConfig, useNuxtApp, useState } from '#app'

let authStateListerner: (() => void) | null = null

export const useSupabase = () => {
  const user = useState<User | null>('supabase_user', () => null)
  const nuxtApp = useNuxtApp()
  const config = useRuntimeConfig()

  const supabase = createClient(config.supabase.url, config.supabase.key, config.supabase.options)

  if (process.client && !authStateListerner) {
    // Once Nuxt app is mounted
    authStateListerner = nuxtApp.hook('app:mounted', () => {
      // Check if user is authenticated on client-side
      const session = supabase.auth.session()
      if (session) {
        // Set cookie on server-side
        setServerSession('SIGNED_IN', session)
        user.value = supabase.auth.user()
      }
      // Listen for auth changes on client-side and update cookie on server-side
      supabase.auth.onAuthStateChange(async (event, session) => {
        await setServerSession(event, session)
        user.value = supabase.auth.user()
      })
    })
  }

  return { ...supabase, user }
}

function setServerSession (event: AuthChangeEvent, session: Session | null): Promise<any> {
  return $fetch('/api/supabase/session', {
    method: 'POST',
    body: { event, session }
  })
}
