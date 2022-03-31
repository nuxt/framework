import { defineNuxtConfig } from 'nuxt3'

export default defineNuxtConfig({
  render: {
    static: {
      allowFromAnyOrigin: true
    }
  }
})
