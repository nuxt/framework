import { resolve } from 'pathe'
import { resolveModule, addTemplate, useNuxt, installModule } from '@nuxt/kit'
import metaModule from '../../nuxt3/src/meta/module'
import { distDir } from './dirs'

const checkDocsMsg = 'Please see https://v3.nuxtjs.org for more information.'
const msgPrefix = '[bridge] [meta]'

export const setupMeta = async (opts: { enable: true | null }) => {
  const nuxt = useNuxt()

  if (!opts.enable) {
    const metaPath = addTemplate({
      filename: 'meta.mjs',
      getContents: () => `export const useMeta = () => console.warn('${msgPrefix} To use \`useMeta\`, please set \`bridge.meta\` to \`true\` in your \`nuxt.config\`. ${checkDocsMsg}')`
    })
    console.log(metaPath)
    nuxt.options.alias['#meta'] = metaPath.dst
    return
  }

  // Alias vue to a vue3-compat version of vue2
  nuxt.options.alias['#vue'] = nuxt.options.alias.vue || resolveModule('vue/dist/vue.runtime.esm.js', { paths: nuxt.options.modulesDir })
  nuxt.options.alias['@vue/shared'] = 'vue'
  nuxt.options.alias['@vue/reactivity'] = 'vue'
  nuxt.options.alias.vue = resolve(distDir, 'runtime/vue.mjs')

  nuxt.options.build.transpile.push('vue')

  if (nuxt.options.head && typeof nuxt.options.head === 'function') {
    throw new TypeError(`${msgPrefix} The head() function in \`nuxt.config\` has been deprecated and in nuxt3 will need to be moved to \`app.vue\`. ${checkDocsMsg}`)
  }

  const runtimeDir = resolve(distDir, 'runtime/meta')
  nuxt.options.alias['#meta'] = runtimeDir

  await installModule(nuxt, metaModule)
}
