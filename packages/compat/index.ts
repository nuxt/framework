import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  name: '@nuxt/compat',
  setup (_options, nuxt) {
    nuxt.options.alias.vue = '@vue/compat'

    // @ts-ignore
    nuxt.options.build.loaders.vue.compilerOptions = nuxt.options.build.loaders.vue.compilerOptions || {}
    // @ts-ignore
    nuxt.options.build.loaders.vue.compilerOptions = {
      compatConfig: {
        MODE: 2
      }
    }
  }
})
