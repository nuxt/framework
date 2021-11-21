import { useCookies, useBody } from 'h3'
import { createClient } from '@supabase/supabase-js'
import config from '#config'

const supabase = createClient(config.supabase.url, config.supabase.key, config.supabase.options)

export default async (req, res) => {
  const body = await useBody(req)

  // Mock for supabase API expecting to use Express 👀
  // TODO: open an issue for Supabase gotrue-js
  req.body = body
  req.cookies = useCookies(req)
  res.status = () => ({ json: () => ({}) })

  supabase.auth.api.setAuthCookie(req, res)

  return 'auth cookie set'
}
