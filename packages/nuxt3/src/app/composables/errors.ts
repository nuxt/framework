import { toRef } from 'vue'
import { useNuxtApp } from '#app'

export interface NuxtError {
  name?: string
  statusCode?: string
  message?: string
  stack?: string
}

export const normalizeError = (e: any): NuxtError => {
  if (!e) {
    return null
  }
  return {
    name: e.name,
    statusCode: e.statusCode,
    message: e.message || e.toString(),
    stack: process.dev ? e.stack : undefined
  }
}

export const useError = () => {
  const nuxt = useNuxtApp()
  const { errors } = useNuxtErrors()

  const errorKey = errors.value.push(null) - 1

  return {
    get: () => errors.value[errorKey],
    set: (e: any) => {
      errors.value[errorKey] = normalizeError(e)
      nuxt.callHook('error:captured', errors.value)
    },
    unset: () => { errors.value[errorKey] = null }
  }
}

export const useNuxtErrors = () => {
  const nuxt = useNuxtApp()

  const errors = toRef(nuxt.payload, 'errors')

  return {
    errors,
    addError: (e: any) => {
      errors.value.push(normalizeError(e))
      nuxt.callHook('error:captured', errors.value)
    },
    resetErrors: () => errors.value.forEach((_err, index) => { errors.value[index] = null }),
    unhandledErrors: computed(() => errors.value.filter(Boolean))
  }
}
