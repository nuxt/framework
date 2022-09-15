import { useNitro } from '@nuxt/kit'

export default defineNuxtConfig({
  modules: [
    (_, nuxt) => {
      nuxt.hook('ready', () => {
        console.log(useNitro())
      })
    }
  ]
})
