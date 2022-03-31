const availableModules = [
  {
    name: 'vueuse',
    packageName: '@vueuse/nuxt'
  },
  {
    name: 'tailwindcss',
    packageName: '@nuxtjs/tailwindcss'
  },
  {
    name: 'color-mode',
    packageName: '@nuxtjs/color-mode'
  },
  {
    name: 'prismic',
    packageName: '@nuxtjs/prismic'
  },
  {
    name: 'windicss',
    packageName: 'nuxt-windicss'
  },
  {
    name: 'strapi',
    packageName: '@nuxtjs/strapi'
  },
  {
    name: 'sanity',
    packageName: '@nuxtjs/sanity'
  },
  {
    name: 'unocss',
    packageName: '@unocss/nuxt'
  },
  {
    name: 'plausible',
    packageName: 'vue-plausible'
  },
  {
    name: 'formkit',
    packageName: '@formkit/nuxt'
  },
  {
    name: 'storyblok',
    packageName: '@storyblok/nuxt'
  },
  {
    name: 'lodash',
    packageName: 'nuxt-lodash'
  },
  {
    name: 'partytown',
    packageName: '@nuxtjs/partytown'
  },
  {
    name: 'directus',
    packageName: 'nuxt-directus'
  },
  {
    name: 'harlem',
    packageName: '@nuxtjs/harlem'
  },
  {
    name: 'algolia',
    packageName: '@nuxtjs/algolia'
  },
  {
    name: 'nuxt-hue',
    packageName: 'nuxt-hue'
  },
  {
    name: 'grapqhl',
    packageName: 'nuxt-graphql-client'
  }
]

export async function findModule (name: string) {
  const modules = availableModules.filter(
    x => x.packageName === name || x.name === name
  )
  if (modules.length < 0) { return }
  return modules[0]
}
