import { defineNuxtConfig } from 'nuxt3'

export default defineNuxtConfig({
  components: {
    dirs: [
      '~/components',
      {
        path: '~/other-components',
        extensions: ['vue'],
        prefix: 'nuxt'
      },
      {
        path: '~/third-components',
        extensions: ['vue'],
        prefix: 'nuxt-third',
        pathPrefix: false
      }
    ]
  }
  // TODO breaking change ?
  // components: [
  //     '~/components',
  //     {
  //       path: '~/other-components',
  //       extensions: ['vue'],
  //       prefix: 'nuxt'
  //   ]
  // }
})
