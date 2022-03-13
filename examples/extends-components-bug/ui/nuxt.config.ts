import { defineNuxtConfig } from 'nuxt3'

export default defineNuxtConfig({
  components: {
    dirs: [
      { path: './components', prefix: 'U' }
    ]
  }
})
