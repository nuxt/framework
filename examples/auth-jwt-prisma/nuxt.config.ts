export default defineNuxtConfig({
  typescript: {
    strict: false
  },
  modules: [
    '@nuxt/ui'
  ],
  publicRuntimeConfig: {
      JWT_TOKEN_SECRET: process.env.JWT_TOKEN_SECRET
  }
})
