import type { BuildConfig } from 'unbuild'

export default <BuildConfig>{
  entries: [
    'src/index',
    'src/compat',
    { input: 'src/runtime/', format: 'esm' }
  ],
  dependencies: [
    '@cloudflare/kv-asset-handler',
    '@netlify/functions',
    '@nuxt/devalue',
    'connect',
    'destr',
    'ohmyfetch',
    'ora',
    'vue-bundle-renderer',
    'vue-server-renderer',
    '@vue/server-renderer',
    'vue'
  ]
}
