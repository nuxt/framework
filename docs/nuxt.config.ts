import { withTrailingSlash } from 'ufo'

export default defineNuxtConfig({
  extends: process.env.WEBSITE_THEME ? withTrailingSlash(process.env.WEBSITE_THEME) : 'nuxt-website-theme',
  vite: {
    server: {
      fs: {
        allow: [
          process.env.WEBSITE_THEME || '.'
        ]
      }
    }
  }
})
