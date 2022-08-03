import type { AppConfig, RuntimeConfig } from '@nuxt/schema'
import { reactive } from 'vue'
import { useNuxtApp } from './nuxt'
// @ts-ignore
import __appConfig from '#build/app.config.mjs'

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

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    const appConfig = useAppConfig()
    const newConfig = newModule?._appConfig
    if (newConfig && appConfig) {
      // TODO: Deep assign
      for (const key in newConfig) {
        appConfig[key] = newConfig[key]
      }
    }
  })
}
