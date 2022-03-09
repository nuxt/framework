let timesRun = 0
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('vue:error', (..._args) => {
    console.log('vue:error')
    // if (process.client) {
    //   console.log(..._args)
    // }
  })
  nuxtApp.hook('app:error', (..._args) => {
    console.log('app:error')
    // if (process.client) {
    //   console.log(..._args)
    // }
  })
  nuxtApp.vueApp.config.errorHandler = (..._args) => {
    console.log('global error handler')
    // if (process.client) {
    //   console.log(..._args)
    // }
  }
  const error = useError()
  if (process.client && error.value && !timesRun) {
    console.log('throwing plugin error on top of existing error')
    timesRun++
    throw new Error('Plugin error')
  } else if (timesRun) {
    console.log('re-ran plugin')
  }
})
