import { useNuxtApp, useState } from '#app'

export const useError = () => {
  const nuxtApp = useNuxtApp()
  return useState('_error', () => process.server ? nuxtApp.ssrContext.error : nuxtApp.payload.error)
}

export const throwError = (_err: string | Error) => {
  const nuxtApp = useNuxtApp()
  const error = useError()
  const err = typeof _err === 'string' ? new Error(_err) : _err
  if (process.server) {
    nuxtApp.ssrContext.error = nuxtApp.ssrContext.error || err
  } else {
    nuxtApp.callHook('app:error', err, nuxtApp)
    error.value = error.value || err
  }

  return err
}

export const clearError = async (redirect?: string) => {
  const nuxtApp = useNuxtApp()
  const error = useError()
  nuxtApp.callHook('app:error:cleared', redirect)
  if (redirect) {
    await nuxtApp.$router.replace(redirect)
  }
  error.value = null
}
