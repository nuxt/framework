export * from './core/nuxt'
export * from './core/builder'

declare global {
  const defineNuxtConfig: typeof import('nuxt/config')['defineNuxtConfig']
}
