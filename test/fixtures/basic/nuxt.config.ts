import { defineNuxtConfig } from '@nuxt/kit'

export default defineNuxtConfig({
  nitro: {
    output: { dir: process.env.NITRO_OUTPUT_DIR }
  }
})
