import { defineNuxtPlugin } from '@nuxt/app'
import $config from '#config'

export default defineNuxtPlugin((nuxt) => {
  nuxt.payload.config = $config
})
