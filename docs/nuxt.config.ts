import { resolve } from 'node:path'
import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  extends: ['./node_modules/@docus/docs-theme'],

  theme: {
    title: 'Nuxt 3',
    description: 'The Hybrid Vue Framework',
    url: 'https://v3.nuxtjs.org',
    credits: false,
    layout: 'docs',
    twitter: 'nuxt_js',
    socials: {
      twitter: 'nuxt_js',
      github: 'nuxt/framework'
    }
  },

  head: {
    titleTemplate: 'Nuxt 3 - %s',
    link: [
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=DM+Serif+Display:ital@0;1&display=swap'
      },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com' }
    ],
    meta: [
      { hid: 'og:site_name', property: 'og:site_name', content: 'Nuxt 3' },
      { hid: 'og:type', property: 'og:type', content: 'website' },
      { hid: 'twitter:site', name: 'twitter:site', content: '@nuxt_js' },
      {
        hid: 'twitter:card',
        name: 'twitter:card',
        content: 'summary_large_image'
      },
      {
        hid: 'og:image',
        property: 'og:image',
        content: 'https://res.cloudinary.com/nuxt/image/upload/v1650870623/nuxt3-rc-social_z6qh3m.png'
      },
      {
        hid: 'og:image:secure_url',
        property: 'og:image:secure_url',
        content: 'https://res.cloudinary.com/nuxt/image/upload/v1650870623/nuxt3-rc-social_z6qh3m.png'
      },
      {
        hid: 'og:image:alt',
        property: 'og:image:alt',
        content: 'Nuxt 3'
      },
      {
        hid: 'twitter:image',
        name: 'twitter:image',
        content: 'https://res.cloudinary.com/nuxt/image/upload/v1650870623/nuxt3-rc-social_z6qh3m.png'
      },
      {
        hid: 'og:video',
        name: 'og:video',
        content: 'https://res.cloudinary.com/nuxt/video/upload/v1634114611/nuxt3-beta_sznsf8.mp4'
      }
    ],
    bodyAttrs: {
      class: ['min-w-xs']
    }
  },

  loading: {
    color: '#00DC82'
  },

  css: [resolve(__dirname, './assets/nuxt.css')],

  modules: [
    '@docus/github',
    'vue-plausible'
  ],

  publicRuntimeConfig: {
    plausible: {
      domain: process.env.PLAUSIBLE_DOMAIN
    }
  },

  github: {
    repo: 'nuxt/framework',
    branch: 'main',
    dir: 'docs'
  },

  tailwindcss: {
    config: {
      theme: {
        extend: {
          colors: {
            primary: {
              50: '#d6ffee',
              100: '#acffdd',
              200: '#83ffcc',
              300: '#30ffaa',
              400: '#00dc82',
              500: '#00bd6f',
              600: '#009d5d',
              700: '#007e4a',
              800: '#005e38',
              900: '#003f25'
            }
          }
        }
      }
    }
  },

  algolia: {
    appId: '1V8G7N9GF0',
    apiKey: '60a01900a4b726d667eab75b6f337592',
    indexName: 'nuxtjs',
    facetFilters: ['tags:v3']
  }
})
