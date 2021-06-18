import { defineNuxtPlugin } from '@nuxt/app'

function freeze (object: Record<string, any>) {
  const propNames = Object.getOwnPropertyNames(object)

  for (const name of propNames) {
    const value = object[name]

    if (value && typeof value === 'object') {
      freeze(value)
    }
  }

  return Object.freeze(object)
}

export default defineNuxtPlugin((nuxt) => {
  if (process.client) {
    globalThis.$config = freeze(nuxt.payload.config)
  } else {
    // @ts-ignore
    nuxt.payload.config = $config
  }
})
