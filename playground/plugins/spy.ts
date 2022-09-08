export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hooks.beforeEach((event) => {
    console.log(event.name)
  })
})
