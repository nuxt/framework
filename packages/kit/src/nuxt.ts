import { useContext } from 'unctx'
import type { Nuxt, NuxtConfig } from './types'

export const useNuxt = useContext<Nuxt>('nuxt')

export function defineNuxtConfig (config: NuxtConfig) {
  return config
}
