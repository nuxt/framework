import { AuthChangeEvent, Session } from '@supabase/supabase-js'

export default defineNuxtPlugin((nuxtApp) => {
  const { user, auth } = useSupabase()

  // Once Nuxt app is mounted
  nuxtApp.hooks.hook('app:mounted', () => {
    // Listen to Supabase auth changes
    auth.onAuthStateChange(async (event, session) => {
      await setServerSession(event, session)
      user.value = auth.user()
    })
  })
})

function setServerSession (event: AuthChangeEvent, session: Session | null): Promise<any> {
  return $fetch('/api/supabase/session', {
    method: 'POST',
    body: { event, session }
  })
}
