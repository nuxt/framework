import destr from 'destr'
import defu from 'defu'
import { joinURL } from 'ufo'

// Bundled runtime config (injected by nitro)
const _runtimeConfig = process.env.RUNTIME_CONFIG as any

// Allow override from process.env and deserialize
for (const type of ['private', 'public']) {
  for (const key in _runtimeConfig[type]) {
    _runtimeConfig[type][key] = destr(process.env[key] || _runtimeConfig[type][key])
  }
}

// Load dynamic app configuration
const appConfig = _runtimeConfig.public.app
appConfig.basePath = process.env.APP_BASE_PATH || appConfig.basePath
appConfig.cdnURL = process.env.APP_CDN_URL || appConfig.cdnURL
appConfig.buildAssetsPath = process.env.APP_BUILD_ASSETS_PATH || appConfig.buildAssetsPath
Object.defineProperty(appConfig, 'buildAssetsURL', {
  get () {
    return joinURL(appConfig.basePath, appConfig.buildAssetsPath)
  }
})

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
