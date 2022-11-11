export default defineNuxtConfig({
  app: {
    head: {
      title: 'nuxt',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { key: 'description', name: 'description', content: '' }
      ],
      script: [
        {
          src: 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.min.js',
          body: true
        }
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    }
  }
})
