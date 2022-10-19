export default defineNuxtConfig({
  app: {
    head: {
      script: [
        { src: '/script.js', async: true }
      ]
    }
  }
})
