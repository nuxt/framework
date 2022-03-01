export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('vue:error', (...args) => {
    console.log('vue:error')
    console.log(...args)
  })
  nuxtApp.hook('app:error', (...args) => {
    console.log('app:error')
    console.log(...args)
  })
})
