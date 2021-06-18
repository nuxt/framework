import destr from 'destr'
import defu from 'defu'

function freeze (object: Record<string, any>) {
  const propNames = Object.getOwnPropertyNames(object)

  for (const name of propNames) {
    const value = object[name]

    if (value && typeof value === 'object') {
      freeze(value)
    }
  }

  return Object.freeze(object)
}

// Bundled runtime config
export const runtimeConfig = process.env.RUNTIME_CONFIG as any

// Allow override from process.env and deserialize
for (const type of ['private', 'public']) {
  for (const key in runtimeConfig[type]) {
    runtimeConfig[type][key] = destr(process.env[key] || runtimeConfig[type][key])
  }
}

// Export merged config
export const config = freeze(defu(runtimeConfig.private, runtimeConfig.public))
export default config
