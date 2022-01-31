import destr from 'destr'
import defu from 'defu'
import { snakeCase } from 'scule'

// Bundled runtime config (injected by nitro)
const _runtimeConfig = process.env.RUNTIME_CONFIG as any

// Allow override from process.env and deserialize
for (const type of ['private', 'public']) {
  for (const key in _runtimeConfig[type]) {
    // baseURL can be overridden by BASE_URL
    const envKey = snakeCase(key).toUpperCase()
    _runtimeConfig[type][key] = destr(process.env[envKey] || _runtimeConfig[type][key])
    if (_runtimeConfig[type][key] && typeof _runtimeConfig[type][key] === 'object') {
      for (const subkey in _runtimeConfig[type][key]) {
        // key: { subKey } can be overridden by KEY_SUB_KEY`
        const envKeyName = `${envKey}_${snakeCase(subkey).toUpperCase()}`
        _runtimeConfig[type][key][subkey] = destr(process.env[envKeyName]) || _runtimeConfig[type][key][subkey]
      }
    }
  }
}

// Load dynamic app configuration
const appConfig = _runtimeConfig.public.app
appConfig.baseURL = process.env.NUXT_APP_BASE_URL || appConfig.baseURL
appConfig.cdnURL = process.env.NUXT_APP_CDN_URL || appConfig.cdnURL
appConfig.buildAssetsDir = process.env.NUXT_APP_BUILD_ASSETS_DIR || appConfig.buildAssetsDir

// Named exports
export const privateConfig = deepFreeze(defu(_runtimeConfig.private, _runtimeConfig.public))
export const publicConfig = deepFreeze(_runtimeConfig.public)

// Default export (usable for server)
export default privateConfig

// Utils
function deepFreeze (object: Record<string, any>) {
  const propNames = Object.getOwnPropertyNames(object)
  for (const name of propNames) {
    const value = object[name]
    if (value && typeof value === 'object') {
      deepFreeze(value)
    }
  }
  return Object.freeze(object)
}
