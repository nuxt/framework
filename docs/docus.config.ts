import { defineDocusConfig } from 'docus'

export default defineDocusConfig({
  title: 'Nuxt 3',
  description: 'The Hybrid Vue Framework',
  theme: '@docus/docs-theme',
  url: 'https://v3.nuxtjs.org',
  credits: false,
  template: 'docs',
  twitter: 'nuxt_js',
  algolia: {
    appId: '1V8G7N9GF0',
    apiKey: '60a01900a4b726d667eab75b6f337592',
    indexName: 'nuxtjs',
    facetFilters: ['tags:v3']
  },
  github: {
    repo: 'nuxt/framework',
    dir: 'docs',
    branch: 'main'
  }
})
