import { useCookies } from 'h3'

export default defineNuxtPlugin(async (nuxtApp) => {
  const { user, auth } = useSupabase()
  const req = nuxtApp.ssrContext!.req

  // Supabase needs to read from req.cookies
  req.cookies = useCookies(req)
  // Check authenticated user during SSR
  user.value = (await auth.api.getUserByCookie(req)).user
})
