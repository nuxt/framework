export default defineNuxtPlugin((nuxt) => {
  if (process.server && nuxt.ssrContext.url.includes('/error-in-plugin') && !nuxt.ssrContext.errors.length) {
    throw new Error('error-in-plugin')
  }
})
