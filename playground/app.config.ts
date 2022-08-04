// import { defineAppConfig } from '#imports'
import type { AppConfig } from '@nuxt/schema'

const defineAppConfig = (config: AppConfig) => config

export default defineAppConfig({
  custom: '123',
  nested: {
    foo: {
      bar: 'fdfdf'
    }
  }
})
