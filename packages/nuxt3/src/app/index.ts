/// <reference path="types/augments.d.ts" />

export * from './nuxt'
export * from './composables'
export * from './components'

// eslint-disable-next-line import/no-restricted-paths
export type { PageMeta } from '../pages/runtime'
// eslint-disable-next-line import/no-restricted-paths
export type { MetaObject } from '../meta/runtime'
export { useHead, useMeta } from '#meta'

export const isVue2 = false
export const isVue3 = true
