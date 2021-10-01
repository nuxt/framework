import { installModule, useNuxt } from '@nuxt/kit'
import globalImports from 'nuxt3/src/global-imports/module'
import defu from 'defu'

// TODO: implement these: https://github.com/nuxt/framework/issues/549
const disabled = [
  'useMeta',
  'useAsyncData',
  'asyncData'
]

const identifiers = {
  '#app': [
    'defineNuxtComponent',
    'useNuxtApp',
    'defineNuxtPlugin'
  ],
  '@vue/composition-api': [
    // lifecycle
    'onActivated',
    'onBeforeMount',
    'onBeforeUnmount',
    'onBeforeUpdate',
    'onDeactivated',
    'onErrorCaptured',
    'onMounted',
    'onServerPrefetch',
    'onUnmounted',
    'onUpdated',

    // reactivity,
    'computed',
    'customRef',
    'isReadonly',
    'isRef',
    'markRaw',
    'reactive',
    'readonly',
    'ref',
    'shallowReactive',
    'shallowReadonly',
    'shallowRef',
    'toRaw',
    'toRef',
    'toRefs',
    'triggerRef',
    'unref',
    'watch',
    'watchEffect',

    // component
    'defineComponent',
    'defineAsyncComponent',
    'getCurrentInstance',
    'h',
    'inject',
    'nextTick',
    'provide',
    'useCssModule'
  ]
}

const defaultIdentifiers = {}
for (const pkg in identifiers) {
  for (const id of identifiers[pkg]) {
    defaultIdentifiers[id] = pkg
  }
}

export async function setupGlobalImports () {
  const nuxt = useNuxt()
  nuxt.options.globalImports = defu(nuxt.options.globalImports, { disabled, identifiers: defaultIdentifiers })
  await installModule(nuxt, globalImports)
}
