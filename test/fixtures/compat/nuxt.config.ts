import { defineNuxtConfig } from '@nuxt/kit'

// @ts-ignore
global.__NUXT_PREPATHS__ = (global.__NUXT_PREPATHS__ || []).concat(__dirname)

export default defineNuxtConfig({
  buildModules: [
    '@nuxt/nitro/compat'
  ],
  nitro: {
    output: { dir: process.env.NITRO_OUTPUT_DIR }
  }
})
