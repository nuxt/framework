import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  appConfig: {
    custom: '123',
    nested: { foo: { bar: 'baz' } }
  }
})
