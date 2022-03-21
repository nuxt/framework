import { defineNuxtConfig } from 'nuxt3'
import preset from './utils/preset'

export default defineNuxtConfig({
  publicRuntimeConfig: {
    plausible: {
      domain: process.env.PLAUSIBLE_DOMAIN
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
        content: 'https://res.cloudinary.com/nuxt/image/upload/v1633987983/nuxt3-preview_rhh50t.png'
      },
      {
        hid: 'og:image:secure_url',
        property: 'og:image:secure_url',
        content: 'https://res.cloudinary.com/nuxt/image/upload/v1633987983/nuxt3-preview_rhh50t.png'
      },
      {
        hid: 'og:image:alt',
        property: 'og:image:alt',
        content: 'Nuxt 3'
      },
      {
        hid: 'twitter:image',
        name: 'twitter:image',
        content: 'https://res.cloudinary.com/nuxt/image/upload/v1633987983/nuxt3-preview_rhh50t.png'
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
  /**
   * Components
   */
  components: [
    {
      prefix: '',
      path: './components/docs',
      global: true
    },
    {
      prefix: '',
      path: './components/icons',
      global: true
    },
    {
      prefix: '',
      path: './components/globals',
      global: true
    },
    {
      prefix: '',
      path: './components/content',
      global: true
    }
  ],
  ui: {
    colors: {
      primary: 'blue',
      gray: 'zinc'
    },
    preset,
    tailwindcss: {
      theme: {
        extend: {
          fontFamily: {
            sans: '"RoobertPRO", sans-serif'
          }
        }
      }
    }
  },
  tailwindcss: {
    config: {
      plugins: [
        require('@tailwindcss/typography')
      ],
      content: ['utils/preset.ts'],
      safelist: [24, 36, 48, 60, 72, 84, 96, 108, 120].map(number => `pl-[${number}px]`)
    }
  },
  /**
   * Modules
   */
  modules: [
    '@nuxt/content',
    '@nuxthq/ui',
    'vue-plausible'
  ]
})
