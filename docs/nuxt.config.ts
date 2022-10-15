import { join } from 'pathe'

export default defineNuxtConfig({
  extends: process.env.WEBSITE_THEME ? join(process.env.WEBSITE_THEME, 'theme') : '@nuxt-themes/website',
  nitro: {
    prerender: {
      routes: ['/', '/404.html', '/guide/directory-structure/app.config']
    }
  }
})
