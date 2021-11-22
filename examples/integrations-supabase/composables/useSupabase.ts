import { createClient, User, SupabaseClient } from '@supabase/supabase-js'
import { useRuntimeConfig, useState } from '#app'

let supabase: SupabaseClient

export const useSupabase = () => {
  const user = useState<User | null>('supabase_user', () => null)
  const config = useRuntimeConfig()

  if (!supabase) {
    supabase = createClient(config.supabase.url, config.supabase.key, config.supabase.options)
  }

  return { ...supabase, user }
}
