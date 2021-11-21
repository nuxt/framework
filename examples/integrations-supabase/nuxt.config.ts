import { defineNuxtConfig } from 'nuxt3'

export default defineNuxtConfig({
  publicRuntimeConfig: {
    supabase: {
      url: process.env.SUPABASE_URL,
      key: process.env.SUPABASE_KEY
    }
  },
  // Transpile @supabase/* libs to works seamlessly with Nuxt ESM
  build: {
    transpile: ['@supabase']
  },
  // For example design purpose
  buildModules: ['@nuxthq/ui']
})
