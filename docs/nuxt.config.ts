export default defineNuxtConfig({
  extends: '@nuxt-themes/website',
  nitro: {
    prerender: {
      routes: ['/guide/directory-structure/app.config']
    }
  }
})
