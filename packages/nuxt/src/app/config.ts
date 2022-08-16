import type { AppConfig, RuntimeConfig } from '@nuxt/schema'
import { reactive } from 'vue'
import { useNuxtApp } from './nuxt'
// @ts-ignore
import __appConfig from '#build/app.config.ts'

// Workaround for vite HMR with virtual modules
export const _appConfig = __appConfig as AppConfig

export function useRuntimeConfig (): RuntimeConfig {
  return useNuxtApp().$config
}

export function defineAppConfig (config: AppConfig): AppConfig {
  return config
}

export function useAppConfig (): AppConfig {
  const nuxtApp = useNuxtApp()
  if (!nuxtApp._appConfig) {
    nuxtApp._appConfig = reactive(_appConfig) as AppConfig
  }
  return nuxtApp._appConfig
}

// HMR Support
if (process.dev) {
  function applyHMR (newConfig) {
    const appConfig = useAppConfig()
    if (newConfig && appConfig) {
      for (const key in newConfig) {
        appConfig[key] = newConfig[key]
      }
      for (const key in appConfig) {
        if (!(key in newConfig)) {
          delete appConfig[key]
        }
      }
    }
  }

  // Vite
  if (import.meta.hot) {
    import.meta.hot.accept((newModule) => {
      const newConfig = newModule?._appConfig
      applyHMR(newConfig)
    })
  }

  // Webpack
  if (import.meta.webpackHot) {
    console.log('Register webpackHot')
    import.meta.webpackHot.accept('#build/app.config.ts', () => {
      applyHMR(__appConfig)
    })
  }
}
