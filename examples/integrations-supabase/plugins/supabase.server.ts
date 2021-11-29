import { useCookies } from 'h3'

export default defineNuxtPlugin(async (nuxtApp) => {
  const { user, auth } = useSupabase()
  const req = nuxtApp.ssrContext!.req

  // Supabase needs to read from req.cookies
  req.cookies = useCookies(req)
  // Check authenticated user during SSR
  user.value = (await auth.api.getUserByCookie(req)).user
  // Fix SSR called to RLS protected tables
  if (user.value) {
    // https://github.com/supabase/supabase/issues/1735#issuecomment-922284089
    // @ts-ignore
    auth.session = () => ({
      access_token: req.cookies['sb:token']
    })
  }
})
