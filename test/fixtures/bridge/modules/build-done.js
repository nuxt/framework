import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  hooks: {
    build: {
      done () {
        console.log('[build-done.js]: Build Done')
      }
    }
  }
})
