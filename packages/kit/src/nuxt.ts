import { useContext } from 'unctx'
import type { Nuxt, NuxtConfig } from '@nuxt/kit'

export const useNuxt = useContext<Nuxt>('nuxt')

export function defineNuxtConfig (config: NuxtConfig) {
  return config
}
